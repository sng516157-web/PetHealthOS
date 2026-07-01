-- Breeder wedge: litter grouping, buyer preview links, vaccine templates
ALTER TABLE "Pet" ADD COLUMN "litterName" TEXT;
ALTER TABLE "Pet" ADD COLUMN "previewToken" TEXT;
CREATE UNIQUE INDEX "Pet_previewToken_key" ON "Pet"("previewToken");

CREATE TABLE "VaccineScheduleTemplate" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VaccineScheduleTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VaccineScheduleTemplate_orgId_idx" ON "VaccineScheduleTemplate"("orgId");

ALTER TABLE "VaccineScheduleTemplate" ADD CONSTRAINT "VaccineScheduleTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
