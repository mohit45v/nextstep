import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "e1", student: "Karan Mehta (Placed @ Atlassian)", title: "SDE Internship Interview Experience", rounds: "3 Rounds (DSA + System Design + HR)", keyTip: "Focus heavily on graph algorithm edge cases and clean code." },
    { id: "e2", student: "Sneha Patel (Placed @ Oracle)", title: "Database & Backend Engineer Interview", rounds: "4 Rounds", keyTip: "Be thorough with SQL indexing, transactions, and concurrency." },
  ]);
}
