import type { CategoryLabel, DifficultyLabel, PackDifficultyLabel } from "@/lib/aptitude-labels";

/**
 * What the aptitude screens receive.
 *
 * These are view models, not Prisma rows: labels instead of enums, a plain
 * string array instead of an Option relation, and — crucially — two separate
 * question shapes.
 *
 * `PracticeQuestion` carries the answer, because self-paced practice reveals it
 * the moment you press "Check answer". `ExamQuestion` does not, because during
 * a timed test the answer key would otherwise be sitting in the page payload
 * for anyone who opens devtools. Scoring happens on the server either way.
 */

export interface TopicSummary {
  id: string;
  name: string;
  category: CategoryLabel;
  iconName: string;
  description: string;
  /** Live count of questions a student can actually be served. */
  questionCount: number;
}

export interface PracticeQuestion {
  id: string;
  topicId: string | null;
  topic: string;
  category: CategoryLabel;
  difficulty: DifficultyLabel;
  question: string;
  options: string[];
  /** 0-based index of the correct option. */
  correctOption: number;
  explanation: string;
  shortcutTip?: string;
  formulaUsed?: string;
  companyTags: string[];
  isBookmarked: boolean;
}

/** A question as it appears during a timed test: no answer, no explanation. */
export interface ExamQuestion {
  id: string;
  topic: string;
  category: CategoryLabel;
  difficulty: DifficultyLabel;
  question: string;
  options: string[];
}

export interface PackSection {
  name: string;
  category: CategoryLabel;
  /** What the real campus paper has. */
  requested: number;
  /** What the approved bank could actually supply. */
  drawn: number;
}

export interface CompanyPackSummary {
  id: string;
  companyName: string;
  logoColor: string;
  testTitle: string;
  durationMinutes: number;
  cutoffPercentage: number;
  difficulty: PackDifficultyLabel;
  description: string;
  sections: { name: string; questionCount: number; category: CategoryLabel }[];
  /** Sum of the sections — the paper the company sets. */
  totalQuestions: number;
  /** How many of those the bank can currently fill. */
  availableQuestions: number;
}

export interface ExamPaper {
  packId: string;
  companyName: string;
  testTitle: string;
  durationMinutes: number;
  cutoffPercentage: number;
  sections: PackSection[];
  questions: ExamQuestion[];
}

export interface FormulaCardView {
  id: string;
  category: CategoryLabel;
  topic: string;
  title: string;
  formula: string;
  keyRule: string;
  example: string;
}

/* ---------------------------------------------------------------------------
   Attempts
   --------------------------------------------------------------------------- */

export type AttemptMode = "MOCK_EXAM" | "TOPIC_PRACTICE";

export interface AttemptSummary {
  id: string;
  mode: AttemptMode;
  /** "TCS NQT Cognitive" for a paper, "Profit & Loss" for practice. */
  title: string;
  packId: string | null;
  topicId: string | null;
  /** Pre-formatted on the server — see lib/format.ts for why. */
  submittedAtLabel: string | null;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  questionCount: number;
  totalTimeSeconds: number;
  /** correct ÷ attempted, so skipping does not flatter the number. Null before anything is attempted. */
  accuracyPercentage: number | null;
  averageTimePerQuestion: number;
  /** Only mock papers have a cutoff; practice has none. */
  cutoffPercentage: number | null;
  /** Whether the score cleared the pack's cutoff. Null when there is no cutoff. */
  clearedCutoff: boolean | null;
}

export interface AttemptReviewItem {
  questionId: string;
  order: number;
  question: string;
  options: string[];
  /** Null when skipped. */
  userOption: number | null;
  correctOption: number;
  isCorrect: boolean;
  isSkipped: boolean;
  explanation: string;
  shortcutTip?: string;
  formulaUsed?: string;
  topic: string;
  topicId: string | null;
  category: CategoryLabel;
  difficulty: DifficultyLabel;
  timeSpentSeconds: number;
  isBookmarked: boolean;
}

/** What the practice-advice panel shows: topics this attempt exposed. */
export interface AttemptRecommendation {
  topicId: string | null;
  topic: string;
  errors: number;
}

export interface AttemptReview extends AttemptSummary {
  items: AttemptReviewItem[];
  recommendations: AttemptRecommendation[];
}

export interface TopicAccuracy {
  topicId: string;
  topic: string;
  category: CategoryLabel;
  /** Questions answered, excluding skips. */
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface ProgressSummary {
  attemptsCount: number;
  examsCount: number;
  questionsAnswered: number;
  correctCount: number;
  skippedCount: number;
  /** Null until at least one question has been answered. */
  overallAccuracy: number | null;
  totalTimeSeconds: number;
  byTopic: TopicAccuracy[];
  recentAttempts: AttemptSummary[];
}
