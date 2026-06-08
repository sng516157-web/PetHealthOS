-- AlterTable: shop billing interval + referral programme
ALTER TABLE "Organization" ADD COLUMN "planInterval" TEXT;
ALTER TABLE "Organization" ADD COLUMN "planActivatedAt" TIMESTAMP(3);
ALTER TABLE "Organization" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "Organization" ADD COLUMN "referredById" TEXT;

-- Unique referral code
CREATE UNIQUE INDEX "Organization_referralCode_key" ON "Organization"("referralCode");

-- Self-relation: referredBy
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_referredById_fkey"
  FOREIGN KEY ("referredById") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
