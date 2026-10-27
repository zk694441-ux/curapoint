import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding proper password hashes for demo accounts...");

  // Better Auth password hash for "DoctorPass123!" & "PatientPass123!"
  // Let's use Better Auth's internal hashPassword utility
  const { hashPassword } = await import("better-auth/crypto");
  
  const docPasswordHash = await hashPassword("DoctorPass123!");
  const patPasswordHash = await hashPassword("PatientPass123!");

  // Insert or update account for Dr. Sarah Jenkins (id: doc-1)
  await sql`
    INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES ('acc-doc-1', 'doc-1', 'credential', 'doc-1', ${docPasswordHash}, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET password = ${docPasswordHash};
  `;
  console.log("✅ Dr. Sarah Jenkins password configured!");

  // Insert or update account for Alex Morgan (id: pat-1)
  await sql`
    INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES ('acc-pat-1', 'pat-1', 'credential', 'pat-1', ${patPasswordHash}, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET password = ${patPasswordHash};
  `;
  console.log("✅ Alex Morgan (patient) password configured!");

  // Also give all other 6 doctors the DoctorPass123! password so any doctor can be logged in
  const otherDocs = ['doc-2', 'doc-3', 'doc-4', 'doc-5', 'doc-6', 'doc-7'];
  for (const docId of otherDocs) {
    await sql`
      INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (${'acc-' + docId}, ${docId}, 'credential', ${docId}, ${docPasswordHash}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET password = ${docPasswordHash};
    `;
  }
  console.log("✅ All doctors configured with DoctorPass123!");
}

main().then(() => {
  console.log("All demo authentication credentials active in Neon DB!");
  process.exit(0);
}).catch(e => {
  console.error("Error setting passwords:", e);
  process.exit(1);
});
