import { cn } from "@/lib/cn";

/** Standard max width + horizontal padding. Every page body should use this. */
export function Container({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />
  );
}

/** Title + optional description + optional right-hand actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Shown where a feature works but the user has no data yet.
 *
 * This exists because the alternative — inventing a plausible-looking number —
 * is what made the old screens untrustworthy. An empty state is information;
 * a fake 78% is misinformation.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-ink-subtle">{icon}</div>}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * A labelled statistic. `value` is intentionally allowed to be null — callers
 * pass null when the number isn't known yet, and get an em-dash rather than a
 * zero that reads like a real measurement.
 */
export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode | null;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3.5">
      <p className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-ink tabular-nums">
        {value ?? <span className="text-ink-subtle">—</span>}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p>}
    </div>
  );
}
