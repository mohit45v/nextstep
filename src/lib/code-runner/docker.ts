import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  RUN_LIMITS,
  type CodeRunner,
  type RunRequest,
  type RunResult,
} from "./types";

/**
 * Runs each submission in a throwaway Docker container.
 *
 * This exists because Judge0 cannot run on a current Docker Desktop: its
 * sandbox, `isolate`, needs cgroup v1, and Docker Desktop's VM is cgroup v2
 * only — every submission fails with "Failed to create control group". Rather
 * than give up on a local playground, this is a second implementation of the
 * same `CodeRunner` interface. Nothing above the seam changed to add it, which
 * is the argument for having had a seam.
 *
 * **It is a development runner.** `getCodeRunner` refuses to select it in
 * production, because driving the Docker CLI means the web process can talk to
 * the Docker daemon, and anything that can talk to the Docker daemon can own the
 * host. On a laptop, where the same user already runs `docker` by hand, that
 * changes nothing. In production, use Judge0 — it is a separate service for
 * exactly this reason.
 *
 * What the sandbox actually enforces, per submission:
 *
 *   --network none          no DNS, no sockets, no exfiltration
 *   --memory / --memory-swap  hard cap with swap disabled, so OOM is a kill
 *   --pids-limit            a fork bomb hits a wall
 *   --cpus                  one core, so a busy loop cannot starve the machine
 *   --user <uid>:<gid>      never root inside the container
 *   --security-opt no-new-privileges   setuid binaries cannot escalate
 *   --cap-drop ALL          no capabilities at all
 *   a wall-clock kill from the host, because a container that ignores its own
 *   limits is still our problem
 */

interface DockerLanguage {
  image: string;
  sourceFile: string;
  /** Shell command that compiles. Exit non-zero means a compile error. */
  compile?: string;
  /** Shell command that runs the program. Inherits the student's stdin. */
  run: string;
  /** Overrides the default memory cap — the JVM needs more than a script does. */
  memoryMb?: number;
}

/**
 * Keyed by Judge0 language id, so a submission means the same thing whichever
 * runner handles it and switching engines never renumbers the UI.
 */
export const DOCKER_LANGUAGES: Record<number, DockerLanguage> = {
  71: {
    image: process.env.CODE_RUNNER_IMAGE_PYTHON ?? "python:3.12-alpine",
    sourceFile: "main.py",
    run: "python3 main.py",
  },
  63: {
    image: process.env.CODE_RUNNER_IMAGE_NODE ?? "node:22-alpine",
    sourceFile: "main.js",
    run: "node main.js",
  },
  54: {
    image: process.env.CODE_RUNNER_IMAGE_CPP ?? "gcc:14",
    sourceFile: "main.cpp",
    compile: "g++ -O2 -std=gnu++17 -o main main.cpp",
    run: "./main",
  },
  62: {
    image: process.env.CODE_RUNNER_IMAGE_JAVA ?? "eclipse-temurin:21-jdk-alpine",
    sourceFile: "Main.java",
    compile: "javac Main.java",
    run: "java -XX:+UseSerialGC -Xss64m Main",
    // A JVM in 256 MB spends its time fighting the heap rather than running the
    // program.
    memoryMb: 512,
  },
};

/** Exit code the wrapper uses to say "compilation failed", distinct from the
 *  program's own exit codes. 42 is outside the range a compiler returns. */
const COMPILE_FAILED = 42;

/** Output is capped so one `while True: print(x)` cannot exhaust the server. */
const MAX_OUTPUT_BYTES = 64 * 1024;

export class DockerRunner implements CodeRunner {
  readonly name = "Local Docker sandbox";
  readonly configured = true;

  /** Images confirmed present. Only positives are cached: an image that was
   *  missing a minute ago may have been pulled since. */
  private readonly imagePresent = new Set<string>();

  async run(request: RunRequest): Promise<RunResult> {
    const language = DOCKER_LANGUAGES[request.languageId];
    if (!language) {
      return failure(`No Docker image is configured for language ${request.languageId}.`);
    }

    if (!(await this.hasImage(language.image))) {
      return failure(
        `The image for this language isn't pulled yet. Run: docker pull ${language.image}`,
      );
    }

    const dir = await mkdtemp(join(tmpdir(), "nextstep-run-"));
    const containerName = `nextstep-run-${randomUUID()}`;

    try {
      await writeFile(join(dir, language.sourceFile), request.source, "utf8");

      const cpuSeconds = request.cpuTimeLimitSeconds ?? RUN_LIMITS.cpuTimeLimitSeconds;
      const memoryMb =
        language.memoryMb ??
        Math.round((request.memoryLimitKb ?? RUN_LIMITS.memoryLimitKb) / 1024);

      // The compile step is guarded rather than `&&`-chained so a failure is
      // reported as a compile error instead of looking like the program exiting
      // non-zero. `exec` replaces the shell, so the program owns stdin and its
      // exit code reaches us unchanged.
      const script = language.compile
        ? `if ! ${language.compile}; then exit ${COMPILE_FAILED}; fi\nexec ${language.run}`
        : `exec ${language.run}`;

      const args = [
        "run",
        "--rm",
        "-i",
        "--name",
        containerName,
        "--network",
        "none",
        "--memory",
        `${memoryMb}m`,
        "--memory-swap",
        `${memoryMb}m`,
        "--pids-limit",
        "128",
        "--cpus",
        "1",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--user",
        `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
        "-v",
        `${dir}:/work`,
        "-w",
        "/work",
        // Compilers and the JVM need somewhere to write; a size-capped tmpfs
        // gives them that without a writable image layer.
        "--tmpfs",
        "/tmp:rw,size=64m,exec",
        "-e",
        "HOME=/tmp",
        language.image,
        "sh",
        "-c",
        script,
      ];

      // Wall-clock budget: the CPU limit plus room for container start. A
      // program that ignores its own limits is still killed from out here.
      const wallMs = cpuSeconds * 1000 + 3000;
      return await this.spawnDocker(args, containerName, request.stdin ?? "", wallMs);
    } catch (error) {
      console.error("Docker runner failed:", error);
      return failure("The local Docker sandbox failed to start.");
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private async hasImage(image: string): Promise<boolean> {
    if (this.imagePresent.has(image)) return true;

    const present = await new Promise<boolean>((resolve) => {
      const child = spawn("docker", ["image", "inspect", image], { stdio: "ignore" });
      child.on("error", () => resolve(false));
      child.on("close", (code) => resolve(code === 0));
    });

    if (present) this.imagePresent.add(image);
    return present;
  }

  private spawnDocker(
    args: string[],
    containerName: string,
    stdin: string,
    wallMs: number,
  ): Promise<RunResult> {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const child = spawn("docker", args);

      let stdout = "";
      let stderr = "";
      let truncated = false;
      let timedOut = false;

      const append = (current: string, chunk: Buffer) => {
        if (current.length >= MAX_OUTPUT_BYTES) {
          truncated = true;
          return current;
        }
        const next = current + chunk.toString("utf8");
        if (next.length > MAX_OUTPUT_BYTES) {
          truncated = true;
          return next.slice(0, MAX_OUTPUT_BYTES);
        }
        return next;
      };

      child.stdout.on("data", (chunk: Buffer) => {
        stdout = append(stdout, chunk);
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr = append(stderr, chunk);
      });

      const timer = setTimeout(() => {
        timedOut = true;
        // Kill the container, not just the CLI: killing `docker run` leaves the
        // container running and the program burning a core.
        spawn("docker", ["kill", containerName], { stdio: "ignore" });
      }, wallMs);

      child.on("error", () => {
        clearTimeout(timer);
        resolve(failure("Couldn't start Docker. Is Docker Desktop running?"));
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        const timeMs = Date.now() - startedAt;
        const note = truncated ? "\n\n[output truncated]" : "";

        if (timedOut) {
          resolve({
            status: "time-limit",
            statusLabel: "Time limit exceeded",
            stdout: stdout + note,
            stderr,
            compileOutput: "",
            timeMs,
            timeNote: "wall clock, including container start",
            memoryKb: null,
            exitCode: null,
          });
          return;
        }

        if (code === COMPILE_FAILED) {
          resolve({
            status: "compile-error",
            statusLabel: "Compilation error",
            stdout: "",
            // Everything the compiler said arrives on stderr; it belongs in the
            // compiler panel, not beside a runtime crash.
            stderr: "",
            compileOutput: stderr + note,
            timeMs,
            timeNote: "wall clock, including container start",
            memoryKb: null,
            exitCode: null,
          });
          return;
        }

        // 137 is SIGKILL. We did not send it (that path is handled above), so
        // the kernel's OOM killer did, which means the memory cap was hit.
        if (code === 137) {
          resolve({
            status: "memory-limit",
            statusLabel: "Out of memory",
            stdout: stdout + note,
            stderr,
            compileOutput: "",
            timeMs,
            timeNote: "wall clock, including container start",
            memoryKb: null,
            exitCode: code,
          });
          return;
        }

        resolve({
          status: code === 0 ? "accepted" : "runtime-error",
          statusLabel: code === 0 ? "Finished" : `Runtime error (exit ${code})`,
          stdout: stdout + note,
          stderr,
          compileOutput: "",
          timeMs,
          timeNote: "wall clock, including container start",
          memoryKb: null,
          exitCode: code,
        });
      });

      child.stdin.on("error", () => undefined); // the program may not read stdin
      child.stdin.end(stdin);
    });
  }
}

function failure(message: string): RunResult {
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
