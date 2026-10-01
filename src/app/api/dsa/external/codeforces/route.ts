import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { getCodeforcesProblems, isCodeforcesTag } from "@/lib/dsa";

/**
 * Proxy for the Codeforces problemset API.
 *
 * It exists so the browser never calls Codeforces directly: the response is
 * cached for five minutes server-side and shared by every student, instead of
 * each visitor hitting a rate-limited public API themselves.
 *
 * The tag is checked against a fixed list rather than passed through. An
 * arbitrary query parameter forwarded to a third party is a small open proxy,
 * and it would also blow the cache apart one unique tag at a time.
 */
export async function GET(request: Request) {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  const requested = new URL(request.url).searchParams.get("tag") ?? "dp";
  if (!isCodeforcesTag(requested)) {
    return NextResponse.json(
      { success: false, error: `Unknown tag "${requested}".` },
      { status: 400 },
    );
  }

  const result = await getCodeforcesProblems(requested);
  if ("error" in result) {
    // 502: we are fine, the upstream is not. A 500 here would send students
    // looking for a bug in NextStep.
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { tag: requested, problems: result.problems },
  });
}
