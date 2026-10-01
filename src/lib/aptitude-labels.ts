import type {
  Category,
  Difficulty,
  PackDifficulty,
} from "@/generated/prisma/enums";

/**
 * The one place database enums and the words a student reads are tied together.
 *
 * Both directions are needed: the app renders labels, the seed and the importer
 * accept labels, and the database stores enums. Keeping the maps together means
 * adding a category is one edit, and a label can never drift between the seed
 * and the screens. `prisma/seed.ts` imports this file too.
 */

export type CategoryLabel =
  | "Quantitative"
  | "Logical Reasoning"
  | "Verbal Ability";

export type DifficultyLabel = "Easy" | "Medium" | "Hard";

export type PackDifficultyLabel = "Moderate" | "Challenging" | "High";

export const CATEGORY_LABELS: Record<Category, CategoryLabel> = {
  QUANTITATIVE: "Quantitative",
  LOGICAL_REASONING: "Logical Reasoning",
  VERBAL_ABILITY: "Verbal Ability",
};

export const CATEGORY_BY_LABEL: Record<CategoryLabel, Category> = {
  Quantitative: "QUANTITATIVE",
  "Logical Reasoning": "LOGICAL_REASONING",
  "Verbal Ability": "VERBAL_ABILITY",
};

export const DIFFICULTY_LABELS: Record<Difficulty, DifficultyLabel> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const DIFFICULTY_BY_LABEL: Record<DifficultyLabel, Difficulty> = {
  Easy: "EASY",
  Medium: "MEDIUM",
  Hard: "HARD",
};

export const PACK_DIFFICULTY_LABELS: Record<PackDifficulty, PackDifficultyLabel> = {
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
  HIGH: "High",
};

export const PACK_DIFFICULTY_BY_LABEL: Record<PackDifficultyLabel, PackDifficulty> = {
  Moderate: "MODERATE",
  Challenging: "CHALLENGING",
  High: "HIGH",
};

/** The category filter chips, in display order. "All" is a UI-only value. */
export const CATEGORY_FILTERS = [
  "All",
  "Quantitative",
  "Logical Reasoning",
  "Verbal Ability",
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

/** Narrows an untrusted query-string value to a filter, defaulting to "All". */
export function toCategoryFilter(value: string | undefined): CategoryFilter {
  return CATEGORY_FILTERS.includes(value as CategoryFilter)
    ? (value as CategoryFilter)
    : "All";
}
