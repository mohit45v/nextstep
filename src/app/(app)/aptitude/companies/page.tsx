import type { Metadata } from "next";
import { CompanyTests } from "@/components/aptitude/CompanyTests";
import { getCompanyPacks } from "@/lib/aptitude";
import { requireProfileUser } from "@/lib/session";

export const metadata: Metadata = { title: "Company tests" };

export default async function CompanyTestsPage() {
  await requireProfileUser();
  const packs = await getCompanyPacks();
  return <CompanyTests packs={packs} />;
}
