"use client";

import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";

/**
 * Fades and lifts its children into place when scrolled into view.
 *
 * `delay` staggers siblings — a grid of three cards at 0/90/180ms reads as one
 * considered movement rather than three things popping at once. Keep the total
 * stagger under ~250ms or the last item feels broken.
 *
 * Always renders a <div>. An `as` prop for <li> was tried and dropped: a
 * polymorphic ref across element types costs more in type gymnastics than a
 * wrapping <li> costs in markup, and <li><div> is perfectly valid.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        inView
          ? "translate-y-0 opacity-100"
          : "motion-safe:translate-y-4 motion-safe:opacity-0",
        className,
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
