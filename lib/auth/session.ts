import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "cp_session";
const SECRET = process.env.BETTER_AUTH_SECRET || "curapoint_fallback_secret_must_be_set_in_production_32_bytes";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token: string): object | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
    if (expected !== sig) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
  };
  const token = sign(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: EXPIRES_IN,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verify(token) as any;
    if (!payload) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireDoctor(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "doctor" && user.role !== "admin") redirect("/patient/dashboard");
  return user;
}

export async function requirePatient(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "patient" && user.role !== "admin") redirect("/doctor/dashboard");
  return user;
}
