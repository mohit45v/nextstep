import type { Metadata } from "next";
import DashboardMain from "@/components/dashboard/DashboardMain";
import { getCompanyPacks, getTopics } from "@/lib/aptitude";
import { getProgressSummary } from "@/lib/attempts";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireProfileUser();

  const [topics, packs, progress] = await Promise.all([
    getTopics(),
    getCompanyPacks(),
    getProgressSummary(user.id),
  ]);

  return (
    <DashboardMain
      user={{ name: user.name ?? user.email, branch: user.branch }}
      topicCount={topics.length}
      questionCount={topics.reduce((sum, topic) => sum + topic.questionCount, 0)}
      packCount={packs.length}
      progress={progress}
    />
  );
}
