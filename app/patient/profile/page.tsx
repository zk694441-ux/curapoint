import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requirePatient } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { PatientProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const patient = await requirePatient();

  const profileData = await db
    .select()
    .from(schema.patientProfiles)
    .where(eq(schema.patientProfiles.userId, patient.id))
    .limit(1);

  const profile = profileData[0] || null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Personal & Medical Information
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your medical contact details, date of birth, and emergency contacts up to date.
        </p>
      </div>

      <PatientProfileForm profile={profile} patientUser={patient} />
    </div>
  );
}
