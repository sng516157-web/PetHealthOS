-- AlterTable
ALTER TABLE "LogEntry" ADD COLUMN "lockedAt" DATETIME;

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "weightKg" REAL NOT NULL,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeightEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "newOwnerName" TEXT,
    "newOwnerEmail" TEXT,
    "note" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'READONLY_COPY',
    "claimable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstViewedAt" DATETIME,
    "claimedAt" DATETIME,
    "claimedByName" TEXT,
    CONSTRAINT "Transfer_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transfer" ("claimedAt", "createdAt", "id", "newOwnerEmail", "newOwnerName", "note", "petId", "token", "visibility") SELECT "claimedAt", "createdAt", "id", "newOwnerEmail", "newOwnerName", "note", "petId", "token", "visibility" FROM "Transfer";
DROP TABLE "Transfer";
ALTER TABLE "new_Transfer" RENAME TO "Transfer";
CREATE UNIQUE INDEX "Transfer_token_key" ON "Transfer"("token");
CREATE INDEX "Transfer_petId_idx" ON "Transfer"("petId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "WeightEntry_petId_measuredAt_idx" ON "WeightEntry"("petId", "measuredAt");
