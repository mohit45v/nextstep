import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "danger"
  | "warn"
  | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-inset text-ink-muted border-line",
  accent: "bg-accent-soft text-accent border-accent-line",
  success: "bg-success-soft text-success border-success-line",
  danger: "bg-danger-soft text-danger border-danger-line",
  warn: "bg-warn-soft text-warn border-warn-line",
  info: "bg-info-soft text-info border-info-line",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
        "text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Difficulty is shown in enough places to be worth centralising the mapping. */
export function DifficultyBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase();
  const tone: BadgeTone =
    normalized === "easy"
      ? "success"
      : normalized === "hard" || normalized === "high"
        ? "danger"
        : "warn";

  return <Badge tone={tone}>{level}</Badge>;
}
