"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, RefreshCw, Search } from "lucide-react";
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
import {
  CODEFORCES_TAGS,
  DSA_BRANCH_FILTERS,
  type DsaBranchFilter,
} from "@/lib/dsa-labels";
import type { DsaProblemView, DsaTopicSummary, LiveProblem } from "@/types/dsa";

interface DSAPageProps {
  topics: DsaTopicSummary[];
  activeTopic: DsaTopicSummary | null;
  problems: DsaProblemView[];
  branch: DsaBranchFilter;
  mode: "curated" | "live";
  tag: string;
  /** Set when the student's profile picked the branch rather than the URL. */
  branchFromProfile: boolean;
}

/**
 * The DSA hub.
 *
 * Two changes worth knowing about:
 *
 *  * **The sheets are server-rendered.** Branch, topic and mode live in the URL,
 *    so the first paint already has the topic list and its problems. The old
 *    version mounted empty and then fetched topics, waited, fetched problems,
 *    waited — two round trips before a student saw anything.
 *  * **A tick is a row.** `ProblemSolve` is keyed `(userId, problemId)`, so
 *    progress survives a refresh, a re-login and a different machine. The update
 *    is optimistic and rolls back if the write fails, rather than quietly
 *    disagreeing with the database.
 */
export default function DSAPage({
  topics,
  activeTopic,
  problems,
  branch,
  mode,
  tag,
  branchFromProfile,
}: DSAPageProps) {
  const [search, setSearch] = useState("");

  /**
   * Solve state, seeded from the server and then owned here so a click feels
   * instant. `failed` carries the one case the student must be told about: the
   * write did not land, so the tick has been put back.
   */
  const [solved, setSolved] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(problems.map((p) => [p.id, p.solved])),
  );
  const [saveFailed, setSaveFailed] = useState(false);

  const [liveProblems, setLiveProblems] = useState<LiveProblem[]>([]);
  const [liveStatus, setLiveStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [liveError, setLiveError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // The live feed is a secondary tab, so it is fetched on demand rather than
  // made part of the page's server render — nobody should wait on Codeforces to
  // see their own curated sheet.
  useEffect(() => {
    if (mode !== "live") return;

    const controller = new AbortController();

    // The status updates live inside the async body on purpose: a synchronous
    // setState in an effect is an extra render before the request has even
    // started, and React's lint rule says so.
    (async () => {
      setLiveStatus("loading");
      setLiveError(null);
      try {
        const res = await fetch(
          `/api/dsa/external/codeforces?tag=${encodeURIComponent(tag)}`,
          { signal: controller.signal },
        );
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body?.error ?? "request failed");
        setLiveProblems(body.data.problems);
        setLiveStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setLiveError(error instanceof Error ? error.message : null);
        setLiveStatus("error");
      }
    })();

    return () => controller.abort();
  }, [mode, tag, reloadToken]);

  async function toggleSolved(problemId: string) {
    const next = !solved[problemId];
    setSolved((prev) => ({ ...prev, [problemId]: next }));
    setSaveFailed(false);

    try {
      const res = await fetch("/api/dsa/solves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, solved: next }),
      });
      if (!res.ok) throw new Error("request failed");
    } catch {
      // Roll back. A tick that looks saved and is not is exactly the bug this
      // screen used to have.
      setSolved((prev) => ({ ...prev, [problemId]: !next }));
      setSaveFailed(true);
    }
  }

  const term = search.trim().toLowerCase();

  const visibleCurated = useMemo(
    () => (term ? problems.filter((p) => p.title.toLowerCase().includes(term)) : problems),
    [problems, term],
  );

  const visibleLive = useMemo(
    () =>
      term ? liveProblems.filter((p) => p.title.toLowerCase().includes(term)) : liveProblems,
    [liveProblems, term],
  );

  const solvedCount = problems.filter((p) => solved[p.id]).length;
  const href = (params: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    const merged = { branch, mode, tag, topic: activeTopic?.id, ...params };
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === "branch" && value === "All") && !(key === "mode" && value === "curated")) {
        search.set(key, value);
      }
    }
    const query = search.toString();
    return query ? `/dsa?${query}` : "/dsa";
  };

  return (
    <Container>
      <PageHeader
        title="DSA problems"
        description="Curated branch-wise sheets with direct LeetCode links, plus a live feed from the Codeforces problemset API. Your ticks are saved to your account."
      />

      {/* Mode switch */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { id: "curated", label: "Curated sheets" },
            { id: "live", label: "Live from Codeforces" },
          ] as const
        ).map((m) => (
          <Link
            key={m.id}
            href={href({ mode: m.id, topic: m.id === "live" ? undefined : activeTopic?.id })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {m.label}
          </Link>
        ))}
      </div>

      {/* Branch filter (curated only) */}
      {mode === "curated" && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {DSA_BRANCH_FILTERS.map((option) => (
              <Link
                key={option}
                href={href({ branch: option, topic: undefined })}
                className={cn(
                  "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                  branch === option
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {option === "All" ? "All branches" : option}
              </Link>
            ))}
          </div>
          {branchFromProfile && (
            <p className="mt-2 text-xs text-ink-subtle">
              Showing the sheets for your branch. Pick another above to see the rest.
            </p>
          )}
        </>
      )}

      {/* Live tag filter */}
      {mode === "live" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {CODEFORCES_TAGS.map((t) => (
            <Link
              key={t.tag}
              href={href({ tag: t.tag })}
              className={cn(
                "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                tag === t.tag
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Topic list */}
        {mode === "curated" && (
          <aside>
            <p className="px-1 pb-2.5 text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
              Topics ({topics.length})
            </p>

            {topics.length === 0 ? (
              <p className="px-1 text-sm text-ink-subtle">
                No sheets for this branch yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {topics.map((topic) => {
                  const isActive = topic.id === activeTopic?.id;
                  const complete =
                    topic.problemCount > 0 && topic.solvedCount === topic.problemCount;

                  return (
                    <li key={topic.id}>
                      <Link
                        href={href({ topic: topic.id })}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "block rounded-card border px-4 py-3 transition-colors",
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
                          <span className="flex shrink-0 items-center gap-1 text-xs text-ink-subtle tabular-nums">
                            {complete && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            )}
                            {topic.solvedCount}/{topic.problemCount}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-ink-subtle">
                          {topic.branch}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        )}

        {/* Problem list */}
        <div className={cn(mode === "live" && "lg:col-span-2")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">
                {mode === "curated"
                  ? (activeTopic?.name ?? "Problems")
                  : (CODEFORCES_TAGS.find((t) => t.tag === tag)?.label ?? "Live problems")}
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                {mode === "curated"
                  ? `${visibleCurated.length} problems · ${solvedCount} solved`
                  : liveStatus === "ready"
                    ? `${visibleLive.length} problems from the Codeforces API`
                    : liveStatus === "loading"
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

          {mode === "curated" && activeTopic?.description && (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {activeTopic.description}
            </p>
          )}

          {saveFailed && (
            <p
              role="alert"
              className="mt-4 rounded-input border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              That tick didn&rsquo;t save — your connection dropped, so it has been
              put back. Try again.
            </p>
          )}

          <div className="mt-5">
            {mode === "curated" ? (
              visibleCurated.length === 0 ? (
                <EmptyState
                  title={term ? "No problems match" : "No problems in this sheet yet"}
                  description={
                    term
                      ? "Try a different search term or topic."
                      : "Pick another topic from the list."
                  }
                />
              ) : (
                <Card className="divide-y divide-line overflow-hidden p-0">
                  {visibleCurated.map((problem) => (
                    <div
                      key={problem.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-inset"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(solved[problem.id])}
                        onChange={() => void toggleSolved(problem.id)}
                        aria-label={`Mark ${problem.title} as solved`}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-accent)]"
                      />

                      <span
                        className={cn(
                          "min-w-0 flex-1 text-sm",
                          solved[problem.id] ? "text-ink-subtle line-through" : "text-ink",
                        )}
                      >
                        {problem.title}
                      </span>

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
              )
            ) : liveStatus === "error" ? (
              <EmptyState
                title="Couldn't load the live feed"
                description={
                  liveError ??
                  "The Codeforces API didn't respond. It rate-limits heavy use — wait a moment and try again."
                }
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setReloadToken((t) => t + 1)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                }
              />
            ) : liveStatus === "loading" || liveStatus === "idle" ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-input border border-line bg-surface"
                  />
                ))}
              </div>
            ) : visibleLive.length === 0 ? (
              <EmptyState
                title="No problems match"
                description="Try a different search term or tag."
              />
            ) : (
              <>
                <Card className="divide-y divide-line overflow-hidden p-0">
                  {visibleLive.map((problem) => (
                    <div
                      key={problem.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-inset"
                    >
                      <span className="min-w-0 flex-1 text-sm text-ink">
                        {problem.title}
                      </span>
                      {problem.rating && <Badge tone="neutral">{problem.rating}</Badge>}
                      <DifficultyBadge level={problem.difficulty} />
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${problem.title} in a new tab`}
                        className="shrink-0 text-ink-subtle transition-colors hover:text-accent"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </Card>
                <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
                  Live problems come straight from Codeforces and are not part of a
                  curated sheet, so there is nothing to tick — your progress is
                  tracked on the curated sheets only.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
