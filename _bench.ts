import { prisma } from "@/lib/prisma";
import { getProgressSummary, getAttemptHistory } from "@/lib/attempts";
import { getTopics, getCompanyPacks, getExamPaper, getPracticeQuestions, getFormulaCards } from "@/lib/aptitude";
import { getDsaTopics, getDsaProblems } from "@/lib/dsa";
import { getReviewQueue } from "@/lib/admin";

async function time<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t = Date.now();
  const out = await fn();
  console.log(`${label.padEnd(28)} ${Date.now() - t} ms`);
  return out;
}

async function main() {
  const user = (await prisma.user.findFirst({ select: { id: true } }))!;
  await time("warm-up (SELECT 1)", () => prisma.$queryRaw`SELECT 1`);
  console.log("--- warm ---");
  await time("getTopics", () => getTopics());
  await time("getCompanyPacks", () => getCompanyPacks());
  await time("getFormulaCards", () => getFormulaCards());
  await time("getPracticeQuestions", () => getPracticeQuestions(user.id, "profit-loss"));
  await time("getExamPaper(tcs-nqt)", () => getExamPaper("tcs-nqt"));
  await time("getProgressSummary", () => getProgressSummary(user.id));
  await time("getAttemptHistory", () => getAttemptHistory(user.id));
  await time("getDsaTopics", () => getDsaTopics(user.id, "CS & IT"));
  await time("getDsaProblems", () => getDsaProblems(user.id, "arrays-hashing"));
  await time("getReviewQueue(DRAFT)", () => getReviewQueue({ status: "DRAFT" }));
  console.log("--- page-shaped (parallel) ---");
  await time("dashboard page", async () => Promise.all([getTopics(), getCompanyPacks(), getProgressSummary(user.id)]));
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); });
