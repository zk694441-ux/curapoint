import Link from "next/link";
import { Activity, Stethoscope, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Cura<span className="text-sky-600">Point</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/doctors" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            Find Doctors
          </Link>
          <Link href="/#specialties" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            Specialties
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
            How it Works
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/patient/dashboard">
            <Button size="sm" variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800">
              <UserCheck className="h-4 w-4 mr-1.5 text-teal-600" />
              Patient Dashboard
            </Button>
          </Link>
          <Link href="/doctor/dashboard">
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-600/20">
              <Stethoscope className="h-4 w-4 mr-1.5" />
              Doctor Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
