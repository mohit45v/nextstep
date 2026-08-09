"use client";

import React from "react";
import { Clock, FileText, Target } from "lucide-react";
import { COMPANY_PACKS, CompanyTestPack, packQuestionCount } from "@/data/aptitudeData";
import {
  Badge,
  Button,
  Card,
  Container,
  DifficultyBadge,
  PageHeader,
} from "@/components/ui";

interface CompanyTestsProps {
  onStartExam: (testPack: CompanyTestPack) => void;
}

export const CompanyTests: React.FC<CompanyTestsProps> = ({ onStartExam }) => {
  return (
    <Container>
      <PageHeader
        title="Company mock tests"
        description="Timed papers modelled on real campus tests. Marking is +4 for a correct answer and −1 for a wrong one, scored on the server."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {COMPANY_PACKS.map((pack) => (
          <Card key={pack.id} className="flex flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
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
                    <p className="truncate text-xs text-ink-subtle">
                      {pack.testTitle}
                    </p>
                  </div>
                </div>
              </div>
              <DifficultyBadge level={pack.difficulty} />
            </div>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">
              {pack.description}
            </p>

            {/* Test facts */}
            <dl className="mt-5 grid grid-cols-3 gap-3 rounded-input bg-inset px-4 py-3">
              <Fact
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Duration"
                value={`${pack.durationMinutes} min`}
              />
              <Fact
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Questions"
                value={String(packQuestionCount(pack))}
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

            <Button className="mt-5 w-full" onClick={() => onStartExam(pack)}>
              Start test
            </Button>
          </Card>
        ))}
      </div>

      <p className="mt-8 rounded-card border border-line border-dashed bg-surface px-5 py-4 text-sm leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">Note on question counts.</span>{" "}
        These papers describe the structure of the real campus tests. The
        question bank is still being written, so a test draws from the questions
        that exist rather than the full count shown above.
      </p>
    </Container>
  );
};

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
