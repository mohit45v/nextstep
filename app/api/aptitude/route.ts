import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    categories: [
      { name: "Quantitative Aptitude", totalQuizzes: 45, completed: 18 },
      { name: "Logical Reasoning", totalQuizzes: 35, completed: 22 },
      { name: "Verbal Ability & English", totalQuizzes: 30, completed: 12 },
      { name: "Data Interpretation", totalQuizzes: 20, completed: 8 },
    ],
  });
}
