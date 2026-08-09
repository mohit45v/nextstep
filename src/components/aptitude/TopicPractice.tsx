'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  HelpCircle,
  Zap
} from 'lucide-react';
import { APTITUDE_TOPICS, SAMPLE_QUESTIONS, AptitudeQuestion } from '@/data/aptitudeData';

interface TopicPracticeProps {
  initialTopicId?: string;
  onBookmarkToggle?: (questionId: string) => void;
  bookmarkedIds?: string[];
}

export const TopicPractice: React.FC<TopicPracticeProps> = ({
  initialTopicId,
  onBookmarkToggle,
  bookmarkedIds = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTopic, setActiveTopic] = useState<string | null>(initialTopicId || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<string[]>(bookmarkedIds);

  const questionsForPractice = activeTopic
    ? SAMPLE_QUESTIONS.filter(q => q.topic.toLowerCase().replace(/ /g, '-') === activeTopic || q.topic === activeTopic)
    : SAMPLE_QUESTIONS;

  const currentQ: AptitudeQuestion | undefined = questionsForPractice[currentQuestionIndex] || SAMPLE_QUESTIONS[0];

  const toggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(b => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
    if (onBookmarkToggle) onBookmarkToggle(id);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsForPractice.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    }
  };

  const filteredTopics = selectedCategory === 'All'
    ? APTITUDE_TOPICS
    : APTITUDE_TOPICS.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Topic-Wise Practice Hub</h1>
          <p className="text-xs text-slate-400">Master aptitude concepts with instant explanations and shortcut formulas</p>
        </div>

        <div className="flex items-center space-x-1 bg-[#131927] p-1 rounded-xl border border-[#262F40]">
          {['All', 'Quantitative', 'Logical Reasoning', 'Verbal Ability'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveTopic(null);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6C5CE7] text-white shadow-md shadow-purple-900/40'
                  : 'text-slate-400 hover:bg-[#1C2333] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Practice Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Topic Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase text-slate-400">Topics ({filteredTopics.length})</span>
            {activeTopic && (
              <button
                onClick={() => {
                  setActiveTopic(null);
                  setCurrentQuestionIndex(0);
                  setSelectedOption(null);
                  setIsAnswerSubmitted(false);
                }}
                className="text-xs text-[#A29BFE] font-semibold hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTopics.map((topic) => {
              const isSelected = activeTopic === topic.id || activeTopic === topic.name;
              return (
                <div
                  key={topic.id}
                  onClick={() => {
                    setActiveTopic(topic.id);
                    setCurrentQuestionIndex(0);
                    setSelectedOption(null);
                    setIsAnswerSubmitted(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1C1936] border-[#6C5CE7] shadow-lg shadow-purple-950/50'
                      : 'bg-[#131927] border-[#262F40] hover:border-[#6C5CE7]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{topic.name}</span>
                    <span className="text-[10px] font-bold text-[#A29BFE] bg-[#6C5CE7]/20 px-2 py-0.5 rounded border border-[#6C5CE7]/30">
                      {topic.accuracy}% Accuracy
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{topic.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Progress</span>
                      <span>{topic.completedQuestions}/{topic.totalQuestions} Solved</span>
                    </div>
                    <div className="w-full bg-[#1C2333] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#6C5CE7] h-full rounded-full"
                        style={{ width: `${(topic.completedQuestions / topic.totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Practice Question Card */}
        <div className="lg:col-span-8 space-y-4">
          {currentQ ? (
            <div className="soft-card p-6 space-y-6">
              
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#262F40]">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase text-[#A29BFE] bg-[#6C5CE7]/20 px-2.5 py-1 rounded-md border border-[#6C5CE7]/30">
                      {currentQ.category} • {currentQ.topic}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      currentQ.difficulty === 'Easy' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                      currentQ.difficulty === 'Medium' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                    }`}>
                      {currentQ.difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-400">
                    Question {currentQuestionIndex + 1} of {questionsForPractice.length}
                  </span>
                  <button
                    onClick={() => toggleBookmark(currentQ.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-[#A29BFE] hover:bg-[#1C2333] transition-colors"
                    title="Bookmark Question"
                  >
                    {bookmarks.includes(currentQ.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-[#6C5CE7] fill-[#6C5CE7]" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                {/* Company Tag badges */}
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="font-semibold">Frequently Asked In:</span>
                  {currentQ.companyTags.map(tag => (
                    <span key={tag} className="bg-[#1C2333] border border-[#262F40] text-slate-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Options Grid */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctOption;

                  let optionStyle = "bg-[#1C2333] border-[#262F40] hover:border-[#6C5CE7]/60 text-slate-200";

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                    } else if (isSelected && !isCorrect) {
                      optionStyle = "bg-rose-950/60 border-rose-500 text-rose-200 font-bold";
                    } else {
                      optionStyle = "bg-[#131927] border-[#262F40] text-slate-500 opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-[#1C1936] border-[#6C5CE7] text-[#A29BFE] font-bold shadow-md shadow-purple-950/50";
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border ${
                          isSelected ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]' : 'bg-[#131927] text-slate-400 border-[#262F40]'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm font-medium">{option}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#262F40] text-slate-300 hover:bg-[#1C2333] disabled:opacity-40"
                >
                  ← Previous
                </button>

                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="bg-[#6C5CE7] hover:bg-[#8257E5] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/40 disabled:opacity-40 transition-all"
                  >
                    Check Solution
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questionsForPractice.length - 1}
                    className="bg-[#6C5CE7] hover:bg-[#8257E5] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/40 flex items-center space-x-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Step-by-Step Explanation Box */}
              {isAnswerSubmitted && (
                <div className="p-5 rounded-2xl bg-[#1C2333] border border-[#262F40] space-y-4 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-[#A29BFE]">
                    <Lightbulb className="w-5 h-5 text-[#A29BFE]" />
                    <h4 className="font-bold text-sm text-white">Step-by-Step Mathematical Explanation</h4>
                  </div>

                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-[#131927] p-4 rounded-xl border border-[#262F40]">
                    {currentQ.explanation}
                  </p>

                  {currentQ.shortcutTip && (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-300 text-xs flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Shortcut Trick: </strong>
                        <span>{currentQ.shortcutTip}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="soft-card p-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-white">No questions available for this topic yet.</p>
              <p className="text-xs">Select another category or clear filters.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
