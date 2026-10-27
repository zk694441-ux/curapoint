import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Stethoscope, User, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50/70 p-4">
      <Link href="/" className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
          <Activity className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          Cura<span className="text-sky-600">Point</span>
        </span>
      </Link>

      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-bold">Access CuraPoint</CardTitle>
          <CardDescription>
            Direct access enabled — select your view
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <Link href="/patient/dashboard" className="block">
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-all flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-teal-700">Patient Dashboard</h3>
                  <p className="text-xs text-slate-500">Alex Morgan • Direct view</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-teal-600 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/doctor/dashboard" className="block">
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-all flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-700">Doctor Dashboard</h3>
                  <p className="text-xs text-slate-500">Dr. Sarah Jenkins • Direct view</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-sky-600 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <div className="pt-2">
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full text-slate-500 text-xs">
                Back to Landing Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
