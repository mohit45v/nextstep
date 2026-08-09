"use client";

import { useRouter } from "next/navigation";
import { AptitudeDashboard } from "@/components/aptitude/AptitudeDashboard";
import { SCREEN_ROUTES, practiceRoute, type ScreenType } from "@/lib/routes";

export default function AptitudePage() {
  const router = useRouter();

  return (
    <AptitudeDashboard
      onNavigate={(screen: ScreenType) => router.push(SCREEN_ROUTES[screen])}
      onStartQuiz={(topicId?: string) => router.push(practiceRoute(topicId))}
    />
  );
}
