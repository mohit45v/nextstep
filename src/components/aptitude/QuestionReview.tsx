'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Bookmark, 
  BookmarkCheck, 
  Lightbulb, 
  Zap, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_QUESTIONS } from "@/data/aptitudeData";
import type { ExamResults } from "@/types";

type FilterMode = 'all' | 'correct' | 'incorrect' | 'bookmarked';

interface QuestionReviewProps {
  lastExamResults?: ExamResults | null;
  onRetakeExam?: () => void;
  onNavigateToTopics?: () => void;
}

export const QuestionReview: React.FC<QuestionReviewProps> = ({
  lastExamResults,
  onRetakeExam,
  onNavigateToTopics
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [bookmarks, setBookmarks] = useState<string[]>(['q1', 'q4']);

  const results = lastExamResults || {
    totalScore: 16,
    maxScore: 24,
    correctCount: 4,
    incorrectCount: 1,
    skippedCount: 1,
    accuracyPercentage: 80,
    totalTimeSeconds: 420,
    averageTimePerQuestion: 70,
    detailedResults: SAMPLE_QUESTIONS.map((q, idx) => ({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      userOption: idx === 4 ? -1 : idx === 1 ? 2 : q.correctOption,
      correctOption: q.correctOption,
      isCorrect: idx !== 1 && idx !== 4,
      isSkipped: idx === 4,
      explanation: q.explanation,
      shortcutTip: q.shortcutTip,
      formulaUsed: q.formulaUsed,
      category: q.category,
      topic: q.topic
    }))
  };

  const toggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(b => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  const filteredItems = results.detailedResults.filter((item) => {
    if (filterMode === 'correct') return item.isCorrect;
    if (filterMode === 'incorrect') return !item.isCorrect && !item.isSkipped;
    if (filterMode === 'bookmarked') return bookmarks.includes(item.questionId);
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Score Summary */}
      <div className="soft-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#6C5CE7]/20 text-[#A29BFE] px-3 py-1 rounded-full text-xs font-bold mb-1 border border-[#6C5CE7]/30">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Assessment Detailed Review</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Test Performance & Solutions</h1>
            <p className="text-xs text-slate-400">Analyze option choices, examine step-by-step logic, and revise bookmarked questions</p>
          </div>

          <div className="flex items-center space-x-3">
            {onRetakeExam && (
              <button
                onClick={onRetakeExam}
                className="bg-[#1C2333] border border-[#262F40] text-[#A29BFE] hover:bg-[#262F40] font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>
            )}
            {onNavigateToTopics && (
              <button
                onClick={onNavigateToTopics}
                className="purple-gradient-bg text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/40"
              >
                <span>Practice Weak Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Score Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1C2333] p-4 rounded-xl border border-[#262F40] text-center space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Score</span>
            <p className="text-2xl font-extrabold text-white">{results.totalScore} / {results.maxScore}</p>
            <span className="text-[11px] text-[#A29BFE] font-bold">Standard Cutoff Met</span>
          </div>

          <div className="bg-[#1C2333] p-4 rounded-xl border border-[#262F40] text-center space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Accuracy</span>
            <p className="text-2xl font-extrabold text-emerald-400">{results.accuracyPercentage}%</p>
            <span className="text-[11px] text-slate-400 font-medium">Target: &gt; 75%</span>
          </div>

          <div className="bg-[#1C2333] p-4 rounded-xl border border-[#262F40] text-center space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Attempted / Skipped</span>
            <p className="text-2xl font-extrabold text-white">{results.correctCount + results.incorrectCount} / {results.skippedCount}</p>
            <span className="text-[11px] text-emerald-400 font-bold">{results.correctCount} Correct</span>
          </div>

          <div className="bg-[#1C2333] p-4 rounded-xl border border-[#262F40] text-center space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">Avg Speed / Q</span>
            <p className="text-2xl font-extrabold text-amber-400">{results.averageTimePerQuestion || 70}s</p>
            <span className="text-[11px] text-slate-400 font-medium">Fast Pace</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-[#131927] p-1 rounded-xl border border-[#262F40]">
          {([
            { id: 'all', label: `All (${results.detailedResults.length})` },
            { id: 'correct', label: `Correct (${results.correctCount})` },
            { id: 'incorrect', label: `Incorrect (${results.incorrectCount})` },
            { id: 'bookmarked', label: `Bookmarked (${bookmarks.length})` }
          ] satisfies ReadonlyArray<{ id: FilterMode; label: string }>).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === tab.id
                  ? 'bg-[#6C5CE7] text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:bg-[#1C2333] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Breakdown List */}
      <div className="space-y-6">
        {filteredItems.map((item, idx) => {
          const isBookmarked = bookmarks.includes(item.questionId);

          return (
            <div key={item.questionId || idx} className="soft-card p-6 space-y-5">
              
              {/* Item Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#262F40]">
                <div className="flex items-center space-x-3">
                  <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                    item.isCorrect ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                    item.isSkipped ? 'bg-[#1C2333] text-slate-300 border border-[#262F40]' : 'bg-rose-950 text-rose-300 border border-rose-800/40'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#A29BFE] bg-[#6C5CE7]/20 px-2.5 py-0.5 rounded border border-[#6C5CE7]/30">
                    {item.category} • {item.topic}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    item.isCorrect ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                    item.isSkipped ? 'bg-[#1C2333] text-slate-400 border border-[#262F40]' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                  }`}>
                    {item.isCorrect ? 'Correct (+4)' : item.isSkipped ? 'Skipped (0)' : 'Incorrect (-1)'}
                  </span>

                  <button
                    onClick={() => toggleBookmark(item.questionId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#A29BFE] hover:bg-[#1C2333] transition-colors"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-5 h-5 text-[#6C5CE7] fill-[#6C5CE7]" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-white leading-relaxed">
                {item.questionText}
              </h3>

              {/* Option Choice Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.options.map((opt: string, optIdx: number) => {
                  const isUserChoice = item.userOption === optIdx;
                  const isCorrectChoice = item.correctOption === optIdx;

                  let style = "bg-[#1C2333] border-[#262F40] text-slate-300";
                  if (isCorrectChoice) {
                    style = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                  } else if (isUserChoice && !isCorrectChoice) {
                    style = "bg-rose-950/60 border-rose-500 text-rose-200 font-bold";
                  }

                  return (
                    <div key={optIdx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${style}`}>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                        <span>{opt}</span>
                      </div>
                      
                      {isCorrectChoice && <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">Correct</span>}
                      {isUserChoice && !isCorrectChoice && <span className="text-[10px] font-extrabold uppercase bg-rose-600 text-white px-2 py-0.5 rounded">Your Choice</span>}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Logic & Explanation Box */}
              <div className="bg-[#1C2333] p-4 rounded-xl border border-[#262F40] space-y-3">
                <div className="flex items-center space-x-2 text-[#A29BFE]">
                  <Lightbulb className="w-4 h-4 text-[#A29BFE]" />
                  <span className="font-bold text-xs text-white">Detailed Solution & Logical Explanation</span>
                </div>
                
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-[#131927] p-3 rounded-lg border border-[#262F40]">
                  {item.explanation}
                </p>

                {item.shortcutTip && (
                  <div className="flex items-start space-x-2 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-lg text-amber-300 text-xs">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Shortcut Trick: </strong>
                      <span>{item.shortcutTip}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
