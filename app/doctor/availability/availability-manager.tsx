"use client";

import { useState } from "react";
import { updateDoctorAvailability } from "@/actions/doctor";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock, Plus, Trash2, Loader2, Save } from "lucide-react";

interface SlotSetting {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function AvailabilityManager({ initialSlots }: { initialSlots: any[] }) {
  const [slots, setSlots] = useState<SlotSetting[]>(
    initialSlots.length > 0
      ? initialSlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: s.slotDurationMinutes || 30,
        }))
      : [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
        ]
  );

  const [loading, setLoading] = useState(false);

  const handleAddDay = () => {
    // Find first day of week not added, or default to 1
    const usedDays = new Set(slots.map((s) => s.dayOfWeek));
    const nextDay = DAYS.find((d) => !usedDays.has(d.value))?.value ?? 1;

    setSlots([
      ...slots,
      {
        dayOfWeek: nextDay,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
      },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, idx) => idx !== index));
  };

  const handleUpdate = (index: number, key: keyof SlotSetting, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [key]: value };
    setSlots(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateDoctorAvailability({ slots });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Working schedule updated successfully!");
      }
    } catch {
      toast.error("Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Weekly Schedule</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddDay}
          className="text-sky-600 border-sky-200 hover:bg-sky-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Working Day
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {slots.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No working days configured. Click &quot;Add Working Day&quot; above to set your hours.
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200"
              >
                <div className="w-36">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Day</label>
                  <select
                    className="w-full text-xs h-9 rounded-md border border-slate-200 bg-white px-2 mt-0.5"
                    value={slot.dayOfWeek}
                    onChange={(e) =>
                      handleUpdate(index, "dayOfWeek", Number(e.target.value))
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Start Time</label>
                  <input
                    type="time"
                    className="w-full text-xs h-9 rounded-md border border-slate-200 bg-white px-2 mt-0.5"
                    value={slot.startTime}
                    onChange={(e) => handleUpdate(index, "startTime", e.target.value)}
                  />
                </div>

                <div className="w-28">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">End Time</label>
                  <input
                    type="time"
                    className="w-full text-xs h-9 rounded-md border border-slate-200 bg-white px-2 mt-0.5"
                    value={slot.endTime}
                    onChange={(e) => handleUpdate(index, "endTime", e.target.value)}
                  />
                </div>

                <div className="w-32">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Slot Length</label>
                  <select
                    className="w-full text-xs h-9 rounded-md border border-slate-200 bg-white px-2 mt-0.5"
                    value={slot.slotDurationMinutes}
                    onChange={(e) =>
                      handleUpdate(index, "slotDurationMinutes", Number(e.target.value))
                    }
                  >
                    <option value={15}>15 mins</option>
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>

                <div className="ml-auto pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end pt-3 border-t border-slate-100">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Availability
        </Button>
      </CardFooter>
    </Card>
  );
}
