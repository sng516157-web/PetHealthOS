-- Food & activity logs (cross-referenced by AI triage / assistant).
CREATE TABLE "FoodLogEntry" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" TEXT NOT NULL,
    "foodName" TEXT,
    "amount" TEXT,
    "appetite" TEXT,
    "notes" TEXT,
    "lockedAt" TIMESTAMP(3),
    "loggedByOrgId" TEXT,
    "loggedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodLogEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActivityLogEntry" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityType" TEXT NOT NULL,
    "durationMin" INTEGER,
    "distanceKm" DOUBLE PRECISION,
    "intensity" TEXT,
    "notes" TEXT,
    "lockedAt" TIMESTAMP(3),
    "loggedByOrgId" TEXT,
    "loggedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLogEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FoodLogEntry_petId_occurredAt_idx" ON "FoodLogEntry"("petId", "occurredAt");
CREATE INDEX "ActivityLogEntry_petId_occurredAt_idx" ON "ActivityLogEntry"("petId", "occurredAt");

ALTER TABLE "FoodLogEntry" ADD CONSTRAINT "FoodLogEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityLogEntry" ADD CONSTRAINT "ActivityLogEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
