-- Per-owner paid pet slots (linked to pets + Stripe subscriptions).
CREATE TABLE "OwnerPetSlot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "OwnerPetSlot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OwnerPetSlot_petId_key" ON "OwnerPetSlot"("petId");
CREATE INDEX "OwnerPetSlot_userId_status_idx" ON "OwnerPetSlot"("userId", "status");

ALTER TABLE "OwnerPetSlot" ADD CONSTRAINT "OwnerPetSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OwnerPetSlot" ADD CONSTRAINT "OwnerPetSlot_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
