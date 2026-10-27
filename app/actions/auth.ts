"use server";

import { db } from "@/lib/db";
import { user as userTable, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, clearSession } from "@/lib/auth/session";
import { randomUUID } from "crypto";

export async function loginAction(email: string, password: string) {
  try {
    // Find user by email
    const [foundUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!foundUser) {
      return { error: "Invalid email or password" };
    }

    // Get password from account table
    const [foundAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, foundUser.id))
      .limit(1);

    if (!foundAccount?.password) {
      return { error: "Invalid email or password" };
    }

    // Verify password - supports both new scrypt format and old bcrypt/argon2 from Better Auth seed
    const isValid = await verifyPassword(password, foundAccount.password);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    // Create session cookie
    await createSession({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
    });

    return { success: true, role: foundUser.role };
  } catch (err: any) {
    console.error("Login error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  role: "patient" | "doctor"
) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const [existing] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.email, normalizedEmail))
      .limit(1);

    if (existing) {
      return { error: "An account with this email already exists. Please sign in." };
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    const hashed = await hashPassword(password);
    const userId = randomUUID();
    const accountId = randomUUID();
    const now = new Date();

    // Insert user
    await db.insert(userTable).values({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      emailVerified: false,
      role,
      createdAt: now,
      updatedAt: now,
    });

    // Insert account with hashed password
    await db.insert(account).values({
      id: accountId,
      accountId: normalizedEmail,
      providerId: "credential",
      userId,
      password: hashed,
      createdAt: now,
      updatedAt: now,
    });

    // Auto sign in
    await createSession({ id: userId, name: name.trim(), email: normalizedEmail, role });

    return { success: true, role };
  } catch (err: any) {
    console.error("Register error:", err);
    return { error: "Could not create account. Please try again." };
  }
}

export async function logoutAction() {
  await clearSession();
}
