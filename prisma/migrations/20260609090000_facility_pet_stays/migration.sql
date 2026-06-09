-- Pet check-in token for facility QR admit
ALTER TABLE "Pet" ADD COLUMN "stayToken" TEXT;
CREATE UNIQUE INDEX "Pet_stayToken_key" ON "Pet"("stayToken");

-- Facility attribution on log entries ("Logged by: <facility>")
ALTER TABLE "LogEntry" ADD COLUMN "loggedByOrgId" TEXT;
ALTER TABLE "LogEntry" ADD COLUMN "loggedByName" TEXT;

-- Pet stays at facilities (hospital/boarding)
CREATE TABLE "PetStay" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "admittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PetStay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PetStay_petId_orgId_key" ON "PetStay"("petId", "orgId");
CREATE INDEX "PetStay_orgId_idx" ON "PetStay"("orgId");
CREATE INDEX "PetStay_petId_idx" ON "PetStay"("petId");

ALTER TABLE "PetStay" ADD CONSTRAINT "PetStay_petId_fkey"
  FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetStay" ADD CONSTRAINT "PetStay_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
