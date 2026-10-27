"use client";

import { useState } from "react";
import { updatePatientProfile } from "@/actions/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface PatientProfileFormProps {
  profile: any;
  patientUser: {
    id: string;
    name: string;
    email: string;
  };
}

export function PatientProfileForm({ profile, patientUser }: PatientProfileFormProps) {
  const [phone, setPhone] = useState(profile?.phone || "+1 (555) 998-1122");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || "1994-06-15");
  const [gender, setGender] = useState<any>(profile?.gender || "female");
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || "O+");
  const [emergencyContact, setEmergencyContact] = useState(
    profile?.emergencyContact || "Jordan Morgan (+1 555-998-1123)"
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updatePatientProfile({
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        emergencyContact,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile updated successfully!");
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
        <CardTitle className="text-lg">Patient Profile</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <Input value={patientUser.name} disabled className="bg-slate-50 text-slate-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input value={patientUser.email} disabled className="bg-slate-50 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <Input
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Gender</label>
              <select
                className="w-full text-sm h-9 rounded-md border border-slate-200 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-sky-600"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Blood Group</label>
              <Input
                placeholder="e.g. O+, A-, B+"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Emergency Contact</label>
              <Input
                placeholder="Name & Contact phone"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-3 border-t border-slate-100">
          <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700 text-white">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Details
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
