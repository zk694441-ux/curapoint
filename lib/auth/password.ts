import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // 1. Check if it's our scrypt hash: "salt:hex"
    if (hash.includes(":")) {
      const [salt, hashed] = hash.split(":");
      if (!salt || !hashed) return false;
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedBuf = Buffer.from(hashed, "hex");
      if (buf.length !== hashedBuf.length) return false;
      return timingSafeEqual(buf, hashedBuf);
    }

    // 2. Fallback to Better Auth's password check if it was hashed with better-auth
    try {
      const { verifyPassword: betterAuthVerify } = await import("better-auth/crypto");
      return await betterAuthVerify({ password, hash });
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}
