import {
  RUN_LIMITS,
  type CodeRunner,
  type RunRequest,
  type RunResult,
  type RunStatus,
} from "./types";

/**
 * A CodeRunner backed by any Judge0-compatible server.
 *
 * Tested against self-hosted CodeBox (MIT, Judge0-compatible) and Judge0 CE.
 * Swapping between them is a `CODE_RUNNER_URL` change — there is no Judge0
 * vocabulary above this file.
 *
 * Why polling rather than `wait=true`: a synchronous submission holds an HTTP
 * connection open for the whole execution, which serverless platforms cut off
 * and which turns one slow program into one blocked request. Submit, then poll,
 * and give up on our own deadline rather than theirs.
 */

/** Judge0's status ids. Only the ones we can act on are named. */
const JUDGE0_STATUS: Record<number, { status: RunStatus; label: string }> = {
  1: { status: "queued", label: "In queue" },
  2: { status: "running", label: "Running" },
  3: { status: "accepted", label: "Finished" },
  4: { status: "wrong-answer", label: "Wrong answer" },
  5: { status: "time-limit", label: "Time limit exceeded" },
  6: { status: "compile-error", label: "Compilation error" },
  7: { status: "runtime-error", label: "Runtime error (SIGSEGV)" },
  8: { status: "runtime-error", label: "Runtime error (SIGXFSZ)" },
  9: { status: "runtime-error", label: "Runtime error (SIGFPE)" },
  10: { status: "runtime-error", label: "Runtime error (SIGABRT)" },
  11: { status: "runtime-error", label: "Runtime error (NZEC)" },
  12: { status: "runtime-error", label: "Runtime error" },
  13: { status: "internal-error", label: "Judge internal error" },
  14: { status: "internal-error", label: "Exec format error" },
};

interface Judge0Submission {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  exit_code?: number | null;
  status?: { id?: number; description?: string };
}

export class Judge0Runner implements CodeRunner {
  readonly name: string;
  readonly configured = true;

  constructor(
    private readonly baseUrl: string,
    private readonly authToken?: string,
    name = "Judge0-compatible runner",
  ) {
    // A trailing slash turns `${base}/submissions` into a double slash, which
    // some reverse proxies 404 rather than normalise.
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.name = name;
  }

  private headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      // Self-hosted Judge0 and CodeBox both read X-Auth-Token.
      ...(this.authToken ? { "X-Auth-Token": this.authToken } : {}),
    };
  }

  async run(request: RunRequest): Promise<RunResult> {
    const deadline = Date.now() + RUN_LIMITS.pollTimeoutMs;

    const created = await this.post(request);
    if ("error" in created) return internalError(created.error);

    const token = created.token;

    // Poll with a gentle backoff: fast at first because most programs finish in
    // well under a second, slower after that so a queued job does not hammer the
    // judge.
    let delay = 150;
    while (Date.now() < deadline) {
      await sleep(delay);
      delay = Math.min(delay * 1.5, 1000);

      const polled = await this.get(token);
      if ("error" in polled) return internalError(polled.error);

      const statusId = polled.submission.status?.id ?? 1;
      if (statusId > 2) return toRunResult(polled.submission);
    }

    // Our deadline, not the engine's. The submission may still be running over
    // there; what matters is that the student gets an answer rather than a
    // spinner that never resolves.
    return {
      status: "time-limit",
      statusLabel: "The judge didn't answer in time",
      stdout: "",
      stderr: "",
      compileOutput: "",
      timeMs: null,
      memoryKb: null,
      exitCode: null,
    };
  }

  private async post(
    request: RunRequest,
  ): Promise<{ token: string } | { error: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/submissions?base64_encoded=false&wait=false`,
        {
          method: "POST",
          headers: this.headers(),
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
          body: JSON.stringify({
            source_code: request.source,
            language_id: request.languageId,
            stdin: request.stdin ?? "",
            expected_output: request.expectedOutput,
            cpu_time_limit:
              request.cpuTimeLimitSeconds ?? RUN_LIMITS.cpuTimeLimitSeconds,
            memory_limit: request.memoryLimitKb ?? RUN_LIMITS.memoryLimitKb,
            // Belt and braces: the sandbox should already deny network access,
            // but say so explicitly in case this engine defaults the other way.
            enable_network: false,
          }),
        },
      );

      if (!response.ok) {
        return { error: `The judge rejected the submission (HTTP ${response.status}).` };
      }

      const body = (await response.json()) as Judge0Submission;
      if (!body.token) return { error: "The judge did not return a submission token." };
      return { token: body.token };
    } catch (error) {
      console.error("Judge0 submit failed:", error);
      return { error: "Couldn't reach the code runner." };
    }
  }

  private async get(
    token: string,
  ): Promise<{ submission: Judge0Submission } | { error: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/submissions/${encodeURIComponent(token)}?base64_encoded=false`,
        {
          headers: this.headers(),
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        },
      );

      if (!response.ok) {
        return { error: `The judge returned HTTP ${response.status} while polling.` };
      }

      return { submission: (await response.json()) as Judge0Submission };
    } catch (error) {
      console.error("Judge0 poll failed:", error);
      return { error: "Lost contact with the code runner while waiting." };
    }
  }
}

function toRunResult(submission: Judge0Submission): RunResult {
  const mapped = JUDGE0_STATUS[submission.status?.id ?? 13] ?? {
    status: "internal-error" as const,
    label: submission.status?.description ?? "Unknown judge status",
  };

  return {
    status: mapped.status,
    statusLabel: mapped.label,
    stdout: submission.stdout ?? "",
    // `message` carries sandbox-level complaints (killed, forbidden syscall)
    // that never reach the program's own stderr.
    stderr: [submission.stderr, submission.message].filter(Boolean).join("\n").trim(),
    compileOutput: submission.compile_output ?? "",
    // Judge0 reports seconds as a string ("0.032").
    timeMs: submission.time ? Math.round(Number(submission.time) * 1000) : null,
    memoryKb: submission.memory ?? null,
    exitCode: submission.exit_code ?? null,
  };
}

function internalError(message: string): RunResult {
  return {
    status: "internal-error",
    statusLabel: message,
    stdout: "",
    stderr: "",
    compileOutput: "",
    timeMs: null,
    memoryKb: null,
    exitCode: null,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
