import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { requireDoctor } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { DoctorAppointmentsManager } from "./appointments-manager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DoctorDashboardPage() {
  const doctor = await requireDoctor();

  // Fetch all appointments for this doctor joined with patient details
  const doctorAppointments = await db
    .select({
      id: schema.appointments.id,
      patientId: schema.appointments.patientId,
      patientName: schema.user.name,
      patientEmail: schema.user.email,
      date: schema.appointments.date,
      startTime: schema.appointments.startTime,
      endTime: schema.appointments.endTime,
      status: schema.appointments.status,
      reason: schema.appointments.reason,
      doctorNotes: schema.appointments.doctorNotes,
      createdAt: schema.appointments.createdAt,
    })
    .from(schema.appointments)
    .innerJoin(schema.user, eq(schema.appointments.patientId, schema.user.id))
    .where(eq(schema.appointments.doctorId, doctor.id))
    .orderBy(desc(schema.appointments.date), desc(schema.appointments.startTime));

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = doctorAppointments.filter((a: any) => a.date === todayStr && a.status !== "cancelled").length;
  const pendingCount = doctorAppointments.filter((a: any) => a.status === "pending").length;
  const confirmedCount = doctorAppointments.filter((a: any) => a.status === "confirmed").length;
  const completedCount = doctorAppointments.filter((a: any) => a.status === "completed").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Doctor Clinical Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {doctor.name}. Manage upcoming patient visits and consultation records.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-sky-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today&apos;s Consults
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{todayCount}</div>
            <p className="text-xs text-slate-400 mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending Approval
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
            <p className="text-xs text-slate-400 mt-1">Requires your review</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Confirmed Visits
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{confirmedCount}</div>
            <p className="text-xs text-slate-400 mt-1">Ready for consultation</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
            <p className="text-xs text-slate-400 mt-1">Total treated patients</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Table with Status and Date Filter */}
      <DoctorAppointmentsManager appointments={doctorAppointments} />
    </div>
  );
}
