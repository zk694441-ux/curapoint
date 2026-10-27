"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Activity, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        toast.error("Sign in failed");
        setLoading(false);
        return;
      }

      toast.success("Welcome back!");
      // Fetch the user to know the role and redirect
      const session = await authClient.getSession();
      const role = (session?.data?.user as any)?.role;
      if (role === "doctor") {
        window.location.href = "/doctor/dashboard";
      } else {
        window.location.href = "/patient/dashboard";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const fillDoctorDemo = () => {
    setEmail("sarah.jenkins@curapoint.demo");
    setPassword("DoctorPass123!");
  };

  const fillPatientDemo = () => {
    setEmail("alex.morgan@curapoint.demo");
    setPassword("PatientPass123!");
  };

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
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In to CuraPoint</CardTitle>
          <CardDescription>
            Enter your email and password to access your health portal
          </CardDescription>
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
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-1.5 text-center font-medium">Quick Demo Logins</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs border-dashed text-slate-600 hover:text-sky-600"
                  onClick={fillDoctorDemo}
                >
                  Fill Doctor Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs border-dashed text-slate-600 hover:text-teal-600"
                  onClick={fillPatientDemo}
                >
                  Fill Patient Demo
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <p className="text-xs text-center text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-sky-600 font-semibold hover:underline">
                Register as Patient or Doctor
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
