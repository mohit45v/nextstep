import type { Metadata } from "next";
import { FormulaCheatsheet } from "@/components/aptitude/FormulaCheatsheet";
import { getFormulaCards } from "@/lib/aptitude";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = { title: "Formula sheets" };

export default async function FormulasPage() {
  await requireProfileUser();
  const cards = await getFormulaCards();
  return <FormulaCheatsheet cards={cards} />;
}
