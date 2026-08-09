'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Flame, Award, ChevronRight } from 'lucide-react';

/**
 * Longest-prefix match wins, so /aptitude/practice beats /aptitude.
 * Keep this sorted most-specific first.
 */
const ROUTE_TITLES: ReadonlyArray<readonly [string, string]> = [
  ['/aptitude/practice', 'Topic-Wise Practice'],
  ['/aptitude/companies', 'Company Test Series'],
  ['/aptitude/exam', 'Mock Exam Simulator'],
  ['/aptitude/review', 'Question Review & Bookmarks'],
  ['/aptitude/formulas', 'Formula Cheatsheets'],
  ['/aptitude/analytics', 'Progress & Weakness Analytics'],
  ['/aptitude', 'Aptitude Dashboard'],
  ['/dsa', 'DSA Hub'],
  ['/dashboard', 'Dashboard'],
];

function titleForPath(pathname: string): string {
  return ROUTE_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'NextStep';
}

interface NavbarProps {
  onToggleDrawer: () => void;
  readinessScore?: number;
  streakDays?: number;
  /** Server-rendered sign-out form, passed down from the layout. */
  accountSlot?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleDrawer,
  readinessScore = 78,
  streakDays = 5,
  accountSlot,
}) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#262F40] shadow-md lg:pl-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Drawer Toggle Button & Active Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleDrawer}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1E293B] border border-[#262F40] transition-colors"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-white tracking-tight">NextStep</span>
              <ChevronRight className="w-4 h-4 text-slate-600 hidden sm:inline-block" />
              <span className="bg-[#2563EB]/20 text-[#60A5FA] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2563EB]/40">
                {titleForPath(pathname)}
              </span>
            </div>
          </div>

          {/* Streak & Readiness Widgets */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-orange-950/40 text-orange-400 border border-orange-800/40 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streakDays}d Streak</span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 bg-[#2563EB]/20 text-[#60A5FA] border border-[#2563EB]/40 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Award className="w-4 h-4 text-[#60A5FA]" />
              <span>Readiness: <strong className="text-white font-bold">{readinessScore}%</strong></span>
            </div>

            {accountSlot}
          </div>

        </div>
      </div>
    </header>
  );
};
