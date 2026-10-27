"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Activity, AlertCircle, Loader2, Stethoscope, User } from "lucide-react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "doctor" ? "doctor" : "patient";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await registerAction(name, email, password, role);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    window.location.href = result.role === "doctor" ? "/doctor/profile" : "/patient/dashboard";
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create your Account</CardTitle>
        <CardDescription>Join CuraPoint to book or manage medical appointments</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">I am joining as a</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole("patient")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${role === "patient" ? "border-sky-600 bg-sky-50 text-sky-700 font-semibold" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                <User className="h-4 w-4" /> Patient
              </button>
              <button type="button" onClick={() => setRole("doctor")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${role === "doctor" ? "border-sky-600 bg-sky-50 text-sky-700 font-semibold" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                <Stethoscope className="h-4 w-4" /> Doctor
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <Input type="text" placeholder={role === "doctor" ? "Dr. Jane Doe" : "Jane Doe"} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <Input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {role === "doctor" ? "Doctor" : "Patient"} Account
          </Button>
          <p className="text-xs text-center text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-sky-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

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
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading form...</div>}>
        <SignUpContent />
      </Suspense>
    </div>
  );
}
