"use client";

import { ArrowRight, Building2, Sigma, Timer } from "lucide-react";
import {
  APTITUDE_TOPICS,
  COMPANY_PACKS,
  questionCountForTopic,
} from "@/data/aptitudeData";
import { Badge, Card, Container, PageHeader, Button } from "@/components/ui";
import type { ScreenType } from "@/lib/routes";

interface DashboardProps {
  onNavigate: (screen: ScreenType) => void;
  onStartQuiz: (topicId?: string) => void;
}

/**
 * Aptitude landing screen.
 *
 * The "Smart Recommendations" panel that used to head this page claimed things
 * like "Your accuracy in Profit & Loss is currently 40%" — personalised
 * analysis of data that was never collected. It is gone until real attempts
 * exist to analyse.
 */
export const AptitudeDashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onStartQuiz,
}) => {
  const readyTopics = APTITUDE_TOPICS.filter((t) => questionCountForTopic(t.id) > 0);
  const upcomingTopics = APTITUDE_TOPICS.filter(
    (t) => questionCountForTopic(t.id) === 0,
  );

  return (
    <Container>
      <PageHeader
        title="Aptitude"
        description="Work through topics one at a time, or sit a full timed paper when you want a realistic run."
        actions={
          <Button onClick={() => onNavigate("company")}>
            <Timer className="h-4 w-4" />
            Take a mock test
          </Button>
        }
      />

      {/* Quick links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink
          icon={<Building2 className="h-[18px] w-[18px]" />}
          title="Company tests"
          detail={`${COMPANY_PACKS.length} timed papers`}
          onClick={() => onNavigate("company")}
        />
        <QuickLink
          icon={<Sigma className="h-[18px] w-[18px]" />}
          title="Formula sheets"
          detail="Quick reference"
          onClick={() => onNavigate("formulas")}
        />
        <QuickLink
          icon={<Timer className="h-[18px] w-[18px]" />}
          title="Your progress"
          detail="Practice history"
          onClick={() => onNavigate("analytics")}
        />
      </div>

      {/* Topics with questions */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Topics</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {readyTopics.length} topics ready to practise.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readyTopics.map((topic) => {
            const count = questionCountForTopic(topic.id);
            return (
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
                    {count} {count === 1 ? "question" : "questions"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartQuiz(topic.id)}
                    className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-accent hover:underline"
                  >
                    Practise
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Topics still being written — listed honestly rather than shown with a
          fabricated question count. */}
      {upcomingTopics.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="mt-1 text-sm text-ink-muted">
            These topics are planned but have no questions written yet.
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
};

function QuickLink({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group text-left">
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
    </button>
  );
}
