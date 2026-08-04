"use client";

import { useRouter } from "next/navigation";
import "./NavDrawer.css";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch?: string;
  onSelectBranch?: (branch: string) => void;
}

export default function NavDrawer({
  isOpen,
  onClose,
  currentBranch,
  onSelectBranch,
}: NavDrawerProps) {
  const router = useRouter();

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

  return (
    <div className={`nav-drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="nav-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-title">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              N
            </div>
            Nextstep <span>Modules</span>
          </div>
          <button className="nav-drawer-close" onClick={onClose} aria-label="Close Drawer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="nav-drawer-content">
          {/* Main Navigation */}
          <div>
            <div className="nav-drawer-section-title">Overview</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick("/")}>
                <span className="nav-drawer-icon">🏠</span>
                <span>Dashboard Home</span>
              </button>
            </div>
          </div>

          {/* 1. 🤖 AI & Career Acceleration Suite */}
          <div>
            <div className="nav-drawer-section-title">1. AI Career Suite</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🤖</span>
                <span>AI Mentor & Analytics</span>
                <span className="nav-drawer-badge">Credits</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">📄</span>
                <span>AI Resume & ATS Checker</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🎯</span>
                <span>JD Skill Gap Analyzer</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🗺️</span>
                <span>Roadmap Generator</span>
              </button>
            </div>
          </div>

          {/* 2. 🎯 Practice & Preparation Hub */}
          <div>
            <div className="nav-drawer-section-title">2. Practice & Preparation</div>
            <div className="nav-drawer-menu">
              <button
                className={`nav-drawer-item ${currentBranch ? "active" : ""}`}
                onClick={() => handleNavClick("/dsa")}
              >
                <span className="nav-drawer-icon">⚡</span>
                <span>DSA Engineering Hub</span>
                <span className="nav-drawer-badge">Live API</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🎙️</span>
                <span>Mock Interview (Faculty/AI)</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">📝</span>
                <span>Aptitude Practice</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🗣️</span>
                <span>Virtual GD Practice</span>
              </button>
            </div>
          </div>

          {/* Sub-section: DSA Engineering Branches */}
          <div>
            <div className="nav-drawer-section-title">DSA by Engineering Branch</div>
            <div className="nav-drawer-menu">
              <button
                className={`nav-drawer-item ${currentBranch === "CS & IT" ? "active" : ""}`}
                onClick={() => handleBranchClick("CS & IT")}
              >
                <span className="nav-drawer-icon">💻</span>
                <span>Computer & IT</span>
              </button>

              <button
                className={`nav-drawer-item ${currentBranch === "AIDS" ? "active" : ""}`}
                onClick={() => handleBranchClick("AIDS")}
              >
                <span className="nav-drawer-icon">🤖</span>
                <span>AI & Data Science (AIDS)</span>
              </button>

              <button
                className={`nav-drawer-item ${currentBranch === "Electrical" ? "active" : ""}`}
                onClick={() => handleBranchClick("Electrical")}
              >
                <span className="nav-drawer-icon">⚡</span>
                <span>Electrical Engineering</span>
              </button>

              <button
                className={`nav-drawer-item ${currentBranch === "Mechanical" ? "active" : ""}`}
                onClick={() => handleBranchClick("Mechanical")}
              >
                <span className="nav-drawer-icon">⚙️</span>
                <span>Mechanical Engineering</span>
              </button>

              <button
                className={`nav-drawer-item ${currentBranch === "Civil" ? "active" : ""}`}
                onClick={() => handleBranchClick("Civil")}
              >
                <span className="nav-drawer-icon">🏗️</span>
                <span>Civil Engineering</span>
              </button>
            </div>
          </div>

          {/* 3. 💼 Placement & Company Portal */}
          <div>
            <div className="nav-drawer-section-title">3. Placement & TPO</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🏢</span>
                <span>Company Requirements</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">📅</span>
                <span>Company Status (Past/Upcoming)</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🎓</span>
                <span>TPO Coordinator Portal</span>
              </button>
            </div>
          </div>

          {/* 4. 👥 Experience & Sessions */}
          <div>
            <div className="nav-drawer-section-title">4. Experience & Community</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">💬</span>
                <span>Student Experiences</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">👥</span>
                <span>Sessions (Mentor / HR)</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🌐</span>
                <span>Alumni Network & Jobs</span>
              </button>
            </div>
          </div>

          {/* 5. 📊 Progress & Leaderboard */}
          <div>
            <div className="nav-drawer-section-title">5. Progress & Analytics</div>
            <div className="nav-drawer-menu">
              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🏆</span>
                <span>Leaderboard</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🟩</span>
                <span>Progress HeatMap</span>
              </button>

              <button className="nav-drawer-item" onClick={() => handleNavClick("/dsa")}>
                <span className="nav-drawer-icon">🔥</span>
                <span>Streaks & Notifications</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="nav-drawer-footer">
          Nextstep Placement Engine • Soft Purple UI
        </div>
      </div>
    </div>
  );
}
