import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user ?? null;
  } catch (err) {
    console.error("Session lookup error:", err);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireDoctor() {
  const user = await requireUser();
  if (user.role !== "doctor" && user.role !== "admin") {
    // Patient tried to access doctor area — send them home, not to patient dashboard
    // (redirecting to patient dashboard would create a loop if patient dashboard also redirects)
    redirect("/patient/dashboard");
  }
  return user;
}

export async function requirePatient() {
  const user = await requireUser();
  if (user.role !== "patient" && user.role !== "admin") {
    redirect("/doctor/dashboard");
  }
  return user;
}
