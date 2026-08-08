import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "n1", title: "🔥 14-Day Streak Maintained!", time: "2 hours ago", read: false },
    { id: "n2", title: "📢 Adobe Campus Drive Registration Open", time: "5 hours ago", read: false },
    { id: "n3", title: "🪙 +50 AI Credits Awarded for Mock Interview", time: "Yesterday", read: true },
  ]);
}
