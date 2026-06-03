<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PawSure 宠诺 — agent operating guide

**Read [`docs/CONTEXT.md`](docs/CONTEXT.md) first.** It is the living source of truth for product decisions, architecture, the account/plan model, infrastructure, known gotchas, and pending work. The chat history that produced this project does **not** travel with the repo — `docs/CONTEXT.md` is how that context is preserved. Trust it over your assumptions.

## How to work on this project (inherit this behaviour)

Be collaborative and consultative, not just an order-taker:

1. **Ask clarifying questions before acting** when a request is ambiguous, has meaningful trade-offs, or is large/irreversible. Prefer structured multiple-choice questions. Make reasonable default decisions for small/reversible choices (naming, formatting), but **confirm scope, destructive actions, infra, billing/pricing, and legal decisions** first.
2. **Diagnose with evidence before concluding.** Measure/inspect rather than guess (e.g., we proved the "slow load times" were client-side packet loss, not the DB or region, by measuring TTFB/connect times). State findings, then recommend.
3. **Present options with trade-offs** and give a clear recommendation; let the user choose direction on big calls.
4. **Don't deploy or push to git unless explicitly asked.** When asked, commit with a descriptive message, push to `main`, then `vercel --prod --yes`.
5. **Verify changes** — run lint/build and, for UI, check on `localhost` (the `/brand` page showcases the design system) before reporting done.

## Keep the docs alive (required)

**After every decision or code change, update the docs in the same turn:**

- Append to the **Decision log** in `docs/CONTEXT.md` (date, what changed, and *why*).
- Update any affected section (architecture, account model, infra, gotchas, pending work).
- If a change alters how agents should behave, update this `AGENTS.md` too.

Treat documentation as part of "done" — a change isn't complete until `docs/CONTEXT.md` reflects it. Keep entries concise and factual.

## Quick facts

- Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · Prisma 7 + Postgres (Neon) · Vercel Blob · Google Gemini via AI SDK.
- Routes & accounts: `/` = public landing, `/owner` + `/shop` = per-type landing/auth. **Unified auth** — a `User` with `orgId` is a **shop** (workspace `/app/*`, gated by `requireActiveOrg()`), without `orgId` is an **owner** (`/me/*`). `/passport/[token]` is the public passport.
- Plans: owner = 2 pets free, **¥25/mo per extra, hard cap 10**; shops = `STARTER`/`SHOP`. Only **verified** shops can issue passports.
- Shop verification (KYC): new shops must upload proof at **`/verify`** (private Blob); team reviews at **`/admin`** (gated by `ADMIN_PASSWORD` and/or `ADMIN_EMAILS`). `createTransfer` requires `verificationStatus === "APPROVED"`. Existing orgs default to `UNVERIFIED` after the `shop_verification` migration — approve them via `/admin`.
- Deploy: Vercel project `pet-health-os` → https://pet-health-os.vercel.app. DB + compute both in `us-east-1`. New env vars: `ADMIN_PASSWORD` (required for `/admin`), optional `ADMIN_EMAILS`, `RESEND_API_KEY`/`RESEND_FROM`.
- Secrets are gitignored. A fresh clone needs `vercel link` then `vercel env pull` (see `.env.example` for the variable inventory).
- Commands: `npm run dev` · `npx next build` · `npm run db:migrate` · `npm run db:studio`.
