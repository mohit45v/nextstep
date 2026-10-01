-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "licence" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'curated',
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Question_source_sourceId_key" ON "Question"("source", "sourceId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Backfill: the questions already in the bank are the hand-written seed set,
-- which has been read and is already being served. Leaving them as DRAFT (the
-- column default) would empty every screen the moment this migration lands, so
-- they are marked APPROVED and given their seed id as a source id. New rows —
-- in particular anything an importer creates — still default to DRAFT.
UPDATE "Question"
   SET "status" = 'APPROVED',
       "source" = 'curated',
       "sourceId" = "id"
 WHERE "sourceId" IS NULL;
