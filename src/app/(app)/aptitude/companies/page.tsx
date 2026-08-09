"use client";

import { useRouter } from "next/navigation";
import { CompanyTests } from "@/components/aptitude/CompanyTests";
import { useAptitudeSession } from "@/components/aptitude/AptitudeSessionProvider";
import { SCREEN_ROUTES } from "@/lib/routes";

export default function CompanyTestsPage() {
  const router = useRouter();
  const { setSelectedExamPack } = useAptitudeSession();

  return (
    <CompanyTests
      onStartExam={(pack) => {
        setSelectedExamPack(pack);
        router.push(SCREEN_ROUTES.exam);
      }}
    />
  );
}
