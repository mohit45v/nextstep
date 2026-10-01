import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
async function main() {
  console.log("by source/status:", await prisma.question.groupBy({ by: ["source", "status"], _count: { _all: true } }));
  console.log("total options:", await prisma.option.count());
  const draft = await prisma.question.findFirst({ where: { status: "DRAFT" }, include: { options: { orderBy: { order: "asc" } } } });
  console.log("sample draft:", draft?.sourceId, draft?.licence, draft?.topicId, draft?.options.map((o) => `${o.text}${o.isCorrect ? "*" : ""}`));
  // Students must not see drafts: the servable filter is status APPROVED + a topic.
  console.log("servable count:", await prisma.question.count({ where: { status: "APPROVED", topicId: { not: null } } }));
  await prisma.$disconnect();
}
main();
