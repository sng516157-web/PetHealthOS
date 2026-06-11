import { config } from "dotenv";
config({ path: ".env.local" });
config();
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
  facility: "facility.demo@pawsure.test",
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

/** Cancel Stripe subscriptions tied to demo emails so billing sync cannot resurrect stale entitlements. */
async function resetDemoStripeSubscriptions() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.log("Stripe not configured — skipping subscription reset");
    return;
  }
  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);
  for (const email of Object.values(EMAILS)) {
    const customers = await stripe.customers.list({ email, limit: 10 });
    for (const customer of customers.data) {
      let startingAfter: string | undefined;
      for (;;) {
        const page = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        for (const sub of page.data) {
          if (sub.status === "canceled" || sub.status === "incomplete_expired") continue;
          await stripe.subscriptions.cancel(sub.id);
          console.log(`  ✓ cancelled Stripe sub ${sub.id} (${email})`);
        }
        if (!page.has_more) break;
        startingAfter = page.data.at(-1)?.id;
      }
    }
  }
}

async function main() {
  console.log("Resetting Stripe subscriptions for demo emails…");
  await resetDemoStripeSubscriptions();

  console.log("Cleaning up any previous demo accounts…");
  // Remove demo users, their owned pets, and their orgs (org pets + stays cascade).
  const existing = await prisma.user.findMany({
    where: { email: { in: Object.values(EMAILS) } },
    select: { id: true, orgId: true },
  });
  const orgIds = existing.map((u) => u.orgId).filter(Boolean) as string[];
  const userIds = existing.map((u) => u.id);
  if (userIds.length) {
    await prisma.pet.deleteMany({ where: { ownerUserId: { in: userIds } } });
  }
  await prisma.user.deleteMany({
    where: { email: { in: Object.values(EMAILS) } },
  });
  if (orgIds.length) {
    await prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
  }

  const pw = hashPassword(PASSWORD);

  // 1) Owner account — free (1 pet included, ¥15/mo per extra, cap 10).
  const owner = await prisma.user.create({
    data: { email: EMAILS.owner, name: "Demo Owner", passwordHash: pw, plan: "FREE" },
  });
  // A pet for the owner, with a QR check-in token (used by the facility demo).
  const ownerPet = await prisma.pet.create({
    data: {
      ownerUserId: owner.id,
      name: "Coco",
      species: "DOG",
      breed: "Corgi",
      sex: "FEMALE",
      birthDate: daysAgo(400),
      color: "Tan",
      weightKg: 9.2,
      status: "ACTIVE",
      stayToken: randomBytes(8).toString("hex"),
    },
  });
  console.log("✓ Owner account:", EMAILS.owner, "(pet: Coco)");

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

  // 4) Facility — approved vet hospital that already has Coco in its care, so
  // the facility dashboard and stay flow are demoable out of the box.
  const facilityOrg = await prisma.organization.create({
    data: {
      name: "Happy Paws Animal Hospital (Demo)",
      kind: "HOSPITAL",
      plan: "STARTER",
      verificationStatus: "APPROVED",
      verificationDocType: "LICENSE",
      verificationDocUrl: "local:verification/demo-approved.png",
      verificationSubmittedAt: daysAgo(6),
      verificationReviewedAt: daysAgo(5),
    },
  });
  await prisma.user.create({
    data: {
      email: EMAILS.facility,
      name: "Facility Manager",
      passwordHash: pw,
      orgId: facilityOrg.id,
    },
  });
  await prisma.petStay.create({
    data: { petId: ownerPet.id, orgId: facilityOrg.id, status: "ACTIVE" },
  });
  await prisma.logEntry.create({
    data: {
      petId: ownerPet.id,
      rawText: "Admitted for boarding. Ate well, bright and active.",
      type: "OBSERVATION",
      severity: "NONE",
      title: "Boarding check-in",
      tags: JSON.stringify(["boarding", "intake"]),
      aiProcessed: true,
      loggedByOrgId: facilityOrg.id,
      loggedByName: facilityOrg.name,
    },
  });
  console.log("✓ Facility (hospital):", EMAILS.facility, "(Coco in care)");

  console.log("\nAll demo accounts ready. Password for all:", PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
