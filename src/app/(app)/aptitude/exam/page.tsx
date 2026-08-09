"use client";

import { useRouter } from "next/navigation";
import { MockExamSimulator } from "@/components/aptitude/MockExamSimulator";
import { useAptitudeSession } from "@/components/aptitude/AptitudeSessionProvider";
import { SCREEN_ROUTES } from "@/lib/routes";

export default function ExamPage() {
  const router = useRouter();
  const { selectedExamPack, setSelectedExamPack, setLastExamResults } =
    useAptitudeSession();

  return (
    <MockExamSimulator
      testPack={selectedExamPack}
      onFinishExam={(results) => {
        setLastExamResults(results);
        setSelectedExamPack(null);
        router.push(SCREEN_ROUTES.review);
      }}
      onCancelExam={() => {
        setSelectedExamPack(null);
        router.push(SCREEN_ROUTES.company);
      }}
    />
  );
}
