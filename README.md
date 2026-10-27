# CuraPoint — Doctor-Patient Appointment Booking Platform

CuraPoint is a clinical-grade healthcare appointment booking and doctor scheduling platform built with Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui components, Drizzle ORM, Neon PostgreSQL, and Better Auth.

---

## ⚡ Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Radix UI primitives, Sonner (toast notifications)
- **Database & ORM**: PostgreSQL on Neon with Drizzle ORM (`drizzle-kit`)
- **Authentication**: Better Auth with email/password and role-based access control (`patient` & `doctor`)
- **Validation**: Zod (strict client and server action validation)
- **Deployment**: Vercel + Neon Database

---

## 🚀 Key Features

### 1. Patient Portal & Booking Engine
- **Specialty Directory & Doctor Search**: Filter doctors by medical specialty (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, Psychiatry, etc.) or free-text search.
- **Doctor Detail Profiles**: View doctor credentials, degrees, experience, clinic location, fees, and verified patient reviews.
- **Intelligent Slot Calculation**: Select any upcoming date to view available time slots calculated on the fly. Automatically hides past slots and slots that are already booked.
- **Double Booking Prevention**: Enforced at both the server action validation layer and the PostgreSQL database constraint layer (`uniqueIndex` on `[doctorId, date, startTime]`).
- **Patient Dashboard**:
  - View upcoming and past appointments with clinical status badges.
  - Reschedule upcoming visits to a new date and time slot.
  - Cancel visits (immediately releases the slot back to the doctor's available pool).
  - Patient Profile Editor (phone, date of birth, blood group, emergency contact).
- **Post-Visit Reviews**: Patients can leave a 1-5 star rating and feedback on completed appointments.

### 2. Doctor Portal
- **Clinical Dashboard**: Real-time stats cards (Today's Consultations, Pending Approvals, Confirmed Visits, Completed Care).
- **Appointment Schedule Manager**: Table view with search and filter by date and status (`pending`, `confirmed`, `completed`, `cancelled`).
- **Consultation Actions**:
  - Accept/Confirm pending booking requests.
  - Mark appointments as completed.
  - Cancel or decline visits.
  - Add & edit private clinical consultation notes for patients.
- **Availability & Working Hours Manager**: Define weekly practice days (Monday through Sunday), work hours (`startTime` - `endTime`), and slot duration (15m, 20m, 30m, 45m, 60m).
- **Doctor Profile Onboarding**: Edit medical specialty, bio, qualifications, experience in years, consultation fee, clinic address, and avatar image.

---

## 🔑 Demo Login Credentials

The seed script initializes the following demo accounts:

### 1. Doctor Demo Account
- **Email**: `sarah.jenkins@curapoint.demo`
- **Password**: `DoctorPass123!`
- **Name**: Dr. Sarah Jenkins, MD
- **Specialty**: Senior Cardiologist

*(Quick Fill button available directly on the `/login` screen)*

### 2. Patient Demo Account
- **Email**: `alex.morgan@curapoint.demo`
- **Password**: `PatientPass123!`
- **Name**: Alex Morgan

*(Quick Fill button available directly on the `/login` screen)*

---

## 🛠️ Step-by-Step Local Setup & Database Migration

### Step 1: Clone and Navigate
```bash
cd curapoint
npm install
```

### Step 2: Create a Free Neon Database
1. Go to [Neon.tech](https://neon.tech) and create a free PostgreSQL project.
2. Copy your connection string (`DATABASE_URL`).
3. In your `curapoint` directory, create a `.env` file (copy from `.env.example`):
```env
DATABASE_URL=postgresql://<user>:<password>@<neon-hostname>/<dbname>?sslmode=require
BETTER_AUTH_SECRET=curapoint_super_secret_jwt_and_encryption_key_2026_xyz
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Database Migrations & Seed
Run `drizzle-kit push` to push the schema into your Neon PostgreSQL database:
```bash
npm run db:push
```

Seed 7 certified doctors across specialties and 1 demo patient:
```bash
npm run db:seed
```

### Step 4: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Instructions (Vercel)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete CuraPoint medical appointment web app"
   git push origin main
   ```
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select your GitHub repository.
3. **Configure Environment Variables in Vercel**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `BETTER_AUTH_SECRET`: A secure 32+ character random secret.
   - `BETTER_AUTH_URL`: Your production Vercel URL (e.g., `https://curapoint.vercel.app`).
   - `NEXT_PUBLIC_APP_URL`: Your production Vercel URL.
4. **Deploy**:
   - Click **Deploy**. Vercel will run `npm run build` cleanly and deploy the production app.

---

## 🧪 End-to-End Verification Checklist

| Flow / Feature | Status | Verification Detail |
|---|---|---|
| **Patient Registration & Login** | Passed | User can register with role selection, sign in with email/password, and session cookie is stored |
| **Doctor Profile Setup** | Passed | Doctor can update bio, specialty, qualifications, fee, clinic location |
| **Availability Manager** | Passed | Doctor can set working days, time ranges, and slot durations |
| **Doctor Directory & Filtering** | Passed | Search by doctor name/clinic + filter by medical specialty |
| **Real-time Slot Generator** | Passed | Date picker generates slots dynamically, omitting past times & booked slots |
| **Booking Mutation & Lock** | Passed | Patient books slot with reason; DB unique index prevents double booking |
| **Doctor Dashboard Visibility** | Passed | Appointment immediately shows on doctor's dashboard in Pending status |
| **Doctor Confirm / Complete / Notes**| Passed | Doctor can confirm, complete, and write clinical notes |
| **Patient Status Sync & Reschedule**| Passed | Patient sees status changes, can reschedule or cancel visits |
| **Cancellation & Slot Release** | Passed | Cancelled appointment frees slot for other patients |
| **Doctor Reviews & Ratings** | Passed | Patient leaves star rating & feedback after appointment completion |
| **Production Build** | Passed | `npm run build` passes with zero type or prerendering errors |
