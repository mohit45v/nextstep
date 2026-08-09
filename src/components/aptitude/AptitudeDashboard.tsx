'use client';

import React from 'react';
import { 
  Sparkles, 
  Target, 
  Flame, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  Zap,
  BookOpen
} from 'lucide-react';
import { ScreenType } from '@/lib/routes';
import { SMART_RECOMMENDATIONS, APTITUDE_TOPICS, COMPANY_PACKS } from '@/data/aptitudeData';

interface DashboardProps {
  onNavigate: (screen: ScreenType) => void;
  onStartQuiz: (topicId?: string) => void;
}

export const AptitudeDashboard: React.FC<DashboardProps> = ({ onNavigate, onStartQuiz }) => {
  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl purple-gradient-bg p-8 text-white shadow-2xl shadow-purple-900/30">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-purple-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#A29BFE]" />
              <span>NextStep AI Aptitude Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready for Campus Placements?
            </h1>
            <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
              Track topic mastery, practice company-specific aptitude sets, get AI smart recommendations, and boost your overall placement readiness score.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('exam')}
                className="bg-white text-[#6C5CE7] hover:bg-purple-50 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all text-sm flex items-center space-x-2"
              >
                <span>Take Full Mock Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('formulas')}
                className="bg-black/30 hover:bg-black/50 text-white font-medium px-4 py-2.5 rounded-xl border border-white/20 transition-all text-sm flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Formula Cheatsheet</span>
              </button>
            </div>
          </div>

          {/* Readiness Gauge Widget */}
          <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[220px] self-stretch flex flex-col justify-center items-center">
            <div className="relative w-24 h-24 flex items-center justify-center my-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-white"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold">78%</span>
                <span className="text-[10px] text-purple-200 uppercase font-semibold">Readiness</span>
              </div>
            </div>
            <span className="text-xs text-purple-200 font-medium">Placement Ready: Level 3</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="soft-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Accuracy Rate</span>
            <Target className="w-4 h-4 text-[#A29BFE]" />
          </div>
          <p className="text-2xl font-extrabold text-white">68.5%</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
            <span>+4.2% this week</span>
          </p>
        </div>

        <div className="soft-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">123 / 225</p>
          <p className="text-xs text-slate-400">54% topics covered</p>
        </div>

        <div className="soft-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">5 Days</p>
          <p className="text-xs text-orange-400 font-semibold">Keep it going tomorrow!</p>
        </div>

        <div className="soft-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Speed</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">1m 18s</p>
          <p className="text-xs text-slate-400">Target: &lt; 1m 30s</p>
        </div>
      </div>

      {/* AI Smart Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/20 flex items-center justify-center text-[#A29BFE]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Smart Recommendations</h2>
              <p className="text-xs text-slate-400">Personalized focus areas to maximize your aptitude percentile</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-semibold text-[#A29BFE] hover:underline"
          >
            View Weakness Analysis →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SMART_RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="soft-card soft-card-hover p-5 space-y-3 flex flex-col justify-between border-l-4 border-l-[#6C5CE7]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A29BFE] bg-[#6C5CE7]/20 px-2 py-0.5 rounded border border-[#6C5CE7]/30">
                    {rec.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                    +{rec.impactScore}% Score
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
              </div>

              <button
                onClick={() => onStartQuiz(rec.topic.toLowerCase().replace(/ /g, '-'))}
                className="w-full bg-[#1C2333] hover:bg-[#6C5CE7] text-[#A29BFE] hover:text-white border border-[#262F40] hover:border-[#6C5CE7] font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Start Recommended Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Topics & Company Test Quick Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Practice Quick Access */}
        <div className="soft-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#A29BFE]" />
              <h3 className="font-bold text-white text-base">Key Aptitude Topics</h3>
            </div>
            <button
              onClick={() => onNavigate('practice')}
              className="text-xs font-semibold text-[#A29BFE] hover:underline"
            >
              All Topics →
            </button>
          </div>

          <div className="space-y-3">
            {APTITUDE_TOPICS.slice(0, 4).map((topic) => (
              <div key={topic.id} className="p-3 rounded-xl bg-[#1C2333] border border-[#262F40] flex items-center justify-between hover:border-[#6C5CE7]/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{topic.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{topic.category}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Accuracy: <strong className={topic.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{topic.accuracy}%</strong></span>
                    <span>•</span>
                    <span>{topic.completedQuestions}/{topic.totalQuestions} Solved</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartQuiz(topic.id)}
                  className="bg-[#131927] border border-[#3B336B] text-[#A29BFE] hover:bg-[#6C5CE7] hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Company Mock Test Series */}
        <div className="soft-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#A29BFE]" />
              <h3 className="font-bold text-white text-base">Company Placement Packs</h3>
            </div>
            <button
              onClick={() => onNavigate('company')}
              className="text-xs font-semibold text-[#A29BFE] hover:underline"
            >
              All Company Packs →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMPANY_PACKS.map((pack) => (
              <div key={pack.id} className="p-4 rounded-xl border border-[#262F40] bg-[#1C2333] space-y-3 soft-card-hover flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#A29BFE] bg-[#6C5CE7]/20 px-2 py-0.5 rounded border border-[#6C5CE7]/30">
                    {pack.companyName}
                  </span>
                  <h4 className="font-bold text-xs text-white mt-1 line-clamp-1">{pack.testTitle}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{pack.totalQuestions} Qs • {pack.durationMinutes} mins</p>
                </div>

                <button
                  onClick={() => onNavigate('exam')}
                  className="w-full bg-[#6C5CE7] hover:bg-[#8257E5] text-white font-semibold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1 shadow-md shadow-purple-900/40"
                >
                  <span>Launch Exam</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
