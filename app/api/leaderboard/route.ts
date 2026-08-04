import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    userRank: 14,
    totalStudents: 1250,
    topRankers: [
      { rank: 1, name: "Rohan Verma", branch: "CSE", score: 2850, streak: 45 },
      { rank: 2, name: "Ananya Iyer", branch: "AIDS", score: 2720, streak: 38 },
      { rank: 3, name: "Siddharth Nair", branch: "IT", score: 2610, streak: 30 },
      { rank: 4, name: "Priya Sharma", branch: "ECE", score: 2540, streak: 28 },
      { rank: 5, name: "Alex Vance", branch: "CSE", score: 2480, streak: 14 },
    ],
  });
}
