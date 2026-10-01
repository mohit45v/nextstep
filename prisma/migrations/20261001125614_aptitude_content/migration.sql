-- CreateEnum
CREATE TYPE "Category" AS ENUM ('QUANTITATIVE', 'LOGICAL_REASONING', 'VERBAL_ABILITY');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "PackDifficulty" AS ENUM ('MODERATE', 'CHALLENGING', 'HIGH');

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "iconName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "topicId" TEXT,
    "category" "Category" NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "shortcutTip" TEXT,
    "formulaUsed" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "companyTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaCard" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "keyRule" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormulaCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPack" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoColor" TEXT NOT NULL,
    "testTitle" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "cutoffPercentage" INTEGER NOT NULL,
    "difficulty" "PackDifficulty" NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPackSection" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyPackSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topic_category_idx" ON "Topic"("category");

-- CreateIndex
CREATE INDEX "Question_topicId_idx" ON "Question"("topicId");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "Question"("category");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "Option"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Option_questionId_order_key" ON "Option"("questionId", "order");

-- CreateIndex
CREATE INDEX "FormulaCard_category_idx" ON "FormulaCard"("category");

-- CreateIndex
CREATE INDEX "CompanyPackSection_packId_idx" ON "CompanyPackSection"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPackSection_packId_order_key" ON "CompanyPackSection"("packId", "order");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPackSection" ADD CONSTRAINT "CompanyPackSection_packId_fkey" FOREIGN KEY ("packId") REFERENCES "CompanyPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
