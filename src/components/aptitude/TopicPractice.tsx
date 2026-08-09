"use client";

import React, { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  X,
} from "lucide-react";
import {
  APTITUDE_TOPICS,
  SAMPLE_QUESTIONS,
  questionsForTopic,
  questionCountForTopic,
} from "@/data/aptitudeData";
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

const CATEGORIES = ["All", "Quantitative", "Logical Reasoning", "Verbal Ability"] as const;
type Category = (typeof CATEGORIES)[number];

interface TopicPracticeProps {
  initialTopicId?: string;
}

export const TopicPractice: React.FC<TopicPracticeProps> = ({ initialTopicId }) => {
  const [category, setCategory] = useState<Category>("All");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(
    initialTopicId ?? null,
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const topics = useMemo(
    () =>
      category === "All"
        ? APTITUDE_TOPICS
        : APTITUDE_TOPICS.filter((t) => t.category === category),
    [category],
  );

  /**
   * Matched on `topicId`, not on a slugified topic name. The old code did
   * `q.topic.toLowerCase().replace(/ /g, '-')`, which silently failed for
   * "Syllogisms & Venn Diagrams" and "Error Spotting & Grammar" because the
   * question's free-text topic did not match the topic's name.
   */
  const questions = useMemo(
    () => (activeTopicId ? questionsForTopic(activeTopicId) : SAMPLE_QUESTIONS),
    [activeTopicId],
  );

  const question = questions[index];
  const activeTopic = APTITUDE_TOPICS.find((t) => t.id === activeTopicId) ?? null;

  function selectTopic(topicId: string | null) {
    setActiveTopicId(topicId);
    resetQuestionState(0);
  }

  function resetQuestionState(nextIndex: number) {
    setIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
  }

  function toggleBookmark(id: string) {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  return (
    <Container>
      <PageHeader
        title="Topic practice"
        description="Answer, then see the full working — not just whether you were right."
      />

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              selectTopic(null);
            }}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[19rem_1fr]">
        {/* Topic list */}
        <aside>
          <div className="flex items-center justify-between px-1 pb-2.5">
            <span className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
              Topics ({topics.length})
            </span>
            {activeTopicId && (
              <button
                type="button"
                onClick={() => selectTopic(null)}
                className="cursor-pointer text-xs font-medium text-accent hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {topics.map((topic) => {
              const count = questionCountForTopic(topic.id);
              const isActive = topic.id === activeTopicId;
              const isEmpty = count === 0;

              return (
                <li key={topic.id}>
                  <button
                    type="button"
                    disabled={isEmpty}
                    onClick={() => selectTopic(topic.id)}
                    className={cn(
                      "w-full rounded-card border px-4 py-3 text-left transition-colors",
                      isEmpty
                        ? "cursor-not-allowed border-dashed border-line bg-surface opacity-60"
                        : "cursor-pointer",
                      !isEmpty && isActive
                        ? "border-accent bg-accent-soft"
                        : !isEmpty && "border-line bg-surface hover:border-line-strong",
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
                        {isEmpty ? "—" : count}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-ink-subtle">
                      {isEmpty ? "No questions yet" : topic.category}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Question workspace */}
        <div>
          {!question ? (
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
                    aria-label={
                      bookmarks.includes(question.id)
                        ? "Remove bookmark"
                        : "Bookmark this question"
                    }
                    className="cursor-pointer text-ink-subtle transition-colors hover:text-accent"
                  >
                    {bookmarks.includes(question.id) ? (
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
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
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
                </div>
              )}

              {/* Controls */}
              <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => resetQuestionState(index - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {!submitted ? (
                  <Button disabled={selected === null} onClick={() => setSubmitted(true)}>
                    Check answer
                  </Button>
                ) : (
                  <Button
                    disabled={index >= questions.length - 1}
                    onClick={() => resetQuestionState(index + 1)}
                  >
                    Next question
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {submitted && index >= questions.length - 1 && (
                <p className="mt-4 text-center text-sm text-ink-subtle">
                  That&rsquo;s the last question in{" "}
                  {activeTopic ? activeTopic.name : "this set"}.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
};
