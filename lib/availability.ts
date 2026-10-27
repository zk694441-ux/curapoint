import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  available: boolean;
  reason?: string;
}

export async function getDoctorSlotsForDate(
  doctorId: string,
  dateStr: string // "YYYY-MM-DD"
): Promise<{ slots: TimeSlot[]; error?: string }> {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday...

    // 1. Fetch doctor's availability for that day of week
    const availRules = await db
      .select()
      .from(schema.availability)
      .where(
        and(
          eq(schema.availability.doctorId, doctorId),
          eq(schema.availability.dayOfWeek, dayOfWeek)
        )
      );

    if (availRules.length === 0) {
      return { slots: [] };
    }

    // 2. Fetch existing active bookings for doctor on that date (excluding cancelled)
    const bookedAppointments = await db
      .select({
        startTime: schema.appointments.startTime,
        endTime: schema.appointments.endTime,
      })
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.doctorId, doctorId),
          eq(schema.appointments.date, dateStr),
          ne(schema.appointments.status, "cancelled")
        )
      );

    const bookedSet = new Set(bookedAppointments.map((a: any) => a.startTime));

    // 3. Generate slots based on availability rules
    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday =
      now.getFullYear() === year &&
      now.getMonth() === month - 1 &&
      now.getDate() === day;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const rule of availRules) {
      const [startH, startM] = rule.startTime.split(":").map(Number);
      const [endH, endM] = rule.endTime.split(":").map(Number);
      const duration = rule.slotDurationMinutes || 30;

      let slotStart = startH * 60 + startM;
      const totalEnd = endH * 60 + endM;

      while (slotStart + duration <= totalEnd) {
        const slotEnd = slotStart + duration;

        const formatTime = (min: number) => {
          const h = Math.floor(min / 60)
            .toString()
            .padStart(2, "0");
          const m = (min % 60).toString().padStart(2, "0");
          return `${h}:${m}`;
        };

        const startTimeStr = formatTime(slotStart);
        const endTimeStr = formatTime(slotEnd);

        // Check if slot is already booked or in past
        const isBooked = bookedSet.has(startTimeStr);
        const isPast = isToday && slotStart <= currentMinutes;

        slots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          available: !isBooked && !isPast,
          reason: isBooked ? "Booked" : isPast ? "Past" : undefined,
        });

        slotStart += duration;
      }
    }

    // Sort slots chronologically
    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return { slots };
  } catch (error: any) {
    console.error("getDoctorSlotsForDate error:", error);
    return { slots: [], error: error.message };
  }
}
