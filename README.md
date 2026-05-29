# Pet Health OS

A health **system of record** for pet shops (and breeders/shelters). Log a pet's
health in plain language, let AI structure and reason about it, run a triage
assessment to prepare for the vet, and hand the new owner a portable **health
passport** when the pet is sold or adopted.

## Features

- **Dashboard** — every pet at a glance, "needs attention" surfacing, upcoming care.
- **Health Log (hybrid)** — write a note naturally; the AI auto-classifies it into
  a type (illness / vet visit / observation / medication / discomfort / …),
  severity, a short title, and tags. Browse a filterable timeline.
- **AI Assistant** — a per-pet chat grounded **only** in that pet's log (no
  cross-contamination between pets).
- **Triage** — proactive flags for serious recent entries, plus an on-demand
  assessment with urgency, concerns, a recommendation, and questions for the vet.
- **Reminders** — vaccines, medications, deworming, and appointments per pet and
  across the shop.
- **Health passport transfer** — generate a read-only public record (`/passport/<token>`)
  with the full profile + history to give a new owner.

## Architecture

One database, **strict per-pet logical scoping**:

```
Organization (the shop)
└── Pet
    ├── LogEntry      (the health record)
    ├── Reminder      (schedule)
    ├── Conversation  (AI chat)
    ├── TriageReport
    └── Transfer      (health passport)
```

The AI is always given exactly one pet's context at query time.

## Stack

- **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4**
- **Prisma 7** + **SQLite** (via the `better-sqlite3` driver adapter)
- **Vercel AI SDK** through the AI Gateway, with a graceful rule-based fallback

## Getting started

```bash
npm install
npm run db:migrate   # apply schema (already applied if dev.db exists)
npm run db:seed      # load the demo shop (Mango, Luna, Rocky)
npm run dev
```

Open the app and explore. To enable full natural-language AI, add an AI key to
`.env` (see the commented lines there):

```bash
AI_GATEWAY_API_KEY="..."
```

Without a key the app runs in **demo mode**: log structuring and triage use
deterministic rules, and the assistant summarizes the log. Everything is fully
functional either way.

## Useful scripts

| Script            | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the dev server                           |
| `npm run db:seed` | Reset + load demo data                         |
| `npm run db:reset`| Drop DB, re-migrate, re-seed                   |
| `npm run db:studio`| Open Prisma Studio                            |

## Notes & next steps (prototype scope)

- Single shop / single login for now (no auth yet) — the data model already has
  `Organization`, so multi-staff roles slot in cleanly later.
- SQLite is used for zero-config local dev; swap the Prisma adapter to Postgres
  (e.g. Neon) for deployment on Vercel.
- AI chat is currently session-only; the `Conversation`/`Message` tables exist
  to persist history when you want it.
