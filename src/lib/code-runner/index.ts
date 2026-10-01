import { Judge0Runner } from "./judge0";
import type { CodeRunner, RunResult } from "./types";

export * from "./types";
export { Judge0Runner } from "./judge0";

/**
 * The runner this deployment uses.
 *
 * Configuration is two environment variables and nothing else:
 *
 *   CODE_RUNNER_URL    http://localhost:2358   (CodeBox or Judge0)
 *   CODE_RUNNER_TOKEN  optional X-Auth-Token
 *
 * With no URL set, `NotConfiguredRunner` answers every request with an honest
 * explanation instead of a crash — a deployment without Docker is a normal state
 * for this project, not an error, and the playground says so plainly.
 */

class NotConfiguredRunner implements CodeRunner {
  readonly name = "No runner configured";
  readonly configured = false;

  async run(): Promise<RunResult> {
    return {
      status: "internal-error",
      statusLabel: "No code runner is configured on this server",
      stdout: "",
      stderr: "",
      compileOutput: "",
      timeMs: null,
      memoryKb: null,
      exitCode: null,
    };
  }
}

let cached: CodeRunner | null = null;

export function getCodeRunner(): CodeRunner {
  if (cached) return cached;

  const url = process.env.CODE_RUNNER_URL?.trim();
  cached = url
    ? new Judge0Runner(
        url,
        process.env.CODE_RUNNER_TOKEN?.trim() || undefined,
        process.env.CODE_RUNNER_NAME?.trim() || "Judge0-compatible runner",
      )
    : new NotConfiguredRunner();

  return cached;
}

/** For the UI: whether running code will work at all right now. */
export function isCodeRunnerConfigured(): boolean {
  return getCodeRunner().configured;
}
