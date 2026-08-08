import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    currentStreak: 14,
    longestStreak: 28,
    totalContributions: 184,
    activeDaysCount: 62,
  });
}
