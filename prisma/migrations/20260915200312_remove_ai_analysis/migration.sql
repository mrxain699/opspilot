/*
  Warnings:

  - You are about to drop the `AIAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIAnalysis" DROP CONSTRAINT "AIAnalysis_incidentId_fkey";

-- DropTable
DROP TABLE "AIAnalysis";
