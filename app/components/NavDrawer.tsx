'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronRight, 
  Compass, 
  BookOpen, 
  Building2, 
  Timer, 
  CheckSquare, 
  Zap, 
  BarChart3, 
  Flame, 
  Map,
  FileText,
  Mic,
  LayoutDashboard,
  Target
} from 'lucide-react';
import { ScreenType } from './Navbar';

interface NavDrawerProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  readinessScore?: number;
  streakDays?: number;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  currentScreen,
  onSelectScreen,
  isOpen,
  onToggleOpen,
  readinessScore = 78,
  streakDays = 5
}) => {
  const [isAptitudeExpanded, setIsAptitudeExpanded] = useState<boolean>(true);

  const aptitudeScreens: { id: ScreenType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Aptitude Dashboard', icon: Compass, badge: 'AI Recs' },
    { id: 'practice', label: 'Topic-Wise Practice', icon: BookOpen, badge: '8 Topics' },
    { id: 'company', label: 'Company Test Series', icon: Building2, badge: 'TCS/Infosys' },
    { id: 'exam', label: 'Mock Exam Simulator', icon: Timer, badge: 'Timed' },
    { id: 'review', label: 'Question Review & Bookmarks', icon: CheckSquare },
    { id: 'formulas', label: 'Formula Cheatsheets', icon: Zap, badge: 'Shortcuts' },
    { id: 'analytics', label: 'Progress & Weakness Analytics', icon: BarChart3, badge: 'Weak Alerts' },
  ];

  const otherModules = [
    { id: 'roadmaps', label: 'Branch Roadmaps', icon: Map, status: 'Soon' },
    { id: 'resume', label: 'AI Resume & ATS Checker', icon: FileText, status: 'Soon' },
    { id: 'mock-interview', label: 'AI Mock Interview', icon: Mic, status: 'Soon' },
    { id: 'tpo', label: 'TPO Placement Analytics', icon: LayoutDashboard, status: 'Soon' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Drawer Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#131927] border-r border-[#262F40] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        
        {/* Drawer Header */}
        <div>
          <div className="p-4 border-b border-[#262F40] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl blue-gradient-bg flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-900/50">
                N
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">NextStep</span>
                <span className="block text-[10px] text-[#60A5FA] font-bold uppercase tracking-wider">Placement Platform</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items Scroll Area */}
          <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
            
            {/* Aptitude Main Module Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setIsAptitudeExpanded(!isAptitudeExpanded)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1E293B] text-[#60A5FA] border border-[#2563EB]/40 font-bold text-xs hover:bg-[#1E3A8A]/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg blue-gradient-bg flex items-center justify-center text-white">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white font-extrabold text-xs">Aptitude Preparation</span>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  <span className="bg-[#2563EB]/30 text-[#60A5FA] text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-[#2563EB]/40">
                    7 Screens
                  </span>
                  {isAptitudeExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#60A5FA]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* All 7 Aptitude Sub-Screens List */}
              {isAptitudeExpanded && (
                <div className="pl-3 pt-1 space-y-1 border-l-2 border-[#2563EB]/40 ml-4 animate-in slide-in-from-top-2 duration-200">
                  {aptitudeScreens.map((screen) => {
                    const Icon = screen.icon;
                    const isActive = currentScreen === screen.id;
                    return (
                      <button
                        key={screen.id}
                        onClick={() => {
                          onSelectScreen(screen.id);
                          if (window.innerWidth < 1024) onToggleOpen();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#2563EB] text-white shadow-md shadow-blue-900/40 font-bold'
                            : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#60A5FA]'}`} />
                          <span className="truncate">{screen.label}</span>
                        </div>

                        {screen.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-[#1E293B] text-slate-400 border border-[#262F40]'
                          }`}>
                            {screen.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other Platform Modules Section */}
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 px-2 tracking-wider">Other Modules</span>
              
              {otherModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-500 text-xs font-medium bg-[#1E293B]/40 border border-[#262F40]/50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{mod.label}</span>
                    </div>
                    <span className="text-[9px] bg-[#262F40] text-slate-400 font-bold px-1.5 py-0.5 rounded">
                      {mod.status}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Drawer Footer User & Streak Card */}
        <div className="p-4 border-t border-[#262F40] bg-[#0B0F17]/50 space-y-3">
          <div className="flex items-center justify-between bg-[#1E293B] p-2.5 rounded-xl border border-[#262F40]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/30 text-[#60A5FA] font-bold text-xs flex items-center justify-center border border-[#2563EB]/40">
                SP
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-white block leading-none">Shubham P.</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Ready: {readinessScore}%</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-orange-400 bg-orange-950/40 px-2 py-1 rounded-lg text-xs font-bold border border-orange-800/40">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{streakDays}d</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
