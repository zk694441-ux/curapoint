"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requireDoctor } from "@/lib/auth/session";
import {
  doctorProfileSchema,
  updateAvailabilitySchema,
  updateAppointmentStatusSchema,
} from "@/lib/validations";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateDoctorProfile(data: unknown) {
  const doctor = await requireDoctor();
  const parsed = doctorProfileSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid profile data" };
  }

  const {
    specialty,
    bio,
    qualifications,
    experienceYears,
    consultationFee,
    clinicAddress,
    phone,
    avatarUrl,
  } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(schema.doctorProfiles)
      .where(eq(schema.doctorProfiles.userId, doctor.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.doctorProfiles)
        .set({
          specialty,
          bio,
          qualifications,
          experienceYears,
          consultationFee,
          clinicAddress,
          phone: phone || null,
          avatarUrl: avatarUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(schema.doctorProfiles.userId, doctor.id));
    } else {
      await db.insert(schema.doctorProfiles).values({
        id: `prof-${doctor.id}`,
        userId: doctor.id,
        specialty,
        bio,
        qualifications,
        experienceYears,
        consultationFee,
        clinicAddress,
        phone: phone || null,
        avatarUrl: avatarUrl || null,
      });
    }

    if (avatarUrl) {
      await db
        .update(schema.user)
        .set({ image: avatarUrl })
        .where(eq(schema.user.id, doctor.id));
    }

    revalidatePath("/doctor/profile");
    revalidatePath("/doctor/dashboard");
    revalidatePath("/doctors");

    return { success: true };
  } catch (error: any) {
    console.error("updateDoctorProfile error:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

export async function updateDoctorAvailability(data: unknown) {
  const doctor = await requireDoctor();
  const parsed = updateAvailabilitySchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid schedule data" };
  }

  try {
    // Replace all existing availability slots for this doctor
    await db
      .delete(schema.availability)
      .where(eq(schema.availability.doctorId, doctor.id));

    if (parsed.data.slots.length > 0) {
      const inserts = parsed.data.slots.map((s) => ({
        id: `avail-${doctor.id}-${s.dayOfWeek}-${Math.random().toString(36).substring(2, 7)}`,
        doctorId: doctor.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDurationMinutes: s.slotDurationMinutes,
      }));

      await db.insert(schema.availability).values(inserts);
    }

    revalidatePath("/doctor/availability");
    revalidatePath(`/doctor/${doctor.id}`);
    revalidatePath("/doctors");

    return { success: true };
  } catch (error: any) {
    console.error("updateDoctorAvailability error:", error);
    return { error: error.message || "Failed to update availability" };
  }
}

export async function updateAppointmentStatus(data: unknown) {
  const doctor = await requireDoctor();
  const parsed = updateAppointmentStatusSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid action payload" };
  }

  const { appointmentId, status, doctorNotes } = parsed.data;

  try {
    // Ensure the appointment belongs to this doctor
    const appt = await db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id, appointmentId),
          eq(schema.appointments.doctorId, doctor.id)
        )
      )
      .limit(1);

    if (appt.length === 0) {
      return { error: "Appointment not found or unauthorized" };
    }

    const updates: Partial<typeof schema.appointments.$inferInsert> = {
      status,
      updatedAt: new Date(),
    };

    if (doctorNotes !== undefined) {
      updates.doctorNotes = doctorNotes;
    }

    await db
      .update(schema.appointments)
      .set(updates)
      .where(eq(schema.appointments.id, appointmentId));

    revalidatePath("/doctor/dashboard");
    revalidatePath("/patient/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("updateAppointmentStatus error:", error);
    return { error: error.message || "Failed to update appointment status" };
  }
}
