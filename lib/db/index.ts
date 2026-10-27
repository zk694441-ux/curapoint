import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
import path from "path";

const connectionString = process.env.DATABASE_URL;

// If a real Neon DATABASE_URL is provided, use Neon HTTP driver.
// Otherwise, seamlessly fall back to an embedded zero-config PostgreSQL instance (PGlite)
// so the user can test the app immediately with zero manual cloud setup!
let dbInstance: any;

if (
  connectionString &&
  !connectionString.includes("ep-sample-123456") &&
  !connectionString.includes("placeholder")
) {
  const sql = neon(connectionString);
  dbInstance = drizzleNeon(sql, { schema });
} else {
  // Embedded local PostgreSQL database
  const dbPath = path.join(process.cwd(), "curapoint_local_db");
  const pglite = new PGlite(dbPath);
  dbInstance = drizzlePglite(pglite, { schema });
}

export const db = dbInstance;
