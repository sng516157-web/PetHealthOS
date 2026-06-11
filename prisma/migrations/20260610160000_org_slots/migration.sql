-- Paid org capacity: shop extra pets + facility care slots.
CREATE TABLE "OrgSlot" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "petId" TEXT,
    "petStayId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "OrgSlot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrgSlot_petId_key" ON "OrgSlot"("petId");
CREATE UNIQUE INDEX "OrgSlot_petStayId_key" ON "OrgSlot"("petStayId");
CREATE INDEX "OrgSlot_orgId_kind_status_idx" ON "OrgSlot"("orgId", "kind", "status");

ALTER TABLE "OrgSlot" ADD CONSTRAINT "OrgSlot_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgSlot" ADD CONSTRAINT "OrgSlot_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrgSlot" ADD CONSTRAINT "OrgSlot_petStayId_fkey" FOREIGN KEY ("petStayId") REFERENCES "PetStay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
