import { NextResponse } from 'next/server';
import { APTITUDE_TOPICS } from '@/app/data/aptitudeData';

export async function GET() {
  const overallQuestionsSolved = APTITUDE_TOPICS.reduce((sum, t) => sum + t.completedQuestions, 0);
  const overallTotalQuestions = APTITUDE_TOPICS.reduce((sum, t) => sum + t.totalQuestions, 0);
  
  const avgAccuracy = Math.round(
    APTITUDE_TOPICS.reduce((sum, t) => sum + t.accuracy, 0) / APTITUDE_TOPICS.length
  );

  const categoryBreakdown = [
    { category: 'Quantitative', accuracy: 62, solved: 47, total: 83 },
    { category: 'Logical Reasoning', accuracy: 76, solved: 46, total: 63 },
    { category: 'Verbal Ability', accuracy: 68, solved: 30, total: 50 }
  ];

  const weakTopics = APTITUDE_TOPICS.filter(t => t.accuracy < 60);
  const strongTopics = APTITUDE_TOPICS.filter(t => t.accuracy >= 80);

  return NextResponse.json({
    success: true,
    data: {
      overallAccuracy: avgAccuracy,
      questionsSolved: overallQuestionsSolved,
      totalQuestions: overallTotalQuestions,
      dailyStreak: 5,
      readinessScore: 78, // out of 100
      categoryBreakdown,
      weakTopics,
      strongTopics
    }
  });
}
