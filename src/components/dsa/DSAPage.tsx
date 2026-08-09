"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Badge,
  Button,
  Card,
  Container,
  DifficultyBadge,
  EmptyState,
  PageHeader,
} from "@/components/ui";

export interface DSATopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  branch: "General" | "CS & IT" | "AIDS" | "Electrical" | "Mechanical" | "Civil";
  totalProblems: number;
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
  { tag: "graphs", label: "Graphs" },
  { tag: "trees", label: "Trees" },
  { tag: "math", label: "Math" },
  { tag: "greedy", label: "Greedy" },
  { tag: "shortest paths", label: "Shortest Paths" },
];

type Status = "idle" | "loading" | "ready" | "error";

export default function DSAPage() {
  const [mode, setMode] = useState<"curated" | "live">("curated");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const [topics, setTopics] = useState<DSATopic[]>([]);
  const [topicsStatus, setTopicsStatus] = useState<Status>("loading");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [problemsStatus, setProblemsStatus] = useState<Status>("idle");

  const [activeLiveTag, setActiveLiveTag] = useState("dp");
  const [search, setSearch] = useState("");

  /**
   * Locally-ticked problems.
   *
   * The API route this used to PATCH returned `{ solved: true }` without
   * writing anything, so progress looked saved and silently vanished on
   * refresh. That route is gone. Ticking still works for the current session,
   * and the notice below says plainly that it is not persisted yet.
   */
  const [solvedLocally, setSolvedLocally] = useState<Record<string, boolean>>({});

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
   * Derived rather than stored. The old code kept this in state and corrected
   * it from an effect whenever the branch filter changed, costing an extra
   * render and briefly showing a topic that was not in the filtered list.
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

  const activeTopic = topics.find((t) => t.id === activeTopicId) ?? null;

  const visibleProblems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return problems;
    return problems.filter((p) => p.title.toLowerCase().includes(term));
  }, [problems, search]);

  const solvedCount = visibleProblems.filter((p) => solvedLocally[p.id]).length;

  return (
    <Container>
      <PageHeader
        title="DSA problems"
        description="Curated branch-wise sheets with direct LeetCode links, plus a live feed from the Codeforces problemset API."
      />

      {/* Mode switch */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { id: "curated", label: "Curated sheets" },
            { id: "live", label: "Live from Codeforces" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Branch filter (curated only) */}
      {mode === "curated" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {BRANCH_OPTIONS.map((branch) => (
            <button
              key={branch}
              type="button"
              onClick={() => setSelectedBranch(branch)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                selectedBranch === branch
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {branch}
            </button>
          ))}
        </div>
      )}

      {/* Live tag filter */}
      {mode === "live" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {CODEFORCES_TAGS.map((t) => (
            <button
              key={t.tag}
              type="button"
              onClick={() => setActiveLiveTag(t.tag)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                activeLiveTag === t.tag
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Topic list */}
        {mode === "curated" && (
          <aside>
            <p className="px-1 pb-2.5 text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
              Topics ({filteredTopics.length})
            </p>

            {topicsStatus === "loading" && (
              <p className="px-1 text-sm text-ink-subtle">Loading topics…</p>
            )}

            {topicsStatus === "error" && (
              <p className="px-1 text-sm text-danger">Couldn&rsquo;t load topics.</p>
            )}

            <ul className="space-y-2">
              {filteredTopics.map((topic) => {
                const isActive = topic.id === activeTopicId;
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={cn(
                        "w-full cursor-pointer rounded-card border px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-accent bg-accent-soft"
                          : "border-line bg-surface hover:border-line-strong",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-accent" : "text-ink",
                          )}
                        >
                          {topic.name}
                        </span>
                        <span className="shrink-0 text-xs text-ink-subtle">
                          {topic.totalProblems}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-ink-subtle">
                        {topic.branch}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* Problem list */}
        <div className={cn(mode === "live" && "lg:col-span-2")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">
                {mode === "curated"
                  ? (activeTopic?.name ?? "Problems")
                  : CODEFORCES_TAGS.find((t) => t.tag === activeLiveTag)?.label}
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                {problemsStatus === "ready"
                  ? `${visibleProblems.length} problems · ${solvedCount} ticked`
                  : problemsStatus === "loading"
                    ? "Loading…"
                    : ""}
              </p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems"
                aria-label="Search problems"
                className="w-full rounded-full border border-line bg-surface py-2 pr-4 pl-9 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {activeTopic?.description && mode === "curated" && (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {activeTopic.description}
            </p>
          )}

          <div className="mt-5">
            {problemsStatus === "error" ? (
              <EmptyState
                title="Couldn't load problems"
                description={
                  mode === "live"
                    ? "The Codeforces API didn't respond. It rate-limits heavy use — wait a moment and try again."
                    : "Something went wrong fetching this topic."
                }
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setActiveLiveTag((t) => t)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                }
              />
            ) : problemsStatus === "loading" ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-input border border-line bg-surface"
                  />
                ))}
              </div>
            ) : visibleProblems.length === 0 ? (
              <EmptyState
                title="No problems match"
                description="Try a different search term or topic."
              />
            ) : (
              <Card className="divide-y divide-line overflow-hidden p-0">
                {visibleProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-inset"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(solvedLocally[problem.id])}
                      onChange={() =>
                        setSolvedLocally((prev) => ({
                          ...prev,
                          [problem.id]: !prev[problem.id],
                        }))
                      }
                      aria-label={`Mark ${problem.title} as solved`}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-accent)]"
                    />

                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm",
                        solvedLocally[problem.id]
                          ? "text-ink-subtle line-through"
                          : "text-ink",
                      )}
                    >
                      {problem.title}
                    </span>

                    {problem.rating && (
                      <Badge tone="neutral">{problem.rating}</Badge>
                    )}
                    <DifficultyBadge level={problem.difficulty} />

                    {problem.link && (
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${problem.title} in a new tab`}
                        className="shrink-0 text-ink-subtle transition-colors hover:text-accent"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </Card>
            )}
          </div>

          <p className="mt-5 rounded-card border border-line border-dashed bg-surface px-5 py-4 text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Ticks aren&rsquo;t saved yet.</span>{" "}
            Marking a problem solved lasts for this visit only — per-user
            progress needs a database table that doesn&rsquo;t exist yet.
          </p>
        </div>
      </div>
    </Container>
  );
}
