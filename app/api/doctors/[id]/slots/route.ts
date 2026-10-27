import { NextResponse } from "next/server";
import { getDoctorSlotsForDate } from "@/lib/availability";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: doctorId } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  const result = await getDoctorSlotsForDate(doctorId, date);
  return NextResponse.json(result);
}
