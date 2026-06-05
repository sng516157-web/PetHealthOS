# PawSure 宠诺 (Pet Health OS)

A health **system of record** for pet shops, breeders, and the owners they sell
to. Log a pet's health in plain language, let AI structure and reason about it,
run a triage assessment to prepare for the vet, and hand the new owner a
portable, verifiable **health passport** when the pet changes hands.

> **New here? Read [`AGENTS.md`](AGENTS.md) and [`docs/CONTEXT.md`](docs/CONTEXT.md) first.**
> The chat history that built this project does not travel with the repo —
> `docs/CONTEXT.md` is the living source of truth for product decisions,
> architecture, the account/plan model, infra, gotchas, and pending work. Trust
> it over assumptions. `docs/UPDATES.md` is the plain-English changelog.

## Features

- **Dashboard** — every pet at a glance, "needs attention" surfacing, upcoming care.
- **Health Log (hybrid)** — write a note naturally; AI classifies it into a type,
  severity, short title, and tags. Photo/video logging with visual triage.
- **AI Assistant** — a per-pet chat grounded **only** in that pet's log. Available
  to both owners and shops.
- **Triage** — proactive flags plus an on-demand assessment (urgency, concerns,
  recommendation, questions for the vet).
- **Proactive health watch** — a daily job flags anomalies; AI only phrases the alert.
- **Reminders** — vaccines, medications, deworming, appointments.
- **Health passport** — a verifiable, credential-style public record
  (`/passport/<token>`) with optional health guarantee; claimable **once** by a
  new owner to start a free account.
- **Accounts & billing** — unified auth: owners (free, 2 pets, ¥25/mo per extra,
  single-device) vs shops (`STARTER`/`SHOP`, multi-device, KYC-verified to issue
  passports). Stripe handles card / Alipay / WeChat Pay.
- **i18n** — full English + 简体中文 (UI and AI).

## Stack

- **Next.js 16** (App Router) · **React 19** · **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL (Neon)** via `@prisma/adapter-pg`
- **Vercel Blob** (uploads) · **Vercel AI SDK** + **Google Gemini** (rule-based fallback in demo mode)
- Deployed on **Vercel**, reachable from mainland China via a **Hong Kong Caddy
  reverse proxy** (`deploy/Caddyfile`)

## Getting started (fresh clone / new machine)

```bash
npm install                 # postinstall runs `prisma generate`

# Connect to the project's Vercel env (DATABASE_URL, AI key, Blob token, …):
npx vercel link             # link to project `pet-health-os`
npx vercel env pull         # writes .env (gitignored)
# …or set the vars by hand using .env.example as the inventory.

npm run db:migrate          # apply Prisma migrations to your DB
npm run db:seed             # load demo data (see docs/TestAccounts.md)
npm run dev
```

A Postgres connection string is **required** (point `DATABASE_URL` at a Neon
branch for local dev). Without an AI key the app runs in **demo mode** with
deterministic rule-based fallbacks — still fully functional.

## Useful scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the dev server                  |
| `npm run build`     | `prisma migrate deploy` + `next build`|
| `npm run db:migrate`| Create/apply a migration (dev)        |
| `npm run db:seed`   | Load demo data                        |
| `npm run db:reset`  | Drop DB, re-migrate, re-seed          |
| `npm run db:studio` | Open Prisma Studio                    |

## Docs

| File | Purpose |
| ---- | ------- |
| [`AGENTS.md`](AGENTS.md) | How to work on this project (read first) |
| [`docs/CONTEXT.md`](docs/CONTEXT.md) | Source of truth: decisions, architecture, infra, gotchas |
| [`docs/UPDATES.md`](docs/UPDATES.md) | Plain-English changelog (shown in `/admin`) |
| [`docs/PRD.md`](docs/PRD.md) · [`docs/ProductDoc.md`](docs/ProductDoc.md) | Product spec / Chinese pitch |
| [`docs/IdeaPool.md`](docs/IdeaPool.md) | Backlog of brainstormed features |
| [`docs/TestAccounts.md`](docs/TestAccounts.md) | Demo accounts |
