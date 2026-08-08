"use client";

import { useState } from "react";
import "./LoginModal.css";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; role: "Student" | "Faculty"; credits: number }) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [role, setRole] = useState<"Student" | "Faculty">("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: role === "Student" ? "Alex Vance (CSE '26)" : "Prof. R. Sharma (TPO)",
      role,
      credits: 250,
    });
    onClose();
  };

  const handleQuickDemo = () => {
    onLoginSuccess({
      name: "Alex Vance (Student)",
      role: "Student",
      credits: 250,
    });
    onClose();
  };

  return (
    <div className={`login-modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="login-header">
          <div className="login-brand-icon">N</div>
          <h2 className="login-title">
            Nextstep <span>Portal</span>
          </h2>
          <p className="login-subtitle">Placement & Skill Acceleration Platform</p>
        </div>

        <div className="login-type-tabs">
          <button
            className={`login-tab-btn ${role === "Student" ? "active" : ""}`}
            onClick={() => setRole("Student")}
          >
            🎓 Student Login
          </button>
          <button
            className={`login-tab-btn ${role === "Faculty" ? "active" : ""}`}
            onClick={() => setRole("Faculty")}
          >
            👨‍🏫 Faculty / TPO
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">College Email ID</label>
            <input
              type="email"
              className="login-input"
              placeholder={role === "Student" ? "student@college.edu" : "faculty@college.edu"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn">
            Log In to Nextstep →
          </button>

          <button type="button" className="demo-login-btn" onClick={handleQuickDemo}>
            ⚡ Quick Demo Login (1-Click)
          </button>
        </form>
      </div>
    </div>
  );
}
