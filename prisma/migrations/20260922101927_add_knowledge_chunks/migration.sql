CREATE EXTENSION IF NOT EXISTS "vector";
-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentAIAnalysis" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "possibleCause" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "recommendedActions" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentAIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncidentAIAnalysis_incidentId_key" ON "IncidentAIAnalysis"("incidentId");

-- CreateIndex
CREATE INDEX "IncidentAIAnalysis_incidentId_idx" ON "IncidentAIAnalysis"("incidentId");

-- AddForeignKey
ALTER TABLE "IncidentAIAnalysis" ADD CONSTRAINT "IncidentAIAnalysis_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
