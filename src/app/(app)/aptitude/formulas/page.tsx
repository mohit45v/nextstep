import type { Metadata } from "next";
import { FormulaCheatsheet } from "@/components/aptitude/FormulaCheatsheet";

export const metadata: Metadata = { title: "Formula sheets" };

export default function FormulasPage() {
  return <FormulaCheatsheet />;
}
