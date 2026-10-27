"use client";

import { useState } from "react";
import {
  cancelPatientAppointment,
  reschedulePatientAppointment,
  submitReview,
} from "@/actions/patient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  FileText,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Loader2,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

interface AppointmentItem {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorAvatar: string | null;
  specialty: string;
  clinicAddress: string;
  consultationFee: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  doctorNotes: string | null;
  createdAt: Date;
  reviewRating: number | null;
  reviewComment: string | null;
}

export function PatientAppointmentsClient({
  appointments,
}: {
  appointments: AppointmentItem[];
}) {
  const [activeReschedule, setActiveReschedule] = useState<AppointmentItem | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const [activeReviewAppt, setActiveReviewAppt] = useState<AppointmentItem | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  const upcomingList = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  );
  const pastList = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment? Your slot will be released.")) {
      return;
    }

    setCancelLoadingId(id);
    try {
      const res = await cancelPatientAppointment(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Appointment cancelled and slot released");
      }
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!activeReschedule || !newDate || !newTime) {
      toast.error("Please pick both a new date and time");
      return;
    }

    setRescheduleLoading(true);
    try {
      // Calculate 30 min end time default
      const [h, m] = newTime.split(":").map(Number);
      const totalMinutes = h * 60 + m + 30;
      const endH = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
      const endM = (totalMinutes % 60).toString().padStart(2, "0");
      const calculatedEnd = `${endH}:${endM}`;

      const res = await reschedulePatientAppointment({
        appointmentId: activeReschedule.id,
        date: newDate,
        startTime: newTime,
        endTime: calculatedEnd,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Appointment rescheduled successfully!");
        setActiveReschedule(null);
      }
    } catch {
      toast.error("Failed to reschedule");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!activeReviewAppt) return;
    setReviewLoading(true);

    try {
      const res = await submitReview({
        appointmentId: activeReviewAppt.id,
        doctorId: activeReviewAppt.doctorId,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Thank you for your feedback!");
        setActiveReviewAppt(null);
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const renderCard = (appt: AppointmentItem, isPast: boolean) => {
    const isCancelling = cancelLoadingId === appt.id;

    return (
      <div
        key={appt.id}
        className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {appt.doctorAvatar ? (
              <img
                src={appt.doctorAvatar}
                alt={appt.doctorName}
                className="h-12 w-12 rounded-full object-cover border border-sky-100"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-base">
                Dr
              </div>
            )}
            <div>
              <Link
                href={`/doctor/${appt.doctorId}`}
                className="font-bold text-slate-900 hover:text-sky-600 transition-colors"
              >
                {appt.doctorName}
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                  {appt.specialty}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {formatCurrency(appt.consultationFee)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={appt.status as any}>{appt.status.toUpperCase()}</Badge>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <Calendar className="h-4 w-4 text-sky-600 shrink-0" />
            <span>
              {formatDate(appt.date)} at {appt.startTime} – {appt.endTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{appt.clinicAddress}</span>
          </div>
        </div>

        {/* Reason & Doctor Notes */}
        <div className="space-y-1.5 text-xs">
          <div>
            <span className="font-semibold text-slate-700">Reason for visit: </span>
            <span className="text-slate-600">{appt.reason}</span>
          </div>

          {appt.doctorNotes && (
            <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg text-teal-900 mt-2">
              <span className="font-semibold flex items-center gap-1.5 mb-1 text-teal-800">
                <FileText className="h-3.5 w-3.5" /> Doctor Consultation Notes:
              </span>
              <p className="text-xs leading-relaxed">{appt.doctorNotes}</p>
            </div>
          )}

          {/* Show review if completed and reviewed */}
          {appt.reviewRating && (
            <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg text-amber-900 text-xs">
              <div className="flex items-center gap-1 font-semibold mb-0.5">
                <span>Your Review:</span>
                <div className="flex">
                  {Array.from({ length: appt.reviewRating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                  ))}
                </div>
              </div>
              {appt.reviewComment && <p className="italic text-slate-600">&ldquo;{appt.reviewComment}&rdquo;</p>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
          {!isPast && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveReschedule(appt);
                  setNewDate(appt.date);
                  setNewTime(appt.startTime);
                }}
                className="text-xs text-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reschedule
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isCancelling}
                onClick={() => handleCancel(appt.id)}
                className="text-xs text-rose-600 border-rose-100 hover:bg-rose-50"
              >
                {isCancelling ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Cancel Visit
                  </>
                )}
              </Button>
            </>
          )}

          {isPast && appt.status === "completed" && !appt.reviewRating && (
            <Button
              size="sm"
              onClick={() => {
                setActiveReviewAppt(appt);
                setReviewRating(5);
                setReviewComment("");
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
            >
              <Star className="h-3.5 w-3.5 mr-1 fill-white" />
              Leave Doctor Review
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingList.length})</TabsTrigger>
          <TabsTrigger value="past">Past / History ({pastList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-700">No upcoming appointments</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                You do not have any active appointments booked right now.
              </p>
              <Link href="/doctors">
                <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                  Find Doctors & Book
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingList.map((appt) => renderCard(appt, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-slate-400 text-xs">
              No past consultations found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastList.map((appt) => renderCard(appt, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog
        open={!!activeReschedule}
        onOpenChange={(open) => !open && setActiveReschedule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your consultation with {activeReschedule?.doctorName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                New Consultation Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-sm h-10 rounded-md border border-slate-200 bg-white px-3"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                New Time Slot (HH:MM)
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-sm h-10 rounded-md border border-slate-200 bg-white px-3"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReschedule(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRescheduleSubmit}
                disabled={rescheduleLoading}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                {rescheduleLoading && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Save Rescheduled Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={!!activeReviewAppt}
        onOpenChange={(open) => !open && setActiveReviewAppt(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate & Review Your Doctor</DialogTitle>
            <DialogDescription>
              Share your consultation experience with {activeReviewAppt?.doctorName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Overall Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= reviewRating
                          ? "fill-amber-400 text-amber-500"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {reviewRating} out of 5
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Your Review & Comments
              </label>
              <Textarea
                rows={3}
                placeholder="Doctor's punctuality, friendliness, treatment effectiveness..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReviewAppt(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReviewSubmit}
                disabled={reviewLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {reviewLoading && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
