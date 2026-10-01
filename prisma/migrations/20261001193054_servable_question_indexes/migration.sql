-- CreateIndex
CREATE INDEX "Question_status_topicId_idx" ON "Question"("status", "topicId");

-- CreateIndex
CREATE INDEX "Question_status_category_idx" ON "Question"("status", "category");

