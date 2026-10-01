import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MockExamSimulator } from "@/components/aptitude/MockExamSimulator";
import { Container, EmptyState, PageHeader, buttonStyles } from "@/components/ui";
import { getExamPaper } from "@/lib/aptitude";
import { requireProfileUser } from "@/lib/session";
import { SCREEN_ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Mock test" };

/**
 * One sitting of a company pack.
 *
 * The pack is a route parameter rather than React context, which is what makes
 * the exam survive a refresh of the page it starts on and lets a student open a
 * paper from a link. The paper itself is built on the server and arrives without
 * the answer key — see `getExamPaper`.
 */
export default async function ExamPage({
  params,
}: {
  params: Promise<{ packId: string }>;
}) {
  await requireProfileUser();

  const { packId } = await params;
  const paper = await getExamPaper(packId);
  if (!paper) notFound();

  // A pack whose sections draw on categories with no approved questions. The
  // alternative — an exam screen with zero questions — would crash on render.
  if (paper.questions.length === 0) {
    return (
      <Container>
        <PageHeader title={paper.companyName} description={paper.testTitle} />
        <div className="mt-8">
          <EmptyState
            title="This paper has no questions yet"
            description="None of this pack's sections have approved questions in the bank. Try another paper, or practise a topic in the meantime."
            action={
              <Link href={SCREEN_ROUTES.company} className={buttonStyles()}>
                Back to tests
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  return <MockExamSimulator paper={paper} />;
}
