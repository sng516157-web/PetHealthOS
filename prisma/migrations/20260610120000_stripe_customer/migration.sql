-- Stripe Customer id for billing portal / subscription management.
ALTER TABLE "Organization" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
