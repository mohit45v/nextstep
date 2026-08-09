import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    role: "Full Stack Software Engineer",
    estimatedWeeks: 12,
    milestones: [
      { week: 1, topic: "DSA Foundations (Arrays, Hash Maps, Strings)", completed: true },
      { week: 4, topic: "Advanced DSA (Trees, Graphs, DP)", completed: true },
      { week: 8, topic: "Backend Engineering & REST/GraphQL APIs", completed: false },
      { week: 12, topic: "System Design, Microservices & Mock Interviews", completed: false },
    ],
  });
}
