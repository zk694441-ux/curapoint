import { requireDoctor } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doctor = await requireDoctor();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar role="doctor" user={doctor} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
