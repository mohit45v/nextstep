import type { DifficultyLabel } from "@/lib/aptitude-labels";
import type { DsaBranchLabel } from "../../prisma/seed-data-dsa";

/** What the DSA screens receive. Labels, not enums; counts, not stored numbers. */

export interface DsaTopicSummary {
  id: string;
  name: string;
  description: string;
  branch: DsaBranchLabel;
  /** COUNT(*) of problems in the sheet. */
  problemCount: number;
  /** How many of them this student has ticked. */
  solvedCount: number;
}

export interface DsaProblemView {
  id: string;
  title: string;
  difficulty: DifficultyLabel;
  link: string | null;
  description: string | null;
  solved: boolean;
}

/**
 * A problem from the Codeforces problemset API.
 *
 * Deliberately a different type from `DsaProblemView`: it has a rating and no
 * solve state, because nothing in our database tracks it. Merging the two shapes
 * is how a "solved" tick on a live problem would end up silently going nowhere.
 */
export interface LiveProblem {
  id: string;
  title: string;
  difficulty: DifficultyLabel;
  rating: number | null;
  tags: string[];
  link: string;
}
