import "dotenv/config";

// This script registers demo users through Better Auth's API
// so they get proper password hashes in the account table.

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

async function registerUser(name: string, email: string, password: string, role: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Registered: ${email} (${role})`);
    } else {
      console.log(`⚠️ ${email}: ${data?.message || JSON.stringify(data)}`);
    }
  } catch (err: any) {
    console.error(`❌ Failed ${email}:`, err.message);
  }
}

async function main() {
  console.log("🔐 Registering demo accounts via Better Auth API...");
  console.log(`   Base URL: ${BASE_URL}\n`);

  // Register demo doctor
  await registerUser("Dr. Sarah Jenkins", "sarah.jenkins@curapoint.demo", "DoctorPass123!", "doctor");

  // Register demo patient
  await registerUser("Alex Morgan", "alex.morgan@curapoint.demo", "PatientPass123!", "patient");

  console.log("\n✅ Done! You can now log in with:");
  console.log("   Doctor:  sarah.jenkins@curapoint.demo / DoctorPass123!");
  console.log("   Patient: alex.morgan@curapoint.demo / PatientPass123!");
}

main().then(() => process.exit(0)).catch(console.error);
