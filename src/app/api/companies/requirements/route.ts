import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { company: "Google", role: "Software Engineer L3", ctc: "32 LPA", minCgpa: 8.5, requiredSkills: ["DSA", "System Design", "C++/Java"] },
    { company: "Microsoft", role: "SDE I", ctc: "28 LPA", minCgpa: 8.0, requiredSkills: ["Data Structures", "OS", "DBMS", "OOP"] },
    { company: "Amazon", role: "SDE - Cloud", ctc: "26 LPA", minCgpa: 7.5, requiredSkills: ["AWS", "Java/Python", "DSA", "Distributed Systems"] },
    { company: "TCS Digital", role: "Systems Engineer", ctc: "9 LPA", minCgpa: 7.0, requiredSkills: ["Aptitude", "Python/Java", "SQL"] },
  ]);
}
