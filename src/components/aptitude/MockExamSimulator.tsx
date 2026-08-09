'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Bookmark, 
  ArrowRight, 
  AlertTriangle,
  Send
} from 'lucide-react';
import { SAMPLE_QUESTIONS, CompanyTestPack, AptitudeQuestion } from "@/data/aptitudeData";
import type { ExamResults } from "@/types";

interface MockExamSimulatorProps {
  testPack?: CompanyTestPack | null;
  onFinishExam: (resultsPayload: ExamResults) => void;
  onCancelExam: () => void;
}

export const MockExamSimulator: React.FC<MockExamSimulatorProps> = ({
  testPack,
  onFinishExam,
  onCancelExam
}) => {
  const durationSeconds = (testPack?.durationMinutes || 20) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [questions] = useState<AptitudeQuestion[]>(SAMPLE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  /**
   * Always points at the current render's `executeSubmission`, so the timer
   * below can call it without listing it as a dependency.
   *
   * This also fixes a real bug: the countdown used to call `handleAutoSubmit()`
   * from inside a `setSecondsRemaining` updater with `[]` deps, so it captured
   * the first render's closure. Running out of time submitted an empty answer
   * sheet no matter what the student had filled in.
   */
  const executeSubmissionRef = useRef<() => void>(undefined);
  const hasAutoSubmitted = useRef(false);

  // Countdown only — the updater stays pure.
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Submit exactly once when the clock hits zero.
  useEffect(() => {
    if (secondsRemaining === 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      executeSubmissionRef.current?.();
    }
  }, [secondsRemaining]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleToggleMarkReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const executeSubmission = async () => {
    const submissions = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
      timeSpentSeconds: 45
    }));

    try {
      const res = await fetch('/api/aptitude/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPackId: testPack?.id || 'mock-exam-1',
          submissions
        })
      });
      const data = await res.json();
      if (data.success) {
        onFinishExam(data.data);
      } else {
        onFinishExam({
          testPackId: testPack?.id || 'mock-exam-1',
          totalScore: 16,
          maxScore: 24,
          correctCount: 4,
          incorrectCount: 1,
          skippedCount: 1,
          accuracyPercentage: 80,
          totalTimeSeconds: durationSeconds - secondsRemaining,
          averageTimePerQuestion: 45,
          detailedResults: questions.map(q => ({
            questionId: q.id,
            questionText: q.question,
            options: q.options,
            userOption: answers[q.id] !== undefined ? answers[q.id] : -1,
            correctOption: q.correctOption,
            isCorrect: answers[q.id] === q.correctOption,
            isSkipped: answers[q.id] === undefined || answers[q.id] === -1,
            explanation: q.explanation,
            shortcutTip: q.shortcutTip,
            topic: q.topic,
            category: q.category
          }))
        });
      }
    } catch {
      onCancelExam();
    }
  };

  // Refresh the ref after every render so the timer above always calls the
  // current closure, with the answers the student has actually entered.
  useEffect(() => {
    executeSubmissionRef.current = executeSubmission;
  });

  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unattemptedCount = questions.length - answeredCount;

  return (
    <div className="fixed inset-0 bg-[#0B0F17] z-50 flex flex-col overflow-hidden text-white">
      
      {/* Top Header */}
      <header className="bg-[#131927] border-b border-[#262F40] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg purple-gradient-bg flex items-center justify-center font-bold text-sm">
            N
          </div>
          <div>
            <h2 className="text-base font-bold">{testPack?.testTitle || 'Full Aptitude Mock Assessment'}</h2>
            <p className="text-xs text-[#A29BFE]">Strict Examination Mode</p>
          </div>
        </div>

        {/* Live Timer */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-extrabold font-mono ${
          secondsRemaining < 300 ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#1C2333] text-[#A29BFE] border border-[#262F40]'
        }`}>
          <Timer className="w-4 h-4" />
          <span>{formatTime(secondsRemaining)}</span>
        </div>

        {/* Exit & Submit controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="purple-gradient-bg hover:opacity-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-purple-900/50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        
        {/* Left Question Box */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between bg-[#131927] p-6 rounded-2xl border border-[#262F40] shadow-md">
          
          <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#262F40]">
              <span className="text-xs font-bold text-[#A29BFE] bg-[#6C5CE7]/20 px-3 py-1 rounded-md border border-[#6C5CE7]/30">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <button
                onClick={handleToggleMarkReview}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  markedForReview[currentQuestion.id]
                    ? 'bg-amber-950/60 border-amber-800/40 text-amber-300'
                    : 'bg-[#1C2333] border-[#262F40] text-slate-300 hover:bg-[#262F40]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1C1936] border-[#6C5CE7] text-[#A29BFE] font-bold shadow-lg shadow-purple-950/50'
                        : 'bg-[#1C2333] border-[#262F40] hover:border-[#6C5CE7]/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border ${
                        isSelected ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]' : 'bg-[#131927] text-slate-400 border-[#262F40]'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm">{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#262F40]">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#262F40] text-slate-300 hover:bg-[#1C2333] disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === questions.length - 1}
              className="bg-[#6C5CE7] hover:bg-[#8257E5] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-purple-900/40 flex items-center space-x-1"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Palette & Status Grid */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#131927] p-5 rounded-2xl border border-[#262F40] shadow-md space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Question Palette Overview</h4>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                <span className="font-extrabold text-sm block">{answeredCount}</span>
                <span className="text-[10px]">Answered</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/40">
                <span className="font-extrabold text-sm block">{reviewCount}</span>
                <span className="text-[10px]">Marked</span>
              </div>
              <div className="p-2 rounded-lg bg-[#1C2333] text-slate-400 border border-[#262F40]">
                <span className="font-extrabold text-sm block">{unattemptedCount}</span>
                <span className="text-[10px]">Unattempted</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = markedForReview[q.id];
                const isCurrent = idx === currentIndex;

                let btnStyle = "bg-[#1C2333] text-slate-400 border-[#262F40]";
                if (isAnswered) btnStyle = "bg-emerald-600 text-white font-bold border-emerald-500";
                if (isMarked) btnStyle = "bg-amber-600 text-white font-bold border-amber-500";
                if (isCurrent) btnStyle += " ring-2 ring-[#6C5CE7] ring-offset-2 ring-offset-[#131927]";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all border ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131927] border border-[#262F40] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-[#A29BFE]">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Confirm Test Submission</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to finish and submit your exam? You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
            </p>

            <div className="bg-[#1C2333] p-3 rounded-xl border border-[#262F40] text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Answered Questions:</span>
                <strong className="text-emerald-400">{answeredCount}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Unattempted Questions:</span>
                <strong className="text-rose-400">{unattemptedCount}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Marked for Review:</span>
                <strong className="text-amber-400">{reviewCount}</strong>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#262F40] text-slate-300 font-semibold text-xs hover:bg-[#1C2333]"
              >
                Continue Test
              </button>
              <button
                onClick={executeSubmission}
                className="flex-1 py-2.5 rounded-xl purple-gradient-bg text-white font-bold text-xs shadow-md shadow-purple-900/50"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
