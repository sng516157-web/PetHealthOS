-- Permanent forfeiture: choosing monthly/yearly SHOP plan closes founding breeder lifetime.
ALTER TABLE "Organization" ADD COLUMN "foundingBreederEligible" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Organization"
SET "foundingBreederEligible" = false
WHERE plan = 'SHOP' AND "planInterval" IN ('month', 'year');
