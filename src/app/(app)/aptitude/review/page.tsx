import type { Metadata } from "next";
import { AttemptHistory } from "@/components/aptitude/AttemptHistory";
import { getAttemptHistory } from "@/lib/attempts";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your attempts" };

export default async function AttemptHistoryPage() {
  const user = await requireProfileUser();
  const attempts = await getAttemptHistory(user.id);
  return <AttemptHistory attempts={attempts} />;
}
