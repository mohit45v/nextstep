"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { SAMPLE_QUESTIONS } from "@/data/aptitudeData";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/useInView";

/**
 * A looping demo of the real practice flow: question → pick an option →
 * reveal → explanation.
 *
 * The questions come from the actual bank rather than being written for the
 * marketing page, so this can never advertise something the app doesn't do.
 * One of the three deliberately picks a wrong answer — the explanation is the
 * point of the product, and you only see its value after getting one wrong.
 */

const PHASES = {
  reading: 1700,
  picking: 900,
  revealed: 3600,
} as const;

type Phase = keyof typeof PHASES;

/** `pick` is the option index the demo chooses — deliberately wrong on one. */
const DEMO = [
  { question: SAMPLE_QUESTIONS[0], pick: SAMPLE_QUESTIONS[0].correctOption },
  { question: SAMPLE_QUESTIONS[1], pick: (SAMPLE_QUESTIONS[1].correctOption + 1) % 4 },
  { question: SAMPLE_QUESTIONS[2], pick: SAMPLE_QUESTIONS[2].correctOption },
];

export function HeroPreview() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [tickedPhase, setTickedPhase] = useState<Phase>("reading");

  /**
   * Derived, not stored. Users who asked for less motion get the first question
   * in its fully-revealed state — the informative one. Computing that here
   * rather than calling setPhase from the effect avoids a wasted render and
   * keeps the effect free of synchronous state writes.
   */
  const phase: Phase = reducedMotion ? "revealed" : tickedPhase;

  useEffect(() => {
    if (reducedMotion) return;

    const next: Record<Phase, () => void> = {
      reading: () => setTickedPhase("picking"),
      picking: () => setTickedPhase("revealed"),
      revealed: () => {
        setIndex((i) => (i + 1) % DEMO.length);
        setTickedPhase("reading");
      },
    };

    const timer = setTimeout(next[phase], PHASES[phase]);
    return () => clearTimeout(timer);
  }, [phase, reducedMotion]);

  const { question, pick } = DEMO[index];
  const isRevealed = phase === "revealed";
  const isPicking = phase === "picking" || isRevealed;
  const gotItRight = pick === question.correctOption;

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(60%_50%_at_50%_40%,var(--color-accent-soft),transparent_70%)]"
      />

      <div
        className="rounded-card border border-line bg-surface p-5 shadow-[0_16px_50px_-16px_rgba(0,0,0,0.22)]"
        // The demo is decorative; screen readers get the real thing on /aptitude.
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warn-line bg-warn-soft px-2.5 py-0.5 text-xs font-medium text-warn">
            {question.difficulty}
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-ink-subtle">
            {question.topic}
            {/* Progress dots */}
            <span className="flex gap-1">
              {DEMO.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === index ? "w-4 bg-accent" : "w-1.5 bg-line-strong",
                  )}
                />
              ))}
            </span>
          </span>
        </div>

        {/* Fixed height stops the card resizing between questions */}
        <div className="mt-4 min-h-[4.5rem]">
          <p
            key={`q-${index}`}
            className="text-[15px] leading-relaxed font-medium text-ink motion-safe:animate-[fade-in-up_450ms_ease-out]"
          >
            {question.question}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {question.options.slice(0, 4).map((option, i) => {
            const isCorrect = i === question.correctOption;
            const isPicked = i === pick;

            const state =
              isRevealed && isCorrect
                ? "correct"
                : isRevealed && isPicked
                  ? "wrong"
                  : isPicking && isPicked
                    ? "picked"
                    : "idle";

            return (
              <div
                key={`${index}-${i}`}
                className={cn(
                  "flex items-center gap-3 rounded-input border px-3.5 py-2.5 transition-all duration-400",
                  state === "idle" && "border-line bg-surface",
                  state === "picked" && "border-accent bg-accent-soft scale-[1.015]",
                  state === "correct" && "border-success-line bg-success-soft",
                  state === "wrong" && "border-danger-line bg-danger-soft",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors duration-300",
                    state === "idle" && "bg-inset text-ink-subtle",
                    state === "picked" && "bg-accent text-white",
                    state === "correct" && "bg-success text-white",
                    state === "wrong" && "bg-danger text-white",
                  )}
                >
                  {state === "correct" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : state === "wrong" ? (
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="truncate text-sm text-ink">{option}</span>
              </div>
            );
          })}
        </div>

        {/* Explanation — the payoff, and the reason one demo answer is wrong */}
        <div
          className={cn(
            "grid transition-all duration-500 ease-out",
            isRevealed ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "rounded-input border px-3.5 py-3",
                gotItRight
                  ? "border-success-line bg-success-soft"
                  : "border-danger-line bg-danger-soft",
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold",
                  gotItRight ? "text-success" : "text-danger",
                )}
              >
                {gotItRight ? "Correct" : "Not quite — here's the working"}
              </p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-muted">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chip */}
      <div className="absolute -right-4 -bottom-5 hidden rounded-card border border-line bg-surface px-4 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] sm:block">
        <p className="text-[11px] font-medium tracking-wide text-ink-subtle uppercase">
          Every question
        </p>
        <p className="mt-0.5 text-sm font-bold text-ink">Worked explanation</p>
      </div>
    </div>
  );
}
