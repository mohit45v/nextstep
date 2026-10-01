import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { getDsaTopics } from "@/lib/dsa";
import { toDsaBranchFilter } from "@/lib/dsa-labels";

/**
 * The curated sheets, with this student's progress.
 *
 * This route used to *be* the database — a 100-line array literal declared above
 * the handler. The data now lives in `DsaTopic`, which is what makes a solved
 * count possible at all.
 */
export async function GET(request: Request) {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  const branch = toDsaBranchFilter(
    new URL(request.url).searchParams.get("branch") ?? undefined,
  );

  const topics = await getDsaTopics(user.id, branch);
  return NextResponse.json({ success: true, data: topics });
}
