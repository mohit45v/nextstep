import type { Metadata } from "next";
import { ProgressAnalytics } from "@/components/aptitude/ProgressAnalytics";
import { getTopics } from "@/lib/aptitude";
import { getProgressSummary } from "@/lib/attempts";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your progress" };

export default async function AnalyticsPage() {
  const user = await requireProfileUser();

  const [progress, topics] = await Promise.all([
    getProgressSummary(user.id),
    getTopics(),
  ]);

  return <ProgressAnalytics progress={progress} topics={topics} />;
}
