import "dotenv/config";
import fs from "fs";
import path from "path";
import { db } from "./index";
import * as schema from "./schema";

async function main() {
  console.log("🌱 Initializing PostgreSQL tables & seeding demo data...");

  // 1. Read generated migration SQL and execute
  const migrationFile = fs.readdirSync(path.join(process.cwd(), "drizzle"))
    .find(f => f.endsWith(".sql"));

  if (migrationFile) {
    console.log(`Executing migration file: ${migrationFile}...`);
    const sqlContent = fs.readFileSync(path.join(process.cwd(), "drizzle", migrationFile), "utf-8");
    
    // Split by statement breakpoints or execute directly
    // PGlite can execute multi-statement SQL
    try {
      if (typeof (db as any).$client?.exec === "function") {
        await (db as any).$client.exec(sqlContent);
      } else if (typeof (db as any).session?.client?.query === "function") {
        await (db as any).session.client.query(sqlContent);
      }
    } catch (e: any) {
      console.log("Schema might already exist:", e.message);
    }
  }

  const doctorsData = [
    {
      id: "doc-1",
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@curapoint.demo",
      role: "doctor",
      specialty: "Cardiology",
      bio: "Board-certified cardiologist specializing in preventive cardiology, coronary artery disease, hypertension, and advanced heart health.",
      qualifications: "MD, FACC, Harvard Medical School",
      experienceYears: 14,
      consultationFee: 120,
      clinicAddress: "Suite 402, Apex Medical Pavilion, Metro Health District",
      avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 019-2831",
    },
    {
      id: "doc-2",
      name: "Dr. Marcus Vance",
      email: "marcus.vance@curapoint.demo",
      role: "doctor",
      specialty: "Dermatology",
      bio: "Expert dermatologist providing cutting-edge skin cancer screenings, acne treatments, eczema therapy, and cosmetic dermatology.",
      qualifications: "MD, FAAD, Johns Hopkins University",
      experienceYears: 10,
      consultationFee: 95,
      clinicAddress: "780 Wellness Boulevard, Suite 12B, Central City",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 014-9921",
    },
    {
      id: "doc-3",
      name: "Dr. Elena Rostova",
      email: "elena.rostova@curapoint.demo",
      role: "doctor",
      specialty: "Pediatrics",
      bio: "Warm and compassionate pediatrician with extensive experience in developmental assessments, immunizations, and pediatric urgent care.",
      qualifications: "MD, FAAP, Stanford University School of Medicine",
      experienceYears: 12,
      consultationFee: 85,
      clinicAddress: "Sunnyside Pediatric Care, 104 Childrens Way",
      avatarUrl: "https://images.unsplash.com/photo-1594824813511-4122d26f7431?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 018-7744",
    },
    {
      id: "doc-4",
      name: "Dr. David Chen",
      email: "david.chen@curapoint.demo",
      role: "doctor",
      specialty: "Orthopedics",
      bio: "Orthopedic surgeon specializing in sports injuries, knee and hip replacements, arthroscopy, and spine rehabilitation.",
      qualifications: "MD, FAAOS, Columbia University",
      experienceYears: 16,
      consultationFee: 150,
      clinicAddress: "Orthopedic & Spine Institute, 2200 Pioneer Parkway",
      avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 012-3489",
    },
    {
      id: "doc-5",
      name: "Dr. Amara Patel",
      email: "amara.patel@curapoint.demo",
      role: "doctor",
      specialty: "General Medicine",
      bio: "Dedicated primary care physician focused on holistic disease prevention, chronic illness management, and lifestyle medicine.",
      qualifications: "MBBS, MD, Yale School of Medicine",
      experienceYears: 8,
      consultationFee: 70,
      clinicAddress: "Downtown Family Clinic, 350 Main Street",
      avatarUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 016-5521",
    },
    {
      id: "doc-6",
      name: "Dr. Julian Thorne",
      email: "julian.thorne@curapoint.demo",
      role: "doctor",
      specialty: "Neurology",
      bio: "Renowned neurologist specialized in migraines, neuropathy, Parkinson's disease, and neurodegenerative disorders.",
      qualifications: "MD, PhD, Oxford University & Mayo Clinic",
      experienceYears: 18,
      consultationFee: 180,
      clinicAddress: "NeuroScience Center, 500 Grand Avenue, 8th Floor",
      avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 015-8833",
    },
    {
      id: "doc-7",
      name: "Dr. Sophia Lin",
      email: "sophia.lin@curapoint.demo",
      role: "doctor",
      specialty: "Psychiatry",
      bio: "Compassionate mental health professional offering evidence-based psychiatric evaluations, medication management, and psychotherapy.",
      qualifications: "MD, APA Fellow, UCLA Medical Center",
      experienceYears: 9,
      consultationFee: 130,
      clinicAddress: "Mind & Health Sanctuary, 19 Oakwood Terrace",
      avatarUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80",
      phone: "+1 (555) 017-4490",
    },
  ];

  const patientData = {
    id: "pat-1",
    name: "Alex Morgan",
    email: "alex.morgan@curapoint.demo",
    role: "patient",
    phone: "+1 (555) 998-1122",
    dateOfBirth: "1994-06-15",
    gender: "female",
    bloodGroup: "O+",
    emergencyContact: "Jordan Morgan (+1 555-998-1123)",
  };

  console.log("Upserting patient demo user...");
  await db
    .insert(schema.user)
    .values({
      id: patientData.id,
      name: patientData.name,
      email: patientData.email,
      role: patientData.role,
      emailVerified: true,
    })
    .onConflictDoUpdate({
      target: schema.user.id,
      set: { name: patientData.name, email: patientData.email, role: patientData.role },
    });

  await db
    .insert(schema.patientProfiles)
    .values({
      id: "pat-prof-1",
      userId: patientData.id,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      bloodGroup: patientData.bloodGroup,
      emergencyContact: patientData.emergencyContact,
    })
    .onConflictDoUpdate({
      target: schema.patientProfiles.userId,
      set: {
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
      },
    });

  for (const doc of doctorsData) {
    console.log(`Upserting doctor ${doc.name}...`);
    await db
      .insert(schema.user)
      .values({
        id: doc.id,
        name: doc.name,
        email: doc.email,
        role: doc.role,
        image: doc.avatarUrl,
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.user.id,
        set: { name: doc.name, email: doc.email, image: doc.avatarUrl },
      });

    await db
      .insert(schema.doctorProfiles)
      .values({
        id: `prof-${doc.id}`,
        userId: doc.id,
        specialty: doc.specialty,
        bio: doc.bio,
        qualifications: doc.qualifications,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        clinicAddress: doc.clinicAddress,
        avatarUrl: doc.avatarUrl,
        phone: doc.phone,
      })
      .onConflictDoUpdate({
        target: schema.doctorProfiles.userId,
        set: {
          specialty: doc.specialty,
          bio: doc.bio,
          qualifications: doc.qualifications,
          experienceYears: doc.experienceYears,
          consultationFee: doc.consultationFee,
          clinicAddress: doc.clinicAddress,
          avatarUrl: doc.avatarUrl,
          phone: doc.phone,
        },
      });

    // Seed Availability: Monday (1) through Friday (5) 09:00 to 17:00
    for (let day = 1; day <= 5; day++) {
      await db
        .insert(schema.availability)
        .values({
          id: `avail-${doc.id}-${day}`,
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          slotDurationMinutes: 30,
        })
        .onConflictDoNothing();
    }
  }

  // Seed sample appointments
  const sampleDate = new Date();
  sampleDate.setDate(sampleDate.getDate() + 2);
  const dateStr = sampleDate.toISOString().split("T")[0];

  await db
    .insert(schema.appointments)
    .values({
      id: "appt-demo-1",
      patientId: patientData.id,
      doctorId: "doc-1",
      date: dateStr,
      startTime: "10:00",
      endTime: "10:30",
      status: "confirmed",
      reason: "Routine cardiovascular checkup and blood pressure monitoring.",
      doctorNotes: "Patient reports mild fatigue after exercise. Recommended EKG.",
    })
    .onConflictDoNothing();

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);
  const pastDateStr = pastDate.toISOString().split("T")[0];

  await db
    .insert(schema.appointments)
    .values({
      id: "appt-demo-2",
      patientId: patientData.id,
      doctorId: "doc-2",
      date: pastDateStr,
      startTime: "14:00",
      endTime: "14:30",
      status: "completed",
      reason: "Annual skin mole check and allergy assessment.",
      doctorNotes: "No concerning lesions noted. Prescribed mild topical moisturizer.",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.reviews)
    .values({
      id: "rev-demo-1",
      appointmentId: "appt-demo-2",
      doctorId: "doc-2",
      patientId: patientData.id,
      rating: 5,
      comment: "Dr. Marcus was very thorough, clear, and reassuring. Excellent clinic experience!",
    })
    .onConflictDoNothing();

  console.log("✅ Database initialized and seed completed successfully!");
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
