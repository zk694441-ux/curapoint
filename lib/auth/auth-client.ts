import { createAuthClient } from "better-auth/react";

// Dynamically use the current origin so this works on localhost AND on Vercel
// without needing NEXT_PUBLIC_APP_URL to be set correctly at build time.
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({ baseURL });

export const { signIn, signUp, signOut, useSession } = authClient;
