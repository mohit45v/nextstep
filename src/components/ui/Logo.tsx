import { cn } from "@/lib/cn";

/**
 * Wordmark. The chevron echoes the "next step" idea without needing an image
 * asset, so it stays crisp at any size and adds no network request.
 */
export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 12.5 8 7l5 5.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 7.5 8 2l5 5.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
          />
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-ink">
          Next<span className="text-accent">Step</span>
        </span>
      )}
    </span>
  );
}
