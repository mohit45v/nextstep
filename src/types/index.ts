/** Shared application types. Replaces the `any` payloads passed between screens. */

export interface ExamQuestionResult {
  questionId: string;
  questionText: string;
  options: string[];
  /** Index the student picked, or -1 when skipped. */
  userOption: number;
  correctOption: number;
  isCorrect: boolean;
  isSkipped: boolean;
  explanation?: string;
  shortcutTip?: string;
  topic: string;
  category: string;
}

export interface ExamResults {
  testPackId: string;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
  detailedResults: ExamQuestionResult[];
}
