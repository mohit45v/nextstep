import type { Metadata } from "next";
import DashboardMain from "@/components/dashboard/DashboardMain";
import { getCompanyPacks, getTopics } from "@/lib/aptitude";
import { getProgressSummary } from "@/lib/attempts";
import { getDsaProgress } from "@/lib/dsa";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireProfileUser();

  // Four independent reads, one round of waiting.
  const [topics, packs, progress, dsaProgress] = await Promise.all([
    getTopics(),
    getCompanyPacks(),
    getProgressSummary(user.id),
    getDsaProgress(user.id),
  ]);

  return (
    <DashboardMain
      user={{ name: user.name ?? user.email, branch: user.branch }}
      topicCount={topics.length}
      questionCount={topics.reduce((sum, topic) => sum + topic.questionCount, 0)}
      packCount={packs.length}
      progress={progress}
      dsaProgress={dsaProgress}
    />
  );
}
