-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'OTHER',
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "sex" TEXT,
    "birthDate" DATETIME,
    "weightKg" REAL,
    "color" TEXT,
    "microchip" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "intakeAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "sireId" TEXT,
    "damId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pet_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pet_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Pet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pet_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Pet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pet" ("birthDate", "breed", "color", "createdAt", "id", "intakeAt", "microchip", "name", "notes", "orgId", "photoUrl", "sex", "species", "status", "updatedAt", "weightKg") SELECT "birthDate", "breed", "color", "createdAt", "id", "intakeAt", "microchip", "name", "notes", "orgId", "photoUrl", "sex", "species", "status", "updatedAt", "weightKg" FROM "Pet";
DROP TABLE "Pet";
ALTER TABLE "new_Pet" RENAME TO "Pet";
CREATE INDEX "Pet_orgId_idx" ON "Pet"("orgId");
CREATE TABLE "new_Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "newOwnerName" TEXT,
    "newOwnerEmail" TEXT,
    "note" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'READONLY_COPY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" DATETIME,
    CONSTRAINT "Transfer_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transfer" ("claimedAt", "createdAt", "id", "newOwnerEmail", "newOwnerName", "note", "petId", "token") SELECT "claimedAt", "createdAt", "id", "newOwnerEmail", "newOwnerName", "note", "petId", "token" FROM "Transfer";
DROP TABLE "Transfer";
ALTER TABLE "new_Transfer" RENAME TO "Transfer";
CREATE UNIQUE INDEX "Transfer_token_key" ON "Transfer"("token");
CREATE INDEX "Transfer_petId_idx" ON "Transfer"("petId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Attachment_petId_idx" ON "Attachment"("petId");
