"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, Lightbulb, Minus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  PageHeader,
  Stat,
  buttonStyles,
} from "@/components/ui";
import { MARKS_CORRECT, MARKS_INCORRECT } from "@/lib/constants";
import { SCREEN_ROUTES, examRoute, practiceRoute } from "@/lib/routes";
import { formatDuration } from "@/lib/format";
import type { AttemptReview } from "@/types/aptitude";

type FilterMode = "all" | "correct" | "incorrect" | "skipped";

/**
 * A stored attempt, question by question.
 *
 * This screen used to fall back to a hardcoded sample result set whenever it had
 * no results in memory — showing a stranger's score as if it were the student's
 * own. It now reads one attempt from the database by id, so there is nothing to
 * fall back to: either the attempt exists and belongs to you, or the route 404s.
 */
export function QuestionReview({ review }: { review: AttemptReview }) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(review.items.map((item) => [item.questionId, item.isBookmarked])),
  );

  const items = useMemo(
    () =>
      review.items.filter((item) => {
        if (filter === "correct") return item.isCorrect;
        if (filter === "incorrect") return !item.isCorrect && !item.isSkipped;
        if (filter === "skipped") return item.isSkipped;
        return true;
      }),
    [review.items, filter],
  );

  async function toggleBookmark(questionId: string) {
    const next = !bookmarks[questionId];
    // Optimistic: the toggle is idempotent server-side, and reverting on failure
    // is more honest than leaving the icon in a state the database never saw.
    setBookmarks((prev) => ({ ...prev, [questionId]: next }));
    try {
      const res = await fetch("/api/aptitude/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, bookmarked: next }),
      });
      if (!res.ok) throw new Error("request failed");
    } catch {
      setBookmarks((prev) => ({ ...prev, [questionId]: !next }));
    }
  }

  const FILTERS: { id: FilterMode; label: string; count: number }[] = [
    { id: "all", label: "All", count: review.items.length },
    { id: "correct", label: "Correct", count: review.correctCount },
    { id: "incorrect", label: "Incorrect", count: review.incorrectCount },
    { id: "skipped", label: "Skipped", count: review.skippedCount },
  ];

  return (
    <Container>
      <PageHeader
        title={review.title}
        description={
          review.submittedAtLabel
            ? `Sat on ${review.submittedAtLabel}. Every question, what you picked, and the method for getting there.`
            : "Every question, what you picked, and the method for getting there."
        }
        actions={
          <div className="flex gap-2">
            <Link
              href={SCREEN_ROUTES.history}
              className={buttonStyles({ variant: "secondary" })}
            >
              All attempts
            </Link>
            {review.packId ? (
              <Link href={examRoute(review.packId)} className={buttonStyles()}>
                Sit it again
              </Link>
            ) : (
              <Link
                href={practiceRoute(review.topicId ?? undefined)}
                className={buttonStyles()}
              >
                Practise again
              </Link>
            )}
          </div>
        }
      />

      {/* Score summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Score"
          value={`${review.totalScore} / ${review.maxScore}`}
          hint={`+${MARKS_CORRECT} correct, ${MARKS_INCORRECT} wrong`}
        />
        <Stat
          label="Accuracy"
          value={
            review.accuracyPercentage === null ? null : `${review.accuracyPercentage}%`
          }
          hint="of questions attempted"
        />
        <Stat
          label="Correct"
          value={`${review.correctCount} of ${review.questionCount}`}
          hint={`${review.skippedCount} skipped`}
        />
        <Stat
          label="Time taken"
          value={formatDuration(review.totalTimeSeconds)}
          hint={`~${review.averageTimePerQuestion}s per question`}
        />
      </div>

      {review.cutoffPercentage !== null && (
        <p
          className={cn(
            "mt-4 rounded-card border px-5 py-3.5 text-sm leading-relaxed",
            review.clearedCutoff
              ? "border-success-line bg-success-soft text-success"
              : "border-warn-line bg-warn-soft text-warn",
          )}
        >
          <span className="font-semibold">
            {review.clearedCutoff ? "Above the cutoff." : "Below the cutoff."}
          </span>{" "}
          <span className="text-ink-muted">
            This paper&rsquo;s cutoff is {review.cutoffPercentage}% of the maximum
            marks. You scored {review.totalScore} out of {review.maxScore}.
          </span>
        </p>
      )}

      {/* What this attempt exposed — counted from these answers, nothing else. */}
      {review.recommendations.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="text-sm font-semibold">Worth another look</h2>
          <ul className="mt-3 space-y-2">
            {review.recommendations.map((rec) => (
              <li
                key={rec.topicId ?? rec.topic}
                className="flex flex-wrap items-center justify-between gap-2 rounded-input bg-inset px-4 py-2.5"
              >
                <span className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">{rec.topic}</span> —{" "}
                  {rec.errors} {rec.errors === 1 ? "error" : "errors"} in this attempt
                </span>
                {rec.topicId && (
                  <Link
                    href={practiceRoute(rec.topicId)}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    Practise this topic →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

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
            const isBookmarked = bookmarks[item.questionId] ?? false;

            return (
              <Card key={item.questionId} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-2.5">
                    <StatusPill status={status} />
                    <span className="text-sm font-semibold text-ink">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs text-ink-subtle">
                      {formatDuration(item.timeSpentSeconds)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{item.topic}</Badge>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(item.questionId)}
                      aria-pressed={isBookmarked}
                      aria-label={
                        isBookmarked ? "Remove bookmark" : "Bookmark this question"
                      }
                      className="cursor-pointer text-ink-subtle transition-colors hover:text-accent"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-[18px] w-[18px] text-accent" />
                      ) : (
                        <Bookmark className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-[16px] leading-relaxed font-medium text-ink">
                  {item.question}
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

                <div className="mt-4 rounded-input bg-inset px-4 py-3.5">
                  <p className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                    Explanation
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink-muted">
                    {item.explanation}
                  </p>
                </div>

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
}

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
