-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "probableCause" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendedActions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incidentId" TEXT NOT NULL,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_incidentId_key" ON "AIAnalysis"("incidentId");

-- CreateIndex
CREATE INDEX "AIAnalysis_createdAt_idx" ON "AIAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
