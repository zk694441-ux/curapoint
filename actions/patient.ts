"use server";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requirePatient, requireUser } from "@/lib/auth/session";
import {
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
  patientProfileSchema,
  reviewSchema,
} from "@/lib/validations";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function bookAppointment(data: unknown) {
  const patient = await requirePatient();
  const parsed = bookAppointmentSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid booking data" };
  }

  const { doctorId, date, startTime, endTime, reason } = parsed.data;

  try {
    // 1. Check if doctor exists
    const doctor = await db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user.id, doctorId), eq(schema.user.role, "doctor")))
      .limit(1);

    if (doctor.length === 0) {
      return { error: "Doctor not found" };
    }

    // 2. Concurrency check: see if an active appointment already exists at this doctor, date and startTime
    const existing = await db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.doctorId, doctorId),
          eq(schema.appointments.date, date),
          eq(schema.appointments.startTime, startTime),
          ne(schema.appointments.status, "cancelled")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        error: "This time slot was just booked by someone else. Please choose another slot.",
      };
    }

    // 3. Create appointment with pending status
    const newId = `appt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(schema.appointments).values({
      id: newId,
      patientId: patient.id,
      doctorId,
      date,
      startTime,
      endTime,
      status: "pending",
      reason,
    });

    revalidatePath("/patient/dashboard");
    revalidatePath("/doctor/dashboard");
    revalidatePath(`/doctor/${doctorId}`);

    return { success: true, appointmentId: newId };
  } catch (error: any) {
    // Handle unique constraint violation in Postgres (code 23505)
    if (error?.code === "23505" || error?.message?.includes("duplicate key")) {
      return {
        error: "This time slot is already booked. Please choose an alternative slot.",
      };
    }
    console.error("bookAppointment error:", error);
    return { error: error.message || "Failed to book appointment" };
  }
}

export async function cancelPatientAppointment(appointmentId: string) {
  const patient = await requirePatient();

  try {
    const appt = await db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id, appointmentId),
          eq(schema.appointments.patientId, patient.id)
        )
      )
      .limit(1);

    if (appt.length === 0) {
      return { error: "Appointment not found or unauthorized" };
    }

    if (appt[0].status === "cancelled" || appt[0].status === "completed") {
      return { error: `Cannot cancel an appointment that is already ${appt[0].status}` };
    }

    await db
      .update(schema.appointments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(schema.appointments.id, appointmentId));

    revalidatePath("/patient/dashboard");
    revalidatePath("/doctor/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("cancelPatientAppointment error:", error);
    return { error: error.message || "Failed to cancel appointment" };
  }
}

export async function reschedulePatientAppointment(data: unknown) {
  const patient = await requirePatient();
  const parsed = rescheduleAppointmentSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid reschedule data" };
  }

  const { appointmentId, date, startTime, endTime } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id, appointmentId),
          eq(schema.appointments.patientId, patient.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return { error: "Appointment not found" };
    }

    const currentAppt = existing[0];
    if (currentAppt.status === "cancelled" || currentAppt.status === "completed") {
      return { error: "Cannot reschedule cancelled or completed visits" };
    }

    // Check conflict on new slot
    const slotConflict = await db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.doctorId, currentAppt.doctorId),
          eq(schema.appointments.date, date),
          eq(schema.appointments.startTime, startTime),
          ne(schema.appointments.status, "cancelled"),
          ne(schema.appointments.id, appointmentId)
        )
      )
      .limit(1);

    if (slotConflict.length > 0) {
      return { error: "The selected replacement slot is not available. Please pick another." };
    }

    await db
      .update(schema.appointments)
      .set({
        date,
        startTime,
        endTime,
        status: "pending", // Rescheduled requires doctor confirmation
        updatedAt: new Date(),
      })
      .where(eq(schema.appointments.id, appointmentId));

    revalidatePath("/patient/dashboard");
    revalidatePath("/doctor/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("reschedulePatientAppointment error:", error);
    return { error: error.message || "Failed to reschedule appointment" };
  }
}

export async function updatePatientProfile(data: unknown) {
  const patient = await requirePatient();
  const parsed = patientProfileSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid profile data" };
  }

  const { phone, dateOfBirth, gender, bloodGroup, emergencyContact } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(schema.patientProfiles)
      .where(eq(schema.patientProfiles.userId, patient.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.patientProfiles)
        .set({
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          emergencyContact: emergencyContact || null,
          updatedAt: new Date(),
        })
        .where(eq(schema.patientProfiles.userId, patient.id));
    } else {
      await db.insert(schema.patientProfiles).values({
        id: `pat-prof-${patient.id}`,
        userId: patient.id,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        emergencyContact: emergencyContact || null,
      });
    }

    revalidatePath("/patient/profile");
    return { success: true };
  } catch (error: any) {
    console.error("updatePatientProfile error:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

export async function submitReview(data: unknown) {
  const patient = await requirePatient();
  const parsed = reviewSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid review data" };
  }

  const { appointmentId, doctorId, rating, comment } = parsed.data;

  try {
    // Verify appointment was completed by this patient
    const appt = await db
      .select()
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id, appointmentId),
          eq(schema.appointments.patientId, patient.id),
          eq(schema.appointments.status, "completed")
        )
      )
      .limit(1);

    if (appt.length === 0) {
      return { error: "You can only review appointments that have been completed" };
    }

    const reviewId = `rev-${Date.now()}`;
    await db.insert(schema.reviews).values({
      id: reviewId,
      appointmentId,
      doctorId,
      patientId: patient.id,
      rating,
      comment: comment || null,
    });

    revalidatePath("/patient/dashboard");
    revalidatePath(`/doctor/${doctorId}`);

    return { success: true };
  } catch (error: any) {
    console.error("submitReview error:", error);
    return { error: error.message || "Failed to submit review" };
  }
}
