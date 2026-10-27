import Link from "next/link";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Briefcase,
  Stethoscope,
  Filter,
} from "lucide-react";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface DoctorsPageProps {
  searchParams: Promise<{
    search?: string;
    specialty?: string;
  }>;
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const specialty = params.specialty || "";

  // Fetch all doctors with their profiles
  const doctorsQuery = await db
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
    })
    .from(schema.user)
    .innerJoin(
      schema.doctorProfiles,
      eq(schema.user.id, schema.doctorProfiles.userId)
    )
    .where(eq(schema.user.role, "doctor"));

  // Fetch ratings summary
  const reviewsData = await db
    .select({
      doctorId: schema.reviews.doctorId,
      avgRating: sql<number>`round(avg(${schema.reviews.rating}), 1)`,
      totalReviews: sql<number>`count(${schema.reviews.id})`,
    })
    .from(schema.reviews)
    .groupBy(schema.reviews.doctorId);

  const reviewMap = new Map<string, { avg: number; count: number }>(
    reviewsData.map((r: any) => [r.doctorId, { avg: Number(r.avgRating) || 5.0, count: Number(r.totalReviews) || 1 }])
  );

  const filteredDoctors = doctorsQuery.filter((doc: any) => {
    const matchesSearch =
      search === "" ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.clinicAddress.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialty =
      specialty === "" || doc.specialty.toLowerCase() === specialty.toLowerCase();

    return matchesSearch && matchesSpecialty;
  });

  const allSpecialties = [
    "All Specialties",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "General Medicine",
    "Neurology",
    "Psychiatry",
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <Navbar />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Find & Book Top Doctors
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare doctors by specialty, ratings, experience and book confirmed appointments.
          </p>

          <form
            method="GET"
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                name="search"
                defaultValue={search}
                placeholder="Search by doctor name, condition, clinic..."
                className="pl-10 h-11 bg-white shadow-xs"
              />
            </div>

            <select
              name="specialty"
              defaultValue={specialty}
              className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-sky-600 sm:w-56"
            >
              {allSpecialties.map((spec) => (
                <option
                  key={spec}
                  value={spec === "All Specialties" ? "" : spec}
                >
                  {spec}
                </option>
              ))}
            </select>

            <Button type="submit" className="h-11 bg-sky-600 hover:bg-sky-700 px-6">
              Search Doctors
            </Button>
          </form>
        </div>

        {/* Doctor Cards Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-lg mx-auto">
            <Stethoscope className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No doctors found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              We couldn&apos;t find any doctors matching your search filters.
            </p>
            <Link href="/doctors">
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc: any) => {
              const reviewInfo = reviewMap.get(doc.id) || { avg: 5.0, count: 1 };
              const initialLetters = doc.name
                .replace("Dr.", "")
                .trim()
                .slice(0, 2)
                .toUpperCase();

              return (
                <Card
                  key={doc.id}
                  className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between bg-white"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {doc.avatarUrl ? (
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-sky-100 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-lg shrink-0">
                          {initialLetters}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/doctor/${doc.id}`}
                          className="font-bold text-base text-slate-900 hover:text-sky-600 transition-colors truncate block"
                        >
                          {doc.name}
                        </Link>
                        <p className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full inline-block mt-1">
                          {doc.specialty}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {doc.qualifications}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {doc.bio}
                    </p>

                    <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          Experience
                        </span>
                        <span className="font-semibold text-slate-700">
                          {doc.experienceYears} Years
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          Location
                        </span>
                        <span className="text-slate-700 truncate max-w-[160px] text-right">
                          {doc.clinicAddress}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                          Rating
                        </span>
                        <span className="font-semibold text-slate-800">
                          {reviewInfo.avg} ({reviewInfo.count} reviews)
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                        Fee
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {formatCurrency(doc.consultationFee)}
                      </span>
                    </div>

                    <Link href={`/doctor/${doc.id}`}>
                      <Button size="sm" className="bg-sky-600 hover:bg-sky-700 shadow-xs">
                        Book Visit
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
