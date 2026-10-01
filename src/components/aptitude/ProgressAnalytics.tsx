import Link from "next/link";
import { BarChart3 } from "lucide-react";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  PageHeader,
  Stat,
  buttonStyles,
} from "@/components/ui";
import { SCREEN_ROUTES, practiceRoute, reviewRoute } from "@/lib/routes";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ProgressSummary, TopicSummary } from "@/types/aptitude";

/**
 * Measured progress.
 *
 * This page previously computed "weak" and "strong" topics from an `accuracy`
 * number hardcoded into each topic, and told students who had never answered a
 * question that their accuracy was low. Every number here is now a query over
 * that student's own `QuestionAttempt` rows: accuracy is correct ÷ answered, per
 * topic, with skips counted separately because skipping is a decision rather than
 * a wrong answer.
 *
 * A topic the student has not practised is absent rather than shown as 0% — no
 * data is not the same as bad data.
 */
export function ProgressAnalytics({
  progress,
  topics,
}: {
  progress: ProgressSummary;
  topics: TopicSummary[];
}) {
  const hasData = progress.questionsAnswered > 0;
  const practisedTopicIds = new Set(progress.byTopic.map((t) => t.topicId));
  const untouched = topics.filter(
    (t) => t.questionCount > 0 && !practisedTopicIds.has(t.id),
  );

  return (
    <Container>
      <PageHeader
        title="Your progress"
        description="Accuracy per topic, measured from every question you have answered."
        actions={
          <Link
            href={SCREEN_ROUTES.history}
            className={buttonStyles({ variant: "secondary" })}
          >
            All attempts
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Questions answered"
          value={hasData ? String(progress.questionsAnswered) : null}
          hint={hasData ? `${progress.skippedCount} skipped` : "Not recorded yet"}
        />
        <Stat
          label="Overall accuracy"
          value={
            progress.overallAccuracy === null ? null : `${progress.overallAccuracy}%`
          }
          hint={hasData ? `${progress.correctCount} correct` : "Not recorded yet"}
        />
        <Stat
          label="Attempts"
          value={progress.attemptsCount > 0 ? String(progress.attemptsCount) : null}
          hint={
            progress.attemptsCount > 0
              ? `${progress.examsCount} mock ${progress.examsCount === 1 ? "paper" : "papers"}`
              : "Not recorded yet"
          }
        />
        <Stat
          label="Time practised"
          value={hasData ? formatDuration(progress.totalTimeSeconds) : null}
          hint={hasData ? "Across all attempts" : "Not recorded yet"}
        />
      </div>

      {!hasData ? (
        <div className="mt-6">
          <EmptyState
            icon={<BarChart3 className="h-8 w-8" />}
            title="No practice history yet"
            description="Answer a practice question or sit a mock paper and this page fills in. Your answers are stored against your account, so the numbers here are only ever things you actually did."
            action={
              <Link href={practiceRoute()} className={buttonStyles()}>
                Start practising
              </Link>
            }
          />
        </div>
      ) : (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Accuracy by topic</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Weakest first. Based on {progress.questionsAnswered} answered{" "}
            {progress.questionsAnswered === 1 ? "question" : "questions"}.
          </p>

          <div className="mt-5 space-y-3">
            {progress.byTopic.map((row) => (
              <Card key={row.topicId} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold">{row.topic}</h3>
                      <Badge tone="neutral">{row.category}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {row.correct} of {row.attempted} correct
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold tabular-nums">{row.accuracy}%</span>
                    <Link
                      href={practiceRoute(row.topicId)}
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      Practise
                    </Link>
                  </div>
                </div>

                {/* A bar, not a chart library: one number per row, and the width
                    is the number. */}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-inset">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      row.accuracy >= 70
                        ? "bg-success"
                        : row.accuracy >= 40
                          ? "bg-warn"
                          : "bg-danger",
                    )}
                    style={{ width: `${row.accuracy}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {progress.recentAttempts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Recent attempts</h2>
          <ul className="mt-4 space-y-2.5">
            {progress.recentAttempts.map((attempt) => (
              <li key={attempt.id}>
                <Link href={reviewRoute(attempt.id)} className="block">
                  <Card
                    interactive
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{attempt.title}</p>
                      <p className="mt-0.5 text-xs text-ink-subtle">
                        {attempt.submittedAtLabel ?? "In progress"} ·{" "}
                        {attempt.questionCount}{" "}
                        {attempt.questionCount === 1 ? "question" : "questions"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink tabular-nums">
                      {attempt.accuracyPercentage === null
                        ? "—"
                        : `${attempt.accuracyPercentage}%`}
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {untouched.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Not practised yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {untouched.length}{" "}
            {untouched.length === 1 ? "topic has" : "topics have"} questions you
            haven&rsquo;t answered.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {untouched.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={practiceRoute(topic.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-accent-line hover:text-accent"
                >
                  {topic.name}
                  <span className="text-xs text-ink-subtle">{topic.questionCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
