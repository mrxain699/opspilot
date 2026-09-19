/*
  Warnings:

  - The `status` column on the `Incident` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `severity` on the `Incident` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('open', 'resolved');

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "severity",
ADD COLUMN     "severity" "IncidentSeverity" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "IncidentStatus" NOT NULL DEFAULT 'open';

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "Incident"("status");
