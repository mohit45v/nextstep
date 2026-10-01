import Link from "next/link";
import { Clock, FileText, Target } from "lucide-react";
import {
  Badge,
  Card,
  Container,
  DifficultyBadge,
  PageHeader,
  buttonStyles,
} from "@/components/ui";
import { examRoute } from "@/lib/routes";
import type { CompanyPackSummary } from "@/types/aptitude";

/**
 * The company packs, each honest about how much of its paper exists.
 *
 * `availableQuestions` is a count the database just ran. A card that says
 * "30 questions" and then serves six is the thing this screen used to do; now it
 * says both numbers and the "Start test" button is disabled when the bank cannot
 * fill a single section.
 */
export function CompanyTests({ packs }: { packs: CompanyPackSummary[] }) {
  const anyShort = packs.some((p) => p.availableQuestions < p.totalQuestions);

  return (
    <Container>
      <PageHeader
        title="Company mock tests"
        description="Timed papers modelled on real campus tests. Marking is +4 for a correct answer and −1 for a wrong one, scored on the server."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {packs.map((pack) => {
          const canSit = pack.availableQuestions > 0;

          return (
            <Card key={pack.id} className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: pack.logoColor }}
                  >
                    {pack.companyName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">
                      {pack.companyName}
                    </h3>
                    <p className="truncate text-xs text-ink-subtle">{pack.testTitle}</p>
                  </div>
                </div>
                <DifficultyBadge level={pack.difficulty} />
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">
                {pack.description}
              </p>

              <dl className="mt-5 grid grid-cols-3 gap-3 rounded-input bg-inset px-4 py-3">
                <Fact
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Duration"
                  value={`${pack.durationMinutes} min`}
                />
                <Fact
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label="Questions"
                  value={
                    pack.availableQuestions === pack.totalQuestions
                      ? String(pack.totalQuestions)
                      : `${pack.availableQuestions} of ${pack.totalQuestions}`
                  }
                />
                <Fact
                  icon={<Target className="h-3.5 w-3.5" />}
                  label="Cutoff"
                  value={`${pack.cutoffPercentage}%`}
                />
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {pack.sections.map((section) => (
                  <Badge key={section.name} tone="neutral">
                    {section.name} · {section.questionCount}
                  </Badge>
                ))}
              </div>

              {canSit ? (
                <Link
                  href={examRoute(pack.id)}
                  className={buttonStyles({ className: "mt-5 w-full" })}
                >
                  Start test
                </Link>
              ) : (
                <p className="mt-5 rounded-input border border-line border-dashed px-4 py-3 text-center text-sm text-ink-subtle">
                  No approved questions for this paper&rsquo;s sections yet.
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {anyShort && (
        <p className="mt-8 rounded-card border border-line border-dashed bg-surface px-5 py-4 text-sm leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">Why some papers are short.</span>{" "}
          Each pack describes the structure of the real campus test. Where the
          approved question bank cannot fill a section yet, the paper you sit is
          shorter — the questions are drawn from what exists rather than padded
          out. The second number above is what you will actually be asked.
        </p>
      )}
    </Container>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] font-medium text-ink-subtle">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
