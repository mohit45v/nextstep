"use client";

import { useState } from "react";
import Link from "next/link";
import NavDrawer from "../NavDrawer";
import LoginModal from "../LoginModal/LoginModal";
import StreakHeatmap from "../StreakHeatmap/StreakHeatmap";
import "./DashboardMain.css";

interface UserProfile {
  name: string;
  role: "Student" | "Faculty";
  credits: number;
}

export default function DashboardMain() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: "Alex Vance (CSE '26)",
    role: "Student",
    credits: 250,
  });

  const modules = [
    {
      num: 1,
      title: "AI Assistance & Analytics",
      desc: "AI credit-based mentor analytics, instant code explanations, and personalized debugging guidance.",
      icon: "🤖",
      link: "/dsa",
      badge: "Credit-Based",
    },
    {
      num: 2,
      title: "Leaderboard & Peer Ranks",
      desc: "Global, college, and branch-wise rankings based on problem submissions and streak consistency.",
      icon: "🏆",
      link: "/dsa",
      badge: "Live Ranks",
    },
    {
      num: 3,
      title: "Mock Interview (Faculty & AI)",
      desc: "Interactive 1-on-1 AI voice mock interviews and faculty review sessions with instant feedback.",
      icon: "🎙️",
      link: "/dsa",
      badge: "AI & Faculty",
    },
    {
      num: 4,
      title: "Company Requirement Portal",
      desc: "Detailed CTC packages, skill prerequisites, eligibility criteria, and target tech stacks.",
      icon: "🏢",
      link: "/dsa",
      badge: "Placements",
    },
    {
      num: 5,
      title: "Resume Maker & ATS Checker",
      desc: "AI-powered resume builder, ATS compatibility scanner, and missing keyword suggestions.",
      icon: "📄",
      link: "/dsa",
      badge: "AI Powered",
    },
    {
      num: 6,
      title: "Progress Heatmap",
      desc: "GitHub-style contribution grid keeping track of daily coding practice and streak achievements.",
      icon: "🟩",
      link: "/dsa",
      badge: "Daily Streak",
    },
    {
      num: 7,
      title: "Student Experiences Archive",
      desc: "Interview & working experience stories shared by past & final-year placed students.",
      icon: "💬",
      link: "/dsa",
      badge: "Verified Insights",
    },
    {
      num: 8,
      title: "JD Skill Gap Analyzer",
      desc: "Upload job descriptions to analyze missing skills and get automated custom target roadmaps.",
      icon: "🎯",
      link: "/dsa",
      badge: "Gap Analyzer",
    },
    {
      num: 9,
      title: "Company Status Tracker",
      desc: "Track real-time hiring status for past, active, and upcoming campus recruitment drives.",
      icon: "📅",
      link: "/dsa",
      badge: "Drive Pipeline",
    },
    {
      num: 10,
      title: "Notifications & Daily Streaks",
      desc: "Personalized notifications, task reminders, and continuous daily streak motivators.",
      icon: "🔥",
      link: "/dsa",
      badge: "Reminders",
    },
    {
      num: 11,
      title: "Aptitude & Reasoning Practice",
      desc: "IndiaBix-style topic-wise quantitative, logical, and verbal practice quiz banks.",
      icon: "📝",
      link: "/dsa",
      badge: "Quiz Banks",
    },
    {
      num: 12,
      title: "Virtual GD Practice",
      desc: "AI-moderated virtual Group Discussion practice environment with communication feedback.",
      icon: "🗣️",
      link: "/dsa",
      badge: "AI GD Simulator",
    },
    {
      num: 13,
      title: "Live Sessions (Mentor & HR)",
      desc: "Schedule and join interactive sessions hosted by industry mentors, HRs, and seniors.",
      icon: "👥",
      link: "/dsa",
      badge: "Live Calendar",
    },
    {
      num: 14,
      title: "Career Roadmap Generator",
      desc: "Generate tailored step-by-step learning roadmaps for target tech roles and companies.",
      icon: "🗺️",
      link: "/dsa",
      badge: "Step-by-Step",
    },
    {
      num: 15,
      title: "TPO Coordinator Portal",
      desc: "Dedicated dashboard for Training & Placement Officers to manage drives & student lists.",
      icon: "🎓",
      link: "/dsa",
      badge: "TPO Hub",
    },
    {
      num: 16,
      title: "Alumni Network & Job Board",
      desc: "Connect directly with college alumni, request job referrals, and explore exclusive jobs.",
      icon: "🌐",
      link: "/dsa",
      badge: "Alumni Jobs",
    },
  ];

  return (
    <div className="dashboard-root">
      {/* Navigation Drawer Component */}
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      {/* Navbar */}
      <header className="dash-navbar">
        <div className="dash-brand-group">
          <button className="menu-trigger-btn" onClick={() => setDrawerOpen(true)}>
            <span>☰</span>
            <span>Modules Menu</span>
          </button>

          <div className="dash-brand-title">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              N
            </div>
            Nextstep <span>Dashboard</span>
          </div>
        </div>

        <div className="dash-user-controls">
          <div className="credit-badge">🪙 {user.credits} AI Credits</div>
          <div className="streak-counter">🔥 14 Days</div>
          <button className="login-trigger-btn" onClick={() => setLoginModalOpen(true)}>
            👤 {user.name}
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="dash-hero-section">
        <div className="dash-hero-card animate-fade-in">
          <div>
            <h1 className="hero-welcome-title">
              Welcome back, <span>{user.name}</span> 👋
            </h1>
            <p className="hero-subtitle">
              Your placement engine is active. Track daily streaks, practice DSA, and analyze skill gaps.
            </p>
          </div>

          <Link href="/dsa" className="hero-action-btn">
            ⚡ Open DSA Engineering Hub →
          </Link>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="dash-main-container">
        {/* Interactive Heatmap Widget */}
        <StreakHeatmap />

        {/* 16 Architecture Modules Grid */}
        <div>
          <div className="section-label" style={{ marginBottom: 16 }}>
            <span>Core Architecture Modules</span> (All 16 Sections)
          </div>

          <div className="modules-grid">
            {modules.map((m) => (
              <Link href={m.link} key={m.num} style={{ textDecoration: "none" }}>
                <div className="module-card">
                  <div>
                    <div className="module-card-header">
                      <div className="module-icon-box">{m.icon}</div>
                      <span className="module-num-badge">#{m.num} {m.badge}</span>
                    </div>

                    <h3 className="module-title">{m.title}</h3>
                    <p className="module-desc">{m.desc}</p>
                  </div>

                  <div className="module-footer">
                    <span>Explore Module</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
