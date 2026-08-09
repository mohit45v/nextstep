import type { Metadata } from "next";
import { TopicPractice } from "@/components/aptitude/TopicPractice";

export const metadata: Metadata = { title: "Topic practice" };

/**
 * The topic lives in the query string rather than component state, so a
 * practice session is linkable and survives a refresh:
 *   /aptitude/practice?topic=percentages
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  return <TopicPractice initialTopicId={topic} />;
}
