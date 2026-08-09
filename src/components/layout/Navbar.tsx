'use client';

import React from 'react';
import { 
  Menu,
  Flame, 
  Award,
  ChevronRight
} from 'lucide-react';

export type ScreenType = 
  | 'dashboard'
  | 'practice'
  | 'company'
  | 'exam'
  | 'review'
  | 'formulas'
  | 'analytics';

interface NavbarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  onToggleDrawer: () => void;
  readinessScore?: number;
  streakDays?: number;
}

const SCREEN_TITLES: Record<ScreenType, string> = {
  dashboard: 'Aptitude Dashboard',
  practice: 'Topic-Wise Practice',
  company: 'Company Test Series',
  exam: 'Mock Exam Simulator',
  review: 'Question Review & Bookmarks',
  formulas: 'Formula Cheatsheets',
  analytics: 'Progress & Weakness Analytics'
};

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onToggleDrawer,
  readinessScore = 78,
  streakDays = 5
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#262F40] shadow-md lg:pl-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Drawer Toggle Button & Active Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleDrawer}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1E293B] border border-[#262F40] transition-colors"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-white tracking-tight">NextStep</span>
              <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline-block" />
              <span className="bg-[#2563EB]/20 text-[#60A5FA] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2563EB]/40">
                {SCREEN_TITLES[currentScreen]}
              </span>
            </div>
          </div>

          {/* Streak & Readiness Widgets */}
          <div className="flex items-center space-x-3">
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 bg-orange-950/40 text-orange-400 border border-orange-800/40 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streakDays}d Streak</span>
            </div>

            {/* Readiness Index */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#2563EB]/20 text-[#60A5FA] border border-[#2563EB]/40 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Award className="w-4 h-4 text-[#60A5FA]" />
              <span>Readiness: <strong className="text-white font-bold">{readinessScore}%</strong></span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
