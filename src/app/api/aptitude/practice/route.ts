import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { recordPracticeAnswer } from "@/lib/attempts";
import { practiceAnswerSchema } from "@/lib/validation/aptitude";

/**
 * Records one answer from a topic-practice session.
 *
 * The practice screen already knows whether the answer was right — it has the
 * key, because it reveals the working immediately. This endpoint still decides
 * for itself: the number that ends up in the progress screen must come from the
 * database's own answer key, not from whatever the page believed.
 */
export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const parsed = practiceAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "That answer isn't in the expected shape." },
      { status: 400 },
    );
  }

  const result = await recordPracticeAnswer({ userId: user.id, ...parsed.data });
  if ("error" in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: result });
}
