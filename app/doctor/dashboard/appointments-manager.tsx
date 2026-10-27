"use client";

import { useState } from "react";
import { updateAppointmentStatus } from "@/actions/doctor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Loader2,
} from "lucide-react";

interface AppointmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  doctorNotes: string | null;
  createdAt: Date;
}

export function DoctorAppointmentsManager({
  appointments,
}: {
  appointments: AppointmentItem[];
}) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeNotesAppt, setActiveNotesAppt] = useState<AppointmentItem | null>(null);
  const [notesText, setNotesText] = useState<string>("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = appointments.filter((appt) => {
    const matchesStatus =
      filterStatus === "all" ? true : appt.status === filterStatus;
    const matchesDate = filterDate ? appt.date === filterDate : true;
    const matchesSearch =
      searchQuery === "" ||
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesDate && matchesSearch;
  });

  const handleStatusChange = async (
    appointmentId: string,
    status: "confirmed" | "completed" | "cancelled"
  ) => {
    setLoadingId(appointmentId);
    try {
      const res = await updateAppointmentStatus({
        appointmentId,
        status,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Appointment marked as ${status}`);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeNotesAppt) return;
    setLoadingId(activeNotesAppt.id);
    try {
      const res = await updateAppointmentStatus({
        appointmentId: activeNotesAppt.id,
        status: activeNotesAppt.status as any,
        doctorNotes: notesText,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Clinical notes updated successfully");
        setActiveNotesAppt(null);
      }
    } catch {
      toast.error("Failed to save clinical notes");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <CardTitle className="text-lg font-bold">Appointment Schedule</CardTitle>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search patient..."
                className="pl-8 text-xs h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Input
              type="date"
              className="text-xs h-9 w-auto"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />

            <select
              className="text-xs h-9 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {(filterStatus !== "all" || filterDate !== "" || searchQuery !== "") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus("all");
                  setFilterDate("");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-500"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No appointments found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your date or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((appt) => {
                  const isLoading = loadingId === appt.id;

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{appt.patientName}</div>
                        <div className="text-xs text-slate-400">{appt.patientEmail}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(appt.date)}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {appt.startTime} – {appt.endTime}
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-slate-700 text-xs line-clamp-2">{appt.reason}</p>
                        {appt.doctorNotes && (
                          <div className="mt-1 text-[11px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 inline-block">
                            Notes added
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge variant={appt.status as any}>
                          {appt.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                disabled={isLoading}
                                onClick={() => handleStatusChange(appt.id, "confirmed")}
                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs text-white"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Confirm
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => handleStatusChange(appt.id, "cancelled")}
                                className="h-8 text-xs text-red-600 hover:bg-red-50"
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {appt.status === "confirmed" && (
                            <>
                              <Button
                                size="sm"
                                disabled={isLoading}
                                onClick={() => handleStatusChange(appt.id, "completed")}
                                className="h-8 bg-sky-600 hover:bg-sky-700 text-xs text-white"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Complete
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => handleStatusChange(appt.id, "cancelled")}
                                className="h-8 text-xs text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveNotesAppt(appt);
                              setNotesText(appt.doctorNotes || "");
                            }}
                            className="h-8 text-xs text-slate-600 hover:text-slate-900"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Notes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Clinical Notes Dialog */}
      <Dialog open={!!activeNotesAppt} onOpenChange={(open) => !open && setActiveNotesAppt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consultation & Clinical Notes</DialogTitle>
            <DialogDescription>
              Patient: <span className="font-semibold text-slate-800">{activeNotesAppt?.patientName}</span> ({activeNotesAppt?.date} at {activeNotesAppt?.startTime})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Patient&apos;s Reported Concern</label>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                {activeNotesAppt?.reason}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Doctor&apos;s Clinical Assessment & Advice</label>
              <Textarea
                placeholder="Prescription, diagnosis, recommended follow-up or lifestyle instructions..."
                rows={4}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveNotesAppt(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={loadingId === activeNotesAppt?.id}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {loadingId === activeNotesAppt?.id && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Save Clinical Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
