-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxEvent_published_idx" ON "OutboxEvent"("published");

-- CreateIndex
CREATE INDEX "OutboxEvent_createdAt_idx" ON "OutboxEvent"("createdAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregateId_idx" ON "OutboxEvent"("aggregateId");
