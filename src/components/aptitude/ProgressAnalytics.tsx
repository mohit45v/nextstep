'use client';

import React from 'react';
import { 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Award
} from 'lucide-react';
import { APTITUDE_TOPICS } from '@/data/aptitudeData';

interface ProgressAnalyticsProps {
  onNavigateToPractice: (topicId: string) => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ onNavigateToPractice }) => {
  const weakTopics = APTITUDE_TOPICS.filter(t => t.accuracy < 60);
  const strongTopics = APTITUDE_TOPICS.filter(t => t.accuracy >= 80);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 bg-[#6C5CE7]/20 text-[#A29BFE] border border-[#6C5CE7]/30 px-3 py-1 rounded-full text-xs font-bold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Aptitude Mastery Insights</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Progress & Weakness Analytics</h1>
        <p className="text-xs text-slate-400">In-depth accuracy tracking, topic mastery badges, and risk alerts to reach 90+ percentile</p>
      </div>

      {/* Category Accuracy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quant */}
        <div className="soft-card p-6 space-y-4 border-t-4 border-t-[#6C5CE7]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-[#A29BFE] bg-[#6C5CE7]/20 px-2.5 py-1 rounded border border-[#6C5CE7]/30">Quantitative</span>
            <span className="text-sm font-extrabold text-white">62% Avg Accuracy</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-[#1C2333] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#6C5CE7] h-full rounded-full" style={{ width: '62%' }} />
            </div>
            <p className="text-xs text-slate-400">47 of 83 questions completed</p>
          </div>
        </div>

        {/* Logical */}
        <div className="soft-card p-6 space-y-4 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/40">Logical Reasoning</span>
            <span className="text-sm font-extrabold text-white">76% Avg Accuracy</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-[#1C2333] h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '76%' }} />
            </div>
            <p className="text-xs text-slate-400">46 of 63 questions completed</p>
          </div>
        </div>

        {/* Verbal */}
        <div className="soft-card p-6 space-y-4 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">Verbal Ability</span>
            <span className="text-sm font-extrabold text-white">68% Avg Accuracy</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-[#1C2333] h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-xs text-slate-400">30 of 50 questions completed</p>
          </div>
        </div>

      </div>

      {/* Weakness Risk Alerts vs Strong Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Risk Alerts */}
        <div className="soft-card p-6 space-y-4 border-l-4 border-l-rose-500">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Weakness Risk Alerts</h3>
          </div>

          <div className="space-y-3">
            {weakTopics.map((topic) => (
              <div key={topic.id} className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-rose-200">{topic.name}</span>
                  <p className="text-[11px] text-rose-300">Accuracy is low ({topic.accuracy}%). Practice required for IT placements.</p>
                </div>

                <button
                  onClick={() => onNavigateToPractice(topic.id)}
                  className="bg-[#131927] border border-rose-800/60 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
                >
                  Improve Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Strong Topics & Badges */}
        <div className="soft-card p-6 space-y-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Award className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Mastered Topics & Badges</h3>
          </div>

          <div className="space-y-3">
            {strongTopics.map((topic) => (
              <div key={topic.id} className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-emerald-200">{topic.name}</span>
                    <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Master Badge
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300">High Accuracy ({topic.accuracy}%). Ready for company cutoffs.</p>
                </div>

                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
