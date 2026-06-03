import "dotenv/config";
import { randomBytes, scryptSync } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Creates a set of demo accounts covering every pipeline (owner, verified shop,
// unverified shop). Idempotent: re-running deletes & recreates these accounts by
// their well-known emails. Does NOT touch other data. See docs/TestAccounts.md.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Mirror src/lib/auth.ts hashPassword (scrypt, "salt:hash").
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const PASSWORD = "Demo123456";

const EMAILS = {
  owner: "owner.demo@pawsure.test",
  verifiedShop: "shop.verified@pawsure.test",
  unverifiedShop: "shop.unverified@pawsure.test",
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

async function main() {
  console.log("Cleaning up any previous demo accounts…");
  // Remove demo users and their orgs (pets cascade from org).
  const existing = await prisma.user.findMany({
    where: { email: { in: Object.values(EMAILS) } },
    select: { id: true, orgId: true },
  });
  const orgIds = existing.map((u) => u.orgId).filter(Boolean) as string[];
  await prisma.user.deleteMany({
    where: { email: { in: Object.values(EMAILS) } },
  });
  if (orgIds.length) {
    await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  }

  const pw = hashPassword(PASSWORD);

  // 1) Owner account — free, 2 pets included, ¥25/mo per extra (cap 10).
  await prisma.user.create({
    data: { email: EMAILS.owner, name: "Demo Owner", passwordHash: pw, plan: "FREE" },
  });
  console.log("✓ Owner account:", EMAILS.owner);

  // 2) Verified shop — APPROVED, on SHOP plan, with pets ready to issue passports.
  const verifiedOrg = await prisma.organization.create({
    data: {
      name: "Sunrise Cattery (Verified Demo)",
      kind: "BREEDER",
      plan: "SHOP",
      verificationStatus: "APPROVED",
      verificationDocType: "LICENSE",
      verificationDocUrl: "local:verification/demo-approved.png",
      verificationSubmittedAt: daysAgo(5),
      verificationReviewedAt: daysAgo(4),
    },
  });
  await prisma.user.create({
    data: {
      email: EMAILS.verifiedShop,
      name: "Verified Shop Owner",
      passwordHash: pw,
      orgId: verifiedOrg.id,
    },
  });
  await prisma.pet.createMany({
    data: [
      {
        orgId: verifiedOrg.id,
        name: "Mochi",
        species: "CAT",
        breed: "British Shorthair",
        sex: "FEMALE",
        birthDate: daysAgo(220),
        color: "Blue",
        status: "ACTIVE",
      },
      {
        orgId: verifiedOrg.id,
        name: "Biscuit",
        species: "DOG",
        breed: "Golden Retriever",
        sex: "MALE",
        birthDate: daysAgo(400),
        color: "Golden",
        status: "ACTIVE",
      },
    ],
  });
  console.log("✓ Verified shop:", EMAILS.verifiedShop, "(2 pets)");

  // 3) Unverified shop — to exercise the /verify upload + /admin review pipeline.
  const unverifiedOrg = await prisma.organization.create({
    data: {
      name: "New Paws Shop (Unverified Demo)",
      kind: "SHOP",
      plan: "STARTER",
      verificationStatus: "UNVERIFIED",
    },
  });
  await prisma.user.create({
    data: {
      email: EMAILS.unverifiedShop,
      name: "Unverified Shop Owner",
      passwordHash: pw,
      orgId: unverifiedOrg.id,
    },
  });
  console.log("✓ Unverified shop:", EMAILS.unverifiedShop);

  console.log("\nAll demo accounts ready. Password for all:", PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
