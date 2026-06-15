/** Locale-neutral mock data for landing sample passport / stay report. */

export const SAMPLE_PASSPORT = {
  orgName: "Sunrise Cattery",
  issuedOn: "May 12, 2026",
  certNo: "PS-7K2M-9FQ1",
  seal: "A3F9-8B2C-1D4E",
  entryCount: 12,
  spanLabel: "4 months",
  transferNote:
    "First vaccines complete. Dewormed on schedule. Calm temperament, good appetite — ready for handover.",
  guaranteeDaysRemaining: 18,
  guaranteeTerms: "Covers congenital issues reported within 14 days of handover.",
  vetCheckedOn: "May 11, 2026",
  vetCheckNote: "Healthy puppy exam — no concerns noted.",
  pet: {
    name: "Mochi",
    species: "DOG" as const,
    breed: "Toy Poodle",
    sex: "FEMALE" as const,
    age: "8 months",
    weightKg: "3.2",
    color: "Apricot",
    microchip: "—",
    intakeAt: "Feb 1, 2026",
    dam: "Luna",
  },
  attachments: [
    { kind: "VACCINE_CERT" as const, label: "DHPP round 2" },
    { kind: "PEDIGREE" as const, label: "Registration certificate" },
  ],
  reminders: [
    { category: "VACCINE" as const, title: "Booster due", dueAt: "Jul 15, 2026" },
    { category: "DEWORMING" as const, title: "Next deworming", dueAt: "Aug 1, 2026" },
  ],
  logs: [
    {
      type: "VET_VISIT" as const,
      title: "Pre-handover vet check",
      severity: "NONE" as const,
      text: "Healthy puppy exam. Weight 3.2 kg. Cleared for handover.",
      occurredAt: "May 11, 2026 · 10:30",
      loggedAgo: "2 days ago",
    },
    {
      type: "MEDICATION" as const,
      title: "Deworming",
      severity: "NONE" as const,
      text: "Routine deworming dose given per schedule.",
      occurredAt: "May 5, 2026 · 09:00",
      loggedAgo: "1 week ago",
    },
    {
      type: "MILESTONE" as const,
      title: "Weight check",
      severity: "NONE" as const,
      text: "3.2 kg — steady gain, good appetite.",
      occurredAt: "May 1, 2026 · 14:00",
      loggedAgo: "11 days ago",
    },
  ],
};

export const SAMPLE_STAY = {
  petName: "Mochi",
  facility: "Green Paws Boarding",
  checkIn: "Jun 1, 2026",
  checkOut: "Jun 4, 2026",
  feeding: "Breakfast and dinner on schedule. Ate full portions day 2–4.",
  medication: "Apoquel 5.4mg — given with dinner on Jun 2 & 3.",
  weight: "3.1 kg on check-out (stable)",
  photos: 3,
  staffNotes:
    "Playful in yard, slept well overnight. No signs of distress. Owner pickup smooth.",
  summary:
    "Four-day stay completed without issues. Medication given as directed. Clear handover summary for the owner.",
};
