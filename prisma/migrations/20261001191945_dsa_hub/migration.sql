-- CreateEnum
CREATE TYPE "DsaBranch" AS ENUM ('GENERAL', 'CS_IT', 'AIDS', 'ELECTRICAL', 'MECHANICAL', 'CIVIL');

-- CreateTable
CREATE TABLE "DsaTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "branch" "DsaBranch" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DsaTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DsaProblem" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "link" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DsaProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemSolve" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemSolve_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DsaTopic_branch_idx" ON "DsaTopic"("branch");

-- CreateIndex
CREATE INDEX "DsaProblem_topicId_idx" ON "DsaProblem"("topicId");

-- CreateIndex
CREATE INDEX "ProblemSolve_userId_idx" ON "ProblemSolve"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemSolve_userId_problemId_key" ON "ProblemSolve"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "DsaProblem" ADD CONSTRAINT "DsaProblem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DsaTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemSolve" ADD CONSTRAINT "ProblemSolve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemSolve" ADD CONSTRAINT "ProblemSolve_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "DsaProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

