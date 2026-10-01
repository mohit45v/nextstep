"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  Card,
  Container,
  DifficultyBadge,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { CATEGORY_FILTERS, type CategoryFilter } from "@/lib/aptitude-labels";
import { practiceRoute, reviewRoute } from "@/lib/routes";
import type { PracticeQuestion, TopicSummary } from "@/types/aptitude";

interface TopicPracticeProps {
  topics: TopicSummary[];
  activeTopic: TopicSummary | null;
  questions: PracticeQuestion[];
  category: CategoryFilter;
}

/**
 * Self-paced practice: one question, answer, full working.
 *
 * Switching topic or category is a navigation, and the page gives this component
 * a `key` of the topic id — so a new topic remounts it with fresh state instead
 * of resetting six pieces of state from an effect.
 *
 * Two things moved out of this component when the bank went into Postgres.
 *
 *  * **Which questions to show.** The topic and the category filter are in the
 *    URL, and the server fetches that topic's questions. The old version held
 *    every question in the bundle and filtered in the browser — fine for six
 *    questions, hopeless for a few thousand.
 *  * **What counts as practice.** Each checked answer is posted to
 *    /api/aptitude/practice, which decides right or wrong from the database and
 *    appends it to one practice attempt. That is what makes the accuracy on
 *    /aptitude/analytics real rather than an invented number.
 */
export function TopicPractice({
  topics,
  activeTopic,
  questions,
  category,
}: TopicPracticeProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.isBookmarked])),
  );
  const [saveFailed, setSaveFailed] = useState(false);

  /**
   * The practice attempt this session is appending to.
   *
   * Created by the server on the first answer and reused after that, so a
   * sitting of ten questions is one attempt in the history rather than ten.
   * State, not a ref: the "review this session" link at the end renders from it.
   */
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Set on mount rather than in the initialiser — `Date.now()` during render is
  // impure and would give a different answer on every re-render.
  const questionShownAt = useRef<number>(0);
  useEffect(() => {
    questionShownAt.current = Date.now();
  }, []);

  const question = questions[index];

  function goTo(nextIndex: number) {
    setIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
    questionShownAt.current = Date.now();
  }

  async function checkAnswer() {
    if (selected === null || !question || !activeTopic) return;
    setSubmitted(true);

    const timeSpentSeconds =
      questionShownAt.current === 0
        ? 0
        : Math.round((Date.now() - questionShownAt.current) / 1000);

    try {
      const res = await fetch("/api/aptitude/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          topicId: activeTopic.id,
          questionId: question.id,
          selectedOption: selected,
          timeSpentSeconds,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("not recorded");
      setAttemptId(data.data.attemptId);
      setSaveFailed(false);
    } catch {
      // The working is already on screen and still correct — only the record
      // failed. Say so rather than pretending the attempt was saved.
      setSaveFailed(true);
    }
  }

  async function toggleBookmark(questionId: string) {
    const next = !bookmarks[questionId];
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

  const visibleTopics =
    category === "All" ? topics : topics.filter((t) => t.category === category);

  return (
    <Container>
      <PageHeader
        title="Topic practice"
        description="Answer, then see the full working — not just whether you were right. Every answer is recorded against your progress."
      />

      {/* Category filter — links, so the choice is in the URL and shareable. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((cat) => (
          <Link
            key={cat}
            href={practiceRoute(undefined, cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[19rem_1fr]">
        {/* Topic list */}
        <aside>
          <div className="flex items-center justify-between px-1 pb-2.5">
            <span className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
              Topics ({visibleTopics.length})
            </span>
            {activeTopic && (
              <Link
                href={practiceRoute(undefined, category)}
                className="text-xs font-medium text-accent hover:underline"
              >
                Clear
              </Link>
            )}
          </div>

          <ul className="space-y-2">
            {visibleTopics.map((topic) => {
              const isActive = topic.id === activeTopic?.id;
              const isEmpty = topic.questionCount === 0;

              // No questions means nothing to link to; rendered as a disabled
              // row rather than a link that lands on an empty screen.
              if (isEmpty) {
                return (
                  <li key={topic.id}>
                    <span className="block cursor-not-allowed rounded-card border border-dashed border-line bg-surface px-4 py-3 opacity-60">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-ink">
                          {topic.name}
                        </span>
                        <span className="shrink-0 text-xs text-ink-subtle">—</span>
                      </span>
                      <span className="mt-1 block text-xs text-ink-subtle">
                        No questions yet
                      </span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={topic.id}>
                  <Link
                    href={practiceRoute(topic.id, category)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-card border px-4 py-3 transition-colors",
                      isActive
                        ? "border-accent bg-accent-soft"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-accent" : "text-ink",
                        )}
                      >
                        {topic.name}
                      </span>
                      <span className="shrink-0 text-xs text-ink-subtle">
                        {topic.questionCount}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-ink-subtle">
                      {topic.category}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Question workspace */}
        <div>
          {!activeTopic ? (
            <EmptyState
              title="Pick a topic to start"
              description="Choose a topic from the list. The number beside each one is how many approved questions it has."
            />
          ) : !question ? (
            <EmptyState
              title="No questions for this topic yet"
              description="Pick another topic from the list — the ones with a number beside them have questions ready."
            />
          ) : (
            <Card className="p-6">
              {/* Question meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge level={question.difficulty} />
                  <Badge tone="neutral">{question.topic}</Badge>
                  {question.companyTags.slice(0, 2).map((tag) => (
                    <Badge key={tag} tone="info">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-subtle">
                    {index + 1} of {questions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(question.id)}
                    aria-pressed={bookmarks[question.id] ?? false}
                    aria-label={
                      bookmarks[question.id]
                        ? "Remove bookmark"
                        : "Bookmark this question"
                    }
                    className="cursor-pointer text-ink-subtle transition-colors hover:text-accent"
                  >
                    {bookmarks[question.id] ? (
                      <BookmarkCheck className="h-[18px] w-[18px] text-accent" />
                    ) : (
                      <Bookmark className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-5 text-[17px] leading-relaxed font-medium text-ink">
                {question.question}
              </p>

              {/* Options */}
              <div className="mt-5 space-y-2.5">
                {question.options.map((option, i) => {
                  const isCorrect = i === question.correctOption;
                  const isPicked = i === selected;

                  const state = !submitted
                    ? isPicked
                      ? "picked"
                      : "idle"
                    : isCorrect
                      ? "correct"
                      : isPicked
                        ? "wrong"
                        : "idle";

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={submitted}
                      onClick={() => setSelected(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-input border px-4 py-3 text-left transition-colors",
                        !submitted && "cursor-pointer",
                        state === "idle" &&
                          "border-line bg-surface hover:border-line-strong",
                        state === "picked" && "border-accent bg-accent-soft",
                        state === "correct" && "border-success-line bg-success-soft",
                        state === "wrong" && "border-danger-line bg-danger-soft",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                          state === "idle" && "bg-inset text-ink-subtle",
                          state === "picked" && "bg-accent text-white",
                          state === "correct" && "bg-success text-white",
                          state === "wrong" && "bg-danger text-white",
                        )}
                      >
                        {state === "correct" ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : state === "wrong" ? (
                          <X className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          String.fromCharCode(65 + i)
                        )}
                      </span>
                      <span className="text-[15px] text-ink">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {submitted && (
                <div className="mt-5 space-y-3">
                  <div
                    className={cn(
                      "rounded-input border px-4 py-3.5",
                      selected === question.correctOption
                        ? "border-success-line bg-success-soft"
                        : "border-danger-line bg-danger-soft",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        selected === question.correctOption
                          ? "text-success"
                          : "text-danger",
                      )}
                    >
                      {selected === question.correctOption
                        ? "Correct"
                        : `Not quite — the answer is ${String.fromCharCode(65 + question.correctOption)}`}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink-muted">
                      {question.explanation}
                    </p>
                  </div>

                  {question.shortcutTip && (
                    <div className="flex gap-3 rounded-input border border-warn-line bg-warn-soft px-4 py-3.5">
                      <Lightbulb className="h-[18px] w-[18px] shrink-0 text-warn" />
                      <div>
                        <p className="text-sm font-semibold text-warn">Shortcut</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {question.shortcutTip}
                        </p>
                      </div>
                    </div>
                  )}

                  {saveFailed && (
                    <p role="status" className="text-sm text-ink-subtle">
                      Couldn&rsquo;t save this answer to your progress — the working
                      above is still right, but it won&rsquo;t count towards your
                      accuracy.
                    </p>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => goTo(index - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {!submitted ? (
                  <Button disabled={selected === null} onClick={() => void checkAnswer()}>
                    Check answer
                  </Button>
                ) : (
                  <Button
                    disabled={index >= questions.length - 1}
                    onClick={() => goTo(index + 1)}
                  >
                    Next question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {submitted && index >= questions.length - 1 && (
                <p className="mt-4 text-center text-sm text-ink-subtle">
                  That&rsquo;s the last question in {activeTopic.name}.{" "}
                  {attemptId && (
                    <Link
                      href={reviewRoute(attemptId)}
                      className="font-semibold text-accent hover:underline"
                    >
                      Review this session
                    </Link>
                  )}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
