-- Owner memorial archive + admin-reviewed condolence refund claims.
ALTER TABLE "Pet" ADD COLUMN "deceasedAt" TIMESTAMP(3);

CREATE TABLE "PetDeathClaim" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofDocUrls" TEXT NOT NULL,
    "applicantNote" TEXT,
    "reviewNote" TEXT,
    "refundMonths" INTEGER NOT NULL DEFAULT 3,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "refundGrantedAt" TIMESTAMP(3),

    CONSTRAINT "PetDeathClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PetDeathClaim_petId_key" ON "PetDeathClaim"("petId");
CREATE INDEX "PetDeathClaim_status_submittedAt_idx" ON "PetDeathClaim"("status", "submittedAt");
CREATE INDEX "PetDeathClaim_userId_idx" ON "PetDeathClaim"("userId");

ALTER TABLE "PetDeathClaim" ADD CONSTRAINT "PetDeathClaim_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetDeathClaim" ADD CONSTRAINT "PetDeathClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
