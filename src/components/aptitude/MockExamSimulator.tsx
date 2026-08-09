"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bookmark, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { SAMPLE_QUESTIONS, CompanyTestPack } from "@/data/aptitudeData";
import type { ExamResults } from "@/types";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, Container } from "@/components/ui";

interface MockExamSimulatorProps {
  testPack?: CompanyTestPack | null;
  onFinishExam: (resultsPayload: ExamResults) => void;
  onCancelExam: () => void;
}

export const MockExamSimulator: React.FC<MockExamSimulatorProps> = ({
  testPack,
  onFinishExam,
  onCancelExam,
}) => {
  const durationSeconds = (testPack?.durationMinutes || 20) * 60;

  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const [questions] = useState(SAMPLE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];

  /**
   * Real per-question timing.
   *
   * The old code sent a hardcoded `timeSpentSeconds: 45` for every question,
   * so the "average time per question" in the results was a constant dressed
   * up as a measurement. We now accumulate the actual dwell time and bank it
   * whenever the student moves to a different question.
   */
  const timeSpent = useRef<Record<string, number>>({});
  // Set on mount rather than in the initialiser — `Date.now()` during render is
  // impure and would give a different answer on every re-render.
  const questionShownAt = useRef<number>(0);

  useEffect(() => {
    questionShownAt.current = Date.now();
  }, []);

  function bankTimeForCurrentQuestion() {
    if (questionShownAt.current === 0) return;
    const elapsed = Math.round((Date.now() - questionShownAt.current) / 1000);
    const id = currentQuestion.id;
    timeSpent.current[id] = (timeSpent.current[id] ?? 0) + elapsed;
    questionShownAt.current = Date.now();
  }

  function goToQuestion(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    bankTimeForCurrentQuestion();
    setCurrentIndex(nextIndex);
  }

  const executeSubmissionRef = useRef<() => void>(undefined);
  const hasAutoSubmitted = useRef(false);

  // Countdown only — the updater stays pure.
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Submit exactly once when the clock hits zero.
  useEffect(() => {
    if (secondsRemaining === 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      executeSubmissionRef.current?.();
    }
  }, [secondsRemaining]);

  const executeSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    bankTimeForCurrentQuestion();

    const submissions = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? -1,
      timeSpentSeconds: timeSpent.current[q.id] ?? 0,
    }));

    try {
      const res = await fetch("/api/aptitude/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testPackId: testPack?.id || "mock-exam-1",
          submissions,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Previously this branch invented a result — 80% accuracy, 4 correct,
        // regardless of what the student actually answered. Showing a real
        // error is the only honest option: scoring happens on the server, so
        // if the server did not answer, there is no score.
        setSubmitError(
          data?.error ?? "Couldn't score your test. Check your connection and try again.",
        );
        setIsSubmitting(false);
        hasAutoSubmitted.current = false;
        return;
      }

      onFinishExam(data.data);
    } catch {
      setSubmitError(
        "Couldn't reach the server to score your test. Your answers are still here — try submitting again.",
      );
      setIsSubmitting(false);
      hasAutoSubmitted.current = false;
    }
  };

  // Refresh the ref after every render so the timer always calls the current
  // closure, with the answers the student has actually entered.
  useEffect(() => {
    executeSubmissionRef.current = executeSubmission;
  });

  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const isLowTime = secondsRemaining <= 60;

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [secondsRemaining]);

  return (
    <Container>
      {/* Exam bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">
            {testPack ? `${testPack.companyName} — ${testPack.testTitle}` : "Mock test"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {answeredCount} of {questions.length} answered
            {reviewCount > 0 && ` · ${reviewCount} marked for review`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm font-bold tabular-nums",
              isLowTime
                ? "border-danger-line bg-danger-soft text-danger"
                : "border-line bg-surface text-ink",
            )}
            role="timer"
            aria-live={isLowTime ? "assertive" : "off"}
          >
            <Timer className="h-4 w-4" />
            {formattedTime}
          </div>
          <Button variant="secondary" onClick={() => setShowSubmitModal(true)}>
            Submit
          </Button>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-5 flex gap-3 rounded-card border border-danger-line bg-danger-soft px-4 py-3.5"
        >
          <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger">Not submitted</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{submitError}</p>
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_15rem]">
        {/* Question */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <span className="text-sm font-semibold text-ink">
              Question {currentIndex + 1}
              <span className="font-normal text-ink-subtle"> of {questions.length}</span>
            </span>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{currentQuestion.topic}</Badge>
              <button
                type="button"
                onClick={() =>
                  setMarkedForReview((prev) => ({
                    ...prev,
                    [currentQuestion.id]: !prev[currentQuestion.id],
                  }))
                }
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  markedForReview[currentQuestion.id]
                    ? "border-warn-line bg-warn-soft text-warn"
                    : "border-line bg-surface text-ink-muted hover:text-ink",
                )}
              >
                <Bookmark className="h-3.5 w-3.5" />
                {markedForReview[currentQuestion.id] ? "Marked" : "Mark for review"}
              </button>
            </div>
          </div>

          <p className="mt-5 text-[17px] leading-relaxed font-medium text-ink">
            {currentQuestion.question}
          </p>

          <div className="mt-5 space-y-2.5">
            {currentQuestion.options.map((option, i) => {
              const isPicked = answers[currentQuestion.id] === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: i }))
                  }
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-input border px-4 py-3 text-left transition-colors",
                    isPicked
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                      isPicked ? "bg-accent text-white" : "bg-inset text-ink-subtle",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[15px] text-ink">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {answers[currentQuestion.id] !== undefined && (
              <button
                type="button"
                onClick={() =>
                  setAnswers((prev) => {
                    const next = { ...prev };
                    delete next[currentQuestion.id];
                    return next;
                  })
                }
                className="cursor-pointer text-sm font-medium text-ink-subtle hover:text-ink"
              >
                Clear answer
              </button>
            )}

            <Button
              size="sm"
              disabled={currentIndex >= questions.length - 1}
              onClick={() => goToQuestion(currentIndex + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Question palette */}
        <aside>
          <Card className="p-4">
            <p className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
              Questions
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const answered = answers[q.id] !== undefined;
                const marked = markedForReview[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(i)}
                    aria-label={`Question ${i + 1}${answered ? ", answered" : ""}`}
                    aria-current={i === currentIndex ? "true" : undefined}
                    className={cn(
                      "grid h-9 cursor-pointer place-items-center rounded-lg border text-sm font-semibold transition-colors",
                      i === currentIndex && "ring-2 ring-accent ring-offset-1",
                      marked
                        ? "border-warn-line bg-warn-soft text-warn"
                        : answered
                          ? "border-success-line bg-success-soft text-success"
                          : "border-line bg-surface text-ink-subtle hover:border-line-strong",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <dl className="mt-4 space-y-1.5 border-t border-line pt-3.5 text-xs">
              <LegendRow className="bg-success-soft border-success-line" label="Answered" value={answeredCount} />
              <LegendRow className="bg-warn-soft border-warn-line" label="Marked" value={reviewCount} />
              <LegendRow className="bg-surface border-line" label="Not answered" value={questions.length - answeredCount} />
            </dl>
          </Card>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={onCancelExam}
          >
            Leave test
          </Button>
        </aside>
      </div>

      {/* Submit confirmation */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-title"
        >
          <Card className="w-full max-w-md p-6">
            <h2 id="submit-title" className="text-lg font-bold">
              Submit your test?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              You&rsquo;ve answered {answeredCount} of {questions.length} questions.
              {questions.length - answeredCount > 0 &&
                ` ${questions.length - answeredCount} will be marked as skipped.`}
            </p>

            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSubmitModal(false)}
              >
                Keep working
              </Button>
              <Button
                className="flex-1"
                disabled={isSubmitting}
                onClick={() => {
                  setShowSubmitModal(false);
                  void executeSubmission();
                }}
              >
                {isSubmitting ? "Scoring…" : "Submit"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
};

function LegendRow({
  className,
  label,
  value,
}: {
  className: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 shrink-0 rounded border", className)} />
      <dt className="flex-1 text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  );
}
