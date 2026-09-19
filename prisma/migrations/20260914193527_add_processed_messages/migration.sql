-- CreateTable
CREATE TABLE "ProcessedMessage" (
    "id" TEXT NOT NULL,
    "messageKey" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedMessage_messageKey_key" ON "ProcessedMessage"("messageKey");

-- CreateIndex
CREATE INDEX "ProcessedMessage_messageKey_idx" ON "ProcessedMessage"("messageKey");
