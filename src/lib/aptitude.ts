import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  CATEGORY_BY_LABEL,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  PACK_DIFFICULTY_LABELS,
  type CategoryFilter,
} from "@/lib/aptitude-labels";
import type {
  CompanyPackSummary,
  DemoQuestion,
  ExamPaper,
  ExamQuestion,
  FormulaCardView,
  PracticeQuestion,
  TopicSummary,
} from "@/types/aptitude";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Every read of aptitude content goes through this file.
 *
 * Two reasons it is worth the indirection:
 *
 *  1. One definition of "a question a student may see" (`servableQuestions`).
 *     When the imported bank arrives, drafts must not leak into practice; with
 *     the filter in one place that is a single edit, not an audit of every page.
 *  2. The screens never see a Prisma row. They get view models with labels and
 *     plain option arrays, so a schema change does not ripple into JSX.
 */

/**
 * The filter for questions a student is allowed to be served.
 *
 * Two conditions, both deliberate:
 *
 *  * `status: "APPROVED"` — a question nobody has read is never shown to a
 *    student. Imported questions arrive as DRAFT and stay invisible until
 *    somebody approves them on /admin/questions.
 *  * `topicId: { not: null }` — an approved question still needs a topic, or it
 *    would be unreachable from practice and would break the per-topic analytics.
 *    The review screen enforces this before it will let you approve anything.
 *
 * Every read in this file and in `attempts.ts` spreads this object. That is the
 * mechanism behind "a student only ever sees APPROVED questions": there is one
 * filter, not a convention to remember at each call site.
 */
export const servableQuestions = {
  status: "APPROVED",
  topicId: { not: null },
} satisfies Prisma.QuestionWhereInput;

/** How many questions one practice session serves. */
export const PRACTICE_SESSION_SIZE = 20;

/** Options always come back in display order — "A" must be the first option. */
const OPTIONS_IN_ORDER = { orderBy: { order: "asc" } } as const;

/* ---------------------------------------------------------------------------
   Topics
   --------------------------------------------------------------------------- */

/**
 * Topics with a live question count.
 *
 * The count is `_count`, i.e. a `COUNT(*)` the database runs — never a stored
 * number. The old hardcoded data advertised 196 questions over a bank of six.
 */
export const getTopics = cache(async (): Promise<TopicSummary[]> => {
  const topics = await prisma.topic.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { questions: { where: servableQuestions } } },
    },
  });

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    category: CATEGORY_LABELS[topic.category],
    iconName: topic.iconName,
    description: topic.description,
    questionCount: topic._count.questions,
  }));
});

/* ---------------------------------------------------------------------------
   Practice
   --------------------------------------------------------------------------- */

/**
 * One topic's questions for a practice session, with the student's bookmarks
 * resolved in the same pass.
 *
 * Capped at `PRACTICE_SESSION_SIZE`: once the imported bank lands a topic can
 * hold hundreds of questions, and shipping all of them to the browser to show
 * one at a time would be slow and pointless.
 */
export async function getPracticeQuestions(
  userId: string,
  topicId: string,
): Promise<PracticeQuestion[]> {
  const [questions, bookmarks] = await Promise.all([
    prisma.question.findMany({
      where: { ...servableQuestions, topicId },
      orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
      take: PRACTICE_SESSION_SIZE,
      include: { options: OPTIONS_IN_ORDER, topic: { select: { name: true } } },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      select: { questionId: true },
    }),
  ]);

  const bookmarked = new Set(bookmarks.map((b) => b.questionId));

  return questions.map((question) => ({
    id: question.id,
    topicId: question.topicId,
    topic: question.topic?.name ?? CATEGORY_LABELS[question.category],
    category: CATEGORY_LABELS[question.category],
    difficulty: DIFFICULTY_LABELS[question.difficulty],
    question: question.prompt,
    options: question.options.map((o) => o.text),
    // The flag is the source of truth; this index is derived for the UI. A
    // question with no correct option would be a seed bug, and -1 makes it
    // visible instead of silently marking option A right.
    correctOption: question.options.findIndex((o) => o.isCorrect),
    explanation: question.explanation,
    shortcutTip: question.shortcutTip ?? undefined,
    formulaUsed: question.formulaUsed ?? undefined,
    companyTags: question.companyTags,
    isBookmarked: bookmarked.has(question.id),
  }));
}

/**
 * A handful of questions for the public landing page's demo loop.
 *
 * The only question query in the app that runs without a session, so it is
 * deliberately narrow: a fixed, small number of rows, oldest first so the result
 * is stable and cacheable, and nothing user-specific. Everything it returns is
 * already public in the sense that it is the content the college is advertising.
 */
export const getDemoQuestions = cache(async (limit = 3): Promise<DemoQuestion[]> => {
  const questions = await prisma.question.findMany({
    where: servableQuestions,
    orderBy: { createdAt: "asc" },
    take: limit,
    include: { options: OPTIONS_IN_ORDER, topic: { select: { name: true } } },
  });

  return questions.map((question) => ({
    id: question.id,
    question: question.prompt,
    options: question.options.map((o) => o.text),
    correctOption: question.options.findIndex((o) => o.isCorrect),
    explanation: question.explanation,
    difficulty: DIFFICULTY_LABELS[question.difficulty],
    topic: question.topic?.name ?? CATEGORY_LABELS[question.category],
  }));
});

/* ---------------------------------------------------------------------------
   Formula cards
   --------------------------------------------------------------------------- */

export const getFormulaCards = cache(async (): Promise<FormulaCardView[]> => {
  const cards = await prisma.formulaCard.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });

  return cards.map((card) => ({
    id: card.id,
    category: CATEGORY_LABELS[card.category],
    topic: card.topic,
    title: card.title,
    formula: card.formula,
    keyRule: card.keyRule,
    example: card.example,
  }));
});

/* ---------------------------------------------------------------------------
   Company packs
   --------------------------------------------------------------------------- */

/**
 * Company packs, each annotated with how much of its paper the bank can fill.
 *
 * `availableQuestions` is why this is a query and not a constant: the cards used
 * to promise a 30-question paper and then serve six. Now the card says both
 * numbers, and the exam builder honours the smaller one.
 */
export const getCompanyPacks = cache(async (): Promise<CompanyPackSummary[]> => {
  const [packs, counts] = await Promise.all([
    prisma.companyPack.findMany({
      orderBy: [{ order: "asc" }, { companyName: "asc" }],
      include: { sections: { orderBy: { order: "asc" } } },
    }),
    prisma.question.groupBy({
      by: ["category"],
      where: servableQuestions,
      _count: { _all: true },
    }),
  ]);

  const availableByCategory = new Map(
    counts.map((row) => [row.category, row._count._all]),
  );

  return packs.map((pack) => {
    // A category's questions are shared across that pack's sections, so the
    // per-category budget is spent down rather than counted twice.
    const budget = new Map(availableByCategory);

    const sections = pack.sections.map((section) => {
      const left = budget.get(section.category) ?? 0;
      const drawn = Math.min(section.questionCount, left);
      budget.set(section.category, left - drawn);
      return {
        name: section.name,
        questionCount: section.questionCount,
        category: CATEGORY_LABELS[section.category],
        drawn,
      };
    });

    return {
      id: pack.id,
      companyName: pack.companyName,
      logoColor: pack.logoColor,
      testTitle: pack.testTitle,
      durationMinutes: pack.durationMinutes,
      cutoffPercentage: pack.cutoffPercentage,
      difficulty: PACK_DIFFICULTY_LABELS[pack.difficulty],
      description: pack.description,
      sections: sections.map(({ name, questionCount, category }) => ({
        name,
        questionCount,
        category,
      })),
      totalQuestions: sections.reduce((sum, s) => sum + s.questionCount, 0),
      availableQuestions: sections.reduce((sum, s) => sum + s.drawn, 0),
    };
  });
});

/* ---------------------------------------------------------------------------
   Exam papers
   --------------------------------------------------------------------------- */

/** Fisher–Yates. Two students sitting the same pack should not get the same paper. */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds one sitting of a pack: for each section, up to `questionCount`
 * questions drawn at random from that section's category, never repeating a
 * question within the paper.
 *
 * Returns null when the pack id does not exist. Returns a paper with fewer
 * questions than the pack advertises when the bank is short — the screens say so
 * rather than padding the paper out.
 */
export async function getExamPaper(packId: string): Promise<ExamPaper | null> {
  const pack = await prisma.companyPack.findUnique({
    where: { id: packId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!pack) return null;

  // Ids first, shuffled in memory, then one fetch for the chosen rows. Postgres
  // has no portable "random N rows" in Prisma's query API, and the bank is small
  // enough that pulling ids is cheap.
  const categories = [...new Set(pack.sections.map((s) => s.category))];
  const idsByCategory = new Map<string, string[]>();
  await Promise.all(
    categories.map(async (category) => {
      const rows = await prisma.question.findMany({
        where: { ...servableQuestions, category },
        select: { id: true },
      });
      idsByCategory.set(category, shuffle(rows.map((r) => r.id)));
    }),
  );

  const chosenIds: string[] = [];
  const sections = pack.sections.map((section) => {
    const pool = idsByCategory.get(section.category) ?? [];
    // splice() both takes the ids and removes them from the pool, so a second
    // section in the same category draws different questions.
    const picked = pool.splice(0, section.questionCount);
    chosenIds.push(...picked);
    return {
      name: section.name,
      category: CATEGORY_LABELS[section.category],
      requested: section.questionCount,
      drawn: picked.length,
    };
  });

  const questions = await prisma.question.findMany({
    where: { id: { in: chosenIds } },
    include: { options: OPTIONS_IN_ORDER, topic: { select: { name: true } } },
  });

  // findMany ignores the order of an `in` list, so restore the section order the
  // paper was built in — a student should meet the sections in sequence.
  const byId = new Map(questions.map((q) => [q.id, q]));
  const ordered: ExamQuestion[] = chosenIds.flatMap((id) => {
    const question = byId.get(id);
    if (!question) return [];
    return [
      {
        id: question.id,
        topic: question.topic?.name ?? CATEGORY_LABELS[question.category],
        category: CATEGORY_LABELS[question.category],
        difficulty: DIFFICULTY_LABELS[question.difficulty],
        question: question.prompt,
        options: question.options.map((o) => o.text),
      },
    ];
  });

  return {
    packId: pack.id,
    companyName: pack.companyName,
    testTitle: pack.testTitle,
    durationMinutes: pack.durationMinutes,
    cutoffPercentage: pack.cutoffPercentage,
    sections,
    questions: ordered,
  };
}

/** Translates the "All | Quantitative | …" chip into a Prisma filter. */
export function categoryWhere(filter: CategoryFilter) {
  return filter === "All" ? {} : { category: CATEGORY_BY_LABEL[filter] };
}
