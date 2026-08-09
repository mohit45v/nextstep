import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "j1", title: "Backend Engineer (Go/Node.js)", company: "Uber", referralBy: "Siddharth M. (Class of '22)", location: "Bengaluru / Remote" },
    { id: "j2", title: "AI/ML Engineer", company: "NVIDIA", referralBy: "Anjali Gupta (Class of '21)", location: "Hyderabad" },
    { id: "j3", title: "Frontend Developer (Next.js)", company: "Razorpay", referralBy: "Rohan D. (Class of '23)", location: "Remote" },
  ]);
}
