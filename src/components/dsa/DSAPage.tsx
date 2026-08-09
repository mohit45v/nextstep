"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import NavDrawer from "@/components/layout/NavDrawer";
import "./DSAPage.css";

export interface DSATopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  branch: "General" | "CS & IT" | "AIDS" | "Electrical" | "Mechanical" | "Civil";
  totalProblems: number;
  solvedProblems: number;
}

export interface DSAProblem {
  id: string;
  topicId?: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  solved: boolean;
  link?: string;
  rating?: number;
  source?: string;
}

const BRANCH_OPTIONS = [
  "All Branches",
  "CS & IT",
  "AIDS",
  "Electrical",
  "Mechanical",
  "Civil",
];

const CODEFORCES_TAGS = [
  { tag: "dp", label: "Dynamic Programming" },
  { tag: "graphs", label: "Graph Algorithms" },
  { tag: "trees", label: "Trees & Data Structures" },
  { tag: "math", label: "Matrix & Math Algorithms" },
  { tag: "greedy", label: "Greedy Algorithms" },
  { tag: "shortest paths", label: "Shortest Paths" },
];

export default function DSAPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"curated" | "live">("curated");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const [topics, setTopics] = useState<DSATopic[]>([]);
  const [topicsStatus, setTopicsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [problemsStatus, setProblemsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const [activeLiveTag, setActiveLiveTag] = useState("dp");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unsolved" | "solved">("all");

  useEffect(() => {
    if (mode !== "curated") return;

    const controller = new AbortController();

    (async () => {
      setTopicsStatus("loading");
      try {
        const res = await fetch("/api/dsa/topics", { signal: controller.signal });
        const data: DSATopic[] = await res.json();
        setTopics(data);
        setTopicsStatus("ready");
      } catch {
        if (!controller.signal.aborted) setTopicsStatus("error");
      }
    })();

    return () => controller.abort();
  }, [mode]);

  const filteredTopics = useMemo(() => {
    if (selectedBranch === "All Branches") return topics;
    return topics.filter((t) => t.branch === selectedBranch);
  }, [topics, selectedBranch]);

  /**
   * Derived rather than stored. The old code kept `activeTopicId` in state and
   * corrected it from an effect whenever the branch filter changed, which cost
   * an extra render pass and briefly rendered a topic that wasn't in the list.
   * Falling back to the first visible topic here means there is never an
   * inconsistent frame.
   */
  const activeTopicId = useMemo(() => {
    if (selectedTopicId && filteredTopics.some((t) => t.id === selectedTopicId)) {
      return selectedTopicId;
    }
    return filteredTopics[0]?.id ?? null;
  }, [filteredTopics, selectedTopicId]);

  useEffect(() => {
    const url =
      mode === "curated"
        ? activeTopicId
          ? `/api/dsa/topics/${activeTopicId}/problems`
          : null
        : `/api/dsa/external/codeforces?tag=${encodeURIComponent(activeLiveTag)}`;

    if (!url) return;

    // Aborting on change stops a slow response for the previous topic from
    // overwriting the current one.
    const controller = new AbortController();

    (async () => {
      setProblemsStatus("loading");
      try {
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setProblems(mode === "curated" ? data : (data.problems ?? []));
        setProblemsStatus("ready");
      } catch {
        if (!controller.signal.aborted) setProblemsStatus("error");
      }
    })();

    return () => controller.abort();
  }, [mode, activeTopicId, activeLiveTag]);

  const activeTopic = useMemo(
    () => topics.find((t) => t.id === activeTopicId) || null,
    [topics, activeTopicId]
  );

  const visibleProblems = useMemo(() => {
    return problems.filter((p) => {
      if (filterStatus === "solved" && !p.solved) return false;
      if (filterStatus === "unsolved" && p.solved) return false;
      if (search.trim() && !p.title.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [problems, filterStatus, search]);

  const toggleSolved = (problem: DSAProblem) => {
    const nextSolved = !problem.solved;

    setProblems((prev) =>
      prev.map((p) => (p.id === problem.id ? { ...p, solved: nextSolved } : p))
    );

    if (mode === "curated" && activeTopicId) {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === activeTopicId
            ? { ...t, solvedProblems: Math.max(0, (t.solvedProblems || 0) + (nextSolved ? 1 : -1)) }
            : t
        )
      );

      fetch(`/api/dsa/problems/${problem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solved: nextSolved }),
      }).catch(() => {});
    }
  };

  const handleBranchSelectFromDrawer = (branch: string) => {
    setMode("curated");
    setSelectedBranch(branch);
  };

  return (
    <div className="dsa-app">
      {/* Navigation Drawer Component */}
      <NavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentBranch={selectedBranch}
        onSelectBranch={handleBranchSelectFromDrawer}
      />

      {/* Top Navbar */}
      <header className="dsa-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              background: "#f3f0ff",
              border: "1px solid #e0d9ff",
              color: "#6c5ce7",
              fontSize: "18px",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 700,
            }}
            aria-label="Open Navigation Drawer"
          >
            ☰ <span style={{ fontSize: "13px", color: "#4c3fb5" }}>Menu</span>
          </button>

          <Link href="/" className="dsa-brand">
            <div className="dsa-brand-logo">N</div>
            <div className="dsa-brand-title">
              Nextstep <span>DSA Hub</span>
            </div>
          </Link>
        </div>

        <div className="dsa-nav-modes">
          <button
            className={`dsa-mode-tab ${mode === "curated" ? "active" : ""}`}
            onClick={() => setMode("curated")}
          >
            Curated Branch DSA
          </button>
          <button
            className={`dsa-mode-tab ${mode === "live" ? "active" : ""}`}
            onClick={() => setMode("live")}
          >
            ⚡ Live Codeforces API
          </button>
        </div>
      </header>

      {/* Engineering Branch Selector */}
      {mode === "curated" && (
        <div className="dsa-branch-strip">
          {BRANCH_OPTIONS.map((branch) => (
            <button
              key={branch}
              className={`dsa-branch-btn ${selectedBranch === branch ? "active" : ""}`}
              onClick={() => setSelectedBranch(branch)}
            >
              {branch}
            </button>
          ))}
        </div>
      )}

      {/* Main Body */}
      <div className="dsa-container">
        {/* Left Topic Sidebar */}
        {mode === "curated" && (
          <aside className="dsa-sidebar">
            <div className="dsa-section-header">
              <span>Topics</span>
              <span>{filteredTopics.length} Topics</span>
            </div>

            {topicsStatus === "loading" && (
              <div className="dsa-empty-state">Loading topics...</div>
            )}

            {topicsStatus === "ready" &&
              filteredTopics.map((topic) => {
                const percent = topic.totalProblems
                  ? Math.round(((topic.solvedProblems || 0) / topic.totalProblems) * 100)
                  : 0;

                return (
                  <div
                    key={topic.id}
                    className={`dsa-topic-card ${topic.id === activeTopicId ? "active" : ""}`}
                    onClick={() => setSelectedTopicId(topic.id)}
                  >
                    <div className="dsa-topic-card-top">
                      <div className="dsa-topic-title">{topic.name}</div>
                      <span className="dsa-topic-badge">{topic.branch}</span>
                    </div>

                    <div className="dsa-topic-desc">{topic.description}</div>

                    <div className="dsa-progress-bar-bg">
                      <div className="dsa-progress-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
          </aside>
        )}

        {/* Right Main Content */}
        <main className="dsa-main">
          {mode === "curated" && activeTopic && (
            <div className="dsa-main-header">
              <div>
                <h1 className="dsa-main-title">
                  {activeTopic.name}
                  <span className="dsa-topic-badge">{activeTopic.branch}</span>
                </h1>
                <p className="dsa-main-desc">{activeTopic.description}</p>
              </div>
            </div>
          )}

          {mode === "live" && (
            <div className="dsa-main-header">
              <div>
                <h1 className="dsa-main-title">⚡ Live Codeforces API</h1>
                <p className="dsa-main-desc">
                  Real-time competitive programming & algorithm questions directly from Codeforces API.
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {CODEFORCES_TAGS.map((t) => (
                    <button
                      key={t.tag}
                      className={`dsa-branch-btn ${activeLiveTag === t.tag ? "active" : ""}`}
                      onClick={() => setActiveLiveTag(t.tag)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="dsa-controls">
            <div className="dsa-search-box">
              <input
                type="text"
                className="dsa-search-input"
                placeholder="Search problem title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="dsa-filter-group">
              <button
                className={`dsa-filter-pill ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All
              </button>
              <button
                className={`dsa-filter-pill ${filterStatus === "unsolved" ? "active" : ""}`}
                onClick={() => setFilterStatus("unsolved")}
              >
                Unsolved
              </button>
              <button
                className={`dsa-filter-pill ${filterStatus === "solved" ? "active" : ""}`}
                onClick={() => setFilterStatus("solved")}
              >
                Solved
              </button>
            </div>
          </div>

          {/* Problems List */}
          {problemsStatus === "loading" && (
            <div className="dsa-empty-state">
              <div className="dsa-empty-icon">🔄</div>
              <div>Fetching problems...</div>
            </div>
          )}

          {problemsStatus === "ready" && visibleProblems.length === 0 && (
            <div className="dsa-empty-state">
              <div className="dsa-empty-icon">🔍</div>
              <div>No problems found matching search criteria.</div>
            </div>
          )}

          {problemsStatus === "ready" && visibleProblems.length > 0 && (
            <div className="dsa-problems-list">
              {visibleProblems.map((problem) => (
                <div
                  key={problem.id}
                  className={`dsa-problem-card ${problem.solved ? "solved" : ""}`}
                >
                  <div className="dsa-problem-left">
                    <div
                      className={`dsa-checkbox ${problem.solved ? "checked" : ""}`}
                      onClick={() => toggleSolved(problem)}
                    >
                      {problem.solved ? "✓" : ""}
                    </div>

                    {problem.link ? (
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noreferrer"
                        className="dsa-problem-title-text"
                      >
                        {problem.title} ↗
                      </a>
                    ) : (
                      <span className="dsa-problem-title-text">{problem.title}</span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {problem.rating && (
                      <span className="dsa-topic-badge">Rating: {problem.rating}</span>
                    )}
                    <span className={`dsa-badge-difficulty ${problem.difficulty}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
