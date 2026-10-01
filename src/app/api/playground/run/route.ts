import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import {
  RUN_LIMITS,
  SUPPORTED_LANGUAGES,
  getCodeRunner,
  languageById,
} from "@/lib/code-runner";

/**
 * Runs a snippet from the playground.
 *
 * Executing code someone typed is the most dangerous thing this app does, so the
 * checks here are deliberate:
 *
 *  * **Signed in.** Never anonymous.
 *  * **A known language id.** The id is passed to the engine, and an arbitrary
 *    number is an arbitrary engine configuration.
 *  * **Bounded source and stdin.** A 10 MB paste costs us nothing to reject and
 *    a lot to forward.
 *  * **Rate limited per student.** One person cannot fill the judge's queue.
 *
 * The sandbox itself — no network, non-root, CPU/memory/time caps — is the
 * engine's job, which is exactly why the engine is a separate service and not an
 * `exec()` in this process.
 */
const runSchema = z.object({
  source: z.string().min(1, "Write some code first.").max(RUN_LIMITS.maxSourceLength),
  languageId: z
    .number()
    .int()
    .refine((id) => SUPPORTED_LANGUAGES.some((language) => language.id === id), {
      message: "That language isn't available here.",
    }),
  stdin: z.string().max(RUN_LIMITS.maxStdinLength).optional(),
});

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  const limit = rateLimit({
    key: `playground:${user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `That's a lot of runs. Try again in ${limit.retryAfterSeconds}s.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const parsed = runSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const runner = getCodeRunner();
  if (!runner.configured) {
    // 503, not 500: the server is fine, the dependency is absent. The UI uses
    // this to explain the setup rather than claim a bug.
    return NextResponse.json(
      {
        success: false,
        error:
          "No code runner is configured. Set CODE_RUNNER_URL to a Judge0-compatible server.",
      },
      { status: 503 },
    );
  }

  const language = languageById(parsed.data.languageId);
  const result = await runner.run({
    source: parsed.data.source,
    languageId: parsed.data.languageId,
    stdin: parsed.data.stdin,
  });

  return NextResponse.json({
    success: true,
    data: { ...result, language: language?.name ?? String(parsed.data.languageId) },
  });
}
