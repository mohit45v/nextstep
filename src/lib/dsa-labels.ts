import type { DsaBranch } from "@/generated/prisma/enums";
import type { DsaBranchLabel } from "../../prisma/seed-data-dsa";

/**
 * Branch enum ↔ the words a student reads, plus the one mapping that matters:
 * a Terna degree programme to the DSA sheet aimed at it.
 */

export const DSA_BRANCH_LABELS: Record<DsaBranch, DsaBranchLabel> = {
  GENERAL: "General",
  CS_IT: "CS & IT",
  AIDS: "AIDS",
  ELECTRICAL: "Electrical",
  MECHANICAL: "Mechanical",
  CIVIL: "Civil",
};

export const DSA_BRANCH_BY_LABEL: Record<DsaBranchLabel, DsaBranch> = {
  General: "GENERAL",
  "CS & IT": "CS_IT",
  AIDS: "AIDS",
  Electrical: "ELECTRICAL",
  Mechanical: "MECHANICAL",
  Civil: "CIVIL",
};

/** The filter chips, in display order. "All" is a UI-only value. */
export const DSA_BRANCH_FILTERS = [
  "All",
  "CS & IT",
  "AIDS",
  "Electrical",
  "Mechanical",
  "Civil",
  "General",
] as const;

export type DsaBranchFilter = (typeof DSA_BRANCH_FILTERS)[number];

export function toDsaBranchFilter(value: string | undefined): DsaBranchFilter {
  return DSA_BRANCH_FILTERS.includes(value as DsaBranchFilter)
    ? (value as DsaBranchFilter)
    : "All";
}

/**
 * The student's degree programme → the sheet they should see first.
 *
 * Best effort by design: it only chooses a default filter, and the student can
 * pick any branch. Programmes that do not map (or a profile with no branch) fall
 * back to "All" rather than guessing.
 */
export function defaultBranchForProgramme(
  branch: string | null | undefined,
): DsaBranchFilter {
  if (!branch) return "All";
  const programme = branch.toLowerCase();

  if (programme.includes("computer") || programme.includes("information technology")) {
    // "Computer Science & Engineering (Data Science)" mentions both, and data
    // science is the more specific sheet, so it is checked first.
    if (programme.includes("data science")) return "AIDS";
    return "CS & IT";
  }
  if (programme.includes("artificial intelligence") || programme.includes("data science")) {
    return "AIDS";
  }
  if (programme.includes("electronics") || programme.includes("electrical")) {
    return "Electrical";
  }
  if (programme.includes("mechanical")) return "Mechanical";
  if (programme.includes("civil")) return "Civil";
  return "All";
}

/* ---------------------------------------------------------------------------
   Codeforces
   --------------------------------------------------------------------------- */

/**
 * The tags the live feed offers.
 *
 * It lives here, beside the other label tables, rather than in `lib/dsa.ts`:
 * that module imports Prisma, and the DSA screen is a client component. A client
 * import of anything Prisma-adjacent pulls `pg` — and therefore `node:fs` — into
 * the browser bundle, which fails the build. Keeping plain data in a
 * dependency-free module is what keeps that boundary honest.
 */
export const CODEFORCES_TAGS = [
  { tag: "dp", label: "Dynamic Programming" },
  { tag: "graphs", label: "Graphs" },
  { tag: "trees", label: "Trees" },
  { tag: "math", label: "Math" },
  { tag: "greedy", label: "Greedy" },
  { tag: "shortest paths", label: "Shortest Paths" },
] as const;

export type CodeforcesTag = (typeof CODEFORCES_TAGS)[number]["tag"];

export function isCodeforcesTag(value: string): value is CodeforcesTag {
  return CODEFORCES_TAGS.some((t) => t.tag === value);
}
