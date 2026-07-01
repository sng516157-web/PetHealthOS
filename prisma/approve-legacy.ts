import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { normalizePgConnectionString } from "../src/lib/pg-connection";

const adapter = new PrismaPg({
  connectionString: normalizePgConnectionString(process.env.DATABASE_URL),
});
const prisma = new PrismaClient({ adapter });

// Keep this demo shop UNVERIFIED so the /verify -> /admin pipeline stays testable.
const KEEP_UNVERIFIED = ["New Paws Shop (Unverified Demo)"];

async function main() {
  const all = await prisma.organization.findMany({
    select: { id: true, name: true, verificationStatus: true },
    orderBy: { createdAt: "asc" },
  });
  console.log("All organisations:");
  for (const o of all) console.log(`  - ${o.verificationStatus.padEnd(11)} ${o.name}`);

  const toApprove = all.filter(
    (o) => o.verificationStatus !== "APPROVED" && !KEEP_UNVERIFIED.includes(o.name),
  );

  if (toApprove.length === 0) {
    console.log("\nNothing to approve.");
  } else {
    const res = await prisma.organization.updateMany({
      where: { id: { in: toApprove.map((o) => o.id) } },
      data: {
        verificationStatus: "APPROVED",
        verificationReviewedAt: new Date(),
        reviewNote: "Auto-approved (legacy account, pre-verification).",
      },
    });
    console.log(`\nApproved ${res.count} legacy org(s):`);
    for (const o of toApprove) console.log(`  ✓ ${o.name}`);
  }
  console.log(`\nKept unverified (demo): ${KEEP_UNVERIFIED.join(", ")}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
