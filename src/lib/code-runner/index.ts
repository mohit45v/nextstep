import { DockerRunner } from "./docker";
import { Judge0Runner } from "./judge0";
import type { CodeRunner, RunResult } from "./types";

export * from "./types";
export { Judge0Runner } from "./judge0";
export { DockerRunner } from "./docker";

/**
 * The runner this deployment uses.
 *
 * Two implementations, one interface, chosen by environment:
 *
 *   CODE_RUNNER_URL="http://…"   a Judge0-compatible server (production)
 *   CODE_RUNNER="docker"         throwaway containers via the local Docker CLI
 *   neither                      nothing executes, and the page says so
 *
 * A URL wins if both are set, because a real judge beats a laptop.
 *
 * The Docker runner is **refused in production**. It drives the Docker CLI, so
 * the web process can reach the Docker daemon — and that is root on the host by
 * another name. On a development machine the same user already runs `docker`
 * themselves, so it grants nothing new; on a server it would be a hole, and a
 * misplaced environment variable must not be all that stands between the two.
 */

class NotConfiguredRunner implements CodeRunner {
  readonly name: string;
  readonly configured = false;

  constructor(name = "No runner configured") {
    this.name = name;
  }

  async run(): Promise<RunResult> {
    return {
      status: "internal-error",
      statusLabel: `${this.name}. Nothing can execute until one is set up.`,
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
  cached = selectRunner();
  return cached;
}

function selectRunner(): CodeRunner {
  const url = process.env.CODE_RUNNER_URL?.trim();
  if (url) {
    return new Judge0Runner(
      url,
      process.env.CODE_RUNNER_TOKEN?.trim() || undefined,
      process.env.CODE_RUNNER_NAME?.trim() || "Judge0-compatible runner",
    );
  }

  if (process.env.CODE_RUNNER?.trim().toLowerCase() === "docker") {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "CODE_RUNNER=docker is ignored in production: it would give the web " +
          "process control of the Docker daemon. Point CODE_RUNNER_URL at a " +
          "Judge0-compatible server instead.",
      );
      return new NotConfiguredRunner(
        "The Docker runner is development-only, and this server is in production mode",
      );
    }
    return new DockerRunner();
  }

  return new NotConfiguredRunner();
}

/** For the UI: whether running code will work at all right now. */
export function isCodeRunnerConfigured(): boolean {
  return getCodeRunner().configured;
}
