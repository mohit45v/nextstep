import Link from "next/link";
import { ArrowRight, Binary, Calculator, Sigma, Timer } from "lucide-react";
import { Card, Container, EmptyState } from "@/components/ui";
import { APTITUDE_TOPICS, COMPANY_PACKS, SAMPLE_QUESTIONS } from "@/data/aptitudeData";

/**
 * The signed-in student, passed down from the server component that read the
 * session.
 *
 * This screen used to hardcode "Alex Vance (CSE '26)", 250 AI credits and a
 * 14-day streak, and advertised sixteen modules of which fourteen linked to
 * /dsa. It now shows the real user and only the two modules that exist.
 */
export interface DashboardUser {
  name: string;
}

export default function DashboardMain({ user }: { user: DashboardUser }) {
  // Derived from the real content, so these can never overstate what is there.
  const topicCount = APTITUDE_TOPICS.length;
  const questionCount = SAMPLE_QUESTIONS.length;
  const packCount = COMPANY_PACKS.length;

  // Only the first name — "Welcome back, Mohit" reads better than the full
  // Google display name.
  const firstName = user.name.split(" ")[0];

  return (
    <Container className="max-w-5xl">
      <div className="border-b border-line pb-7">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Pick up where you left off, or start something new.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <ModuleCard
          href="/aptitude"
          icon={<Calculator className="h-5 w-5" />}
          title="Aptitude practice"
          body={`${topicCount} topics across quantitative, logical reasoning and verbal, with ${questionCount} worked questions.`}
        />
        <ModuleCard
          href="/aptitude/companies"
          icon={<Timer className="h-5 w-5" />}
          title="Company mock tests"
          body={`${packCount} timed papers modelled on real campus tests, scored with +4 / −1 marking.`}
        />
        <ModuleCard
          href="/dsa"
          icon={<Binary className="h-5 w-5" />}
          title="DSA problems"
          body="Branch-wise curated sheets with LeetCode links, plus a live feed from the Codeforces API."
        />
        <ModuleCard
          href="/aptitude/formulas"
          icon={<Sigma className="h-5 w-5" />}
          title="Formula sheets"
          body="Quick-reference cards for the formulas that come up most often in campus aptitude rounds."
        />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Your activity</h2>
        <div className="mt-4">
          {/*
            Deliberately an empty state rather than a heatmap of invented
            squares. Practice attempts are not stored yet — once the
            ExamAttempt model exists this becomes a real chart.
          */}
          <EmptyState
            title="No activity recorded yet"
            description="Your practice history will appear here once you complete a topic or a mock test."
            action={
              <Link
                href="/aptitude/practice"
                className="text-sm font-semibold text-accent hover:underline"
              >
                Start practising →
              </Link>
            }
          />
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
