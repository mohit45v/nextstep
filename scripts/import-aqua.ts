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
import { PrismaClient } from "../src/generated/prisma/client";
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
        "[--topic <topicId>] [--category QUANTITATIVE] [--difficulty MEDIUM] [--dry-run]\n\n" +
        `Download it from ${dataset.url} — licence ${dataset.licence}.`,
    );
  }
  if (!existsSync(file)) throw new Error(`No such file: ${file}`);

  const limit = Number(get("--limit") ?? 500);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive whole number.");
  }

  return {
    file,
    limit,
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

/* ---------------------------------------------------------------------------
   Import
   --------------------------------------------------------------------------- */

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Fill in .env.local (or .env) first.");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

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
  let duplicateInFile = 0;
  const seen = new Set<string>();
  const reasons = new Map<string, number>();

  for await (const line of stream) {
    if (created + updated + duplicateInFile >= options.limit) break;

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

    const { sourceId, prompt, options: choices, correctIndex, explanation } = mapped.value;

    const existing = await prisma.question.findUnique({
      where: { source_sourceId: { source: SOURCE, sourceId } },
      select: { id: true, status: true },
    });

    // One transaction per question: the question and its options are a unit, and
    // a question with half its options would be worse than no question.
    await prisma.$transaction(async (tx) => {
      const question = existing
        ? await tx.question.update({
            where: { id: existing.id },
            data: {
              prompt,
              explanation,
              // Re-importing must not quietly resurrect something an editor
              // rejected, nor demote something they approved — so `status`,
              // `topicId` and the review fields are left exactly as they are.
              category: options.category,
              difficulty: options.difficulty,
              licence: dataset.licence,
            },
            select: { id: true },
          })
        : await tx.question.create({
            data: {
              status: "DRAFT",
              source: SOURCE,
              sourceId,
              licence: dataset.licence,
              topicId: options.topicId,
              category: options.category,
              difficulty: options.difficulty,
              prompt,
              explanation,
              companyTags: [],
            },
            select: { id: true },
          });

      await tx.option.deleteMany({ where: { questionId: question.id } });
      await tx.option.createMany({
        data: choices.map((optionText, order) => ({
          questionId: question.id,
          order,
          text: optionText,
          isCorrect: order === correctIndex,
        })),
      });
    });

    if (existing) updated += 1;
    else created += 1;

    const done = created + updated;
    if (done % 100 === 0) console.log(`  …${done} questions`);
  }

  stream.close();

  console.log("\nDone.");
  console.log(`  lines read        ${lines}`);
  console.log(`  created           ${created}`);
  console.log(`  updated           ${updated}`);
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
