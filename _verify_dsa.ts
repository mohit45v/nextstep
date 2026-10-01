import { prisma } from "@/lib/prisma";
import { getDsaTopics, getDsaProblems, setProblemSolved, getDsaProgress, getCodeforcesProblems, isCodeforcesTag } from "@/lib/dsa";
import { defaultBranchForProgramme } from "@/lib/dsa-labels";

async function main() {
  const user = (await prisma.user.findFirst({ select: { id: true, branch: true } }))!;
  console.log("branch →", user.branch, "→ default sheet:", defaultBranchForProgramme(user.branch));

  const all = await getDsaTopics(user.id);
  console.log("topics:", all.map((t) => `${t.id} ${t.solvedCount}/${t.problemCount}`).join(" | "));

  const cs = await getDsaTopics(user.id, "CS & IT");
  console.log("CS & IT only:", cs.length, "topics");

  const problems = await getDsaProblems(user.id, "arrays-hashing");
  console.log("arrays-hashing:", problems.length, "problems; first:", problems[0].title, "| solved:", problems[0].solved, "| difficulty:", problems[0].difficulty);

  // Tick, tick again (idempotent), untick.
  console.log("tick:", await setProblemSolved(user.id, "ah-1", true));
  console.log("tick again:", await setProblemSolved(user.id, "ah-1", true));
  console.log("rows for ah-1:", await prisma.problemSolve.count({ where: { userId: user.id, problemId: "ah-1" } }));
  console.log("topic count after tick:", (await getDsaTopics(user.id, "CS & IT"))[0].solvedCount);
  console.log("progress:", await getDsaProgress(user.id));
  console.log("unknown problem:", await setProblemSolved(user.id, "does-not-exist", true));
  console.log("untick:", await setProblemSolved(user.id, "ah-1", false));
  console.log("untick again (no row):", await setProblemSolved(user.id, "ah-1", false));
  console.log("rows after untick:", await prisma.problemSolve.count({ where: { userId: user.id } }));

  console.log("tag validation:", isCodeforcesTag("dp"), isCodeforcesTag("; DROP TABLE"));
  const live = await getCodeforcesProblems("dp");
  console.log("codeforces:", "problems" in live ? `${live.problems.length} problems, first: ${live.problems[0]?.title}` : live.error);

  await prisma.$disconnect();
}
main().catch(async (e) => { console.error("FAILED:", e); process.exitCode = 1; await prisma.$disconnect(); });
