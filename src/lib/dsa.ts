import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_LABELS } from "@/lib/aptitude-labels";
import {
  DSA_BRANCH_BY_LABEL,
  DSA_BRANCH_LABELS,
  type DsaBranchFilter,
} from "@/lib/dsa-labels";
import type { DsaProblemView, DsaTopicSummary, LiveProblem } from "@/types/dsa";

/**
 * Reads for the DSA hub.
 *
 * Everything here is scoped to one student where solve state is involved: a tick
 * is a row in `ProblemSolve`, and the only way to see someone else's is to be
 * them.
 */

/**
 * Topics with their problem count and this student's solved count.
 *
 * Both numbers come from the database in one query — the counts are a grouped
 * join, not a per-topic round trip, so adding topics does not add queries.
 */
export async function getDsaTopics(
  userId: string,
  branch: DsaBranchFilter = "All",
): Promise<DsaTopicSummary[]> {
  const where = branch === "All" ? {} : { branch: DSA_BRANCH_BY_LABEL[branch] };

  const [topics, solvesByTopic] = await Promise.all([
    prisma.dsaTopic.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { problems: true } } },
    }),
    // One grouped query for every topic's solved count, rather than N counts.
    prisma.problemSolve.groupBy({
      by: ["problemId"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  // Map solved problem ids back to their topic without a second trip: the ids
  // are prefixed per sheet, but relying on that would be fragile, so fetch the
  // pairs once.
  const solvedIds = solvesByTopic.map((row) => row.problemId);
  const problemTopics = solvedIds.length
    ? await prisma.dsaProblem.findMany({
        where: { id: { in: solvedIds } },
        select: { id: true, topicId: true },
      })
    : [];

  const solvedPerTopic = new Map<string, number>();
  for (const problem of problemTopics) {
    solvedPerTopic.set(problem.topicId, (solvedPerTopic.get(problem.topicId) ?? 0) + 1);
  }

  return topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    description: topic.description,
    branch: DSA_BRANCH_LABELS[topic.branch],
    problemCount: topic._count.problems,
    solvedCount: solvedPerTopic.get(topic.id) ?? 0,
  }));
}

/** One sheet's problems, with this student's ticks resolved in the same pass. */
export async function getDsaProblems(
  userId: string,
  topicId: string,
): Promise<DsaProblemView[]> {
  const problems = await prisma.dsaProblem.findMany({
    where: { topicId },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: {
      // A filtered include rather than a second query: Postgres joins the
      // student's own solve row, and an empty array means "not solved".
      solves: { where: { userId }, select: { id: true } },
    },
  });

  return problems.map((problem) => ({
    id: problem.id,
    title: problem.title,
    difficulty: DIFFICULTY_LABELS[problem.difficulty],
    link: problem.link,
    description: problem.description,
    solved: problem.solves.length > 0,
  }));
}

/**
 * Ticks or un-ticks a problem.
 *
 * `upsert` on the composite unique and `deleteMany` for removal, so both
 * directions are idempotent — the UI updates optimistically and a retried or
 * duplicated request cannot leave the two out of step.
 */
export async function setProblemSolved(
  userId: string,
  problemId: string,
  solved: boolean,
): Promise<{ solved: boolean } | { error: string }> {
  const problem = await prisma.dsaProblem.findUnique({
    where: { id: problemId },
    select: { id: true },
  });
  if (!problem) return { error: "That problem doesn't exist." };

  if (solved) {
    await prisma.problemSolve.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: { userId, problemId },
      update: {},
    });
  } else {
    await prisma.problemSolve.deleteMany({ where: { userId, problemId } });
  }

  return { solved };
}

/** Totals for the dashboard: how much of the curated set is ticked off. */
export const getDsaProgress = cache(
  async (userId: string): Promise<{ solved: number; total: number }> => {
    const [solved, total] = await Promise.all([
      prisma.problemSolve.count({ where: { userId } }),
      prisma.dsaProblem.count(),
    ]);
    return { solved, total };
  },
);

/* ---------------------------------------------------------------------------
   Codeforces
   --------------------------------------------------------------------------- */

/** Tags offered in the live feed. A fixed list — the UI must not pass anything through. */
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

interface CodeforcesApiProblem {
  contestId?: number;
  index?: string;
  name?: string;
  rating?: number;
  tags?: string[];
}

export const LIVE_PROBLEM_LIMIT = 30;

/**
 * Live problems for one tag.
 *
 * Three things this does that the old route handler did not:
 *
 *  * **Times out.** Codeforces is occasionally slow or down, and without a
 *    deadline our own request hangs for as long as theirs does, holding a
 *    serverless invocation open behind it.
 *  * **Validates.** Every field is checked before use; a problem missing a
 *    contestId has no stable URL and is dropped rather than linked to a 404.
 *  * **Caches by tag for five minutes.** The feed is identical for every
 *    student, so it is fetched once per tag per five minutes for everyone.
 */
export async function getCodeforcesProblems(
  tag: CodeforcesTag,
): Promise<{ problems: LiveProblem[] } | { error: string }> {
  try {
    const response = await fetch(
      `https://codeforces.com/api/problemset.problems?tags=${encodeURIComponent(tag)}`,
      {
        next: { revalidate: 300, tags: [`codeforces:${tag}`] },
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      return { error: `Codeforces replied with HTTP ${response.status}.` };
    }

    const data = (await response.json()) as {
      status?: string;
      comment?: string;
      result?: { problems?: CodeforcesApiProblem[] };
    };

    if (data.status !== "OK") {
      return { error: data.comment ?? "Codeforces rejected the request." };
    }

    const problems = (data.result?.problems ?? [])
      .filter(
        (p): p is CodeforcesApiProblem & { contestId: number; index: string; name: string } =>
          typeof p.contestId === "number" &&
          typeof p.index === "string" &&
          typeof p.name === "string",
      )
      .slice(0, LIVE_PROBLEM_LIMIT)
      .map((p) => ({
        id: `cf-${p.contestId}-${p.index}`,
        title: `${p.name} (CF ${p.contestId}${p.index})`,
        // Codeforces ratings are not our Easy/Medium/Hard, but the mapping is
        // the conventional one and the real rating is shown beside it.
        difficulty:
          p.rating === undefined
            ? ("Medium" as const)
            : p.rating < 1200
              ? ("Easy" as const)
              : p.rating >= 1700
                ? ("Hard" as const)
                : ("Medium" as const),
        rating: p.rating ?? null,
        tags: p.tags ?? [],
        link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
      }));

    return { problems };
  } catch (error) {
    // A timeout and a DNS failure are the same thing to a student: the feed is
    // not available right now. The detail goes to the server log, not the page.
    console.error("Codeforces fetch failed:", error);
    return {
      error:
        error instanceof Error && error.name === "TimeoutError"
          ? "Codeforces took too long to respond."
          : "Couldn't reach Codeforces.",
    };
  }
}
