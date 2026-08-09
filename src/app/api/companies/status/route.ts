import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    upcoming: [
      { name: "Adobe", date: "Aug 12, 2026", type: "On-Campus Drive", role: "SDE I" },
      { name: "Salesforce", date: "Aug 18, 2026", type: "Hackathon & Hiring", role: "Member of Technical Staff" },
    ],
    active: [
      { name: "Deloitte", stage: "Online Assessment (OA)", deadline: "Tomorrow, 11:59 PM" },
      { name: "Infosys Power Programmer", stage: "Technical Interview Round 1", date: "Today, 3:00 PM" },
    ],
    past: [
      { name: "Goldman Sachs", outcome: "Completed", selectedCount: 8 },
      { name: "JPMorgan Chase", outcome: "Completed", selectedCount: 12 },
    ],
  });
}
