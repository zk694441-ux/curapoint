import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Activity, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const user = await getCurrentUser();

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

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href={user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}
            >
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                <User className="h-4 w-4 mr-1.5" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                  Book an Appointment
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
