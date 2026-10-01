/**
 * Rebuilds the aptitude content tables from `prisma/seed-data.ts`.
 *
 *   npm run db:seed        (or: npx prisma db seed)
 *
 * Idempotent by design: every write is an upsert keyed on the content's own
 * stable id, and a question's options are replaced wholesale rather than
 * appended. Running it twice leaves the database in the same state as running
 * it once, which is what makes it safe to run after every schema change.
 *
 * It does not touch users, attempts or bookmarks — only content.
 */
import { config as loadEnv } from "dotenv";

// Must run before the Prisma client reads DATABASE_URL. The Prisma CLI loads
// prisma.config.ts for its own commands, but `tsx prisma/seed.ts` is a plain
// Node process and gets nothing for free.
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CATEGORY_BY_LABEL,
  DIFFICULTY_BY_LABEL,
  PACK_DIFFICULTY_BY_LABEL,
} from "../src/lib/aptitude-labels";
import { DSA_BRANCH_BY_LABEL } from "../src/lib/dsa-labels";
import {
  APTITUDE_TOPICS,
  COMPANY_PACKS,
  FORMULA_CARDS,
  SAMPLE_QUESTIONS,
} from "./seed-data";
import { DSA_PROBLEMS, DSA_TOPICS } from "./seed-data-dsa";

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Fill in .env.local (or .env) before seeding.",
    );
  }
  return url;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: connectionString() }),
});

async function seedTopics() {
  for (const [index, topic] of APTITUDE_TOPICS.entries()) {
    const data = {
      name: topic.name,
      category: CATEGORY_BY_LABEL[topic.category],
      iconName: topic.iconName,
      description: topic.description,
      order: index,
    };

    await prisma.topic.upsert({
      where: { id: topic.id },
      create: { id: topic.id, ...data },
      update: data,
    });
  }
  console.log(`  topics           ${APTITUDE_TOPICS.length}`);
}

async function seedQuestions() {
  const topicIds = new Set(APTITUDE_TOPICS.map((t) => t.id));

  for (const question of SAMPLE_QUESTIONS) {
    // Fail loudly rather than inserting a question nobody can reach. A typo in
    // `topicId` used to mean the question silently vanished from its topic.
    if (!topicIds.has(question.topicId)) {
      throw new Error(
        `Question ${question.id} references unknown topic "${question.topicId}".`,
      );
    }
    if (
      question.correctOption < 0 ||
      question.correctOption >= question.options.length
    ) {
      throw new Error(
        `Question ${question.id} has correctOption ${question.correctOption}, ` +
          `outside its ${question.options.length} options.`,
      );
    }

    const data = {
      topicId: question.topicId,
      // Hand-written and reviewed by whoever wrote this file, so it seeds as
      // APPROVED. Everything that arrives from an importer starts as DRAFT —
      // see scripts/import-aqua.ts.
      status: "APPROVED" as const,
      source: "curated",
      sourceId: question.id,
      licence: null,
      category: CATEGORY_BY_LABEL[question.category],
      prompt: question.question,
      explanation: question.explanation,
      shortcutTip: question.shortcutTip ?? null,
      formulaUsed: question.formulaUsed ?? null,
      difficulty: DIFFICULTY_BY_LABEL[question.difficulty],
      companyTags: question.companyTags,
    };

    await prisma.question.upsert({
      where: { id: question.id },
      create: { id: question.id, ...data },
      update: data,
    });

    // Replace rather than merge: an edited option list must not leave the old
    // wording behind as a seventh choice.
    await prisma.option.deleteMany({ where: { questionId: question.id } });
    await prisma.option.createMany({
      data: question.options.map((text, order) => ({
        questionId: question.id,
        order,
        text,
        isCorrect: order === question.correctOption,
      })),
    });
  }
  console.log(`  questions        ${SAMPLE_QUESTIONS.length}`);
}

async function seedFormulaCards() {
  for (const [index, card] of FORMULA_CARDS.entries()) {
    const data = {
      category: CATEGORY_BY_LABEL[card.category],
      topic: card.topic,
      title: card.title,
      formula: card.formula,
      keyRule: card.keyRule,
      example: card.example,
      order: index,
    };

    await prisma.formulaCard.upsert({
      where: { id: card.id },
      create: { id: card.id, ...data },
      update: data,
    });
  }
  console.log(`  formula cards    ${FORMULA_CARDS.length}`);
}

async function seedCompanyPacks() {
  for (const [index, pack] of COMPANY_PACKS.entries()) {
    const data = {
      companyName: pack.companyName,
      logoColor: pack.logoColor,
      testTitle: pack.testTitle,
      durationMinutes: pack.durationMinutes,
      cutoffPercentage: pack.cutoffPercentage,
      difficulty: PACK_DIFFICULTY_BY_LABEL[pack.difficulty],
      description: pack.description,
      order: index,
    };

    await prisma.companyPack.upsert({
      where: { id: pack.id },
      create: { id: pack.id, ...data },
      update: data,
    });

    await prisma.companyPackSection.deleteMany({ where: { packId: pack.id } });
    await prisma.companyPackSection.createMany({
      data: pack.sections.map((section, order) => ({
        packId: pack.id,
        name: section.name,
        questionCount: section.questionCount,
        category: CATEGORY_BY_LABEL[section.category],
        order,
      })),
    });
  }
  console.log(`  company packs    ${COMPANY_PACKS.length}`);
}

/* ---------------------------------------------------------------------------
   DSA hub
   --------------------------------------------------------------------------- */

async function seedDsa() {
  for (const [index, topic] of DSA_TOPICS.entries()) {
    const data = {
      name: topic.name,
      description: topic.description,
      branch: DSA_BRANCH_BY_LABEL[topic.branch],
      order: index,
    };

    await prisma.dsaTopic.upsert({
      where: { id: topic.id },
      create: { id: topic.id, ...data },
      update: data,
    });
  }

  let problemCount = 0;
  for (const [topicId, problems] of Object.entries(DSA_PROBLEMS)) {
    if (!DSA_TOPICS.some((t) => t.id === topicId)) {
      throw new Error(`DSA problems reference unknown topic "${topicId}".`);
    }

    for (const [index, problem] of problems.entries()) {
      const data = {
        topicId,
        title: problem.title,
        difficulty: DIFFICULTY_BY_LABEL[
          (problem.difficulty.charAt(0).toUpperCase() +
            problem.difficulty.slice(1)) as "Easy" | "Medium" | "Hard"
        ],
        link: problem.link ?? null,
        description: problem.description ?? null,
        order: index,
      };

      await prisma.dsaProblem.upsert({
        where: { id: problem.id },
        create: { id: problem.id, ...data },
        update: data,
      });
      problemCount += 1;
    }
  }

  console.log(`  dsa topics       ${DSA_TOPICS.length}`);
  console.log(`  dsa problems     ${problemCount}`);
}

async function main() {
  console.log("Seeding content…");
  await seedTopics();
  await seedQuestions();
  await seedFormulaCards();
  await seedCompanyPacks();
  await seedDsa();
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("\nSeed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
