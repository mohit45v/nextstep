import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalCredits: 250,
    usedCredits: 45,
    remainingCredits: 205,
    mentorInsights: [
      { topic: "Dynamic Programming", mastery: "65%", suggestion: "Practice 0/1 Knapsack problems" },
      { topic: "Graph Algorithms", mastery: "80%", suggestion: "Review Dijkstra's shortest path" },
      { topic: "System Design", mastery: "50%", suggestion: "Study Load Balancers & Caching" },
    ],
    weeklyAiQueries: 28,
  });
}
