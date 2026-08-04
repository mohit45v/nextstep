import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "gd1", topic: "Impact of Artificial Intelligence on Future Engineering Jobs", activeParticipants: 5, status: "Live Room" },
    { id: "gd2", topic: "EV Infrastructure vs Conventional Transport in India", activeParticipants: 4, status: "Starting in 10 mins" },
    { id: "gd3", topic: "Remote Work vs Office Work Culture", activeParticipants: 6, status: "Live Room" },
  ]);
}
