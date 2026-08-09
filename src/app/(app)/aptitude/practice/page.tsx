import { TopicPractice } from "@/components/aptitude/TopicPractice";

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
