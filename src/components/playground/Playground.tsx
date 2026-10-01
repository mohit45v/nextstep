"use client";

import { useState } from "react";
import { AlertTriangle, Play, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, Container, PageHeader } from "@/components/ui";
import { CodeEditor } from "./CodeEditor";
import { SUPPORTED_LANGUAGES, type RunResult, type RunStatus } from "@/lib/code-runner/types";

/** Each outcome gets its own colour and its own sentence. */
const STATUS_PRESENTATION: Record<
  RunStatus,
  { tone: "success" | "danger" | "warn" | "neutral" | "accent"; hint: string }
> = {
  queued: { tone: "neutral", hint: "Waiting for a free slot on the judge." },
  running: { tone: "accent", hint: "Your program is executing." },
  accepted: { tone: "success", hint: "Your program ran to completion." },
  "wrong-answer": {
    tone: "warn",
    hint: "It ran, but the output didn't match what was expected.",
  },
  "compile-error": {
    tone: "danger",
    hint: "It never ran — the compiler rejected it. The message is below.",
  },
  "runtime-error": {
    tone: "danger",
    hint: "It started and then crashed. Check the error output below.",
  },
  "time-limit": {
    tone: "warn",
    hint: "It was still running when the clock ran out — look for a loop that never ends.",
  },
  "memory-limit": {
    tone: "warn",
    hint: "It asked for more memory than the sandbox allows.",
  },
  "internal-error": {
    tone: "danger",
    hint: "The judge itself failed. This one isn't your code.",
  },
};

interface PlaygroundProps {
  /** False when the server has no CODE_RUNNER_URL. */
  configured: boolean;
  runnerName: string;
}

export function Playground({ configured, runnerName }: PlaygroundProps) {
  const [languageId, setLanguageId] = useState(SUPPORTED_LANGUAGES[0].id);
  const [sources, setSources] = useState<Record<number, string>>(() =>
    Object.fromEntries(SUPPORTED_LANGUAGES.map((l) => [l.id, l.template])),
  );
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const language =
    SUPPORTED_LANGUAGES.find((l) => l.id === languageId) ?? SUPPORTED_LANGUAGES[0];

  async function run() {
    if (isRunning || !configured) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sources[languageId], languageId, stdin }),
      });
      const body = await response.json();

      if (!response.ok || !body.success) {
        setError(body?.error ?? "Couldn't run your code.");
        return;
      }
      setResult(body.data as RunResult);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Container>
      <PageHeader
        title="Playground"
        description="Write code, give it input, run it. Execution happens in a sandboxed judge on the server — never in your browser and never on this app's own process."
        actions={
          <Button onClick={() => void run()} disabled={!configured || isRunning}>
            <Play className="h-4 w-4" />
            {isRunning ? "Running…" : "Run"}
          </Button>
        }
      />

      {!configured && (
        <div className="mt-6 flex gap-3 rounded-card border border-warn-line bg-warn-soft px-5 py-4">
          <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-warn" />
          <div className="text-sm leading-relaxed text-ink-muted">
            <p className="font-semibold text-warn">No code runner is configured</p>
            <p className="mt-1">
              The editor works, but nothing can execute until this server can reach
              a Judge0-compatible engine. Start one with{" "}
              <code className="rounded bg-inset px-1.5 py-0.5 font-mono text-xs">
                docker compose up -d
              </code>{" "}
              and set{" "}
              <code className="rounded bg-inset px-1.5 py-0.5 font-mono text-xs">
                CODE_RUNNER_URL
              </code>{" "}
              in <code className="font-mono text-xs">.env.local</code>. The README
              has the steps.
            </p>
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2 pb-3">
            {SUPPORTED_LANGUAGES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLanguageId(option.id)}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
                  option.id === languageId
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {option.name}
              </button>
            ))}
            <span className="ml-auto text-xs text-ink-subtle">
              {/* Per-language drafts, so switching tabs does not throw away work. */}
              ⌘/Ctrl + Enter to run
            </span>
          </div>

          <CodeEditor
            value={sources[languageId] ?? ""}
            onChange={(next) => setSources((prev) => ({ ...prev, [languageId]: next }))}
            language={language.monaco}
            onRun={() => void run()}
          />

          <label
            htmlFor="stdin"
            className="mt-5 block text-sm font-semibold text-ink"
          >
            Standard input
          </label>
          <p className="mt-1 text-xs text-ink-subtle">
            What your program reads from stdin. Leave it empty if it reads nothing.
          </p>
          <textarea
            id="stdin"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            rows={4}
            spellCheck={false}
            className="mt-2 w-full rounded-card border border-line bg-surface p-3.5 font-mono text-[13px] text-ink focus:border-accent focus:outline-none"
          />
        </div>

        {/* Output */}
        <aside>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Terminal className="h-4 w-4 text-ink-subtle" />
                Output
              </h2>
              {result && (
                <Badge tone={STATUS_PRESENTATION[result.status].tone}>
                  {result.statusLabel}
                </Badge>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-input border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger"
              >
                {error}
              </p>
            )}

            {!result && !error && (
              <p className="mt-4 text-sm leading-relaxed text-ink-subtle">
                {isRunning
                  ? "Sending your code to the judge…"
                  : "Run your code to see its output, the time it took and the memory it used."}
              </p>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                <p className="text-sm leading-relaxed text-ink-muted">
                  {STATUS_PRESENTATION[result.status].hint}
                </p>

                <dl className="grid grid-cols-2 gap-3 rounded-input bg-inset px-4 py-3 text-xs">
                  <div>
                    <dt className="text-ink-subtle">Time</dt>
                    <dd className="mt-0.5 font-semibold text-ink tabular-nums">
                      {result.timeMs === null ? "—" : `${result.timeMs} ms`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle">Memory</dt>
                    <dd className="mt-0.5 font-semibold text-ink tabular-nums">
                      {result.memoryKb === null
                        ? "—"
                        : `${Math.round(result.memoryKb / 1024)} MB`}
                    </dd>
                  </div>
                </dl>

                {result.compileOutput && (
                  <OutputBlock
                    label="Compiler"
                    body={result.compileOutput}
                    tone="danger"
                  />
                )}
                {result.stdout && <OutputBlock label="stdout" body={result.stdout} />}
                {result.stderr && (
                  <OutputBlock label="stderr" body={result.stderr} tone="danger" />
                )}
                {!result.stdout && !result.stderr && !result.compileOutput && (
                  <p className="text-sm text-ink-subtle">
                    Your program printed nothing.
                  </p>
                )}
              </div>
            )}

            <p className="mt-5 border-t border-line pt-3.5 text-xs leading-relaxed text-ink-subtle">
              Engine: {runnerName}. Code runs with no network access, a CPU and
              memory cap, and a time limit.
            </p>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

function OutputBlock({
  label,
  body,
  tone = "neutral",
}: {
  label: string;
  body: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
        {label}
      </p>
      <pre
        className={cn(
          "mt-1.5 max-h-64 overflow-auto rounded-input border px-3.5 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap",
          tone === "danger"
            ? "border-danger-line bg-danger-soft text-danger"
            : "border-line bg-inset text-ink",
        )}
      >
        {body}
      </pre>
    </div>
  );
}
