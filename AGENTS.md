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
5. **Verify changes** — follow **`Tests/SOP.md`**: run lint/build ([12-build-lint-deploy.md](Tests/12-build-lint-deploy.md)),
   then the subsystem checklists from [Tests/change-impact.md](Tests/change-impact.md) for everything you
   touched. For UI, check on `localhost` (`/brand` for design system). Billing changes: read `docs/BILLING.md`
   first and run [07-billing-payments.md](Tests/07-billing-payments.md).

## Keep the docs alive (required)

**After every decision or code change, update the docs in the same turn:**

- Append to the **Decision log** in `docs/CONTEXT.md` (date, what changed, and *why*).
- Append a one-line, user-facing bullet to the **Updates log** in `docs/UPDATES.md` (newest first) for any shipped/user-visible change. This file is shown read-only in `/admin`, so keep it plain-English and free of secrets.
- Update any affected section (architecture, account model, infra, gotchas, pending work).
- If a change alters how agents should behave, update this `AGENTS.md` too.

Treat documentation as part of "done" — a change isn't complete until `docs/CONTEXT.md` reflects it. Keep entries concise and factual. **Every commit that changes behaviour must include the matching doc update in that same commit** — if you find yourself about to `git commit` code without a `docs/CONTEXT.md` change, stop and write the decision-log entry first.

## Quick facts

- Stack: Next.js 16 (App Router) · React 19 · Tailwind v4 · Prisma 7 + Postgres (Neon) · Vercel Blob · Google Gemini via AI SDK.
- Routes & accounts: `/` = public landing, `/owner` + `/shop` + `/facility` = per-type landing/auth. **Unified auth** — a `User` with `orgId` is a shop/facility (workspace `/app/*`, gated by `requireActiveOrg()`), without `orgId` is an **owner** (`/me/*`). `/passport/[token]` is the public passport.
- **Third account type — facility (宠物医院/寄养)**: an `Organization` with `kind` `HOSPITAL`|`BOARDING` (`isFacilityKind`/`isFacilityOrg`). Facilities **don't own pets** and **can't issue passports**; they get **time-boxed** access to owner pets via `PetStay` (`(petId, orgId)`, `ACTIVE`|`ARCHIVED`). Owner shows a QR (`Pet.stayToken`); facility scans → `admitPetByToken` (active stay). Owner taps "taken back" → `releasePet` archives stays + rotates `stayToken` (old QR dies). While ACTIVE the facility sees full current history; once ARCHIVED `getFacilityPetView` windows logs to `releasedAt` (no new owner data leaks) and the view is read-only (no AI/triage/transfer tabs, no delete). Facility logs are tagged `LogEntry.loggedBy{OrgId,Name}` → "Logged by <facility>". KYC + billing reuse the shop flow (same `/verify`, same `SHOP_BILLING` pricing). **Capacity (mirrors the SHOP plan):** a facility holds `FACILITY_BASE_CAPACITY` (**50**) pets in care at once; extra "care slots" are **¥30/mo** each (`FACILITY_EXTRA_SLOT_PRICE_RMB`, stored in `org.extraPetSlots`, persist while paid even if empty, no hard cap). Billing page lists plan benefits (`facility.planBenefits`) + the slot price. `admitPetByToken` blocks with `CAPACITY_REACHED` when full; `addFacilitySlot`/`buyFacilitySlot` grant a slot (demo-grant now, Stripe `org_slot` path ready). `/app` pages branch on `isFacilityOrg`.
- Single-device owners / multi-device shops: owner accounts may only be logged in on **one device** at a time; shops are **multi-device** (unlimited). Enforced via `User.sessionId`/`sessionExpiresAt` + a `sid` embedded in the signed cookie (`src/lib/auth.ts`): `setSession(id, { single })` records the sid for owners, `getCurrentUser` logs out a device whose sid no longer matches (kicked, on its next request). All owner sign-ins (`signIn`, `verifyPhoneOtp`, `claimPassport`) check `hasActiveSession()` and return `{ conflict: true }` so `AuthCard` can offer "kick other device" (resubmits with `force=1`). Phone OTP uses `verifyOtp(..., { consume:false })` for the pre-check so the code survives the forced retry.
- Plans: owner = **1 pet free, $2.99/mo per extra, hard cap 10**; shops/facilities = free `STARTER` (default) or paid `SHOP` — **$29.99/month or $299/year** (`SHOP_BILLING`, `org.planInterval`); extra pet/care slots **$4.99/mo**. Stripe Checkout uses dynamic `price_data` in **USD**. Referral programme **removed** (parked in `docs/REFERRALS_DEFERRED.md`). Only **verified** shops can issue passports.
- **Locale:** localStorage (`pawsure-locale`) + geo default (CN/HK/MO → zh, else en). Client mirrors to cookie for SSR; no `setLocale` server action.
- Account: `/me/account` (owners) and `/app/account` (shops/facilities) — profile + **Stripe Customer Portal** for cancel/update card + **permanent delete** (`deleteAccount` → `src/lib/account-delete.ts`, cancels all Stripe subs first). `/me/billing` and `/app/billing` = upgrades & quota only. **Slot entitlements:** `OwnerPetSlot` + `OrgSlot` (`care`|`shop_pet`); revoked slots → view-only pets (no log/AI). Live Stripe: `docs/LIVE_STRIPE.md`.
- Payments: **Stripe card checkout only** (`createStripeCheckout` in `lib/billing.ts`). All paid products use Stripe **subscriptions**. **Before editing billing:** read `docs/BILLING.md` (metadata contract, no `revalidatePath` on sync, never un-revoke slots). **WeChat Pay + Alipay removed** until incorporation — `docs/PAYMENTS_WALLETS_DEFERRED.md`. Live: `docs/LIVE_STRIPE.md`. **China GTM:** HK sole prop + Stripe HK for cards; native mainland wallets need incorporation. See `docs/CONTEXT.md`.
- AI is available to **both** owners and shops. Each pet page is tabbed (Health Log · AI Assistant · Triage); owners get this via `/me/pets/[id]/{chat,triage}` (sub-routes under `me/pets/[id]/layout.tsx`), shops via `/app/pets/[id]/...` (which also has a Transfer tab — owners don't). The chat API (`/api/pets/[id]/chat`) and `generateTriageReport` are gated by `**canAccessPet(petId)`** in `lib/data.ts` (owner of the pet, or member of its org) — keep that check when adding new AI surfaces. AI context includes health logs **and** reference documents (`Attachment`); chat/triage pass image/PDF bytes for vision when present (`loadVisionAttachments`). The chat system prompt adapts its tone for owners vs shops. Triage rendering is the shared `components/TriageReport.tsx`. **Dates/times:** browser IANA timezone in `tz` cookie (`TimezoneSync`); pass `{ timeZone, locale }` to `formatDate`/`formatDateTime`; new logs send client `occurredAt`.
- Shop verification (KYC): new shops must upload proof at `**/verify`** (private Blob); team reviews at `**/admin`** (gated by `ADMIN_PASSWORD` and/or `ADMIN_EMAILS`). `createTransfer` requires `verificationStatus === "APPROVED"`. Existing orgs default to `UNVERIFIED` after the `shop_verification` migration — approve them via `/admin`.
- Deploy: Vercel project `pet-health-os` → [https://pet-health-os.vercel.app](https://pet-health-os.vercel.app). DB + compute both in `us-east-1`. New env vars: `ADMIN_PASSWORD` (required for `/admin`), optional `ADMIN_EMAILS`, `RESEND_API_KEY`/`RESEND_FROM`.
- China access: still on Vercel, fronted by a **Hong Kong Caddy reverse proxy** (`deploy/Caddyfile`) on a custom domain so it's reachable from the mainland without a VPN. App-side wiring: `serverActions.allowedOrigins` in `next.config.ts` (extendable via `PROXY_ALLOWED_ORIGINS`) and a same-origin blob image proxy `/api/img` (`src/lib/img.ts` `proxyImageSrc`, disable with `NEXT_PUBLIC_IMG_PROXY=0`) since `*.blob.vercel-storage.com` is GFW-blocked. Current: HK VPS `47.239.178.233`, domain `pethealthos.online` (temp). See `docs/CONTEXT.md` §7–8.
- Secrets are gitignored. A fresh clone needs `vercel link` then `vercel env pull` (see `.env.example` for the variable inventory).
- Commands: `npm run dev` · `npx next build` · `npm run db:migrate` · `npm run db:studio`.
- **Regression tests:** manual SOPs + checklists in **`Tests/`** ([README](Tests/README.md)). No automated
  test suite yet — update `Tests/` when adding flows or gates.