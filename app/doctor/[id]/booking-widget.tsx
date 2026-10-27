"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { bookAppointment } from "@/actions/patient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

interface SlotItem {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

interface BookingWidgetProps {
  doctor: {
    id: string;
    name: string;
    consultationFee: number;
    specialty: string;
  };
  currentUser: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export function BookingWidget({ doctor, currentUser }: BookingWidgetProps) {
  const router = useRouter();

  // Tomorrow as default date in YYYY-MM-DD
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getMinDateStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getMaxDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // 30 days ahead
    return d.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowStr());
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [reason, setReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    let isMounted = true;

    async function fetchSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      setBookingError(null);

      try {
        const res = await fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`);
        const data = await res.json();
        if (isMounted) {
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
      } finally {
        if (isMounted) {
          setLoadingSlots(false);
        }
      }
    }

    fetchSlots();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, doctor.id]);

  const handleBook = async () => {
    if (!currentUser) {
      toast.info("Please sign in as a patient to book an appointment");
      router.push(`/login?callbackUrl=/doctor/${doctor.id}`);
      return;
    }

    if (currentUser.role === "doctor") {
      toast.error("Doctor accounts cannot book appointments. Please use a patient account.");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter the reason for your appointment");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const res = await bookAppointment({
        doctorId: doctor.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
      });

      if (res.error) {
        setBookingError(res.error);
        toast.error(res.error);
        // Refresh slot availability
        const slotRes = await fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`);
        const slotData = await slotRes.json();
        setSlots(slotData.slots || []);
        setSelectedSlot(null);
      } else {
        toast.success("Appointment request sent successfully!");
        router.push("/patient/dashboard");
      }
    } catch {
      toast.error("An unexpected error occurred while booking");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-md bg-white">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Book Clinical Visit</CardTitle>
          <span className="text-sm font-extrabold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full">
            {formatCurrency(doctor.consultationFee)}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Select an available day and time slot to schedule with {doctor.name}
        </p>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {bookingError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        {/* Date Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-sky-600" />
            1. Select Date
          </label>
          <input
            type="date"
            min={getMinDateStr()}
            max={getMaxDateStr()}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-sm h-10 rounded-md border border-slate-200 bg-white px-3 focus:outline-none focus:ring-1 focus:ring-sky-600 shadow-2xs font-medium"
          />
        </div>

        {/* Time Slot Picker */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-600" />
              2. Select Time Slot
            </span>
            {selectedSlot && (
              <span className="text-xs font-bold text-sky-600">
                Selected: {selectedSlot.startTime} – {selectedSlot.endTime}
              </span>
            )}
          </label>

          {loadingSlots ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
              <span className="text-xs">Checking real-time doctor schedule...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-600">No slots available on this date</p>
              <p className="text-[11px] text-slate-400 mt-1">
                The doctor may not practice on this day or all slots are fully booked. Try selecting a different date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center ${
                      !slot.available
                        ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through"
                        : isSelected
                        ? "bg-sky-600 text-white border-sky-600 shadow-xs font-semibold"
                        : "bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/30"
                    }`}
                  >
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            3. Reason for Visit & Symptoms
          </label>
          <Textarea
            rows={3}
            placeholder="Briefly describe your symptoms or what you'd like to consult the doctor for..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Security / Guarantee */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 text-[11px]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />
          <span>Real-time DB lock prevents double-booking. Free cancellation anytime.</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-5 border-t border-slate-100 flex flex-col gap-2">
        <Button
          onClick={handleBook}
          disabled={bookingLoading || !selectedSlot || !reason.trim()}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-xs"
        >
          {bookingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Appointment Request
        </Button>
      </CardFooter>
    </Card>
  );
}
