"use client";

import React, { useMemo, useState } from "react";
import { Check, Lightbulb, Minus, X } from "lucide-react";
import type { ExamResults } from "@/types";
import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  Card,
  Container,
  EmptyState,
  PageHeader,
  Stat,
} from "@/components/ui";

type FilterMode = "all" | "correct" | "incorrect" | "skipped";

interface QuestionReviewProps {
  lastExamResults?: ExamResults | null;
  onRetakeExam?: () => void;
  onNavigateToTopics?: () => void;
}

export const QuestionReview: React.FC<QuestionReviewProps> = ({
  lastExamResults,
  onRetakeExam,
  onNavigateToTopics,
}) => {
  const [filter, setFilter] = useState<FilterMode>("all");

  const items = useMemo(() => {
    if (!lastExamResults) return [];
    return lastExamResults.detailedResults.filter((item) => {
      if (filter === "correct") return item.isCorrect;
      if (filter === "incorrect") return !item.isCorrect && !item.isSkipped;
      if (filter === "skipped") return item.isSkipped;
      return true;
    });
  }, [lastExamResults, filter]);

  /**
   * No results in memory — the student navigated here directly, or refreshed
   * after finishing. This used to fall back to a hardcoded sample result set,
   * which showed a stranger's score as if it were the student's own.
   */
  if (!lastExamResults) {
    return (
      <Container>
        <PageHeader title="Test review" />
        <div className="mt-8">
          <EmptyState
            title="No test results to show"
            description="Finish a mock test and your question-by-question review will appear here. Results aren't saved between visits yet, so a refresh clears them."
            action={
              onNavigateToTopics && (
                <Button onClick={onNavigateToTopics}>Go to practice</Button>
              )
            }
          />
        </div>
      </Container>
    );
  }

  const r = lastExamResults;
  const minutes = Math.floor(r.totalTimeSeconds / 60);
  const seconds = r.totalTimeSeconds % 60;

  const FILTERS: { id: FilterMode; label: string; count: number }[] = [
    { id: "all", label: "All", count: r.detailedResults.length },
    { id: "correct", label: "Correct", count: r.correctCount },
    { id: "incorrect", label: "Incorrect", count: r.incorrectCount },
    { id: "skipped", label: "Skipped", count: r.skippedCount },
  ];

  return (
    <Container>
      <PageHeader
        title="Test review"
        description="Every question, what you picked, and the method for getting there."
        actions={
          <div className="flex gap-2">
            {onNavigateToTopics && (
              <Button variant="secondary" onClick={onNavigateToTopics}>
                Practise topics
              </Button>
            )}
            {onRetakeExam && <Button onClick={onRetakeExam}>Retake</Button>}
          </div>
        }
      />

      {/* Score summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Score" value={`${r.totalScore} / ${r.maxScore}`} hint="+4 correct, −1 wrong" />
        <Stat label="Accuracy" value={`${r.accuracyPercentage}%`} hint="of questions attempted" />
        <Stat label="Correct" value={`${r.correctCount} of ${r.detailedResults.length}`} />
        <Stat
          label="Time taken"
          value={`${minutes}m ${String(seconds).padStart(2, "0")}s`}
          hint={`~${r.averageTimePerQuestion}s per question`}
        />
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Question list */}
      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={`No ${filter} questions`}
            description="Try a different filter."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map((item, idx) => {
            const status = item.isSkipped
              ? "skipped"
              : item.isCorrect
                ? "correct"
                : "incorrect";

            return (
              <Card key={item.questionId} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <StatusPill status={status} />
                    <span className="text-sm font-semibold text-ink">
                      Question {idx + 1}
                    </span>
                  </div>
                  <Badge tone="neutral">{item.topic}</Badge>
                </div>

                <p className="mt-4 text-[16px] leading-relaxed font-medium text-ink">
                  {item.questionText}
                </p>

                <div className="mt-4 space-y-2">
                  {item.options.map((option, i) => {
                    const isCorrect = i === item.correctOption;
                    const isPicked = i === item.userOption;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 rounded-input border px-4 py-2.5",
                          isCorrect
                            ? "border-success-line bg-success-soft"
                            : isPicked
                              ? "border-danger-line bg-danger-soft"
                              : "border-line bg-surface",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                            isCorrect
                              ? "bg-success text-white"
                              : isPicked
                                ? "bg-danger text-white"
                                : "bg-inset text-ink-subtle",
                          )}
                        >
                          {isCorrect ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          ) : isPicked ? (
                            <X className="h-3.5 w-3.5" strokeWidth={3} />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </span>
                        <span className="flex-1 text-sm text-ink">{option}</span>
                        {isPicked && (
                          <span className="shrink-0 text-xs font-medium text-ink-subtle">
                            your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="mt-4 rounded-input bg-inset px-4 py-3.5">
                    <p className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                      Explanation
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {item.explanation}
                    </p>
                  </div>
                )}

                {item.shortcutTip && (
                  <div className="mt-3 flex gap-3 rounded-input border border-warn-line bg-warn-soft px-4 py-3.5">
                    <Lightbulb className="h-[18px] w-[18px] shrink-0 text-warn" />
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-warn uppercase">
                        Shortcut
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {item.shortcutTip}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
};

function StatusPill({ status }: { status: "correct" | "incorrect" | "skipped" }) {
  const config = {
    correct: { tone: "success" as const, Icon: Check, label: "Correct" },
    incorrect: { tone: "danger" as const, Icon: X, label: "Incorrect" },
    skipped: { tone: "neutral" as const, Icon: Minus, label: "Skipped" },
  }[status];

  return (
    <Badge tone={config.tone}>
      <config.Icon className="h-3 w-3" strokeWidth={3} />
      {config.label}
    </Badge>
  );
}
