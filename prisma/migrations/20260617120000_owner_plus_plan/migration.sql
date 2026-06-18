-- Owner Plus subscription interval tracking (mirrors org SHOP billing fields).
ALTER TABLE "User" ADD COLUMN "planInterval" TEXT;
ALTER TABLE "User" ADD COLUMN "planActivatedAt" TIMESTAMP(3);
