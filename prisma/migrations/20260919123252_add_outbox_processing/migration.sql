-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "processing" BOOLEAN NOT NULL DEFAULT false;
