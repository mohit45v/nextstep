import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { getCompanyPacks, getFormulaCards, getTopics } from "@/lib/aptitude";

/**
 * The aptitude content index: topics with live question counts, company packs,
 * and formula cards.
 *
 * Two things worth noting:
 *
 *  * It requires a session. The screens themselves are server components that
 *    query Prisma directly, so this endpoint exists for anything outside the
 *    render path — a future mobile client, a script, a debugging session — and
 *    "signed-in students only" applies there too.
 *  * It serves no answers. Nothing in this payload reveals a correct option.
 */
export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  const [topics, packs, formulaCards] = await Promise.all([
    getTopics(),
    getCompanyPacks(),
    getFormulaCards(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      topics,
      packs,
      formulaCards,
      // Derived, so it can never contradict the list above.
      questionCount: topics.reduce((sum, topic) => sum + topic.questionCount, 0),
    },
  });
}
