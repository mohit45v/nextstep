import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileQuestion } from "lucide-react";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  PageHeader,
  Stat,
  buttonStyles,
} from "@/components/ui";
import { getReviewQueue } from "@/lib/admin";
import { DATASETS } from "@/lib/datasets";
import { cn } from "@/lib/cn";
import type { QuestionStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Question review" };

const STATUSES: { value: QuestionStatus; label: string }[] = [
  { value: "DRAFT", label: "Drafts" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

function toStatus(value: string | undefined): QuestionStatus {
  return STATUSES.some((s) => s.value === value)
    ? (value as QuestionStatus)
    : "DRAFT";
}

/**
 * The review queue.
 *
 * Imported questions land here as drafts and go no further until somebody reads
 * one and decides. The filters are in the URL so a half-finished review session
 * can be resumed from a bookmark, and the queue is oldest-first so working
 * through it actually ends.
 */
export default async function QuestionReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; page?: string; decided?: string }>;
}) {
  const { status, source, page, decided } = await searchParams;

  const activeStatus = toStatus(status);
  const activePage = Math.max(1, Number(page) || 1);
  const queue = await getReviewQueue({
    status: activeStatus,
    source: source || undefined,
    page: activePage,
  });

  return (
    <Container>
      <PageHeader
        title="Question review"
        description="Nothing reaches a student from here until it is approved. Read every question you approve — imported answer keys and rationales are frequently wrong."
        actions={
          <Link href="/attributions" className={buttonStyles({ variant: "secondary" })}>
            Attributions
          </Link>
        }
      />

      {decided && (
        <p
          role="status"
          className="mt-6 rounded-card border border-success-line bg-success-soft px-4 py-3 text-sm text-success"
        >
          Decision recorded. Next question in the queue is below.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Drafts waiting" value={String(queue.counts.DRAFT)} />
        <Stat label="Approved" value={String(queue.counts.APPROVED)} hint="Served to students" />
        <Stat label="Rejected" value={String(queue.counts.REJECTED)} />
      </div>

      {/* Status tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {STATUSES.map((option) => (
          <Link
            key={option.value}
            href={`/admin/questions?status=${option.value}${source ? `&source=${encodeURIComponent(source)}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeStatus === option.value
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {option.label} ({queue.counts[option.value]})
          </Link>
        ))}
      </div>

      {/* Source filter */}
      {queue.sources.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-subtle">Source:</span>
          <Link
            href={`/admin/questions?status=${activeStatus}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !source
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-surface text-ink-muted hover:text-ink",
            )}
          >
            All
          </Link>
          {queue.sources.map((row) => (
            <Link
              key={row.source}
              href={`/admin/questions?status=${activeStatus}&source=${encodeURIComponent(row.source)}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                source === row.source
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {DATASETS[row.source]?.name ?? row.source} ({row.count})
            </Link>
          ))}
        </div>
      )}

      {queue.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<FileQuestion className="h-8 w-8" />}
            title={
              activeStatus === "DRAFT"
                ? "No drafts waiting"
                : `No ${activeStatus.toLowerCase()} questions`
            }
            description={
              activeStatus === "DRAFT"
                ? "Import a slice of an open dataset to fill the queue: npm run import:aqua -- --file <path> --limit 500"
                : "Nothing in this list yet."
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {queue.items.map((item) => (
            <li key={item.id}>
              <Link href={`/admin/questions/${item.id}`} className="block">
                <Card interactive className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
                      {/* Truncated to keep the queue scannable; the full text is one
                          click away. */}
                      {item.prompt.length > 220
                        ? `${item.prompt.slice(0, 220)}…`
                        : item.prompt}
                    </p>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">{item.category}</Badge>
                      <Badge tone="info">{item.source}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-subtle">
                    <span>{item.optionCount} options</span>
                    <span>{item.difficulty}</span>
                    <span>{item.topicName ?? "No topic assigned"}</span>
                    {item.licence && <span>{item.licence}</span>}
                    {item.reviewedAtLabel && (
                      <span>
                        {item.status === "APPROVED" ? "Approved" : "Decided"}{" "}
                        {item.reviewedAtLabel}
                        {item.reviewedByName ? ` by ${item.reviewedByName}` : ""}
                      </span>
                    )}
                    {item.missingAnswer && (
                      <span className="inline-flex items-center gap-1 font-medium text-danger">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        No correct option marked
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {queue.pageCount > 1 && (
        <nav className="mt-8 flex items-center justify-between border-t border-line pt-5">
          <span className="text-sm text-ink-subtle">
            Page {queue.page} of {queue.pageCount} · {queue.total} questions
          </span>
          <div className="flex gap-2">
            {queue.page > 1 && (
              <Link
                href={`/admin/questions?status=${activeStatus}${source ? `&source=${encodeURIComponent(source)}` : ""}&page=${queue.page - 1}`}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Previous
              </Link>
            )}
            {queue.page < queue.pageCount && (
              <Link
                href={`/admin/questions?status=${activeStatus}${source ? `&source=${encodeURIComponent(source)}` : ""}&page=${queue.page + 1}`}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </Container>
  );
}
