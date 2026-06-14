import { CalendarClock, Hospital, Languages, ShieldCheck, Sparkles, Store, User } from "lucide-react";

export const DEMO_VARIANTS = [
  {
    slug: "aurora",
    name: "Aurora",
    tagline: "Soft ambient motion — calm but alive",
    mood: "Floating orbs, staggered reveals, gentle hero float",
  },
  {
    slug: "flow",
    name: "Flow",
    tagline: "Connected narrative — things move together",
    mood: "Marquee trust strip, animated connector line, side slides",
  },
  {
    slug: "lift",
    name: "Lift",
    tagline: "Playful micro-interactions — tactile cards",
    mood: "Hover tilt, icon wiggle, shimmer CTAs, counting stats",
  },
] as const;

export type DemoVariantSlug = (typeof DEMO_VARIANTS)[number]["slug"];

export const DEMO_LANDING = {
  heroEyebrow: "Rebuilding trust in pet care",
  heroTitle: "A trusted health ecosystem for owners, shops, and facilities.",
  heroSubtitle:
    "PawSure isn't just another pet app. We're building a lifelong chain of trust — owners keep the record, shops prove good care, and facilities log with transparency.",
  heroPrimary: "Join us",
  heroSecondary: "See the ecosystem",
  trust: ["Owners control the record", "Shops prove care with history", "Facilities log with transparency"],
  howEyebrow: "The trust ecosystem",
  howTitle: "Owners · Shops · Facilities — one chain of trust for life",
  steps: [
    {
      icon: User,
      title: "Pet owners",
      desc: "The record travels with the pet for life. You decide who can see it and when to revoke access.",
    },
    {
      icon: Store,
      title: "Breeders & shops",
      desc: "Daily care builds a verifiable record. Issue a health passport buyers can trust.",
    },
    {
      icon: Hospital,
      title: "Vet clinics & boarding",
      desc: "Scan to admit, log during the stay, archive on take-back — a clear record after the pet leaves.",
    },
  ],
  featuresEyebrow: "What trust is built on",
  featuresTitle: "It takes all three sides to make every handover feel safe",
  features: [
    { icon: ShieldCheck, title: "Verifiable health history", desc: "Entries accumulate over time and can't be rewritten after handover." },
    { icon: Sparkles, title: "AI that knows the full story", desc: "Answers grounded in the pet's complete history — same facts for everyone." },
    { icon: CalendarClock, title: "Reminders that stick", desc: "Vaccines, meds, and check-ups surfaced before they slip through the cracks." },
    { icon: Languages, title: "One record, for life", desc: "From breeding to boarding to vet visits — one timeline, not scattered slips." },
  ],
  chooseEyebrow: "Join us",
  chooseTitle: "Which side of the ecosystem are you?",
  paths: [
    { icon: User, title: "Pet owner", desc: "Free for your first pet. Start fresh or scan a passport from your breeder.", href: "/owner" },
    { icon: Store, title: "Breeder or shop", desc: "Manage animals, track lineage, issue trusted passports at sale.", href: "/shop", highlight: true },
    { icon: Hospital, title: "Clinic or boarding", desc: "Admit by QR, log during the stay, hand back a transparent report.", href: "/facility" },
  ],
  stats: [
    { label: "Sides in the ecosystem", value: 3 },
    { label: "Free pets for owners", value: 1 },
    { label: "Care slots included", value: 50 },
  ],
  marquee: [
    "Verifiable history",
    "Consent-based sharing",
    "AI-assisted triage",
    "Lifelong timeline",
    "Tamper-evident passports",
    "Owner-controlled access",
  ],
};
