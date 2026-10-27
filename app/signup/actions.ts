"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: "patient" | "doctor"
) {
  try {
    // Use Better Auth server API to create the user
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!response || !response.user) {
      return { error: "Registration failed. Please try again." };
    }

    // Better Auth may not persist custom fields via API body —
    // forcefully update the role in the DB right after creation
    await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, response.user.id));

    return { success: true, role };
  } catch (err: any) {
    const msg: string = err?.message || "Could not complete registration";
    // Friendly message for duplicate email
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("already")) {
      return { error: "An account with this email already exists. Please sign in." };
    }
    return { error: msg };
  }
}
