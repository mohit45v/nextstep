/**
 * The seam between NextStep and whatever actually executes student code.
 *
 * Nothing above this file knows which engine is running. That is the whole
 * point: the runner is self-hosted [CodeBox](https://github.com/hiteshchoudhary/Codebox)
 * today, a hosted Judge0 tomorrow, and the only thing that changes is an
 * environment variable.
 *
 * The interface is modelled on the Judge0 REST shape because CodeBox is
 * Judge0-compatible — but the types here are ours, so a different engine can be
 * adapted to them without the UI noticing.
 */

/**
 * What became of a submission.
 *
 * Each value needs its own treatment in the UI: "something went wrong" tells a
 * student nothing, while "your program was still running after 5 seconds" tells
 * them to look for an infinite loop.
 */
export type RunStatus =
  | "queued"
  | "running"
  | "accepted"
  | "wrong-answer"
  | "compile-error"
  | "runtime-error"
  | "time-limit"
  | "memory-limit"
  | "internal-error";

export interface RunRequest {
  source: string;
  /** Judge0 language id — see SUPPORTED_LANGUAGES. */
  languageId: number;
  stdin?: string;
  /** When set, the engine compares its own output and reports wrong-answer. */
  expectedOutput?: string;
  cpuTimeLimitSeconds?: number;
  memoryLimitKb?: number;
}

export interface RunResult {
  status: RunStatus;
  /** One line a student can act on, e.g. "Compilation error". */
  statusLabel: string;
  stdout: string;
  stderr: string;
  /** Compiler diagnostics; empty for interpreted languages. */
  compileOutput: string;
  /** Wall/CPU time the engine reported, in milliseconds. Null when unknown. */
  timeMs: number | null;
  memoryKb: number | null;
  exitCode: number | null;
}

export interface Language {
  id: number;
  name: string;
  /** Monaco's identifier for syntax highlighting. */
  monaco: string;
  /** Starter code, so the editor is never an empty box. */
  template: string;
}

export interface CodeRunner {
  /** Shown in the UI so a student knows what executed their code. */
  readonly name: string;
  /** False when the environment has no runner configured. */
  readonly configured: boolean;
  run(request: RunRequest): Promise<RunResult>;
}

/**
 * The languages the playground offers.
 *
 * Judge0 CE ids, which are stable across installations — that stability is what
 * lets the same id work against CodeBox locally and a hosted Judge0 in
 * production. Four languages, because those are the four a campus test asks for.
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    id: 71,
    name: "Python 3",
    monaco: "python",
    template: `# Read input with input(), print the answer.\n\nname = input().strip() or "world"\nprint(f"Hello, {name}!")\n`,
  },
  {
    id: 63,
    name: "JavaScript (Node)",
    monaco: "javascript",
    template: `// Read stdin, print the answer.\nconst data = require("fs").readFileSync(0, "utf8").trim();\nconsole.log(\`Hello, \${data || "world"}!\`);\n`,
  },
  {
    id: 54,
    name: "C++ (GCC)",
    monaco: "cpp",
    template: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    if (name.empty()) name = "world";\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}\n`,
  },
  {
    id: 62,
    name: "Java",
    monaco: "java",
    // Judge0 requires the entry class to be called Main.
    template: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.hasNextLine() ? sc.nextLine().trim() : "";\n        if (name.isEmpty()) name = "world";\n        System.out.println("Hello, " + name + "!");\n    }\n}\n`,
  },
];

export function languageById(id: number): Language | undefined {
  return SUPPORTED_LANGUAGES.find((language) => language.id === id);
}

/** Limits applied to every run. Generous for practice, far short of a fork bomb. */
export const RUN_LIMITS = {
  cpuTimeLimitSeconds: 5,
  memoryLimitKb: 256_000,
  /** Characters. A campus solution is a few hundred lines at most. */
  maxSourceLength: 64_000,
  maxStdinLength: 16_000,
  /** How long we wait for the engine before giving up on the whole submission. */
  pollTimeoutMs: 20_000,
} as const;
