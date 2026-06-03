-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN     "imageMime" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "guaranteeDays" INTEGER,
ADD COLUMN     "guaranteeTerms" TEXT,
ADD COLUMN     "guaranteeType" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "vetCheckNote" TEXT,
ADD COLUMN     "vetCheckedAt" TIMESTAMP(3);
