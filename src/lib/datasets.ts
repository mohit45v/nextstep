/**
 * The question bank's sources, and what each licence actually requires of us.
 *
 * `source` on a Question is one of these keys. /attributions renders this
 * registry — but only the entries that have questions in the database, so the
 * page credits what we actually use rather than listing everything we might.
 *
 * Read the `obligations` field before importing anything new. "Openly licensed"
 * is not the same as "do whatever you like": one of the two datasets below is
 * non-commercial and share-alike, which is a constraint on NextStep itself.
 */
export interface DatasetInfo {
  key: string;
  name: string;
  /** Who made it — the people the licence requires us to credit. */
  authors: string;
  /** Where it came from. */
  url: string;
  licence: string;
  licenceUrl: string;
  /** What the dataset is, in one sentence a student would understand. */
  description: string;
  /** What the licence obliges NextStep to do. */
  obligations: string;
  /** Honest limitations — why these questions are reviewed before being served. */
  caveats?: string;
}

export const DATASETS: Record<string, DatasetInfo> = {
  curated: {
    key: "curated",
    name: "NextStep original questions",
    authors: "Written for NextStep at Terna Engineering College",
    url: "https://github.com/",
    licence: "All rights reserved",
    licenceUrl: "",
    description:
      "Questions written by hand for this platform, with worked step-by-step explanations and shortcut methods.",
    obligations: "None — these are our own.",
  },

  "aqua-rat": {
    key: "aqua-rat",
    name: "AQuA-RAT (Algebra Question Answering with Rationales)",
    authors:
      "Wang Ling, Dani Yogatama, Chris Dyer and Phil Blunsom (DeepMind), 2017",
    url: "https://github.com/google-deepmind/AQuA",
    licence: "Apache-2.0",
    licenceUrl: "https://www.apache.org/licenses/LICENSE-2.0",
    description:
      "About 100,000 crowd-sourced algebraic word problems, each with five options and a natural-language rationale.",
    obligations:
      "Keep the licence and copyright notice, and state that the content was modified. Commercial use is permitted.",
    caveats:
      "This is machine-learning training data, not an exam paper. The rationales are crowd-sourced, quality is uneven and some stated answers are wrong — which is why every imported question is a draft until a human has read it.",
  },

  "logiqa-2.0": {
    key: "logiqa-2.0",
    name: "LogiQA 2.0",
    authors: "Jian Liu, Leyang Cui, Hanmeng Liu, Dandan Huang, Yile Wang and Yue Zhang",
    url: "https://github.com/csitfun/LogiQA2.0_Chinese",
    licence: "CC BY-NC-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    description:
      "About 8,700 logical reasoning questions drawn from civil-service examinations.",
    obligations:
      "Credit the authors, and share any adaptation under the same licence. Non-commercial only — NextStep must not charge for access to these questions, and that restriction travels with them.",
    caveats:
      "Translated and adapted items read differently from campus-test English, so phrasing often needs editing during review.",
  },
};

/** The datasets, in a stable display order. */
export const DATASET_LIST = Object.values(DATASETS);

export function datasetFor(source: string): DatasetInfo | undefined {
  return DATASETS[source];
}
