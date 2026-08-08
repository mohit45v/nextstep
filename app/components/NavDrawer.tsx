'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Target,
  Bot,
  Users,
  Award,
  Globe
} from 'lucide-react';
import './NavDrawer.css';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch?: string;
  onSelectBranch?: (branch: string) => void;
  readinessScore?: number;
  streakDays?: number;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen,
  onClose,
  currentBranch = 'All Branches',
  onSelectBranch,
  readinessScore = 78,
  streakDays = 14
}) => {
  const router = useRouter();
  const [isAptitudeExpanded, setIsAptitudeExpanded] = useState<boolean>(true);
  const [isDsaExpanded, setIsDsaExpanded] = useState<boolean>(true);

  const handleBranchClick = (branch: string) => {
    onClose();
    if (onSelectBranch) {
      onSelectBranch(branch);
    } else {
      router.push(`/dsa?branch=${encodeURIComponent(branch)}`);
    }
  };

  const handleNavClick = (path: string) => {
    onClose();
    router.push(path);
  };

  const branches = [
    { name: 'All Branches', icon: '📚' },
    { name: 'CS & IT', icon: '💻' },
    { name: 'AIDS', icon: '🤖' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Mechanical', icon: '⚙️' },
    { name: 'Civil', icon: '🏗️' }
  ];

  return (
    <div className={`nav-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className="nav-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-title">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              N
            </div>
            NextStep <span>Placement Engine</span>
          </div>

          <button onClick={onClose} className="nav-drawer-close" aria-label="Close Drawer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items Scroll Area */}
        <div className="nav-drawer-content space-y-4">
          
          {/* Main Overview */}
          <div>
            <div className="nav-drawer-section-title">Overview</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item active" onClick={() => handleNavClick('/')}>
                <LayoutDashboard className="w-4 h-4 text-[#60A5FA]" />
                <span>Dashboard Home</span>
              </button>
            </div>
          </div>

          {/* 1. AI Career Acceleration Suite */}
          <div>
            <div className="nav-drawer-section-title">1. AI Career Suite</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Bot className="w-4 h-4 text-[#60A5FA]" />
                <span>AI Mentor & Analytics</span>
                <span className="nav-drawer-badge">Credits</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <FileText className="w-4 h-4 text-[#60A5FA]" />
                <span>AI Resume & ATS Checker</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Target className="w-4 h-4 text-[#60A5FA]" />
                <span>JD Skill Gap Analyzer</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Map className="w-4 h-4 text-[#60A5FA]" />
                <span>Roadmap Generator</span>
              </button>
            </div>
          </div>

          {/* 2. DSA Engineering Hub */}
          <div>
            <div className="nav-drawer-section-title">2. DSA Engineering Hub</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Zap className="w-4 h-4 text-[#60A5FA]" />
                <span>DSA Engineering Hub</span>
                <span className="nav-drawer-badge">Live API</span>
              </button>
            </div>

            {/* Branch Sub-menu */}
            <div className="pl-3 pt-1 space-y-1">
              {branches.map((b) => (
                <button
                  key={b.name}
                  onClick={() => handleBranchClick(b.name)}
                  className={`nav-drawer-item ${currentBranch === b.name ? 'active' : ''}`}
                >
                  <span className="text-xs">{b.icon}</span>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Aptitude & Practice Preparation */}
          <div>
            <div className="nav-drawer-section-title">3. Aptitude & Practice</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <BookOpen className="w-4 h-4 text-[#60A5FA]" />
                <span>Aptitude Practice</span>
              </button>
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Mic className="w-4 h-4 text-[#60A5FA]" />
                <span>Mock Interview (Faculty/AI)</span>
              </button>
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Users className="w-4 h-4 text-[#60A5FA]" />
                <span>Virtual GD Practice</span>
              </button>
            </div>
          </div>

          {/* 4. Placement & TPO */}
          <div>
            <div className="nav-drawer-section-title">4. Placement & TPO</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Building2 className="w-4 h-4 text-[#60A5FA]" />
                <span>Company Requirements</span>
              </button>
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Timer className="w-4 h-4 text-[#60A5FA]" />
                <span>Company Status Tracker</span>
              </button>
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <LayoutDashboard className="w-4 h-4 text-[#60A5FA]" />
                <span>TPO Coordinator Portal</span>
              </button>
            </div>
          </div>

          {/* 5. Alumni & Community */}
          <div>
            <div className="nav-drawer-section-title">5. Alumni & Community</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick('/dsa')}>
                <Globe className="w-4 h-4 text-[#60A5FA]" />
                <span>Alumni Network & Jobs</span>
              </button>
            </div>
          </div>

        </div>

        {/* Drawer Footer User Card */}
        <div className="nav-drawer-footer">
          <div className="flex items-center justify-between bg-[#1E293B] p-2.5 rounded-xl border border-[#334155]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/30 text-[#60A5FA] font-bold text-xs flex items-center justify-center border border-[#2563EB]/40">
                AV
              </div>
              <div className="space-y-0.5 text-left">
                <span className="font-bold text-xs text-white block leading-none">Alex Vance</span>
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
    </div>
  );
};

export default NavDrawer;
