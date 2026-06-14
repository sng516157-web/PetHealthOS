-- Terms of Service & Privacy Policy acceptance at registration.
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3);
