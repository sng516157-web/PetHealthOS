import type { ReminderCategory } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type VaccineTemplateItem = {
  label: string;
  category: ReminderCategory;
  daysAfterAnchor: number;
  note?: string;
};

export type VaccineTemplateSeed = {
  name: string;
  species: "DOG" | "CAT" | null;
  items: VaccineTemplateItem[];
};

/** Built-in schedules seeded per org on first use. */
export const DEFAULT_VACCINE_TEMPLATES: VaccineTemplateSeed[] = [
  {
    name: "Puppy core (8–16 weeks)",
    species: "DOG",
    items: [
      { label: "DHPP #1", category: "VACCINE", daysAfterAnchor: 42 },
      { label: "DHPP #2", category: "VACCINE", daysAfterAnchor: 63 },
      { label: "DHPP #3", category: "VACCINE", daysAfterAnchor: 84 },
      { label: "Rabies", category: "VACCINE", daysAfterAnchor: 98 },
      { label: "Deworming", category: "DEWORMING", daysAfterAnchor: 21 },
      { label: "Deworming", category: "DEWORMING", daysAfterAnchor: 42 },
    ],
  },
  {
    name: "Kitten core (8–12 weeks)",
    species: "CAT",
    items: [
      { label: "FVRCP #1", category: "VACCINE", daysAfterAnchor: 56 },
      { label: "FVRCP #2", category: "VACCINE", daysAfterAnchor: 77 },
      { label: "FVRCP #3", category: "VACCINE", daysAfterAnchor: 98 },
      { label: "Rabies", category: "VACCINE", daysAfterAnchor: 98 },
      { label: "Deworming", category: "DEWORMING", daysAfterAnchor: 28 },
    ],
  },
];

export function anchorDateForPet(pet: {
  birthDate: Date | null;
  intakeAt: Date | null;
  createdAt: Date;
}): Date {
  return pet.birthDate ?? pet.intakeAt ?? pet.createdAt;
}

export async function getOrgVaccineTemplates(orgId: string) {
  let templates = await prisma.vaccineScheduleTemplate.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, species: true },
  });
  if (templates.length === 0) {
    await prisma.vaccineScheduleTemplate.createMany({
      data: DEFAULT_VACCINE_TEMPLATES.map((t) => ({
        orgId,
        name: t.name,
        species: t.species,
        items: t.items,
      })),
    });
    templates = await prisma.vaccineScheduleTemplate.findMany({
      where: { orgId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, species: true },
    });
  }
  return templates;
}
