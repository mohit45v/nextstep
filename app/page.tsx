'use client';

import React, { useState } from 'react';
import DashboardMain from "./components/DashboardMain/DashboardMain";
import { Navbar, ScreenType } from './components/Navbar';
import { NavDrawer } from './components/NavDrawer';
import { AptitudeDashboard } from './components/AptitudeDashboard';
import { TopicPractice } from './components/TopicPractice';
import { CompanyTests } from './components/CompanyTests';
import { MockExamSimulator } from './components/MockExamSimulator';
import { QuestionReview } from './components/QuestionReview';
import { FormulaCheatsheet } from './components/FormulaCheatsheet';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { CompanyTestPack } from './data/aptitudeData';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(undefined);
  const [selectedExamPack, setSelectedExamPack] = useState<CompanyTestPack | null>(null);
  const [lastExamResults, setLastExamResults] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTopicPractice = (topicId?: string) => {
    setSelectedTopicId(topicId);
    setCurrentScreen('practice');
  };

  const handleStartExamPack = (pack: CompanyTestPack) => {
    setSelectedExamPack(pack);
    setCurrentScreen('exam');
  };

  const handleFinishExam = (resultsPayload: any) => {
    setLastExamResults(resultsPayload);
    setSelectedExamPack(null);
    setCurrentScreen('review');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col font-sans">
      
      {/* Left Navigation Drawer */}
      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Top Header Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={handleNavigate}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        readinessScore={78}
        streakDays={14}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {currentScreen === 'dashboard' && (
          <DashboardMain />
        )}

        {currentScreen === 'practice' && (
          <TopicPractice
            initialTopicId={selectedTopicId}
          />
        )}

        {currentScreen === 'company' && (
          <CompanyTests
            onStartExam={handleStartExamPack}
          />
        )}

        {currentScreen === 'exam' && (
          <MockExamSimulator
            testPack={selectedExamPack}
            onFinishExam={handleFinishExam}
            onCancelExam={() => setCurrentScreen('company')}
          />
        )}

        {currentScreen === 'review' && (
          <QuestionReview
            lastExamResults={lastExamResults}
            onRetakeExam={() => setCurrentScreen('exam')}
            onNavigateToTopics={() => setCurrentScreen('practice')}
          />
        )}

        {currentScreen === 'formulas' && (
          <FormulaCheatsheet />
        )}

        {currentScreen === 'analytics' && (
          <ProgressAnalytics
            onNavigateToPractice={handleStartTopicPractice}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#131927] border-t border-[#262F40] py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">NextStep Engine</span>
            <span>•</span>
            <span>AI Placement & Career Development Platform</span>
          </div>
          <p>© 2026 NextStep. Dark Mode Royal Blue Palette.</p>
        </div>
      </footer>

    </div>
  );
}
