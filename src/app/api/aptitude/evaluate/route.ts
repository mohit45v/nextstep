import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { recordAttempt } from "@/lib/attempts";
import { evaluateRequestSchema } from "@/lib/validation/aptitude";

/**
 * Scores a finished mock paper and stores it.
 *
 * What changed when this moved onto the database:
 *
 *  * The answer key is read from the `Option` rows, not from a TypeScript array
 *    that also shipped to the browser. The paper the client renders no longer
 *    contains the answers at all.
 *  * The response is an attempt id, not a score. The review screen reads the
 *    stored attempt, so a result survives a refresh and can be linked to.
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

  const parsed = evaluateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "That submission isn't in the expected shape.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const { packId, topicId, submissions, elapsedSeconds } = parsed.data;

  const result = await recordAttempt({
    userId: user.id,
    mode: packId ? "MOCK_EXAM" : "TOPIC_PRACTICE",
    packId,
    topicId,
    answers: submissions,
    // Derived from how long the client had the paper open, so the stored window
    // matches the sitting rather than the instant of submission.
    startedAt: elapsedSeconds
      ? new Date(Date.now() - elapsedSeconds * 1000)
      : undefined,
  });

  if ("error" in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: { attemptId: result.attemptId, reviewUrl: `/aptitude/review/${result.attemptId}` },
  });
}
