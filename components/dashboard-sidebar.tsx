"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Calendar, User, Stethoscope, Clock, Users, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  role: "doctor" | "patient" | "admin";
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const doctorNav = [
    { href: "/doctor/dashboard", label: "Overview & Appointments", icon: Calendar },
    { href: "/doctor/availability", label: "My Working Hours", icon: Clock },
    { href: "/doctor/profile", label: "Doctor Profile", icon: Stethoscope },
  ];

  const patientNav = [
    { href: "/patient/dashboard", label: "My Appointments", icon: Calendar },
    { href: "/doctors", label: "Find Doctors", icon: Users },
    { href: "/patient/profile", label: "Personal Details", icon: User },
  ];

  const navItems = role === "doctor" ? doctorNav : patientNav;

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900">CuraPoint</span>
            <span className="block text-xs font-semibold text-sky-600 uppercase tracking-wider">
              {role} Portal
            </span>
          </div>
        </Link>
      </div>

      <div className="p-4 flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="px-1">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Current View</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>

        {/* Switch portal button directly */}
        <Link
          href={role === "doctor" ? "/patient/dashboard" : "/doctor/dashboard"}
          className="block"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
            Switch to {role === "doctor" ? "Patient" : "Doctor"} View
          </Button>
        </Link>
      </div>
    </aside>
  );
}
