-- Medication log entries (structured dosing alongside health / food / activity logs).
CREATE TABLE "MedicationLogEntry" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medicationName" TEXT NOT NULL,
    "dose" TEXT,
    "route" TEXT,
    "notes" TEXT,
    "lockedAt" TIMESTAMP(3),
    "loggedByOrgId" TEXT,
    "loggedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationLogEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MedicationLogEntry_petId_occurredAt_idx" ON "MedicationLogEntry"("petId", "occurredAt");

ALTER TABLE "MedicationLogEntry" ADD CONSTRAINT "MedicationLogEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
