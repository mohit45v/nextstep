import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    availableSlots: [
      { id: "m1", type: "AI Voice Mock", title: "Full Stack Engineer Mock", duration: "45 mins", rating: "4.9" },
      { id: "m2", type: "Faculty 1-on-1", title: "Technical HR with Prof. Sharma", duration: "30 mins", date: "Tomorrow, 4:00 PM" },
      { id: "m3", type: "AI Technical", title: "Data Structures & System Design", duration: "60 mins", rating: "4.8" },
    ],
  });
}
