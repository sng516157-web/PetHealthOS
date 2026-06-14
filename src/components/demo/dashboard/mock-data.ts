export const MOCK_OWNER = {
  name: "Jordan",
  pets: [
    { id: "1", name: "Mochi", breed: "British Shorthair", species: "CAT" as const, status: "ACTIVE", age: "2 yrs" },
    { id: "2", name: "Buddy", breed: "Golden Retriever", species: "DOG" as const, status: "ACTIVE", age: "4 yrs" },
    { id: "3", name: "Luna", breed: "Ragdoll", species: "CAT" as const, status: "UNDER_OBSERVATION", age: "1 yr" },
  ],
  notifications: [
    { id: "n1", title: "Vaccine due in 5 days", pet: "Mochi", tone: "amber" as const },
    { id: "n2", title: "Weight log reminder", pet: "Buddy", tone: "slate" as const },
    { id: "n3", title: "Follow-up check suggested", pet: "Luna", tone: "rose" as const },
  ],
};

export const MOCK_SHOP = {
  orgName: "Sunrise Cattery",
  stats: { pets: 24, attention: 3, dueWeek: 5, logs: 186 },
  attention: [
    { id: "p1", name: "Coco", note: "Mild cough — owner notified", severity: "Moderate" },
    { id: "p2", name: "Rocky", note: "Under observation after intake", severity: "Watch" },
    { id: "p3", name: "Pearl", note: "Vaccine overdue", severity: "Moderate" },
  ],
  pets: [
    { id: "a", name: "Coco", breed: "Maine Coon", emoji: "💉" },
    { id: "b", name: "Rocky", breed: "Labrador", emoji: "📝" },
    { id: "c", name: "Pearl", breed: "Siamese", emoji: "⚖️" },
    { id: "d", name: "Dash", breed: "Corgi", emoji: "🩺" },
    { id: "e", name: "Milo", breed: "Persian", emoji: "💊" },
    { id: "f", name: "Nala", breed: "Beagle", emoji: "📋" },
  ],
  reminders: [
    { id: "r1", title: "FVRCP booster", pet: "Pearl", when: "Tomorrow", overdue: false },
    { id: "r2", title: "Deworming", pet: "Rocky", when: "In 3 days", overdue: false },
    { id: "r3", title: "Weight check", pet: "Coco", when: "Overdue", overdue: true },
  ],
};

export const MOCK_FACILITY = {
  orgName: "Happy Paws Animal Hospital",
  inCare: [
    { id: "f1", name: "Biscuit", breed: "Shiba Inu", logs: 4, last: "Post-op check — stable" },
    { id: "f2", name: "Willow", breed: "Domestic Shorthair", logs: 2, last: "Boarding day 2 — eating well" },
    { id: "f3", name: "Otis", breed: "French Bulldog", logs: 7, last: "IV fluids — monitor overnight" },
    { id: "f4", name: "Piper", breed: "Cavalier", logs: 1, last: "Admitted this morning" },
  ],
};

export const DASHBOARD_DEMO_VARIANTS = [
  {
    slug: "owner",
    name: "Owner",
    tagline: "Full-width home for /me",
    mood: "Wide pet grid, side panel for scan + alerts, Aurora hero",
  },
  {
    slug: "shop",
    name: "Shop / breeder",
    tagline: "Canvas workspace for /app",
    mood: "Bento stats, attention feed + reminders column, uses sidebar width",
  },
  {
    slug: "facility",
    name: "Facility",
    tagline: "In-care board for hospitals & boarding",
    mood: "Admit hero, wide pet cards, capacity strip",
  },
] as const;
