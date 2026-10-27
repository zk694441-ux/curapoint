import { z } from "zod";

// -------------------------------------------------------------
// Auth Schemas
// -------------------------------------------------------------
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["patient", "doctor"], {
    error: "Role must be either 'patient' or 'doctor'",
  }),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// -------------------------------------------------------------
// Doctor Profile Schema
// -------------------------------------------------------------
export const doctorProfileSchema = z.object({
  specialty: z.string().min(2, "Specialty is required").max(100),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(1000),
  qualifications: z.string().min(2, "Qualifications are required").max(200),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative").max(60),
  consultationFee: z.coerce.number().min(10, "Consultation fee must be at least $10").max(2000),
  clinicAddress: z.string().min(5, "Clinic address is required").max(250),
  phone: z.string().min(7, "Valid phone number is required").max(20).optional().or(z.literal("")),
  avatarUrl: z.string().url("Valid image URL").optional().or(z.literal("")),
});

// -------------------------------------------------------------
// Patient Profile Schema
// -------------------------------------------------------------
export const patientProfileSchema = z.object({
  phone: z.string().min(7, "Valid phone number is required").max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  bloodGroup: z.string().max(5).optional().or(z.literal("")),
  emergencyContact: z.string().max(100).optional().or(z.literal("")),
});

// -------------------------------------------------------------
// Availability Schema
// -------------------------------------------------------------
export const availabilityItemSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time format must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time format must be HH:MM"),
  slotDurationMinutes: z.coerce.number().min(15).max(120),
});

export const updateAvailabilitySchema = z.object({
  slots: z.array(availabilityItemSchema),
});

// -------------------------------------------------------------
// Booking & Appointment Schema
// -------------------------------------------------------------
export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
  reason: z.string().min(3, "Please describe the reason for visit (min 3 characters)").max(500),
});

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.enum(["confirmed", "completed", "cancelled"]),
  doctorNotes: z.string().max(1000).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
});

export const reviewSchema = z.object({
  appointmentId: z.string().min(1),
  doctorId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});
