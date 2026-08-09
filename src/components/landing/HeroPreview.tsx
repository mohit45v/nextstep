import { Check, X } from "lucide-react";

/**
 * A static preview of the practice screen, built from the app's own tokens
 * rather than a screenshot — so it can never drift out of date visually, costs
 * no image request, and stays sharp on any display.
 *
 * The question shown is a genuine one from the aptitude bank.
 */
export function HeroPreview() {
  return (
    <div className="relative" aria-hidden="true">
      {/* Soft accent glow behind the card */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-accent-soft via-transparent to-transparent" />

      <div className="rounded-card border border-line bg-surface p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warn-line bg-warn-soft px-2.5 py-0.5 text-xs font-medium text-warn">
            Medium
          </span>
          <span className="text-xs font-medium text-ink-subtle">
            Profit &amp; Loss · Question 3 of 6
          </span>
        </div>

        <p className="mt-4 text-[15px] leading-relaxed font-medium text-ink">
          A shopkeeper marks an article 40% above cost price and offers a 25%
          discount. What is the net profit percentage?
        </p>

        <div className="mt-4 space-y-2">
          <PreviewOption label="A" text="10%" />
          <PreviewOption label="B" text="5%" state="correct" />
          <PreviewOption label="C" text="15%" state="wrong" />
          <PreviewOption label="D" text="No profit, no loss" />
        </div>

        <div className="mt-4 rounded-input border border-success-line bg-success-soft px-3.5 py-3">
          <p className="text-xs font-semibold text-success">Explanation</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Let CP = 100. MP = 140. SP = 140 × 0.75 = 105. Profit = 5%.
          </p>
        </div>
      </div>

      {/* Floating stat chip */}
      <div className="absolute -right-3 -bottom-5 hidden rounded-card border border-line bg-surface px-4 py-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.2)] sm:block">
        <p className="text-[11px] font-medium tracking-wide text-ink-subtle uppercase">
          Server-scored
        </p>
        <p className="mt-0.5 text-sm font-bold text-ink">+4 / −1 marking</p>
      </div>
    </div>
  );
}

function PreviewOption({
  label,
  text,
  state,
}: {
  label: string;
  text: string;
  state?: "correct" | "wrong";
}) {
  const shell =
    state === "correct"
      ? "border-success-line bg-success-soft"
      : state === "wrong"
        ? "border-danger-line bg-danger-soft"
        : "border-line bg-surface";

  const badge =
    state === "correct"
      ? "bg-success text-white"
      : state === "wrong"
        ? "bg-danger text-white"
        : "bg-inset text-ink-subtle";

  return (
    <div className={`flex items-center gap-3 rounded-input border px-3.5 py-2.5 ${shell}`}>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${badge}`}
      >
        {state === "correct" ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : state === "wrong" ? (
          <X className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          label
        )}
      </span>
      <span className="text-sm text-ink">{text}</span>
    </div>
  );
}
