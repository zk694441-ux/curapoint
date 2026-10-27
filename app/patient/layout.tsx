import { requirePatient } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const patient = await requirePatient();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar role="patient" user={patient} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
