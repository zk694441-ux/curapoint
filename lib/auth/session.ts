// Direct demo user sessions - no authentication, no cookies, no redirects needed!
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const DEMO_DOCTOR: SessionUser = {
  id: "doc-1",
  name: "Dr. Sarah Jenkins",
  email: "sarah.jenkins@curapoint.demo",
  role: "doctor",
};

export const DEMO_PATIENT: SessionUser = {
  id: "pat-1",
  name: "Alex Morgan",
  email: "alex.morgan@curapoint.demo",
  role: "patient",
};

export async function getCurrentUser(): Promise<SessionUser> {
  return DEMO_PATIENT;
}

export async function requireUser(): Promise<SessionUser> {
  return DEMO_PATIENT;
}

export async function requireDoctor(): Promise<SessionUser> {
  return DEMO_DOCTOR;
}

export async function requirePatient(): Promise<SessionUser> {
  return DEMO_PATIENT;
}
