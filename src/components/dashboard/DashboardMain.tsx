import Link from "next/link";
import { ArrowRight, Binary, Calculator, History, Sigma, Timer } from "lucide-react";
import { Card, Container, EmptyState, Stat, buttonStyles } from "@/components/ui";
import { SCREEN_ROUTES, practiceRoute, reviewRoute } from "@/lib/routes";
import { formatDuration } from "@/lib/format";
import type { ProgressSummary } from "@/types/aptitude";

/**
 * The signed-in student's home screen.
 *
 * This screen used to hardcode "Alex Vance (CSE '26)", 250 AI credits and a
 * 14-day streak, and advertised sixteen modules of which fourteen linked to
 * /dsa. Every number here is now either a count of content in the database or a
 * measurement of this student's own attempts — and where there is nothing to
 * measure it says so instead of showing a zero that reads like a result.
 */
export interface DashboardUser {
  name: string;
  branch: string | null;
}

export default function DashboardMain({
  user,
  topicCount,
  questionCount,
  packCount,
  progress,
}: {
  user: DashboardUser;
  topicCount: number;
  questionCount: number;
  packCount: number;
  progress: ProgressSummary;
}) {
  // Only the first name — "Welcome back, Mohit" reads better than the full
  // Google display name.
  const firstName = user.name.split(" ")[0];
  const hasActivity = progress.questionsAnswered > 0;
  const weakest = progress.byTopic[0];

  return (
    <Container className="max-w-5xl">
      <div className="border-b border-line pb-7">
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {firstName}</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          {user.branch ? `${user.branch} · ` : ""}Pick up where you left off, or
          start something new.
        </p>
      </div>

      {/* Measured, or honestly blank. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Questions answered"
          value={hasActivity ? String(progress.questionsAnswered) : null}
          hint={hasActivity ? "Across all attempts" : "Nothing recorded yet"}
        />
        <Stat
          label="Accuracy"
          value={
            progress.overallAccuracy === null ? null : `${progress.overallAccuracy}%`
          }
          hint={hasActivity ? `${progress.correctCount} correct` : "Nothing recorded yet"}
        />
        <Stat
          label="Time practised"
          value={hasActivity ? formatDuration(progress.totalTimeSeconds) : null}
          hint={hasActivity ? `${progress.attemptsCount} attempts` : "Nothing recorded yet"}
        />
      </div>

      {weakest && (
        <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              Your weakest topic so far is {weakest.topic}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {weakest.correct} of {weakest.attempted} correct ({weakest.accuracy}%).
              Measured from the questions you have answered — nothing else.
            </p>
          </div>
          <Link
            href={practiceRoute(weakest.topicId)}
            className={buttonStyles({ size: "sm" })}
          >
            Practise it
          </Link>
        </Card>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <ModuleCard
          href={SCREEN_ROUTES.dashboard}
          icon={<Calculator className="h-5 w-5" />}
          title="Aptitude practice"
          body={`${topicCount} topics across quantitative, logical reasoning and verbal, with ${questionCount} worked questions in the bank.`}
        />
        <ModuleCard
          href={SCREEN_ROUTES.company}
          icon={<Timer className="h-5 w-5" />}
          title="Company mock tests"
          body={`${packCount} timed papers modelled on real campus tests, scored on the server with +4 / −1 marking.`}
        />
        <ModuleCard
          href="/dsa"
          icon={<Binary className="h-5 w-5" />}
          title="DSA problems"
          body="Branch-wise curated sheets with LeetCode links, plus a live feed from the Codeforces API."
        />
        <ModuleCard
          href={SCREEN_ROUTES.formulas}
          icon={<Sigma className="h-5 w-5" />}
          title="Formula sheets"
          body="Quick-reference cards for the formulas that come up most often in campus aptitude rounds."
        />
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          {progress.recentAttempts.length > 0 && (
            <Link
              href={SCREEN_ROUTES.history}
              className="text-sm font-semibold text-accent hover:underline"
            >
              All attempts →
            </Link>
          )}
        </div>

        <div className="mt-4">
          {progress.recentAttempts.length === 0 ? (
            <EmptyState
              icon={<History className="h-8 w-8" />}
              title="No activity recorded yet"
              description="Your practice history will appear here once you answer a question or finish a mock test. Attempts are stored on your account, so they survive a refresh."
              action={
                <Link href={practiceRoute()} className={buttonStyles()}>
                  Start practising
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2.5">
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
                          {attempt.correctCount}/{attempt.questionCount} correct ·{" "}
                          {formatDuration(attempt.totalTimeSeconds)}
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
          )}
        </div>
      </section>
    </Container>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card interactive className="h-full p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            {icon}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
      </Card>
    </Link>
  );
}
