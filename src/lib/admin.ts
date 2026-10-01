import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/aptitude-labels";
import { formatDateTime } from "@/lib/format";
import type { QuestionStatus } from "@/generated/prisma/enums";
import type { QueueItem, ReviewQuestion, ReviewQueue } from "@/types/admin";

// Re-exported so existing imports from this module keep working; the definitions
// live in `types/admin.ts`, which has no runtime dependencies.
export type { QueueItem, ReviewQuestion, ReviewQueue } from "@/types/admin";

/**
 * Queries for the editorial side of the question bank.
 *
 * Kept apart from `lib/aptitude.ts` on purpose: everything in that file is
 * filtered to what a student may see, and nothing here is. These functions
 * deliberately read drafts and rejects, so they are only ever called from a
 * route that has already passed `requireRole("ADMIN")`.
 */

/** Drafts per page in the review queue. */
export const REVIEW_PAGE_SIZE = 20;

export async function getReviewQueue({
  status = "DRAFT",
  source,
  page = 1,
}: {
  status?: QuestionStatus;
  source?: string;
  page?: number;
}): Promise<ReviewQueue> {
  const where = { status, ...(source ? { source } : {}) };

  const [rows, total, counts, sources] = await Promise.all([
    prisma.question.findMany({
      where,
      // Oldest first: a review queue that reorders itself as you work through it
      // is how questions get read twice and others never.
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
      select: {
        id: true,
        status: true,
        source: true,
        licence: true,
        prompt: true,
        category: true,
        difficulty: true,
        reviewedAt: true,
        topic: { select: { name: true } },
        reviewedBy: { select: { name: true, email: true } },
        options: { select: { isCorrect: true } },
      },
    }),
    prisma.question.count({ where }),
    prisma.question.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.question.groupBy({ by: ["source"], _count: { _all: true } }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      status: row.status,
      source: row.source,
      licence: row.licence,
      prompt: row.prompt,
      category: CATEGORY_LABELS[row.category],
      difficulty: DIFFICULTY_LABELS[row.difficulty],
      topicName: row.topic?.name ?? null,
      optionCount: row.options.length,
      missingAnswer: !row.options.some((option) => option.isCorrect),
      reviewedAtLabel: row.reviewedAt ? formatDateTime(row.reviewedAt) : null,
      reviewedByName: row.reviewedBy?.name ?? row.reviewedBy?.email ?? null,
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / REVIEW_PAGE_SIZE)),
    counts: {
      DRAFT: counts.find((c) => c.status === "DRAFT")?._count._all ?? 0,
      APPROVED: counts.find((c) => c.status === "APPROVED")?._count._all ?? 0,
      REJECTED: counts.find((c) => c.status === "REJECTED")?._count._all ?? 0,
    },
    sources: sources
      .map((row) => ({ source: row.source, count: row._count._all }))
      .sort((a, b) => b.count - a.count),
  };
}

/** One question, in full, for the edit form. */
export async function getReviewQuestion(id: string): Promise<ReviewQuestion | null> {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { order: "asc" } },
      reviewedBy: { select: { name: true, email: true } },
      _count: { select: { attempts: true } },
    },
  });
  if (!question) return null;

  return {
    id: question.id,
    status: question.status,
    source: question.source,
    sourceId: question.sourceId,
    licence: question.licence,
    prompt: question.prompt,
    explanation: question.explanation,
    shortcutTip: question.shortcutTip,
    formulaUsed: question.formulaUsed,
    category: question.category,
    difficulty: question.difficulty,
    topicId: question.topicId,
    companyTags: question.companyTags,
    options: question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    correctOption: question.options.findIndex((o) => o.isCorrect),
    createdAtLabel: formatDateTime(question.createdAt),
    reviewedAtLabel: question.reviewedAt ? formatDateTime(question.reviewedAt) : null,
    reviewedByName: question.reviewedBy?.name ?? question.reviewedBy?.email ?? null,
    attemptCount: question._count.attempts,
  };
}

/** The id of the next draft after this one, so review is a queue, not a hunt. */
export async function getNextDraftId(afterId: string): Promise<string | null> {
  const current = await prisma.question.findUnique({
    where: { id: afterId },
    select: { createdAt: true },
  });
  if (!current) return null;

  const next = await prisma.question.findFirst({
    where: { status: "DRAFT", createdAt: { gt: current.createdAt } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return next?.id ?? null;
}
