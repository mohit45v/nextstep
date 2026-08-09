import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    targetRole: "Frontend Engineer (React / Next.js)",
    matchedSkills: ["React 19", "TypeScript", "Tailwind CSS", "REST API"],
    gapSkills: ["State Management (Zustand/Redux)", "E2E Testing (Playwright)", "Web Vitals Optimization"],
    alignmentScore: 78,
  });
}
