import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Badge, Card, Container, PageHeader, buttonStyles } from "@/components/ui";
import { QuestionReviewForm } from "@/components/admin/QuestionReviewForm";
import { getNextDraftId, getReviewQuestion } from "@/lib/admin";
import { getTopics } from "@/lib/aptitude";
import { datasetFor } from "@/lib/datasets";
import { reviewQuestion } from "../actions";

export const metadata: Metadata = { title: "Review question" };

const STATUS_TONES = {
  DRAFT: "warn",
  APPROVED: "success",
  REJECTED: "danger",
} as const;

export default async function ReviewQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [question, topics, nextDraftId] = await Promise.all([
    getReviewQuestion(id),
    getTopics(),
    getNextDraftId(id),
  ]);
  if (!question) notFound();

  const dataset = datasetFor(question.source);

  // The action needs the question id; binding it on the server means the client
  // form cannot be re-pointed at a different question.
  const action = reviewQuestion.bind(null, question.id);

  return (
    <Container className="max-w-4xl">
      <PageHeader
        title="Review question"
        description="Work the question yourself, fix the wording, confirm the answer, then decide."
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/questions"
              className={buttonStyles({ variant: "secondary" })}
            >
              Back to queue
            </Link>
            {nextDraftId && (
              <Link href={`/admin/questions/${nextDraftId}`} className={buttonStyles()}>
                Next draft
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        }
      />

      {/* Provenance. An editor approving imported content needs to know where it
          came from and what the licence demands. */}
      <Card className="mt-8 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONES[question.status]}>{question.status}</Badge>
          <Badge tone="neutral">{dataset?.name ?? question.source}</Badge>
          {question.licence && <Badge tone="info">{question.licence}</Badge>}
          {question.attemptCount > 0 && (
            <Badge tone="accent">
              Answered {question.attemptCount}{" "}
              {question.attemptCount === 1 ? "time" : "times"}
            </Badge>
          )}
        </div>

        <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-ink-subtle">Added</dt>
            <dd className="mt-0.5 font-medium text-ink">{question.createdAtLabel}</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Source id</dt>
            <dd className="mt-0.5 font-mono break-all text-ink">
              {question.sourceId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Last decision</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {question.reviewedAtLabel
                ? `${question.reviewedAtLabel}${question.reviewedByName ? ` · ${question.reviewedByName}` : ""}`
                : "Never reviewed"}
            </dd>
          </div>
        </dl>

        {dataset?.caveats && (
          <p className="mt-4 rounded-input border border-warn-line bg-warn-soft px-4 py-3 text-xs leading-relaxed text-ink-muted">
            <span className="font-semibold text-warn">About this source.</span>{" "}
            {dataset.caveats}
          </p>
        )}

        {dataset && dataset.licenceUrl && (
          <p className="mt-3 text-xs text-ink-subtle">
            <span className="font-medium">Licence obligations:</span>{" "}
            {dataset.obligations}{" "}
            <a
              href={dataset.licenceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
            >
              {dataset.licence}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        )}
      </Card>

      <div className="mt-6">
        <QuestionReviewForm question={question} topics={topics} action={action} />
      </div>
    </Container>
  );
}
