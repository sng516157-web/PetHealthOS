-- Admin-comped slots: exempt from Stripe subscription sync (see syncSlotRevocationsFromStripe).
ALTER TABLE "OwnerPetSlot" ADD COLUMN "comped" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OrgSlot" ADD COLUMN "comped" BOOLEAN NOT NULL DEFAULT false;
