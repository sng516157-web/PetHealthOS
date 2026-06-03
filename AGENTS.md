# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# PawSure 宠诺 — agent operating guide

**Read `[docs/CONTEXT.md](docs/CONTEXT.md)` first.** It is the living source of truth for product decisions, architecture, the account/plan model, infrastructure, known gotchas, and pending work. The chat history that produced this project does **not** travel with the repo — `docs/CONTEXT.md` is how that context is preserved. Trust it over your assumptions.

## How to work on this project (inherit this behaviour)

Be collaborative and consultative, not just an order-taker:

1. **Ask clarifying questions before acting** when a request is ambiguous, has meaningful trade-offs, or is large/irreversible. Prefer structured multiple-choice questions. Make reasonable default decisions for small/reversible choices (naming, formatting), but **confirm scope, destructive actions, infra, billing/pricing, and legal decisions** first.
2. **Diagnose with evidence before concluding.** Measure/inspect rather than guess (e.g., we proved the "slow load times" were client-side packet loss, not the DB or region, by measuring TTFB/connect times). State findings, then recommend.
3. **Present options with trade-offs** and give a clear recommendation; let the user choose direction on big calls.
4. **Don't deploy or push to git unless explicitly asked.** When asked, **first update `docs/CONTEXT.md` (and `AGENTS.md` if behaviour changed), then stage the docs together with the code so they land in the *same commit*.** Commit with a descriptive message, push to `main`, then `vercel --prod --yes`. A commit that changes behaviour but not the docs is incomplete — never ship one.
5. **Verify changes** — run lint/build and, for UI, check on `localhost` (the `/brand` page showcases the design system) before reporting done.

## Keep the docs alive (required)

**After every decision or code change, update the docs in the same turn:**

- Append to the **Decision log** in `docs/CONTEXT.md` (date, what changed, and *why*).
- Update any affected section (architecture, account model, infra, gotchas, pending work).
- If a change alters how agents should behave, update this `AGENTS.md` too.

Treat documentation as part of "done" — a change isn't complete until `docs/CONTEXT.md` reflects it. Keep entries concise and factual. **Every commit that changes behaviour must include the matching doc update in that same commit** — if you find yourself about to `git commit` code without a `docs/CONTEXT.md` change, stop and write the decision-log entry first.

## Quick facts

- Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · Prisma 7 + Postgres (Neon) · Vercel Blob · Google Gemini via AI SDK.
- Routes & accounts: `/` = public landing, `/owner` + `/shop` = per-type landing/auth. **Unified auth** — a `User` with `orgId` is a **shop** (workspace `/app/*`, gated by `requireActiveOrg()`), without `orgId` is an **owner** (`/me/*`). `/passport/[token]` is the public passport.
- Single-device owners / multi-device shops: owner accounts may only be logged in on **one device** at a time; shops are **multi-device** (unlimited). Enforced via `User.sessionId`/`sessionExpiresAt` + a `sid` embedded in the signed cookie (`src/lib/auth.ts`): `setSession(id, { single })` records the sid for owners, `getCurrentUser` logs out a device whose sid no longer matches (kicked, on its next request). All owner sign-ins (`signIn`, `verifyPhoneOtp`, `claimPassport`) check `hasActiveSession()` and return `{ conflict: true }` so `AuthCard` can offer "kick other device" (resubmits with `force=1`). Phone OTP uses `verifyOtp(..., { consume:false })` for the pre-check so the code survives the forced retry.
- Plans: owner = 2 pets free, **¥25/mo per extra, hard cap 10**; shops = `STARTER`/`SHOP`. Only **verified** shops can issue passports.
- Payments: **Stripe processes all three buttons** (card / Alipay / WeChat Pay) via `createStripeCheckout` in `lib/billing.ts` — the cross-border path so a **HK Stripe account** charges mainland users with no native merchant account. Cards = monthly subscription; Alipay/WeChat Pay = one-time `mode:"payment"` (Stripe has no recurring for them). Going live needs only `STRIPE_SECRET_KEY` + enabling Alipay/WeChat in the Stripe Dashboard. **China GTM:** founder is a HK resident → lightweight legal path is **sole proprietor + HK Business Registration + Stripe HK** (no company/ICP needed); mainland hosting/native wallets would need a mainland company + ICP. See `docs/CONTEXT.md` decision log for the full reasoning.
- AI is available to **both** owners and shops. Each pet page is tabbed (Health Log · AI Assistant · Triage); owners get this via `/me/pets/[id]/{chat,triage}` (sub-routes under `me/pets/[id]/layout.tsx`), shops via `/app/pets/[id]/...` (which also has a Transfer tab — owners don't). The chat API (`/api/pets/[id]/chat`) and `generateTriageReport` are gated by `**canAccessPet(petId)`** in `lib/data.ts` (owner of the pet, or member of its org) — keep that check when adding new AI surfaces. The chat system prompt adapts its tone for owners vs shops. Triage rendering is the shared `components/TriageReport.tsx`.
- Shop verification (KYC): new shops must upload proof at `**/verify`** (private Blob); team reviews at `**/admin**` (gated by `ADMIN_PASSWORD` and/or `ADMIN_EMAILS`). `createTransfer` requires `verificationStatus === "APPROVED"`. Existing orgs default to `UNVERIFIED` after the `shop_verification` migration — approve them via `/admin`.
- Deploy: Vercel project `pet-health-os` → [https://pet-health-os.vercel.app](https://pet-health-os.vercel.app). DB + compute both in `us-east-1`. New env vars: `ADMIN_PASSWORD` (required for `/admin`), optional `ADMIN_EMAILS`, `RESEND_API_KEY`/`RESEND_FROM`.
- Secrets are gitignored. A fresh clone needs `vercel link` then `vercel env pull` (see `.env.example` for the variable inventory).
- Commands: `npm run dev` · `npx next build` · `npm run db:migrate` · `npm run db:studio`.

