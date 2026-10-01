import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { getProgressSummary } from "@/lib/attempts";

/**
 * The signed-in student's measured progress.
 *
 * Scoped to `user.id` from the session — there is no `?userId=` parameter, by
 * design. One student's accuracy is not another student's business, and an
 * endpoint that takes an id is one missing check away from leaking it.
 */
export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  const progress = await getProgressSummary(user.id);
  return NextResponse.json({ success: true, data: progress });
}
