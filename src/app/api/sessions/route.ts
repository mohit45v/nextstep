import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "s1", speaker: "Priya Rao (Senior HR @ Amazon)", title: "Cracking System Design & HR Rounds", time: "Aug 5, 6:00 PM", seatsLeft: 14 },
    { id: "s2", speaker: "Amitabh Sen (Tech Lead @ Microsoft)", title: "Mastering Graph & DP Algorithms", time: "Aug 7, 7:30 PM", seatsLeft: 8 },
  ]);
}
