import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuestionReview } from "@/components/aptitude/QuestionReview";
import { getAttemptReview } from "@/lib/attempts";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = { title: "Test review" };

/**
 * A stored attempt, addressed by id.
 *
 * The lookup is scoped to the signed-in user inside `getAttemptReview`, so
 * guessing another student's attempt id gives a 404 rather than their paper.
 * That is also why this is not a shareable public link: it is stable for the
 * person who sat it, and nobody else.
 */
export default async function AttemptReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireProfileUser();
  const { attemptId } = await params;

  const review = await getAttemptReview(user.id, attemptId);
  if (!review) notFound();

  return <QuestionReview review={review} />;
}
