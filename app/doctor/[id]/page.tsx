import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { Navbar } from "@/components/navbar";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";
import { eq, desc, sql } from "drizzle-orm";
import { BookingWidget } from "./booking-widget";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
  Phone,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DoctorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const doctorData = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      avatarUrl: schema.doctorProfiles.avatarUrl,
      specialty: schema.doctorProfiles.specialty,
      bio: schema.doctorProfiles.bio,
      qualifications: schema.doctorProfiles.qualifications,
      experienceYears: schema.doctorProfiles.experienceYears,
      consultationFee: schema.doctorProfiles.consultationFee,
      clinicAddress: schema.doctorProfiles.clinicAddress,
      phone: schema.doctorProfiles.phone,
    })
    .from(schema.user)
    .innerJoin(
      schema.doctorProfiles,
      eq(schema.user.id, schema.doctorProfiles.userId)
    )
    .where(eq(schema.user.id, id))
    .limit(1);

  if (doctorData.length === 0) {
    notFound();
  }

  const doctor = doctorData[0];

  // Fetch Reviews
  const reviews = await db
    .select({
      id: schema.reviews.id,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      createdAt: schema.reviews.createdAt,
      patientName: schema.user.name,
    })
    .from(schema.reviews)
    .innerJoin(schema.user, eq(schema.reviews.patientId, schema.user.id))
    .where(eq(schema.reviews.doctorId, doctor.id))
    .orderBy(desc(schema.reviews.createdAt));

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Doctor Profile & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                {doctor.avatarUrl ? (
                  <img
                    src={doctor.avatarUrl}
                    alt={doctor.name}
                    className="h-24 w-24 rounded-2xl object-cover border-2 border-sky-100 shadow-xs"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-2xl">
                    Dr
                  </div>
                )}

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
                    <span className="inline-flex items-center text-teal-600">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full inline-block">
                    {doctor.specialty}
                  </p>
                  <p className="text-xs text-slate-500">{doctor.qualifications}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                      {avgRating} ({reviews.length} reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.experienceYears} Years Experience
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Consultation Fee</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(doctor.consultationFee)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Specialty Focus</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {doctor.specialty}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Clinic Phone</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {doctor.phone || "On Request"}
                  </span>
                </div>
              </div>

              {/* Bio & Clinic Location */}
              <div className="space-y-4 pt-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-sky-600" />
                    About & Clinical Philosophy
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {doctor.bio}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-sky-600" />
                    Education & Credentials
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {doctor.qualifications}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sky-600" />
                    Clinic & Hospital Location
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {doctor.clinicAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Patient Feedback & Reviews</span>
                <span className="text-xs font-semibold text-slate-500">
                  {reviews.length} total reviews
                </span>
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No patient reviews yet. Be the first to leave a review after your visit!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {rev.patientName}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-amber-400 text-amber-500"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Booking Widget */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <BookingWidget doctor={doctor} currentUser={currentUser} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
