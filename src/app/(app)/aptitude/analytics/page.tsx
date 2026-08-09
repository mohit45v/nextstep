"use client";

import { useRouter } from "next/navigation";
import { ProgressAnalytics } from "@/components/aptitude/ProgressAnalytics";
import { practiceRoute } from "@/lib/routes";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <ProgressAnalytics
      onNavigateToPractice={(topicId) => router.push(practiceRoute(topicId))}
    />
  );
}
