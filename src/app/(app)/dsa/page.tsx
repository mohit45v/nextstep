import type { Metadata } from "next";
import DSAPage from "@/components/dsa/DSAPage";
import { getDsaProblems, getDsaTopics, isCodeforcesTag } from "@/lib/dsa";
import { defaultBranchForProgramme, toDsaBranchFilter } from "@/lib/dsa-labels";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "DSA problems",
  description:
    "Branch-wise curated problem sheets with LeetCode links, plus a live feed from the Codeforces API.",
};

/**
 * Server-rendered: branch, topic and mode come from the URL, so the first paint
 * already contains the sheet and its problems. The previous version shipped an
 * empty page that then made two chained fetches before showing anything.
 *
 * With no `?branch=`, the student's own degree programme picks the first sheet —
 * a default, not a restriction.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    branch?: string;
    topic?: string;
    mode?: string;
    tag?: string;
  }>;
}) {
  const user = await requireProfileUser();
  const params = await searchParams;

  const branchFromProfile = !params.branch;
  const branch = branchFromProfile
    ? defaultBranchForProgramme(user.branch)
    : toDsaBranchFilter(params.branch);

  const mode = params.mode === "live" ? "live" : "curated";
  const tag = params.tag && isCodeforcesTag(params.tag) ? params.tag : "dp";

  // When the URL names a topic, its problems do not depend on the topic list, so
  // both queries go out together instead of one waiting on the other.
  const [topics, requestedProblems] = await Promise.all([
    getDsaTopics(user.id, branch),
    params.topic ? getDsaProblems(user.id, params.topic) : Promise.resolve(null),
  ]);

  const activeTopic =
    topics.find((topic) => topic.id === params.topic) ?? topics[0] ?? null;

  const problems =
    requestedProblems && activeTopic?.id === params.topic
      ? requestedProblems
      : activeTopic
        ? await getDsaProblems(user.id, activeTopic.id)
        : [];

  return (
    <DSAPage
      // Remount when the sheet changes so the optimistic solve state restarts
      // from the server's answer rather than carrying over.
      key={activeTopic?.id ?? "none"}
      topics={topics}
      activeTopic={activeTopic}
      problems={problems}
      branch={branch}
      mode={mode}
      tag={tag}
      branchFromProfile={branchFromProfile && branch !== "All"}
    />
  );
}
