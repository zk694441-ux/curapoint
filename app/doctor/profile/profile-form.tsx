"use client";

import { useState } from "react";
import { updateDoctorProfile } from "@/actions/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Stethoscope, Save } from "lucide-react";

interface DoctorProfileFormProps {
  profile: any;
  doctorUser: {
    id: string;
    name: string;
    email: string;
  };
}

export function DoctorProfileForm({ profile, doctorUser }: DoctorProfileFormProps) {
  const [specialty, setSpecialty] = useState(profile?.specialty || "General Medicine");
  const [bio, setBio] = useState(
    profile?.bio ||
      "Experienced physician committed to delivering empathetic, high-standard patient diagnosis and comprehensive care."
  );
  const [qualifications, setQualifications] = useState(
    profile?.qualifications || "MD, MBBS"
  );
  const [experienceYears, setExperienceYears] = useState(
    profile?.experienceYears?.toString() || "8"
  );
  const [consultationFee, setConsultationFee] = useState(
    profile?.consultationFee?.toString() || "80"
  );
  const [clinicAddress, setClinicAddress] = useState(
    profile?.clinicAddress || "Central Care Clinic, Health Plaza Suite 200"
  );
  const [phone, setPhone] = useState(profile?.phone || "+1 (555) 012-3456");
  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80"
  );
  const [loading, setLoading] = useState(false);

  const specialtiesList = [
    "General Medicine",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "Neurology",
    "Psychiatry",
    "Gynecology",
    "Ophthalmology",
    "ENT",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateDoctorProfile({
        specialty,
        bio,
        qualifications,
        experienceYears: Number(experienceYears),
        consultationFee: Number(consultationFee),
        clinicAddress,
        phone,
        avatarUrl,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile saved successfully!");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Public Clinical Information</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input value={doctorUser.name} disabled className="bg-slate-50 text-slate-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Account Email</label>
              <Input value={doctorUser.email} disabled className="bg-slate-50 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Medical Specialty</label>
              <select
                className="w-full text-sm h-9 rounded-md border border-slate-200 bg-white px-3 py-1 focus:outline-none focus:ring-1 focus:ring-sky-600"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {specialtiesList.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Qualifications & Degree</label>
              <Input
                placeholder="e.g. MD, FACC, Harvard Medical School"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Experience (Years)</label>
              <Input
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Consultation Fee ($ USD)</label>
              <Input
                type="number"
                min="10"
                max="2000"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Clinic / Hospital Address</label>
            <Input
              placeholder="Suite #, Building, Street, City"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Doctor Bio & Philosophy of Care</label>
            <Textarea
              rows={4}
              placeholder="Tell patients about your medical background, approach to patient care, and areas of expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Avatar Image URL</label>
            <Input
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-2 border-t border-slate-100">
          <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
