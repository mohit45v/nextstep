import Link from "next/link";
import { History } from "lucide-react";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  PageHeader,
  Stat,
  buttonStyles,
} from "@/components/ui";
import { SCREEN_ROUTES, reviewRoute } from "@/lib/routes";
import { formatDuration } from "@/lib/format";
import type { AttemptSummary } from "@/types/aptitude";

/**
 * Everything the student has sat, newest first.
 *
 * This list is the visible proof that attempts are persisted: before Weekend 4
 * there was nothing to list, because a finished paper lived in React state until
 * the next navigation threw it away.
 */
export function AttemptHistory({ attempts }: { attempts: AttemptSummary[] }) {
  const exams = attempts.filter((a) => a.mode === "MOCK_EXAM");

  return (
    <Container>
      <PageHeader
        title="Your attempts"
        description="Every paper and practice session you have finished. Open one to see the question-by-question review."
        actions={
          <Link href={SCREEN_ROUTES.company} className={buttonStyles()}>
            Take a mock test
          </Link>
        }
      />

      {attempts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title="Nothing recorded yet"
            description="Finish a mock test or answer a practice question and it will show up here — results are stored on your account now, so they survive a refresh."
            action={
              <Link href={SCREEN_ROUTES.company} className={buttonStyles()}>
                Browse company tests
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Attempts" value={String(attempts.length)} />
            <Stat label="Mock papers" value={String(exams.length)} />
            <Stat
              label="Time practised"
              value={formatDuration(
                attempts.reduce((sum, a) => sum + a.totalTimeSeconds, 0),
              )}
            />
          </div>

          <ul className="mt-8 space-y-3">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <Link href={reviewRoute(attempt.id)} className="block">
                  <Card interactive className="flex flex-wrap items-center gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[15px] font-semibold text-ink">
                          {attempt.title}
                        </h2>
                        <Badge tone={attempt.mode === "MOCK_EXAM" ? "accent" : "neutral"}>
                          {attempt.mode === "MOCK_EXAM" ? "Mock paper" : "Practice"}
                        </Badge>
                        {attempt.clearedCutoff !== null && (
                          <Badge tone={attempt.clearedCutoff ? "success" : "warn"}>
                            {attempt.clearedCutoff ? "Cleared cutoff" : "Below cutoff"}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink-subtle">
                        {attempt.submittedAtLabel ?? "In progress"} ·{" "}
                        {attempt.questionCount}{" "}
                        {attempt.questionCount === 1 ? "question" : "questions"} ·{" "}
                        {formatDuration(attempt.totalTimeSeconds)}
                      </p>
                    </div>

                    <dl className="flex shrink-0 gap-6">
                      <div>
                        <dt className="text-[11px] text-ink-subtle uppercase">Score</dt>
                        <dd className="text-lg font-bold text-ink tabular-nums">
                          {attempt.totalScore}
                          <span className="text-sm font-normal text-ink-subtle">
                            /{attempt.maxScore}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] text-ink-subtle uppercase">
                          Accuracy
                        </dt>
                        <dd className="text-lg font-bold text-ink tabular-nums">
                          {attempt.accuracyPercentage === null
                            ? "—"
                            : `${attempt.accuracyPercentage}%`}
                        </dd>
                      </div>
                    </dl>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Container>
  );
}
