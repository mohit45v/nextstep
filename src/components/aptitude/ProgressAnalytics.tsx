"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { APTITUDE_TOPICS, questionCountForTopic } from "@/data/aptitudeData";
import { Button, Card, Container, EmptyState, PageHeader, Stat } from "@/components/ui";

interface ProgressAnalyticsProps {
  onNavigateToPractice: (topicId: string) => void;
}

/**
 * Progress screen.
 *
 * This page previously computed "weak" and "strong" topics from an `accuracy`
 * number hardcoded into each topic, and displayed advice like "Accuracy is low
 * (40%). Practice required for IT placements" to users who had never answered
 * a question. None of it was measured.
 *
 * Attempts are not persisted yet, so the honest version of this screen is an
 * empty state plus the list of what is available to practise. It becomes a real
 * analytics view once the ExamAttempt model exists.
 */
export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  onNavigateToPractice,
}) => {
  const practisable = APTITUDE_TOPICS.filter((t) => questionCountForTopic(t.id) > 0);

  return (
    <Container>
      <PageHeader
        title="Your progress"
        description="Accuracy, weak topics and streaks will appear here once your attempts are being recorded."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Questions attempted" value={null} hint="Not recorded yet" />
        <Stat label="Overall accuracy" value={null} hint="Not recorded yet" />
        <Stat label="Tests completed" value={null} hint="Not recorded yet" />
      </div>

      <div className="mt-6">
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="No practice history yet"
          description="Attempts aren't saved to your account yet, so there's nothing to chart. Practising still works — you'll get scored and see full explanations, the results just aren't stored between visits."
        />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Available to practise</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {practisable.length} topics have questions ready.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {practisable.map((topic) => (
            <Card key={topic.id} className="flex flex-col p-5">
              <h3 className="text-[15px] font-semibold">{topic.name}</h3>
              <p className="mt-1 text-xs text-ink-subtle">{topic.category}</p>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-muted">
                {topic.description}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
                onClick={() => onNavigateToPractice(topic.id)}
              >
                Practise {questionCountForTopic(topic.id)}{" "}
                {questionCountForTopic(topic.id) === 1 ? "question" : "questions"}
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
};
