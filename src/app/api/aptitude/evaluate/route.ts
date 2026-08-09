import { NextResponse } from 'next/server';
import { SAMPLE_QUESTIONS } from '@/data/aptitudeData';

interface UserSubmission {
  questionId: string;
  selectedOption: number; // 0-indexed, -1 if skipped
  timeSpentSeconds: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submissions: UserSubmission[] = body.submissions || [];
    const testPackId = body.testPackId || 'custom-practice';

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let totalTimeSeconds = 0;

    const detailedResults = submissions.map(sub => {
      const question = SAMPLE_QUESTIONS.find(q => q.id === sub.questionId);
      if (!question) return null;

      totalTimeSeconds += sub.timeSpentSeconds || 0;

      const isSkipped = sub.selectedOption === -1;
      const isCorrect = sub.selectedOption === question.correctOption;

      if (isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
        totalScore += 4; // +4 for correct
      } else {
        incorrectCount++;
        totalScore -= 1; // -1 penalty
      }

      return {
        questionId: question.id,
        questionText: question.question,
        options: question.options,
        userOption: sub.selectedOption,
        correctOption: question.correctOption,
        isCorrect,
        isSkipped,
        timeSpentSeconds: sub.timeSpentSeconds,
        explanation: question.explanation,
        shortcutTip: question.shortcutTip,
        formulaUsed: question.formulaUsed,
        category: question.category,
        topic: question.topic
      };
    }).filter(Boolean);

    const attemptedCount = correctCount + incorrectCount;
    const accuracyPercentage = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const averageTimePerQuestion = attemptedCount > 0 ? Math.round(totalTimeSeconds / attemptedCount) : 0;

    // Generate Smart Recommendations based on errors
    const topicErrorMap: Record<string, number> = {};
    detailedResults.forEach(res => {
      if (res && !res.isCorrect && !res.isSkipped) {
        topicErrorMap[res.topic] = (topicErrorMap[res.topic] || 0) + 1;
      }
    });

    const generatedRecommendations = Object.keys(topicErrorMap).map(topic => ({
      topic,
      message: `You made ${topicErrorMap[topic]} error(s) in ${topic}. Review formulas and complete 5 practice questions to improve accuracy.`,
      action: `Practice ${topic}`
    }));

    return NextResponse.json({
      success: true,
      data: {
        testPackId,
        totalScore,
        maxScore: submissions.length * 4,
        correctCount,
        incorrectCount,
        skippedCount,
        accuracyPercentage,
        totalTimeSeconds,
        averageTimePerQuestion,
        detailedResults,
        generatedRecommendations
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid submission payload' }, { status: 400 });
  }
}
