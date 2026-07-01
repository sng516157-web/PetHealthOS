import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { normalizePgConnectionString } from "../src/lib/pg-connection";

const adapter = new PrismaPg({
  connectionString: normalizePgConnectionString(process.env.DATABASE_URL),
});
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);
const yearsAgo = (n: number) =>
  new Date(Date.now() - n * 365 * 86400000);

async function main() {
  console.log("Resetting data…");
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.triageReport.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.weightEntry.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.logEntry.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: "Whisker Lane Cattery & Kennel", kind: "BREEDER" },
  });

  // ---- Breeding pair (lineage demo) ----
  const cooper = await prisma.pet.create({
    data: {
      orgId: org.id,
      name: "Cooper",
      species: "DOG",
      breed: "Beagle",
      sex: "MALE",
      birthDate: yearsAgo(4),
      weightKg: 11.8,
      color: "Tricolor",
      status: "ACTIVE",
      notes: "Stud. Health-tested, calm temperament.",
    },
  });
  const biscuit = await prisma.pet.create({
    data: {
      orgId: org.id,
      name: "Biscuit",
      species: "DOG",
      breed: "Beagle",
      sex: "FEMALE",
      birthDate: yearsAgo(3),
      weightKg: 9.6,
      color: "Lemon & white",
      status: "ACTIVE",
      notes: "Dam. Excellent mother, last litter of 5.",
    },
  });

  // ---- Mango: a beagle puppy with a recent tummy issue ----
  const mango = await prisma.pet.create({
    data: {
      orgId: org.id,
      name: "Mango",
      species: "DOG",
      breed: "Beagle",
      sex: "MALE",
      birthDate: daysAgo(150),
      weightKg: 7.2,
      color: "Tricolor",
      microchip: "991002000123456",
      status: "UNDER_OBSERVATION",
      sireId: cooper.id,
      damId: biscuit.id,
      notes: "Energetic puppy from Biscuit's spring litter, awaiting final vaccination round before sale.",
    },
  });

  await prisma.attachment.create({
    data: {
      petId: mango.id,
      kind: "PEDIGREE",
      label: "Certificate of Pedigree",
      url: "/uploads/sample-pedigree.svg",
      mimeType: "image/svg+xml",
    },
  });

  // Antibody titer result — the proof buyers actually trust (optional).
  await prisma.attachment.create({
    data: {
      petId: mango.id,
      kind: "ANTIBODY_TEST",
      label: "Distemper/Parvo antibody titer",
      url: "/uploads/sample-pedigree.svg",
      mimeType: "image/svg+xml",
    },
  });

  // Weekly growth weights — the daily-use ritual that builds a credible history.
  await prisma.weightEntry.createMany({
    data: [
      { petId: mango.id, weightKg: 6.1, measuredAt: daysAgo(40) },
      { petId: mango.id, weightKg: 6.5, measuredAt: daysAgo(33) },
      { petId: mango.id, weightKg: 6.8, measuredAt: daysAgo(26) },
      { petId: mango.id, weightKg: 7.0, measuredAt: daysAgo(12) },
      { petId: mango.id, weightKg: 7.2, measuredAt: daysAgo(3) },
    ],
  });

  await prisma.logEntry.createMany({
    data: [
      {
        petId: mango.id,
        occurredAt: daysAgo(40),
        rawText: "Intake exam. Bright, alert, good body condition. Weight 6.1kg.",
        type: "VET_VISIT", severity: "NONE",
        title: "Intake exam clear",
        summary: "Healthy intake exam, weight 6.1kg.",
        tags: JSON.stringify(["intake", "weight", "checkup"]),
        aiProcessed: true,
      },
      {
        petId: mango.id,
        occurredAt: daysAgo(28),
        rawText: "First DHPP vaccination given. No reaction observed afterwards.",
        type: "MEDICATION", severity: "NONE",
        title: "First DHPP vaccine",
        summary: "Received first DHPP vaccination, no adverse reaction.",
        tags: JSON.stringify(["vaccine", "dhpp"]),
        aiProcessed: true,
      },
      {
        petId: mango.id,
        occurredAt: daysAgo(4),
        rawText: "Loose stool this morning, a bit more than usual. Still eating and playful.",
        type: "ILLNESS", severity: "MEDIUM",
        title: "Loose stool, still active",
        summary: "Mild diarrhea but appetite and energy normal.",
        tags: JSON.stringify(["diarrhea", "appetite"]),
        aiProcessed: true,
      },
      {
        petId: mango.id,
        occurredAt: daysAgo(2),
        rawText: "Vomited once after breakfast. Diarrhea continues. Drinking water normally.",
        type: "ILLNESS", severity: "HIGH",
        title: "Vomiting + ongoing diarrhea",
        summary: "One vomiting episode with continuing diarrhea, still hydrating.",
        tags: JSON.stringify(["vomit", "diarrhea", "hydration"]),
        aiProcessed: true,
      },
      {
        petId: mango.id,
        occurredAt: daysAgo(1),
        rawText: "Seems a little low energy today, slept more than usual. Ate about half his food.",
        type: "OBSERVATION", severity: "MEDIUM",
        title: "Lethargic, reduced appetite",
        summary: "Lower energy and reduced appetite (ate ~50%).",
        tags: JSON.stringify(["lethargic", "appetite"]),
        aiProcessed: true,
      },
    ],
  });

  await prisma.reminder.createMany({
    data: [
      {
        petId: mango.id,
        title: "Second DHPP vaccination",
        category: "VACCINE",
        dueAt: daysFromNow(3),
      },
      {
        petId: mango.id,
        title: "Deworming dose",
        category: "DEWORMING",
        dueAt: daysFromNow(10),
        recurrence: "MONTHLY",
      },
      {
        petId: mango.id,
        title: "Recheck stool sample",
        category: "APPOINTMENT",
        dueAt: daysFromNow(1),
        notes: "Follow up on diarrhea episode.",
      },
    ],
  });

  // ---- Luna: a healthy adult cat ----
  const luna = await prisma.pet.create({
    data: {
      orgId: org.id,
      name: "Luna",
      species: "CAT",
      breed: "Domestic Shorthair",
      sex: "FEMALE",
      birthDate: yearsAgo(2),
      weightKg: 4.1,
      color: "Black",
      status: "ACTIVE",
      notes: "Calm, litter-trained, good with people.",
    },
  });
  await prisma.logEntry.createMany({
    data: [
      {
        petId: luna.id,
        occurredAt: daysAgo(60),
        rawText: "Spayed. Recovered well, sutures removed after 10 days.",
        type: "VET_VISIT", severity: "NONE",
        title: "Spay surgery — recovered",
        summary: "Spay surgery completed and healed without complications.",
        tags: JSON.stringify(["surgery", "spay"]),
        aiProcessed: true,
      },
      {
        petId: luna.id,
        occurredAt: daysAgo(7),
        rawText: "Playful and eating well. Coat looks shiny.",
        type: "OBSERVATION", severity: "NONE",
        title: "Doing great",
        summary: "Healthy, active, good coat condition.",
        tags: JSON.stringify(["healthy", "appetite"]),
        aiProcessed: true,
      },
    ],
  });
  await prisma.reminder.create({
    data: {
      petId: luna.id,
      title: "Annual FVRCP booster",
      category: "VACCINE",
      dueAt: daysFromNow(45),
      recurrence: "YEARLY",
    },
  });

  // ---- Rocky: a senior dog with a chronic issue ----
  const rocky = await prisma.pet.create({
    data: {
      orgId: org.id,
      name: "Rocky",
      species: "DOG",
      breed: "Labrador Retriever",
      sex: "MALE",
      birthDate: yearsAgo(8),
      weightKg: 31.5,
      color: "Golden",
      status: "ACTIVE",
      notes: "Senior dog, mild stiffness in hind legs.",
    },
  });
  await prisma.logEntry.createMany({
    data: [
      {
        petId: rocky.id,
        occurredAt: daysAgo(20),
        rawText: "Slight limp on right hind leg after long walk. Better after rest.",
        type: "DISCOMFORT", severity: "LOW",
        title: "Mild limp after exercise",
        summary: "Transient right hind-leg limp following exertion.",
        tags: JSON.stringify(["limp", "joint"]),
        aiProcessed: true,
      },
      {
        petId: rocky.id,
        occurredAt: daysAgo(5),
        rawText: "Started joint supplement (glucosamine) once daily with dinner.",
        type: "MEDICATION", severity: "NONE",
        title: "Joint supplement started",
        summary: "Began daily glucosamine supplement.",
        tags: JSON.stringify(["supplement", "joint"]),
        aiProcessed: true,
      },
    ],
  });

  console.log("Seeded organization:", org.name);
  console.log(
    "Pets:",
    [cooper.name, biscuit.name, mango.name, luna.name, rocky.name].join(", "),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
