import { prisma } from "@/lib/prisma";
import { servableQuestions } from "@/lib/aptitude";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/aptitude-labels";
import { MARKS_CORRECT, MARKS_INCORRECT } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { Category } from "@/generated/prisma/enums";
import type {
  AttemptMode,
  AttemptRecommendation,
  AttemptReview,
  AttemptReviewItem,
  AttemptSummary,
  ProgressSummary,
  TopicAccuracy,
} from "@/types/aptitude";

/**
 * Scoring and reading back attempts.
 *
 * The rule this file exists to enforce: **a score is computed from option rows
 * in the database, never from anything the client sent.** The client sends which
 * option index it picked and how long it took; everything else — right or wrong,
 * the total, the maximum, the accuracy — is derived here. A tampered request can
 * therefore claim a wrong answer, which is pointless, but not a score.
 */

/** One answer as the client submits it. */
export interface SubmittedAnswer {
  questionId: string;
  /** 0-based option index, or null/-1 for a skip. */
  selectedOption: number | null;
  timeSpentSeconds: number;
}

/* ---------------------------------------------------------------------------
   Writing
   --------------------------------------------------------------------------- */

/**
 * Scores a submission and stores it as one attempt.
 *
 * Everything happens in a single transaction: an attempt whose question rows
 * failed to write would show a score with nothing behind it, which is exactly
 * the kind of half-truth the rest of this app avoids.
 */
export async function recordAttempt({
  userId,
  mode,
  packId,
  topicId,
  answers,
  startedAt,
}: {
  userId: string;
  mode: AttemptMode;
  packId?: string | null;
  topicId?: string | null;
  answers: SubmittedAnswer[];
  startedAt?: Date;
}): Promise<{ attemptId: string } | { error: string }> {
  if (answers.length === 0) {
    return { error: "No answers were submitted." };
  }

  // Load the questions the submission refers to. Anything not in the servable
  // bank is dropped rather than scored — a request naming a draft question, or a
  // question id that does not exist, must not create an attempt around it.
  const questions = await prisma.question.findMany({
    where: { ...servableQuestions, id: { in: answers.map((a) => a.questionId) } },
    include: { options: { orderBy: { order: "asc" } } },
  });

  if (questions.length === 0) {
    return { error: "None of the submitted questions exist in the question bank." };
  }

  const byId = new Map(questions.map((q) => [q.id, q]));

  // One row per question, whatever the client sent. `QuestionAttempt` is unique
  // on (attemptId, questionId), so a payload naming the same question twice —
  // a retried merge, a bug in a future client, or someone poking at the API —
  // used to fail the whole transaction with a constraint error instead of
  // scoring the paper. First occurrence wins, which is the order it was sat in.
  const seen = new Set<string>();
  const uniqueAnswers = answers.filter((answer) => {
    if (seen.has(answer.questionId)) return false;
    seen.add(answer.questionId);
    return true;
  });

  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let totalTimeSeconds = 0;

  const rows = uniqueAnswers.flatMap((answer, index) => {
    const question = byId.get(answer.questionId);
    if (!question) return [];

    // -1 was the old sentinel for "skipped" and the exam client still sends it;
    // both spellings land as null in the database.
    const selected =
      answer.selectedOption === null ||
      answer.selectedOption === undefined ||
      answer.selectedOption < 0
        ? null
        : answer.selectedOption;

    // Clamp time: a tab left open overnight should not report 40 000 seconds on
    // one question, and a negative number is simply invalid.
    const timeSpentSeconds = Math.min(
      Math.max(0, Math.round(answer.timeSpentSeconds || 0)),
      60 * 60,
    );
    totalTimeSeconds += timeSpentSeconds;

    const isSkipped = selected === null;
    // The flag on the option row is the answer key. Note this also returns false
    // for an out-of-range index, so a crafted `selectedOption: 99` is wrong, not
    // a crash.
    const isCorrect = !isSkipped && (question.options[selected]?.isCorrect ?? false);

    if (isSkipped) {
      skippedCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
      totalScore += MARKS_CORRECT;
    } else {
      incorrectCount += 1;
      totalScore += MARKS_INCORRECT;
    }

    return [
      {
        questionId: question.id,
        order: index,
        selectedOption: selected,
        isCorrect,
        timeSpentSeconds,
      },
    ];
  });

  const attempt = await prisma.$transaction(
    async (tx) =>
      tx.examAttempt.create({
      data: {
        userId,
        mode,
        packId: packId ?? null,
        topicId: topicId ?? null,
        startedAt: startedAt ?? new Date(),
        submittedAt: new Date(),
        totalScore,
        maxScore: rows.length * MARKS_CORRECT,
        correctCount,
        incorrectCount,
        skippedCount,
        totalTimeSeconds,
        questions: { create: rows },
      },
      select: { id: true },
    }),
    // Prisma's default is 2s to acquire a connection. A cold pool needs about
    // three seconds for the first one, and a student who has just finished a
    // paper must not be told their submission failed because of that.
    { maxWait: 15_000, timeout: 20_000 },
  );

  return { attemptId: attempt.id };
}

/**
 * Records one answer from a topic-practice session.
 *
 * Practice is answered a question at a time with the answer revealed straight
 * away, so there is no "submit" to hang a single write off. Instead the first
 * answer opens an attempt and every later answer appends to it, which is what
 * makes per-topic accuracy real without asking the student to finish anything.
 *
 * `attemptId` comes from the client, so it is checked against the signed-in user
 * and the topic before anything is written — otherwise it would be a way to
 * append answers to someone else's attempt.
 */
export async function recordPracticeAnswer({
  userId,
  attemptId,
  topicId,
  questionId,
  selectedOption,
  timeSpentSeconds,
}: {
  userId: string;
  attemptId?: string | null;
  topicId: string;
  questionId: string;
  selectedOption: number | null;
  timeSpentSeconds: number;
}): Promise<{ attemptId: string; isCorrect: boolean } | { error: string }> {
  const question = await prisma.question.findFirst({
    where: { ...servableQuestions, id: questionId, topicId },
    include: { options: { orderBy: { order: "asc" } } },
  });
  if (!question) return { error: "That question is not in this topic." };

  const selected =
    selectedOption === null || selectedOption === undefined || selectedOption < 0
      ? null
      : selectedOption;
  const isCorrect = selected !== null && (question.options[selected]?.isCorrect ?? false);
  const seconds = Math.min(Math.max(0, Math.round(timeSpentSeconds || 0)), 60 * 60);

  // Everything from here is one transaction: an answer row without the matching
  // totals would make the history list disagree with the review screen.
  const result = await prisma.$transaction(async (tx) => {
    let attempt = attemptId
      ? await tx.examAttempt.findFirst({
          where: { id: attemptId, userId, mode: "TOPIC_PRACTICE", topicId },
          select: { id: true },
        })
      : null;

    if (!attempt) {
      attempt = await tx.examAttempt.create({
        data: {
          userId,
          mode: "TOPIC_PRACTICE",
          topicId,
          totalScore: 0,
          maxScore: 0,
          correctCount: 0,
          incorrectCount: 0,
          skippedCount: 0,
          totalTimeSeconds: 0,
        },
        select: { id: true },
      });
    }

    const alreadyAnswered = await tx.questionAttempt.count({
      where: { attemptId: attempt.id },
    });

    // Re-checking the same question overwrites its row rather than adding a
    // second one, so answering twice cannot inflate a topic's accuracy.
    await tx.questionAttempt.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
      create: {
        attemptId: attempt.id,
        questionId,
        order: alreadyAnswered,
        selectedOption: selected,
        isCorrect,
        timeSpentSeconds: seconds,
      },
      update: { selectedOption: selected, isCorrect, timeSpentSeconds: seconds },
    });

    // Totals are recomputed from the rows, never incremented — an incremented
    // counter and an overwritten answer drift apart immediately.
    const rows = await tx.questionAttempt.findMany({
      where: { attemptId: attempt.id },
      select: { isCorrect: true, selectedOption: true, timeSpentSeconds: true },
    });

    const correct = rows.filter((r) => r.isCorrect).length;
    const skipped = rows.filter((r) => r.selectedOption === null).length;
    const incorrect = rows.length - correct - skipped;

    await tx.examAttempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        correctCount: correct,
        incorrectCount: incorrect,
        skippedCount: skipped,
        // Practice uses the same marking as a real paper so one scale runs
        // through the whole app; accuracy, not score, is what the progress
        // screen reports.
        totalScore: correct * MARKS_CORRECT + incorrect * MARKS_INCORRECT,
        maxScore: rows.length * MARKS_CORRECT,
        totalTimeSeconds: rows.reduce((sum, r) => sum + r.timeSpentSeconds, 0),
      },
    });

    return attempt.id;
  }, { maxWait: 15_000, timeout: 20_000 });

  return { attemptId: result, isCorrect };
}

/* ---------------------------------------------------------------------------
   Reading
   --------------------------------------------------------------------------- */

/** The shape every summary is built from, so the list and the review agree. */
type AttemptRow = {
  id: string;
  mode: AttemptMode;
  packId: string | null;
  topicId: string | null;
  submittedAt: Date | null;
  totalScore: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalTimeSeconds: number;
  pack: { companyName: string; testTitle: string; cutoffPercentage: number } | null;
  topic: { name: string } | null;
};

function toSummary(attempt: AttemptRow): AttemptSummary {
  const attempted = attempt.correctCount + attempt.incorrectCount;
  const questionCount = attempted + attempt.skippedCount;
  const accuracyPercentage =
    attempted > 0 ? Math.round((attempt.correctCount / attempted) * 100) : null;

  // Cutoffs are expressed as a percentage of the paper's maximum, which is the
  // way campus tests state them. A negatively-marked score can go below zero, so
  // clamp before comparing.
  const scorePercentage =
    attempt.maxScore > 0
      ? Math.max(0, (attempt.totalScore / attempt.maxScore) * 100)
      : 0;
  const cutoffPercentage = attempt.pack?.cutoffPercentage ?? null;

  return {
    id: attempt.id,
    mode: attempt.mode,
    title:
      attempt.pack?.companyName ??
      (attempt.topic ? `${attempt.topic.name} practice` : "Practice session"),
    packId: attempt.packId,
    topicId: attempt.topicId,
    submittedAtLabel: attempt.submittedAt ? formatDateTime(attempt.submittedAt) : null,
    totalScore: attempt.totalScore,
    maxScore: attempt.maxScore,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    skippedCount: attempt.skippedCount,
    questionCount,
    totalTimeSeconds: attempt.totalTimeSeconds,
    accuracyPercentage,
    averageTimePerQuestion:
      questionCount > 0 ? Math.round(attempt.totalTimeSeconds / questionCount) : 0,
    cutoffPercentage,
    clearedCutoff:
      cutoffPercentage === null ? null : scorePercentage >= cutoffPercentage,
  };
}

const ATTEMPT_SELECT = {
  id: true,
  mode: true,
  packId: true,
  topicId: true,
  submittedAt: true,
  totalScore: true,
  maxScore: true,
  correctCount: true,
  incorrectCount: true,
  skippedCount: true,
  totalTimeSeconds: true,
  pack: { select: { companyName: true, testTitle: true, cutoffPercentage: true } },
  topic: { select: { name: true } },
} as const;

/** A student's attempts, newest first. Scoped by userId — never by id alone. */
export async function getAttemptHistory(
  userId: string,
  limit = 20,
): Promise<AttemptSummary[]> {
  const attempts = await prisma.examAttempt.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: limit,
    select: ATTEMPT_SELECT,
  });

  return attempts.map(toSummary);
}

/**
 * One attempt, question by question.
 *
 * `userId` is part of the where clause, not checked afterwards: a review link is
 * shareable as a URL, and without this a student could read someone else's paper
 * by guessing an id.
 */
export async function getAttemptReview(
  userId: string,
  attemptId: string,
): Promise<AttemptReview | null> {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    select: {
      ...ATTEMPT_SELECT,
      questions: {
        orderBy: { order: "asc" },
        select: {
          questionId: true,
          order: true,
          selectedOption: true,
          isCorrect: true,
          timeSpentSeconds: true,
          question: {
            select: {
              prompt: true,
              explanation: true,
              shortcutTip: true,
              formulaUsed: true,
              category: true,
              difficulty: true,
              topicId: true,
              topic: { select: { name: true } },
              options: { orderBy: { order: "asc" }, select: { text: true, isCorrect: true } },
            },
          },
        },
      },
    },
  });

  if (!attempt) return null;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId, questionId: { in: attempt.questions.map((q) => q.questionId) } },
    select: { questionId: true },
  });
  const bookmarked = new Set(bookmarks.map((b) => b.questionId));

  const items: AttemptReviewItem[] = attempt.questions.map((row) => ({
    questionId: row.questionId,
    order: row.order,
    question: row.question.prompt,
    options: row.question.options.map((o) => o.text),
    userOption: row.selectedOption,
    correctOption: row.question.options.findIndex((o) => o.isCorrect),
    isCorrect: row.isCorrect,
    isSkipped: row.selectedOption === null,
    explanation: row.question.explanation,
    shortcutTip: row.question.shortcutTip ?? undefined,
    formulaUsed: row.question.formulaUsed ?? undefined,
    topic: row.question.topic?.name ?? CATEGORY_LABELS[row.question.category],
    topicId: row.question.topicId,
    category: CATEGORY_LABELS[row.question.category],
    difficulty: DIFFICULTY_LABELS[row.question.difficulty],
    timeSpentSeconds: row.timeSpentSeconds,
    isBookmarked: bookmarked.has(row.questionId),
  }));

  // Advice is counted from this attempt's own errors — the topics the student
  // actually got wrong, in order of how often. No invented "your accuracy is 40%".
  const errorsByTopic = new Map<string, AttemptRecommendation>();
  for (const item of items) {
    if (item.isCorrect || item.isSkipped) continue;
    const key = item.topicId ?? item.topic;
    const existing = errorsByTopic.get(key);
    if (existing) {
      existing.errors += 1;
    } else {
      errorsByTopic.set(key, {
        topicId: item.topicId,
        topic: item.topic,
        errors: 1,
      });
    }
  }

  return {
    ...toSummary(attempt),
    items,
    recommendations: [...errorsByTopic.values()].sort((a, b) => b.errors - a.errors),
  };
}

/* ---------------------------------------------------------------------------
   Progress
   --------------------------------------------------------------------------- */

/**
 * Everything the progress screen shows, measured.
 *
 * Per-topic accuracy is a `groupBy` over the student's own question attempts
 * joined to the question's topic — not a number stored on the topic. Skips are
 * excluded from accuracy and reported separately: a skipped question is a
 * decision, not a wrong answer.
 */
export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  const [attemptTotals, examCount, overall, byTopicRows, recentAttempts] =
    await Promise.all([
      prisma.examAttempt.aggregate({
        where: { userId },
        _count: { _all: true },
        _sum: { skippedCount: true, totalTimeSeconds: true },
      }),
      prisma.examAttempt.count({ where: { userId, mode: "MOCK_EXAM" } }),
      // Overall totals are counted independently of the per-topic breakdown:
      // a question whose topic was removed after it was answered still counts
      // towards "questions answered", and deriving the total by summing the
      // topic rows would quietly drop it.
      prisma.questionAttempt.groupBy({
        by: ["isCorrect"],
        where: { attempt: { userId }, selectedOption: { not: null } },
        _count: { _all: true },
      }),
      // Per-topic accuracy as one grouped join, computed by Postgres.
      //
      // This used to pull every answered QuestionAttempt row into Node and tally
      // them in a loop — fine for a demo, linear in a student's whole history
      // once they have been practising for a term. The database already has the
      // index; counting is its job.
      prisma.$queryRaw<
        { topicId: string; topic: string; category: Category; attempted: bigint; correct: bigint }[]
      >`
        SELECT t."id"       AS "topicId",
               t."name"     AS "topic",
               t."category" AS "category",
               COUNT(*)                                        AS "attempted",
               COUNT(*) FILTER (WHERE qa."isCorrect")           AS "correct"
          FROM "QuestionAttempt" qa
          JOIN "ExamAttempt"     a ON a."id" = qa."attemptId"
          JOIN "Question"        q ON q."id" = qa."questionId"
          JOIN "Topic"           t ON t."id" = q."topicId"
         WHERE a."userId" = ${userId}
           AND qa."selectedOption" IS NOT NULL
         GROUP BY t."id", t."name", t."category"
      `,
      getAttemptHistory(userId, 5),
    ]);

  const byTopic: TopicAccuracy[] = byTopicRows
    .map((row) => {
      // COUNT() comes back as bigint over the wire; Number() is safe here — a
      // student would need billions of answers to lose precision.
      const attempted = Number(row.attempted);
      const correct = Number(row.correct);
      return {
        topicId: row.topicId,
        topic: row.topic,
        category: CATEGORY_LABELS[row.category],
        attempted,
        correct,
        accuracy: Math.round((correct / attempted) * 100),
      };
    })
    // Weakest first: the list is there to tell a student what to practise next.
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted);

  const questionsAnswered = overall.reduce((sum, row) => sum + row._count._all, 0);
  const correctCount =
    overall.find((row) => row.isCorrect)?._count._all ?? 0;

  return {
    attemptsCount: attemptTotals._count._all,
    examsCount: examCount,
    questionsAnswered,
    correctCount,
    skippedCount: attemptTotals._sum.skippedCount ?? 0,
    overallAccuracy:
      questionsAnswered > 0
        ? Math.round((correctCount / questionsAnswered) * 100)
        : null,
    totalTimeSeconds: attemptTotals._sum.totalTimeSeconds ?? 0,
    byTopic,
    recentAttempts,
  };
}
