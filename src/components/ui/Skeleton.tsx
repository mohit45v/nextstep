import { cn } from "@/lib/cn";

/**
 * Placeholder blocks for `loading.tsx`.
 *
 * These exist for one measured reason: the database is a few hundred
 * milliseconds away, so a page's queries take long enough to notice. A route
 * with a `loading.tsx` streams its shell immediately and fills in when the data
 * lands, instead of showing nothing at all while the server waits.
 *
 * They are deliberately shaped like the screen they stand in for — a skeleton
 * that does not match its page reads as a layout shift rather than as loading.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-input bg-inset", className)}
    />
  );
}

/** Page title + description block. */
export function PageHeaderSkeleton() {
  return (
    <div className="border-b border-line pb-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
    </div>
  );
}

export function StatRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[4.5rem] rounded-card" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-card" />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-8 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-card" />
      ))}
    </div>
  );
}
