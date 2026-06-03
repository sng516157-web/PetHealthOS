-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "verificationDocType" TEXT,
ADD COLUMN     "verificationDocUrl" TEXT,
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verificationReviewedAt" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);
