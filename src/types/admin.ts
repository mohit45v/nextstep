import type { QuestionStatus } from "@/generated/prisma/enums";
import type { CategoryLabel, DifficultyLabel } from "@/lib/aptitude-labels";

/**
 * View models for the editorial screens.
 *
 * They live here rather than in `lib/admin.ts` because the review *form* is a
 * client component. `lib/admin.ts` imports Prisma, and a client component that
 * imports it — even for a type — is one careless edit away from pulling `pg`,
 * and therefore `node:net`, into the browser bundle. Types in a module with no
 * runtime dependencies cannot do that.
 */

export interface QueueItem {
  id: string;
  status: QuestionStatus;
  source: string;
  licence: string | null;
  prompt: string;
  category: CategoryLabel;
  difficulty: DifficultyLabel;
  topicName: string | null;
  optionCount: number;
  /** True when no option is flagged correct — a draft that cannot be approved. */
  missingAnswer: boolean;
  reviewedAtLabel: string | null;
  reviewedByName: string | null;
}

export interface ReviewQueue {
  items: QueueItem[];
  total: number;
  page: number;
  pageCount: number;
  counts: Record<QuestionStatus, number>;
  sources: { source: string; count: number }[];
}

export interface ReviewQuestion {
  id: string;
  status: QuestionStatus;
  source: string;
  sourceId: string | null;
  licence: string | null;
  prompt: string;
  explanation: string;
  shortcutTip: string | null;
  formulaUsed: string | null;
  /** Database enum values — the form posts them straight back. */
  category: string;
  difficulty: string;
  topicId: string | null;
  companyTags: string[];
  options: { text: string; isCorrect: boolean }[];
  correctOption: number;
  createdAtLabel: string;
  reviewedAtLabel: string | null;
  reviewedByName: string | null;
  /** Whether a student has ever been served this question. */
  attemptCount: number;
}
