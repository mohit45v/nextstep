'use client';

import React from 'react';
import { 
  Building2, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { COMPANY_PACKS, CompanyTestPack } from '@/app/data/aptitudeData';

interface CompanyTestsProps {
  onStartExam: (testPack: CompanyTestPack) => void;
}

export const CompanyTests: React.FC<CompanyTestsProps> = ({ onStartExam }) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-2 bg-[#6C5CE7]/20 text-[#A29BFE] px-3 py-1 rounded-full text-xs font-bold border border-[#6C5CE7]/30">
          <Building2 className="w-3.5 h-3.5" />
          <span>Company-Wise Aptitude Test Series</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Target Company Placement Tests</h1>
        <p className="text-xs text-slate-400">Practice full-length papers modeled on previous hiring patterns of top IT & engineering recruiters</p>
      </div>

      {/* Test Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COMPANY_PACKS.map((pack) => (
          <div 
            key={pack.id} 
            className="soft-card p-6 space-y-6 flex flex-col justify-between soft-card-hover border-t-4"
            style={{ borderTopColor: pack.logoColor || '#6C5CE7' }}
          >
            <div className="space-y-4">
              
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wide text-white bg-[#1C2333] px-3 py-1 rounded-lg border border-[#262F40]">
                  {pack.companyName}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  pack.difficulty === 'Moderate' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                  pack.difficulty === 'Challenging' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
                  'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                }`}>
                  {pack.difficulty} Difficulty
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg font-bold text-white">{pack.testTitle}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pack.description}</p>
              </div>

              {/* Key Specs Row */}
              <div className="grid grid-cols-3 gap-2 bg-[#1C2333] p-3 rounded-xl border border-[#262F40] text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Questions</span>
                  <span className="font-extrabold text-sm text-white">{pack.totalQuestions} Qs</span>
                </div>
                <div className="border-x border-[#262F40]">
                  <span className="text-[10px] text-slate-500 font-semibold block">Duration</span>
                  <span className="font-extrabold text-sm text-white">{pack.durationMinutes} mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Cutoff Target</span>
                  <span className="font-extrabold text-sm text-emerald-400">{pack.cutoffPercentage}%</span>
                </div>
              </div>

              {/* Sections Included */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pattern Breakdown</span>
                <div className="space-y-1.5">
                  {pack.sections.map((sec, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#131927] border border-[#262F40]">
                      <span className="font-medium text-slate-300">{sec.name}</span>
                      <span className="font-bold text-[#A29BFE]">{sec.questionCount} Questions</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              <button
                onClick={() => onStartExam(pack)}
                className="w-full purple-gradient-bg hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center space-x-2 transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Start Timed Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
