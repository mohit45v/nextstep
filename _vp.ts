import { prisma } from "@/lib/prisma";
import { getProgressSummary, recordAttempt, getAttemptReview } from "@/lib/attempts";

async function main() {
  const user = (await prisma.user.findFirst({ select: { id: true } }))!;
  const ids = (await prisma.question.findMany({ where: { status: "APPROVED", topicId: { not: null } }, select: { id: true }, take: 2 })).map((q) => q.id);

  const dup = await recordAttempt({
    userId: user.id, mode: "MOCK_EXAM", packId: "tcs-nqt",
    answers: [
      { questionId: ids[0], selectedOption: 0, timeSpentSeconds: 5 },
      { questionId: ids[0], selectedOption: 1, timeSpentSeconds: 5 },
      { questionId: ids[1], selectedOption: -1, timeSpentSeconds: 2 },
      { questionId: "ghost-question", selectedOption: 0, timeSpentSeconds: 1 },
    ],
  });
  console.log("duplicate + unknown ids →", dup);
  if (!("attemptId" in dup)) throw new Error("expected an attempt");

  const review = await getAttemptReview(user.id, dup.attemptId);
  console.log("rows stored:", review!.items.length, "| maxScore:", review!.maxScore, "| questions:", review!.items.map((i) => `${i.questionId.slice(0,4)}:${i.isSkipped ? "skip" : i.isCorrect ? "ok" : "wrong"}`));

  const started = Date.now();
  const progress = await getProgressSummary(user.id);
  console.log("progress in", Date.now() - started, "ms:", {
    attempts: progress.attemptsCount, answered: progress.questionsAnswered,
    correct: progress.correctCount, overall: progress.overallAccuracy,
    byTopic: progress.byTopic.map((t) => `${t.topic} ${t.correct}/${t.attempted}`),
  });

  await prisma.examAttempt.deleteMany({ where: { id: dup.attemptId } });
  console.log("attempts left:", await prisma.examAttempt.count());
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error("FAILED:", e); process.exitCode = 1; await prisma.$disconnect(); });
