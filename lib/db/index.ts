import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ Warning: DATABASE_URL is not set in environment.");
}

const sql = neon(connectionString || "postgresql://placeholder:placeholder@ep-dummy.us-east-2.aws.neon.tech/neondb?sslmode=require");
export const db = drizzle(sql, { schema });
