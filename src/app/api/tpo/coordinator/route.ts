import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalEligibleStudents: 480,
    placedStudents: 312,
    ongoingDrives: 6,
    averageCtc: "11.4 LPA",
    highestCtc: "44.0 LPA",
    tpoCoordinators: [
      { name: "Prof. R. Sharma", role: "Head of Training & Placement" },
      { name: "Dr. V. Kulkarni", role: "Industry Relations Lead" },
    ],
  });
}
