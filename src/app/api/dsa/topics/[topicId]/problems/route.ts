import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { getDsaProblems } from "@/lib/dsa";

/** One sheet's problems, each carrying whether *this* student has ticked it. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ topicId: string }> },
) {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  const { topicId } = await params;
  const problems = await getDsaProblems(user.id, topicId);

  return NextResponse.json({ success: true, data: problems });
}
