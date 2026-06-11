/**
 * One-off prep for E2E regression: simulate KYC upload for unverified demo shop.
 * Run: npx tsx prisma/regression-prep.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const UNVERIFIED_EMAIL = "shop.unverified@pawsure.test";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: UNVERIFIED_EMAIL },
    select: { orgId: true, org: { select: { id: true, verificationStatus: true } } },
  });
  if (!user?.orgId) throw new Error("Unverified demo shop not found — run seed-demo first");

  if (user.org?.verificationStatus === "UNVERIFIED") {
    await prisma.organization.update({
      where: { id: user.orgId },
      data: {
        verificationStatus: "PENDING",
        verificationDocType: "LICENSE",
        verificationDocUrl: "local:verification/regression-demo.png",
        verificationNote: "Regression test submission",
        verificationSubmittedAt: new Date(),
      },
    });
    console.log("✓ Unverified shop → PENDING (simulated doc upload)");
  } else {
    console.log("✓ Unverified shop already", user.org?.verificationStatus);
  }

  if (process.argv.includes("--approve")) {
    await prisma.organization.update({
      where: { id: user.orgId },
      data: {
        verificationStatus: "APPROVED",
        verificationReviewedAt: new Date(),
        reviewNote: "Regression test approval",
      },
    });
    console.log("✓ Unverified shop → APPROVED");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
