/**
 * Imports questions from the AQuA-RAT dataset as DRAFTS.
 *
 *   npm run import:aqua -- --file ~/Downloads/train.json --limit 500
 *
 * Get the data first (Apache-2.0, ~100k questions, about 160 MB):
 *   curl -L -o train.json https://raw.githubusercontent.com/google-deepmind/AQuA/master/train.json
 *
 * Three properties this script is built around:
 *
 *  1. **It streams.** The file is JSON Lines — one object per line — so it is read
 *     line by line through `readline`. `JSON.parse(readFileSync(...))` on a 160 MB
 *     file would hold the whole thing plus the parsed object graph in memory, for
 *     the sake of importing 500 of its 100,000 lines.
 *  2. **It is idempotent.** AQuA items have no id, so the id is a SHA-256 of the
 *     normalised question text, stored as `sourceId`. With the unique index on
 *     (source, sourceId), re-running the importer updates rows instead of adding
 *     duplicates — including across different slices of the same file.
 *  3. **Nothing it writes is visible to a student.** Every row is `status: DRAFT`
 *     with no topic. A draft is unreachable from practice and from every exam
 *     paper until somebody reads it on /admin/questions and approves it. This is
 *     not politeness: AQuA's rationales are crowd-sourced and some of its stated
 *     answers are simply wrong.
 */
import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { config as loadEnv } from "dotenv";

loadEnv({ path: [".env.local", ".env"], quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import type { Category, Difficulty } from "../src/generated/prisma/enums";
import { DATASETS } from "../src/lib/datasets";

const SOURCE = "aqua-rat";
const dataset = DATASETS[SOURCE];

/* ---------------------------------------------------------------------------
   Arguments
   --------------------------------------------------------------------------- */

interface Options {
  file: string;
  limit: number;
  topicId: string | null;
  category: Category;
  difficulty: Difficulty;
  dryRun: boolean;
  concurrency: number;
}

function parseArgs(argv: string[]): Options {
  const get = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };

  const file = get("--file");
  if (!file) {
    throw new Error(
      "Usage: npm run import:aqua -- --file <path to AQuA train.json> [--limit 500] " +
        "[--topic <topicId>] [--category QUANTITATIVE] [--difficulty MEDIUM] " +
        "[--concurrency 8] [--dry-run]\n\n" +
        `Download it from ${dataset.url} — licence ${dataset.licence}.`,
    );
  }
  if (!existsSync(file)) throw new Error(`No such file: ${file}`);

  const limit = Number(get("--limit") ?? 500);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive whole number.");
  }

  const concurrency = Number(get("--concurrency") ?? 8);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
    throw new Error("--concurrency must be between 1 and 16.");
  }

  return {
    file,
    limit,
    concurrency,
    // Left null on purpose unless asked: a topic is an editorial decision, and
    // filing 500 algebra problems under one topic sight unseen is how a topic
    // ends up advertising questions nobody has read.
    topicId: get("--topic") ?? null,
    category: (get("--category") ?? "QUANTITATIVE") as Category,
    difficulty: (get("--difficulty") ?? "MEDIUM") as Difficulty,
    dryRun: argv.includes("--dry-run"),
  };
}

/* ---------------------------------------------------------------------------
   Mapping one AQuA item
   --------------------------------------------------------------------------- */

/** An AQuA line, as far as we rely on it. Everything is checked before use. */
interface AquaItem {
  question?: unknown;
  options?: unknown;
  rationale?: unknown;
  correct?: unknown;
}

interface MappedQuestion {
  sourceId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Collapses whitespace so two copies of the same question that differ only in
 * spacing hash to the same id. Without this the dedupe key would be defeated by
 * a stray double space.
 */
function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function sourceIdFor(prompt: string): string {
  return createHash("sha256").update(normalise(prompt)).digest("hex").slice(0, 32);
}

/** AQuA writes options as "A)1/2" or "a ) 1/2". The letter is the answer key. */
function stripOptionLabel(option: string): string {
  return normalise(option).replace(/^[A-Ea-e]\s*[).:-]\s*/, "");
}

/**
 * Maps one line, or explains why it cannot be used. Returning a reason rather
 * than throwing keeps one malformed line out of the import without killing the
 * other 499.
 */
function mapItem(raw: AquaItem): { ok: true; value: MappedQuestion } | { ok: false; reason: string } {
  const prompt = typeof raw.question === "string" ? normalise(raw.question) : "";
  if (prompt.length < 10) return { ok: false, reason: "question text missing or too short" };

  if (!Array.isArray(raw.options) || raw.options.length < 2) {
    return { ok: false, reason: "fewer than two options" };
  }
  const options = raw.options
    .filter((o): o is string => typeof o === "string")
    .map(stripOptionLabel)
    .filter((o) => o.length > 0);
  if (options.length !== raw.options.length) {
    return { ok: false, reason: "an option was empty or not a string" };
  }

  const correct = typeof raw.correct === "string" ? raw.correct.trim().toUpperCase() : "";
  const correctIndex = correct.charCodeAt(0) - 65; // "A" → 0
  if (correct.length !== 1 || correctIndex < 0 || correctIndex >= options.length) {
    return { ok: false, reason: `answer key "${correct}" does not point at an option` };
  }

  // AQuA's `rationale` is the worked reasoning. It becomes our `explanation`,
  // which is the whole reason this dataset is worth importing — an MCQ with no
  // method is a flashcard, not practice.
  const explanation =
    typeof raw.rationale === "string" ? raw.rationale.trim() : "";
  if (explanation.length < 10) return { ok: false, reason: "no rationale to use as an explanation" };

  return {
    ok: true,
    value: { sourceId: sourceIdFor(prompt), prompt, options, correctIndex, explanation },
  };
}

/**
 * Writes one question and its options.
 *
 * An `upsert` keyed on `(source, sourceId)` rather than read-then-write: it is
 * one round trip instead of two, and it closes the race between two importers
 * running at once — which happens more often than you would think, since the
 * obvious reaction to a slow import is to start another one.
 *
 * `status`, `topicId` and the review fields are never touched on update. A
 * re-import must not resurrect something an editor rejected, nor quietly demote
 * something they approved.
 */
async function writeQuestion(
  prisma: PrismaClient,
  question: MappedQuestion,
  options: Options,
): Promise<"created" | "updated" | "failed"> {
  const { sourceId, prompt, options: choices, correctIndex, explanation } = question;

  const shared = {
    prompt,
    explanation,
    category: options.category,
    difficulty: options.difficulty,
    licence: dataset.licence,
  };

  try {
    return await prisma.$transaction(
      async (tx) => {
      const before = await tx.question.findUnique({
        where: { source_sourceId: { source: SOURCE, sourceId } },
        select: { id: true },
      });

      const row = await tx.question.upsert({
        where: { source_sourceId: { source: SOURCE, sourceId } },
        create: {
          status: "DRAFT",
          source: SOURCE,
          sourceId,
          topicId: options.topicId,
          companyTags: [],
          ...shared,
        },
        update: shared,
        select: { id: true },
      });

      // Replace the option list wholesale: matching edited rows up by index
      // would quietly keep an option the source has since dropped.
      await tx.option.deleteMany({ where: { questionId: row.id } });
      await tx.option.createMany({
        data: choices.map((text, order) => ({
          questionId: row.id,
          order,
          text,
          isCorrect: order === correctIndex,
        })),
      });

        return before ? "updated" : "created";
      },
      {
        // Defaults are 2s to get a connection and 5s to finish. Opening a
        // connection to a hosted database takes about three seconds, so on a
        // cold pool every transaction in the first batch failed with "Unable to
        // start a transaction in the given time" — a timeout that had nothing to
        // do with the work being slow.
        maxWait: 20_000,
        timeout: 30_000,
      },
    );
  } catch (error) {
    // A concurrent importer can win the race between the lookup and the insert.
    // That is the unique index doing its job, so count it as an update rather
    // than failing the run.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return "updated";
    }
    console.error(`  ! ${sourceId}: ${error instanceof Error ? error.message : error}`);
    return "failed";
  }
}

/* ---------------------------------------------------------------------------
   Import
   --------------------------------------------------------------------------- */

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Fill in .env.local (or .env) first.");
  }
  // The pool is sized to the batch: `--concurrency 8` wants eight connections,
  // and opening one against a hosted database costs seconds, so they are kept
  // for the whole run rather than reopened between batches.
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: options.concurrency,
      idleTimeoutMillis: 5 * 60 * 1000,
      connectionTimeoutMillis: 15_000,
    }),
  });

  if (options.topicId) {
    const topic = await prisma.topic.findUnique({ where: { id: options.topicId } });
    if (!topic) {
      await prisma.$disconnect();
      throw new Error(
        `No topic with id "${options.topicId}". Run \`npx prisma db seed\` or pick one of: ` +
          (await prisma.topic.findMany({ select: { id: true } })).map((t) => t.id).join(", "),
      );
    }
  }

  // Open the pool before the first batch rather than during it: connections
  // cost seconds each, and a transaction that is waiting for one counts that
  // wait against its own deadline.
  await Promise.all(
    Array.from({ length: options.concurrency }, () =>
      prisma.$queryRaw`SELECT 1`.catch(() => undefined),
    ),
  );

  console.log(`Importing from ${options.file}`);
  console.log(`  source     ${SOURCE} (${dataset.licence})`);
  console.log(`  limit      ${options.limit}`);
  console.log(`  topic      ${options.topicId ?? "none — assign one during review"}`);
  console.log(`  status     DRAFT (never served to students)`);
  if (options.dryRun) console.log("  DRY RUN — nothing will be written\n");
  else console.log("");

  const stream = createInterface({
    input: createReadStream(options.file, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lines = 0;
  let created = 0;
  let updated = 0;
  let invalid = 0;
  let failed = 0;
  let duplicateInFile = 0;
  let lastReported = 0;
  const seen = new Set<string>();
  const reasons = new Map<string, number>();
  const pending: MappedQuestion[] = [];

  /**
   * Writes one batch of questions concurrently.
   *
   * Each question is its own transaction — a batch is a unit of parallelism, not
   * a unit of atomicity. One malformed row should not roll back the other seven,
   * and a question plus its options is the thing that must be all-or-nothing.
   */
  async function writeBatch(batch: MappedQuestion[]) {
    const results = await Promise.all(
      batch.map((question) => writeQuestion(prisma, question, options)),
    );
    return {
      created: results.filter((r) => r === "created").length,
      updated: results.filter((r) => r === "updated").length,
      failed: results.filter((r) => r === "failed").length,
    };
  }

  for await (const line of stream) {
    // Count what is queued as well as what is written, or a batch in flight
    // would let the loop read past --limit.
    if (created + updated + duplicateInFile + pending.length >= options.limit) break;

    const text = line.trim();
    if (!text) continue;
    lines += 1;

    let raw: AquaItem;
    try {
      raw = JSON.parse(text) as AquaItem;
    } catch {
      invalid += 1;
      reasons.set("line is not valid JSON", (reasons.get("line is not valid JSON") ?? 0) + 1);
      continue;
    }

    const mapped = mapItem(raw);
    if (!mapped.ok) {
      invalid += 1;
      reasons.set(mapped.reason, (reasons.get(mapped.reason) ?? 0) + 1);
      continue;
    }

    // The same question can appear more than once in the file; count it, and do
    // not spend a database round-trip on it.
    if (seen.has(mapped.value.sourceId)) {
      duplicateInFile += 1;
      continue;
    }
    seen.add(mapped.value.sourceId);

    if (options.dryRun) {
      created += 1;
      continue;
    }

    pending.push(mapped.value);

    // Flush a batch whenever enough work has accumulated. Each question is a few
    // round trips to a database a few hundred milliseconds away, so doing them
    // one after another is almost entirely waiting — the pool does the same work
    // in a fraction of the wall time.
    if (pending.length >= options.concurrency) {
      const batch = pending.splice(0, pending.length);
      const outcome = await writeBatch(batch);
      created += outcome.created;
      updated += outcome.updated;
      failed += outcome.failed;
    }

    // Progress in round hundreds. Batched writes jump several at a time, so an
    // exact `% 100` test would usually miss.
    const done = created + updated;
    if (done - lastReported >= 100) {
      lastReported = done - (done % 100);
      console.log(`  …${lastReported} questions`);
    }
  }

  stream.close();

  // The last partial batch. Without this, up to `concurrency - 1` questions
  // would be read, counted and then quietly never written.
  if (pending.length > 0 && !options.dryRun) {
    const outcome = await writeBatch(pending.splice(0, pending.length));
    created += outcome.created;
    updated += outcome.updated;
    failed += outcome.failed;
  }

  console.log("\nDone.");
  console.log(`  lines read        ${lines}`);
  console.log(`  created           ${created}`);
  console.log(`  updated           ${updated}`);
  if (failed > 0) console.log(`  failed to write   ${failed}`);
  console.log(`  duplicate in file ${duplicateInFile}`);
  console.log(`  skipped (invalid) ${invalid}`);
  for (const [reason, count] of [...reasons.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${count} × ${reason}`);
  }

  if (!options.dryRun) {
    const drafts = await prisma.question.count({ where: { source: SOURCE, status: "DRAFT" } });
    console.log(
      `\n${drafts} ${SOURCE} drafts are waiting for review at /admin/questions.` +
        "\nNothing imported is served to a student until it is approved there.",
    );
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
