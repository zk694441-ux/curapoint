import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// -------------------------------------------------------------
// Better Auth Core Tables
// -------------------------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("patient"), // "patient" | "doctor" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// -------------------------------------------------------------
// Doctor Profiles
// -------------------------------------------------------------
export const doctorProfiles = pgTable("doctor_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  specialty: text("specialty").notNull(),
  bio: text("bio").notNull(),
  qualifications: text("qualifications").notNull(),
  experienceYears: integer("experience_years").notNull().default(0),
  consultationFee: integer("consultation_fee").notNull().default(50),
  clinicAddress: text("clinic_address").notNull(),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// -------------------------------------------------------------
// Patient Profiles
// -------------------------------------------------------------
export const patientProfiles = pgTable("patient_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"), // YYYY-MM-DD
  gender: text("gender"), // "male" | "female" | "other"
  bloodGroup: text("blood_group"),
  emergencyContact: text("emergency_contact"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// -------------------------------------------------------------
// Doctor Weekly Availability
// -------------------------------------------------------------
export const availability = pgTable("availability", {
  id: text("id").primaryKey(),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  slotDurationMinutes: integer("slot_duration_minutes").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// -------------------------------------------------------------
// Appointments (with Strict Double Booking Prevention Unique Index)
// -------------------------------------------------------------
export const appointments = pgTable(
  "appointments",
  {
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    doctorId: text("doctor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // "YYYY-MM-DD"
    startTime: text("start_time").notNull(), // "09:30"
    endTime: text("end_time").notNull(), // "10:00"
    status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "completed" | "cancelled"
    reason: text("reason").notNull(),
    doctorNotes: text("doctor_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Unique constraint so double booking of active appointments is impossible
    // Note: in app logic we check if non-cancelled slot exists, and this index guarantees db level concurrency safety
    uniqueIndex("doctor_date_time_idx").on(
      table.doctorId,
      table.date,
      table.startTime
    ),
  ]
);

// -------------------------------------------------------------
// Reviews & Ratings
// -------------------------------------------------------------
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  appointmentId: text("appointment_id")
    .notNull()
    .unique()
    .references(() => appointments.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export inferred types
export type User = typeof user.$inferSelect;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
