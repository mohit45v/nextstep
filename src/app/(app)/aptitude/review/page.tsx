"use client";

import { useRouter } from "next/navigation";
import { QuestionReview } from "@/components/aptitude/QuestionReview";
import { useAptitudeSession } from "@/components/aptitude/AptitudeSessionProvider";
import { SCREEN_ROUTES } from "@/lib/routes";

export default function ReviewPage() {
  const router = useRouter();
  const { lastExamResults } = useAptitudeSession();

  return (
    <QuestionReview
      lastExamResults={lastExamResults}
      onRetakeExam={() => router.push(SCREEN_ROUTES.exam)}
      onNavigateToTopics={() => router.push(SCREEN_ROUTES.practice)}
    />
  );
}
