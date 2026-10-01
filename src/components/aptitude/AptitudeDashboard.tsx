import Link from "next/link";
import { ArrowRight, Building2, Sigma, Timer } from "lucide-react";
import { Badge, Card, Container, PageHeader, buttonStyles } from "@/components/ui";
import { SCREEN_ROUTES, practiceRoute } from "@/lib/routes";
import type { TopicSummary } from "@/types/aptitude";

interface DashboardProps {
  topics: TopicSummary[];
  packCount: number;
  formulaCount: number;
  questionCount: number;
}

/**
 * Aptitude landing screen.
 *
 * A server component with links, not a client component with `onNavigate`
 * callbacks: nothing here is interactive beyond navigation, so there is no state
 * to own and no reason to ship it to the browser. The counts come from the
 * database — a topic can only advertise questions that exist.
 *
 * The "Smart Recommendations" panel that used to head this page claimed things
 * like "Your accuracy in Profit & Loss is currently 40%" — personalised analysis
 * of data that was never collected. Real per-topic accuracy now lives on
 * /aptitude/analytics, measured from stored attempts.
 */
export function AptitudeDashboard({
  topics,
  packCount,
  formulaCount,
  questionCount,
}: DashboardProps) {
  const readyTopics = topics.filter((t) => t.questionCount > 0);
  const upcomingTopics = topics.filter((t) => t.questionCount === 0);

  return (
    <Container>
      <PageHeader
        title="Aptitude"
        description="Work through topics one at a time, or sit a full timed paper when you want a realistic run."
        actions={
          <Link href={SCREEN_ROUTES.company} className={buttonStyles()}>
            <Timer className="h-4 w-4" />
            Take a mock test
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink
          href={SCREEN_ROUTES.company}
          icon={<Building2 className="h-[18px] w-[18px]" />}
          title="Company tests"
          detail={`${packCount} timed ${packCount === 1 ? "paper" : "papers"}`}
        />
        <QuickLink
          href={SCREEN_ROUTES.formulas}
          icon={<Sigma className="h-[18px] w-[18px]" />}
          title="Formula sheets"
          detail={`${formulaCount} quick-reference cards`}
        />
        <QuickLink
          href={SCREEN_ROUTES.analytics}
          icon={<Timer className="h-[18px] w-[18px]" />}
          title="Your progress"
          detail="Accuracy and history"
        />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Topics</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {readyTopics.length} {readyTopics.length === 1 ? "topic" : "topics"} ready
          to practise, {questionCount} questions in total.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readyTopics.map((topic) => (
            <Card key={topic.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-semibold">{topic.name}</h3>
                <Badge tone="neutral">{topic.category}</Badge>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                {topic.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
                <span className="text-xs text-ink-subtle">
                  {topic.questionCount}{" "}
                  {topic.questionCount === 1 ? "question" : "questions"}
                </span>
                <Link
                  href={practiceRoute(topic.id)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                >
                  Practise
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Topics with no questions yet — listed honestly rather than shown with a
          fabricated question count. */}
      {upcomingTopics.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="mt-1 text-sm text-ink-muted">
            These topics are planned but have no approved questions yet.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {upcomingTopics.map((topic) => (
              <li key={topic.id}>
                <span className="inline-flex items-center rounded-full border border-line border-dashed bg-surface px-3 py-1.5 text-sm text-ink-subtle">
                  {topic.name}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}

function QuickLink({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card interactive className="flex items-center gap-3.5 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{title}</span>
          <span className="block text-xs text-ink-subtle">{detail}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </Card>
    </Link>
  );
}
