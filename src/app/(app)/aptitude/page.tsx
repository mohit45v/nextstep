import { AptitudeDashboard } from "@/components/aptitude/AptitudeDashboard";
import { getCompanyPacks, getFormulaCards, getTopics } from "@/lib/aptitude";
import { requireProfileUser } from "@/lib/session";

/**
 * Server component. The three queries run in parallel and the page ships no
 * question data to the browser that the student is not looking at.
 */
export default async function AptitudePage() {
  await requireProfileUser();

  const [topics, packs, formulaCards] = await Promise.all([
    getTopics(),
    getCompanyPacks(),
    getFormulaCards(),
  ]);

  return (
    <AptitudeDashboard
      topics={topics}
      packCount={packs.length}
      formulaCount={formulaCards.length}
      questionCount={topics.reduce((sum, topic) => sum + topic.questionCount, 0)}
    />
  );
}
