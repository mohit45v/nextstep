import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/session";
import { setProblemSolved } from "@/lib/dsa";

const solveSchema = z.object({
  problemId: z.string().min(1).max(64),
  /** Explicit state, not a blind toggle: a retried request must be harmless. */
  solved: z.boolean(),
});

/**
 * Ticks or un-ticks a curated problem for the signed-in student.
 *
 * The route this replaces returned `{ solved: true }` without writing anything,
 * so the UI showed progress that never existed. That is the worst kind of bug —
 * it looks like a feature until the student comes back the next day.
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

  const parsed = solveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Expected { problemId, solved }." },
      { status: 400 },
    );
  }

  const result = await setProblemSolved(
    user.id,
    parsed.data.problemId,
    parsed.data.solved,
  );
  if ("error" in result) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: result });
}
