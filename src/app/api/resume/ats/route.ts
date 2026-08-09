import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    atsScore: 84,
    status: "Strong Match",
    missingKeywords: ["Docker", "Kubernetes", "GraphQL"],
    strengthAreas: ["React/Next.js", "Data Structures", "Tailwind CSS", "REST APIs"],
    recommendations: "Add 2 cloud projects and quantify impact metrics in your experience bullet points.",
  });
}
