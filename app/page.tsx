import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  Search,
  ArrowRight,
  HeartPulse,
  Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const specialties = [
    { name: "Cardiology", count: "12+ Doctors", desc: "Heart & cardiovascular wellness" },
    { name: "Dermatology", count: "18+ Doctors", desc: "Skin, hair, & allergy treatments" },
    { name: "Pediatrics", count: "15+ Doctors", desc: "Infant, child & teen health" },
    { name: "General Medicine", count: "25+ Doctors", desc: "Primary care, colds & health checkups" },
    { name: "Orthopedics", count: "10+ Doctors", desc: "Joint, bone & musculoskeletal care" },
    { name: "Neurology", count: "8+ Doctors", desc: "Brain, nerves & headache specialists" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-radial-[at_top_right] from-sky-100/60 via-white to-slate-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold uppercase tracking-wider">
                <HeartPulse className="h-4 w-4 text-teal-600" />
                Trusted Health Booking Experience
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Book verified doctors,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                  instantly & hassle-free.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
                Connect with leading certified specialists in your city. View real-time availability, select your preferred time slot, and manage your health appointments with ease.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/doctors" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/25">
                    <Search className="h-5 w-5 mr-2" />
                    Find a Doctor
                  </Button>
                </Link>
                <Link href="/signup?role=doctor" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Are you a Doctor? Join CuraPoint
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-slate-900">10,000+</div>
                  <div className="text-xs text-slate-500 font-medium">Patients Served</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">500+</div>
                  <div className="text-xs text-slate-500 font-medium">Certified Doctors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">4.9/5</div>
                  <div className="text-xs text-slate-500 font-medium">Patient Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Hero Card Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-lg">
                      Dr
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Dr. Sarah Jenkins, MD</h4>
                      <p className="text-xs text-sky-600 font-medium">Senior Cardiologist • 12 yrs exp</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    Available Today
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Select Appointment Slot
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["09:30 AM", "11:00 AM", "02:30 PM", "03:45 PM", "05:00 PM"].map((time, idx) => (
                      <span
                        key={time}
                        className={`text-center py-2 text-xs font-medium rounded-lg border transition-colors ${
                          idx === 1
                            ? "bg-sky-600 text-white border-sky-600 font-semibold shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-teal-50/70 p-3.5 border border-teal-100 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" />
                  <p className="text-xs text-teal-900 leading-snug">
                    Instant confirmation. Guaranteed no double-booking with real-time slot locks.
                  </p>
                </div>

                <Link href="/doctors" className="block">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    Explore All Available Doctors
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section id="specialties" className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Consult Specialists Across All Medical Fields
            </h2>
            <p className="mt-3 text-slate-600">
              Browse top verified healthcare providers tailored to your personal health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec) => (
              <Link
                key={spec.name}
                href={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
                className="group p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-sky-50 group-hover:bg-sky-600 group-hover:text-white transition-colors text-sky-600 flex items-center justify-center mb-4">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {spec.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{spec.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{spec.count}</span>
                  <span className="text-sky-600 group-hover:underline">View Available &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Healthcare at Your Fingertips
            </h2>
            <p className="mt-3 text-slate-600">
              Simple 3-step process to consult with verified doctors without long waiting queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Find Your Doctor</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Filter by medical specialty, experience, reviews and consultation fee to find the perfect specialist.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="h-12 w-12 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Select Date & Time</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Choose from available working hours with real-time conflict protection. Zero double booking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Get Confirmed Care</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your doctor reviews and confirms the appointment. Receive updates, reschedule, or cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900">CuraPoint Health</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CuraPoint Medical Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/doctors" className="hover:text-sky-600">Doctors</Link>
            <Link href="/login" className="hover:text-sky-600">Doctor Portal</Link>
            <Link href="/login" className="hover:text-sky-600">Patient Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
