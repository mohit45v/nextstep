import { NextResponse } from 'next/server';
import { 
  APTITUDE_TOPICS, 
  SAMPLE_QUESTIONS, 
  COMPANY_PACKS, 
  FORMULA_CARDS, 
  SMART_RECOMMENDATIONS 
} from '@/data/aptitudeData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const topic = searchParams.get('topic');

  let filteredQuestions = SAMPLE_QUESTIONS;

  if (category) {
    filteredQuestions = filteredQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  if (topic) {
    filteredQuestions = filteredQuestions.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  }

  return NextResponse.json({
    success: true,
    categories: [
      { name: "Quantitative Aptitude", totalQuizzes: 45, completed: 18 },
      { name: "Logical Reasoning", totalQuizzes: 35, completed: 22 },
      { name: "Verbal Ability & English", totalQuizzes: 30, completed: 12 },
      { name: "Data Interpretation", totalQuizzes: 20, completed: 8 },
    ],
    data: {
      topics: APTITUDE_TOPICS,
      questions: filteredQuestions,
      companyPacks: COMPANY_PACKS,
      formulas: FORMULA_CARDS,
      smartRecommendations: SMART_RECOMMENDATIONS
    }
  });
}
