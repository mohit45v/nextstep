import type { Metadata } from "next";
import { TopicPractice } from "@/components/aptitude/TopicPractice";
import { getPracticeQuestions, getTopics } from "@/lib/aptitude";
import { toCategoryFilter } from "@/lib/aptitude-labels";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = { title: "Topic practice" };

/**
 * Both the topic and the category filter live in the query string rather than
 * component state, so a practice session is linkable and survives a refresh:
 *   /aptitude/practice?topic=profit-loss&category=Quantitative
 *
 * The questions for the chosen topic are fetched here, which means the browser
 * only ever receives the topic being practised — not the whole bank.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; category?: string }>;
}) {
  const user = await requireProfileUser();
  const { topic, category } = await searchParams;

  const topics = await getTopics();
  // An unknown ?topic= is treated as no topic at all rather than an error: a
  // stale bookmark should land on "pick a topic", not a 404.
  const activeTopic = topics.find((t) => t.id === topic) ?? null;
  const questions = activeTopic
    ? await getPracticeQuestions(user.id, activeTopic.id)
    : [];

  return (
    <TopicPractice
      // Remounts the practice panel when the topic changes, which resets the
      // question index, the selected option and the session's attempt without an
      // effect that writes state.
      key={activeTopic?.id ?? "no-topic"}
      topics={topics}
      activeTopic={activeTopic}
      questions={questions}
      category={toCategoryFilter(category)}
    />
  );
}
