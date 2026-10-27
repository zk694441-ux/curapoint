import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requireDoctor } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { AvailabilityManager } from "./availability-manager";

export const dynamic = "force-dynamic";

export default async function DoctorAvailabilityPage() {
  const doctor = await requireDoctor();

  const currentSlots = await db
    .select()
    .from(schema.availability)
    .where(eq(schema.availability.doctorId, doctor.id));

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Weekly Working Hours & Availability
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure which days and hours you accept patient bookings. Patients can only book slots during these times.
        </p>
      </div>

      <AvailabilityManager initialSlots={currentSlots} />
    </div>
  );
}
