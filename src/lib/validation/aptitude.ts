import { z } from "zod";

/**
 * Request schemas for the aptitude API.
 *
 * Route handlers are a public surface: anything reachable with `fetch` has to
 * assume the body was written by hand. These schemas are the only thing that
 * turns `await request.json()` into values the rest of the code may trust.
 */

/** A skipped question arrives as -1 from the exam client, or null from newer code. */
const selectedOption = z.number().int().min(-1).max(50).nullable();

export const submittedAnswerSchema = z.object({
  questionId: z.string().min(1).max(64),
  selectedOption,
  // Seconds. Bounded here as well as in the scorer — the scorer clamps, this
  // rejects, and a submission claiming a year on one question is a bug or an
  // attack either way.
  timeSpentSeconds: z.number().int().min(0).max(60 * 60).default(0),
});

export const evaluateRequestSchema = z.object({
  packId: z.string().min(1).max(64).nullish(),
  topicId: z.string().min(1).max(64).nullish(),
  /** Seconds the student had the paper open; used as the attempt's start time. */
  elapsedSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
  submissions: z.array(submittedAnswerSchema).min(1).max(200),
});

export const practiceAnswerSchema = z.object({
  attemptId: z.string().min(1).max(64).nullish(),
  topicId: z.string().min(1).max(64),
  questionId: z.string().min(1).max(64),
  selectedOption,
  timeSpentSeconds: z.number().int().min(0).max(60 * 60).default(0),
});

export const bookmarkSchema = z.object({
  questionId: z.string().min(1).max(64),
  /** true to bookmark, false to remove. Explicit rather than a blind toggle, so
   *  a retried request cannot undo itself. */
  bookmarked: z.boolean(),
});
