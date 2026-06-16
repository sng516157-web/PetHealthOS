-- 6-digit verification codes alongside magic links.
ALTER TABLE "EmailVerification" ADD COLUMN "codeHash" TEXT;
ALTER TABLE "EmailVerification" ADD COLUMN "codeAttempts" INTEGER NOT NULL DEFAULT 0;
