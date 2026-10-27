import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requirePatient } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { PatientAppointmentsClient } from "./appointments-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const patient = await requirePatient();

  // Fetch patient appointments joined with doctor details and reviews
  const patientAppointments = await db
    .select({
      id: schema.appointments.id,
      doctorId: schema.appointments.doctorId,
      doctorName: schema.user.name,
      doctorEmail: schema.user.email,
      doctorAvatar: schema.user.image,
      specialty: schema.doctorProfiles.specialty,
      clinicAddress: schema.doctorProfiles.clinicAddress,
      consultationFee: schema.doctorProfiles.consultationFee,
      date: schema.appointments.date,
      startTime: schema.appointments.startTime,
      endTime: schema.appointments.endTime,
      status: schema.appointments.status,
      reason: schema.appointments.reason,
      doctorNotes: schema.appointments.doctorNotes,
      createdAt: schema.appointments.createdAt,
      reviewRating: schema.reviews.rating,
      reviewComment: schema.reviews.comment,
    })
    .from(schema.appointments)
    .innerJoin(schema.user, eq(schema.appointments.doctorId, schema.user.id))
    .innerJoin(
      schema.doctorProfiles,
      eq(schema.appointments.doctorId, schema.doctorProfiles.userId)
    )
    .leftJoin(
      schema.reviews,
      eq(schema.appointments.id, schema.reviews.appointmentId)
    )
    .where(eq(schema.appointments.patientId, patient.id))
    .orderBy(desc(schema.appointments.date), desc(schema.appointments.startTime));

  const upcoming = patientAppointments.filter(
    (a: any) => a.status === "confirmed" || a.status === "pending"
  );
  const completed = patientAppointments.filter((a: any) => a.status === "completed");
  const cancelled = patientAppointments.filter((a: any) => a.status === "cancelled");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your consultations, view medical notes, reschedule or submit doctor reviews.
          </p>
        </div>

        <Link href="/doctors">
          <Button className="bg-sky-600 hover:bg-sky-700 shadow-xs">
            + Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-sky-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming Visits
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{upcoming.length}</div>
            <p className="text-xs text-slate-400 mt-1">Scheduled & active</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Completed Care
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{completed.length}</div>
            <p className="text-xs text-slate-400 mt-1">Past consultations</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Awaiting Doctor
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {patientAppointments.filter((a: any) => a.status === "pending").length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Pending confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Cancelled
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">{cancelled.length}</div>
            <p className="text-xs text-slate-400 mt-1">Released slots</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Tabs: Upcoming vs Past */}
      <PatientAppointmentsClient appointments={patientAppointments} />
    </div>
  );
}
