import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requireDoctor } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { DoctorProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage() {
  const doctor = await requireDoctor();

  const profileData = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, doctor.id))
    .limit(1);

  const profile = profileData[0] || null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Doctor Profile & Credentials
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide your qualifications, medical specialty, consultation fee, and clinic location.
        </p>
      </div>

      <DoctorProfileForm profile={profile} doctorUser={doctor} />
    </div>
  );
}
