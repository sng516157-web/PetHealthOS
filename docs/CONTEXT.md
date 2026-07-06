# PawSure 宠诺 — Project Context (living document)

> This file preserves the decisions and reasoning that don't live in the code.
> **Every agent must keep it current** — see the rules in `/AGENTS.md`. After any
> decision or code change, update the relevant section and append to the
> Decision log below.

Last updated: 2026-07-06

---

## 1. Product

**PawSure 宠诺** — trusted lifelong **health passports** for pets.

- **Taglines:** "Every pet comes with confidence." / 让每一次托付，都更安心。
- **Core idea:** Breeders/shops/shelters log a pet's health over time, then issue
  a credible, tamper-evident **health passport** that transfers with the pet when
  it goes to a new owner. The new owner can claim it and continue the same
  lifelong timeline. AI assists with log structuring, Q&A, and vet triage.
- **Primary segment:** breeders / catteries (猫舍) / kennels (犬舍) / shops. New
  pet owners are the second segment (the growth loop: every sale → a new user).
- **Market:** Greater China first (mainland + HK/TW/overseas Chinese), open to global.
- **Tone:** warm, trustworthy, modern, calm, premium, responsible. Avoid clinical,
  childish, or generic-SaaS styling.

Deeper product/strategy docs: `docs/PRD.md`, `docs/competitive-landscape.md`,
`docs/wtp-interview-script.md` (+ `.zh.md`).

---

## 2. Architecture & stack

- **Next.js 16** (App Router, TypeScript), **React 19**, **Tailwind v4** (theme
  tokens in `src/app/globals.css`).
- **Prisma 7** + **PostgreSQL (Neon)** via `@prisma/adapter-pg`. Client singleton
  in `src/lib/prisma.ts`. Migrations use the **unpooled** URL (see
  `prisma.config.ts`); runtime uses the **pooled** URL.
- **AI:** Groq via the Vercel AI SDK (`@ai-sdk/groq`); logic in
  `src/lib/ai.ts`. Locale-aware. Context = health log **plus** reference documents
  (`Attachment` metadata in `buildPetContext`; up to 4 image/PDF files loaded for
  vision via `loadVisionAttachments` / `fetchStoredFileBytes`). Chat and triage both
  pass multimodal parts when documents exist. Log enrichment runs in the background
  via `after()` so saves feel instant. **Org workspace AI** (`/app/ai`, shops +
  facilities): roster-wide chat (`/api/org/chat`) and ward triage
  (`generateOrgWardTriageReport`) over all pets in care via `getOrgPetsForAI()`.
  Per-pet chat/triage remains on each pet page.
- **Timezone:** Browser IANA timezone auto-detected on first visit (`TimezoneSync` →
  `setTimezone` cookie `tz`). `formatDate` / `formatDateTime` (`src/lib/format.ts`)
  use `Intl` with that timezone + UI locale. New log entries send client `occurredAt`
  (ISO) from `QuickAddLog` so stored timestamps match the user's "now". No GPS /
  schema migration — cookie only.
- **Uploads:** Vercel Blob in prod, local filesystem fallback in dev (`saveUpload`).
- **i18n:** `en`/`zh` dictionaries in `src/lib/i18n/` (`en.ts` is the source of
  truth; `zh.ts` must mirror its shape — enforced by the `Dictionary` type).
  **Language:** stored in **localStorage** (`pawsure-locale`); client mirrors to a
  short-lived cookie for SSR. **Default: English** — users opt into 中文 via `LocaleToggle`.
  Geo auto-switch disabled (HK proxy made every visitor look CN/HK). Search bots always get English SSR.
- **Auth:** **unified** — one `User` account system (scrypt email+password and/or
  phone OTP, signed cookies; `src/lib/auth.ts`). A `User` with `orgId` set is a
  **shop** account (manages an `Organization`); a `User` without `orgId` is an
  **owner** account. Sign-up picks the type (shop also creates the `Organization`).
  - **Device limits:** **owners = single device**, **shops = multi-device (unlimited)**.
    The signed cookie carries a session id (`sid`); for owners `setSession(id,{single:true})`
    also stores `User.sessionId`/`sessionExpiresAt`. `getCurrentUser` returns `null`
    (logs the device out on its next request) when an owner's cookie `sid` ≠ stored
    `sessionId` — i.e. it was kicked by a newer login. Shops skip the check. Sign-out
    clears the owner's stored session (`clearUserSession`). On login, all owner paths
    (`signIn`, `verifyPhoneOtp`, `claimPassport`) call `hasActiveSession()`; if active and
    not forced they return `{ conflict: true }`, and `AuthCard` shows a "sign out other
    device / cancel" choice that resubmits with `force=1`. Phone OTP pre-checks with
    `verifyOtp(..., { consume:false })` so the code survives the forced retry.
- **Routes:**
  - `/` = **public landing** (marketing + choose owner/shop + log in). Between “How it
    works” and the sample passport: **interactive mini dashboards** (`LandingMiniDashboards`)
    — real `*HomeView` components in preview mode + in-frame pet tabs. Maintained via
    `pet-tab-model.ts`, `dashboard-preview-data.ts`, `PreviewPetTabPanels.tsx` (see
    `AGENTS.md`). `/owner`, `/shop` = per-type landing pages (explain + login/create).
  - `/app/*` = **shop/breeder workspace** (sidebar; moved here from `/`). Gated by
    `requireActiveOrg()` → redirects non-shop / logged-out users to `/shop`.
  - `/me/*` = owner workspace. `/passport/[token]` = public passport.
  - **Pet detail tabs** (owner `/me/pets/[id]/*`, shop/facility `/app/pets/[id]/*`):
    major tabs — **Logs** (sub: Quick Log · Food · Activity), AI Assistant, Triage,
    Reminders, Weight, Documents; owners also get **Check-in**; shops get **Transfer**.
    Facility archived stays hide AI/Triage/Transfer. Reminders/weight/documents/check-in
    moved out of the old sidebar grid into dedicated routes.
  - `/login` = shared auth entry; `/pricing`, `/app/billing`, `/me/billing`,
    `/app/ai` = shop/facility workspace AI (assistant + ward triage),
    `/billing/success|cancelled`; `/brand` = design-system showcase; `/demo/*` = motion
    previews (noindex, not in sitemap).
- **Cron:** `/api/cron/reminders` (daily, `vercel.json`), guarded by `CRON_SECRET`.

---

## 3. Account & plan model

Defined in `src/lib/plans.ts`. Quotas are **hard-enforced** on pet creation.

**Organisations (breeders/shops)** — `ORG_PLANS`, **can issue passports** (once verified):
- `STARTER` — free, 5 pets.
- `SHOP` — **$14.99/mo or $149/yr** (`SHOP_BILLING`), 50 pets (+**$2.49/mo** per extra slot), multi-seat.

**Owners (consumers)** — `USER_PLANS`, **cannot issue passports**:
- `FREE` — **1 pet** free (Owner's Account / 主人账户). Created on passport-claim or self-signup.
- `PLUS` — **$6.99/mo or $80/yr** (`OWNER_BILLING`), **5 pets** included. No per-pet add-ons.

Notes:
- Owner quota = `plan.includedPets` only (`getUserUsage`, `getOwnerPetEntitlements`). Upgrade on
  `/me/billing` via `OwnerBilling` → Stripe (`scopeKind: user`, `planKey: PLUS`). Cancel → `FREE`;
  pets beyond the tier become view-only. Legacy `OwnerPetSlot` / `user_slot` Stripe subs still
  reverse via webhook sync but new slot purchases are disabled.
- Passport issuance is enforced **server-side** in `createTransfer`: requires an org
  pet on a passport-capable plan **AND** `org.verificationStatus === "APPROVED"`.
  Owner-managed pets (no `orgId`) are blocked.
- Claiming a transferred pet is intentionally **not** quota-blocked (protects the
  breeder→buyer handoff). The cap applies to pets an owner adds themselves.
- **Shop roster quota** counts only pets **in care** (`ACTIVE` / `UNDER_OBSERVATION`).
  Issuing a passport (`createTransfer`) sets `TRANSFERRED`, releases any linked
  `shop_pet` `OrgSlot`, and frees the slot for the next animal.

**Shop verification (KYC).** Shops must upload a business licence (营业执照) or
alternative proof and be **approved by the PawSure team** before issuing passports.
`Organization.verificationStatus`: `UNVERIFIED → PENDING → APPROVED | REJECTED`.
- Gate: `/app` layout redirects `UNVERIFIED`/`REJECTED` shops to **`/verify`**; `PENDING`
  shops are let in (with a banner) but passport issuance stays locked until `APPROVED`.
- Proof is stored as a **private** Blob (`saveVerificationDoc`, `access:"private"`;
  dev: `.uploads/`). Reviewers view it via the admin-only proxy `/api/admin/doc/[orgId]`.
- Admin area **`/admin`** (`src/lib/admin.ts`): gated by `ADMIN_PASSWORD` (shared
  password → signed `ph_admin` cookie) and/or `ADMIN_EMAILS` (logged-in user match).
  Reviewers approve/reject (`reviewOrg`) with a reason. New submissions email the team
  via `notifyAdmins` when `RESEND_API_KEY` + `ADMIN_EMAILS` are set. **Entitlement grants:**
  reviewers can comp an owner extra pet slot, facility care slot, or SHOP plan by account
  email (`AdminGrantPanel` → `adminGrantEntitlement` in `src/lib/admin-grants.ts`). Grant types:
  Owner Plus plan, facility care slot, or SHOP plan. Comped care slots set `OrgSlot.comped = true`
  so `syncSlotRevocationsFromStripe` does not revoke them on billing refresh; SHOP / Owner Plus
  use `activatePlan` (same as demo mode).
  **Unverified sign-ups:** `/admin` lists accounts with `emailVerifiedAt` null; reviewers can
  **Mark verified** (`markEmailVerifiedByAdmin`) for support. Verification emails send a **6-digit
  code** + HTML magic link (`EmailVerification.codeHash`); users can confirm on `/verify-email`
  without clicking the link.
- **Password reset:** `/forgot-password` → `sendPasswordResetEmail` (same Resend + code/link
  pattern as verify, 1-hour TTL) → `/reset-password` with token or email+code. Clears owner
  `sessionId` on success so old devices lose access. Sign-in tab links to forgot flow.

---

## 4. Key flows

- **Transfer / passport:** breeder calls `createTransfer` (no owner name/email — the
  shop only configures guarantee, visibility, and claimability) → freezes pre-transfer
  history (`lockedAt`), adds a "🏡 Homecoming day" milestone, marks pet `TRANSFERRED`
  (moves to the shop's **Archived** list), returns a token → public `/passport/[token]`.
  **One passport per pet** — a second `createTransfer` is rejected (`ALREADY_ISSUED`).
- **Claim:** if the breeder enabled it, the new owner scans the QR and registers
  (`claimPassport`: name, email, password — the only place owner credentials are
  collected) → creates/signs into an Owner's Account, sets `ownerUserId`, marks pet
  `ARCHIVED`.
- **Owner self-signup:** from `/` → `/owner`, "start fresh" → `register` (owner) → `/me`;
  or "scan a passport QR" (`PassportScanner`: camera via `html5-qrcode` + paste-link
  fallback) → `/passport/[token]` claim.
- **Shop signup:** from `/` → `/shop` → `register` with `accountType=shop` creates an
  `Organization`, links the `User` (`orgId`). New shops are `UNVERIFIED`, so the `/app`
  layout sends them to **`/verify`** to upload proof (→ `PENDING`) before using the
  workspace. `getActiveOrg()` resolves the logged-in user's org; `requireActiveOrg()`
  enforces it for `/app`.
- **Verification review:** `/verify` (`submitVerification`) → team approves at `/admin`
  (`reviewOrg`) → `APPROVED` unlocks passport issuance.
- **Billing:** `startCheckout` / `buyOwnerPetSlot` / `buyFacilitySlot` via **Stripe card
  checkout only** (`createStripeCheckout` in `lib/billing.ts`). Shop/facility plans,
  owner extra pet slots, and facility care slots all use Stripe **subscriptions** (monthly;
  shop also yearly). Fulfillment/reversal matrix: `docs/BILLING.md`. **WeChat Pay + Alipay
  removed** (2026-06-10)
  until incorporation — full revisit guide in `docs/PAYMENTS_WALLETS_DEFERRED.md`. Demo mode
  still activates instantly when `STRIPE_SECRET_KEY` is unset. Live: `STRIPE_SECRET_KEY` +
  `STRIPE_WEBHOOK_SECRET` + `APP_PUBLIC_URL=https://pethealthos.online`.

---

## 5. Infrastructure & deployment

- **Vercel project:** `pet-health-os` (team `sng516157-webs-projects`) →
  https://pet-health-os.vercel.app. Deploy with `vercel --prod --yes` (CLI is
  installed and linked) or push to `main`.
- **Neon Postgres:** region `us-east-1`. Co-located with Vercel compute (default
  `iad1`) → fast SSR (~0.3s incl. queries). Pooled endpoint at runtime.
- **GitHub:** `https://github.com/sng516157-web/PetHealthOS.git`, branch `main`.
- **Env vars (names only; values are gitignored):** `DATABASE_URL`,
  `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`,
  `GROQ_API_KEY`, plus Neon `POSTGRES_*`/`PG*`/`NEON_*`. Optional:
  `TWILIO_*`, `STRIPE_SECRET_KEY`, `WECHAT_PAY_*`, `ALIPAY_*`, Resend key. See
  `.env.example`. Fresh clone: `vercel link` → `vercel env pull`.

---

## 6. Brand kit

- Tokens (re-mapped Tailwind v4 theme) in `src/app/globals.css`: Sage Trust
  `#6FAF98` (actions), Forest Calm `#24594C` (headings), Soft Paper `#FFF8EF`
  (bg), Sand, Ink, Promise Gold, Calm Blue, Gentle Alert. Soft shadows, rounded
  surfaces, warm cream cards.
- Fonts: **Nunito** (en) + system CJK (zh) — no heavy CJK web font shipped.
- Logo: `src/components/PawSureLogo.tsx` — transparent mark (`pawsure-mark-*.png`);
  cream squircle composites in `app-icon-*.png` for favicons/OG. Master
  `pawsure-mark-1024.png`; regen via `scripts/generate-brand-icons.mjs`.
- Reusable component kit: `src/components/pawsure/` (Button, Input/Search,
  Chip/StatusBadge, Card/PetCard/ProfileCard, Modal, BottomSheet, Toast,
  TopAppBar, BottomTabBar, EmptyState, OnboardingCard). Review all of it at `/brand`.

---

## 7. Known gotchas

- **China access:** use **`https://pethealthos.online`** (HK proxy), not
  `*.vercel.app`, from mainland China without a VPN. The GFW interferes with Vercel's
  edge domain — **not** the DB or region. **Stripe return URLs** must use the same
  reachable domain: set `APP_PUBLIC_URL=https://pethealthos.online` on Vercel so
  Checkout `success_url`/`cancel_url` are not `pet-health-os.vercel.app` (post-payment
  redirect often hangs/fails on the mainland). Webhook fulfillment still runs if the
  redirect is missed — refresh billing after a minute or open
  `https://pethealthos.online/billing/success?session_id=…` from the Stripe receipt.
- **Hydration warning in the in-IDE browser** is a false positive — the Cursor
  browser injects `data-cursor-ref` attributes. Not a real bug; ignore.
- **Vercel Blob URLs** (`*.blob.vercel-storage.com`) are also GFW-blocked. Pet
  photos / log media / attachments are now served through a same-origin proxy
  `/api/img?u=<blob url>` (`src/lib/img.ts` `proxyImageSrc` + `src/app/api/img/route.ts`),
  so they load through the reachable proxy domain. Disable with
  `NEXT_PUBLIC_IMG_PROXY=0` if a CDN later fronts the blob store.
- `zh.ts` must mirror `en.ts` exactly (type-enforced). Update both together.
- **Dates before timezone cookie:** first paint may use `UTC` until `TimezoneSync`
  detects the browser zone and `router.refresh()` — one brief flash possible on cold load.
- **pg SSL warning in dev:** Neon/Vercel URLs often use `sslmode=require`; `normalizePgConnectionString`
  in `src/lib/pg-connection.ts` rewrites to `verify-full` before connect (same behavior as today,
  silences pg v9 deprecation noise). Optional: set `sslmode=verify-full` in env directly.
- **Workspace motion:** dashboards and pet chrome use `MotionPop` (load-time stagger),
  not scroll-gated `MotionReveal` — avoids invisible UI until scroll.
- **Founding spot count:** `getFoundingBreederOffersAvailability()` is cached 60s;
  shop dashboard promo loads availability client-side so `/app` SSR stays fast.

---

## 8. Pending / next steps

- **China-accessible hosting (app side done; awaiting domain HTTPS).** Plan: a
  **Hong Kong reverse proxy** (Caddy) in front of the existing Vercel app + a
  custom domain — reachable from China without a VPN, no ICP needed (user has
  only a personal Chinese ID). App-side code changes are **done**: (1)
  `serverActions.allowedOrigins` in `next.config.ts` (defaults
  `pethealthos.online` + `www`, extendable via `PROXY_ALLOWED_ORIGINS`); (2)
  blob images proxied same-origin via `/api/img` (`src/lib/img.ts`); (3)
  `deploy/Caddyfile` committed. **Current setup:** HK VPS (Alibaba Cloud Simple
  Application Server) IP `47.239.178.233`, domain `pethealthos.online` (temp —
  brand may change). Remaining manual step (user): point DNS A records at the
  IP (Cloudflare "DNS only" / grey cloud) and reload Caddy with the domain so
  auto-HTTPS turns on; then logins/forms work (secure cookies need HTTPS).
  Latency optimisation (move compute+DB to Singapore) is a later step, after
  validation.
- Live Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) when ready. WeChat/Alipay
  deferred until incorporation — see `docs/PAYMENTS_WALLETS_DEFERRED.md`.
- **Automated data import (AI).** v1 manual queue shipped; **admin import workspace** at
  `/admin/imports/[id]` parses CSV, maps columns (incl. 宠舍管家-style headers), applies rows
  → pets/logs/weight and PDFs → attachments; `processingState` JSON is the stable plan shape for
  future AI. Next: AI column-mapping suggestions + doc classification.

---

## Decision log

- **2026-07-06** — **Waffo domain verification meta tag.** Added
  `<meta name="waffo-verify" content="c8597952f5254f27a0cfacf28c99297d">` to homepage
  metadata (`src/app/page.tsx`) for Waffo merchant/domain verification.

- **2026-07-05** — **Quick-log time parse fix.** Natural-time parser no longer treats
  duration numbers (`20 minutes`) as clock hours; prefers explicit `at 11 am` matches
  and interprets wall times in the user's IANA timezone (cookie / form `timeZone`).

- **2026-07-05** — **Unified quick log + medication tab.** Quick Log merges health, food,
  activity, and medication entries in one timeline with bucket badges; freeform notes are
  AI/heuristic-routed to the right table (`FoodLogEntry`, `ActivityLogEntry`,
  `MedicationLogEntry`, or `LogEntry`). Natural-language time hints (e.g. "11 am", "昨天
  下午") set `occurredAt`; category forms get an explicit date/time field. New
  `MedicationLogEntry` model + `/food|/activity|/medication` sub-tabs. Migration:
  `20260705140000_medication_logs`.

- **2026-07-01** — **Transparent brand mark.** UI uses background-free
  `pawsure-mark-*.png` (tile wrapper restored in `PawSureMarkTile`); favicons/OG
  still composite the mark onto cream `#FAF3EB` squircles via the icon script.

- **2026-07-01** — **Brand logo refresh.** Replaced inline SVG paw/shield mark with the
  new gradient heart-check squircle (`#FAF3EB` tile). Regenerated `public/brand/app-icon-*`
  sizes, `src/app/icon.png` / `apple-icon.png`, and SVG lockups embed the raster mark.
  `scripts/generate-brand-icons.mjs` resizes from `app-icon-1024.png`.

Newest first. One entry per decision/change: date — what — why.

- **2026-07-01** — **Owner AI prompt suggestions.** `ChatPanel` `audience=owner` uses
  `chat.ownerStarters` + `ownerGrounded`; shop uses `shopStarters`. Removed quick-log
  suggestion chips entirely.
- **2026-07-01** — **Editable pet profiles.** `updatePet` + `/app/pets/[id]/edit` and
  `/me/pets/[id]/edit` — same validation as create; shop includes litter + lineage; gated by
  `requirePetWriteAccess` (not facility / memorial / slot read-only).
- **2026-07-01** — **Breeder wedge + high-impact UX (2026-07-01 backlog).** Shipped: (1) owner
  home scan CTA + non-collapsible scanner; (2) shop onboarding checklist on `/app`; (3) mobile
  bottom nav “More” sheet (billing, account, feedback); (4) `Pet.litterName` + filter/bulk
  log; (5) `VaccineScheduleTemplate` + default puppy/kitten schedules; (6) `Pet.previewToken`
  + `/preview/[token]` buyer preview; (7) `/app/pets/[id]/handover` print/PDF; (8)
  `PassportShareButtons` (WhatsApp + WeChat copy). Registry: `docs/FEATURES.md`. Migration:
  `20260701120000_breeder_wedge_features`.
- **2026-07-01** — **UX backlog doc location.** Moved product-review waiting list to
  `docs/UX Improvement Waiting List/2026-07-01.md` (was briefly at repo root).
- **2026-07-01** — **pg SSL connection string.** `normalizePgConnectionString` rewrites Neon
  `sslmode=require` → `verify-full` before connect — same TLS behavior, silences pg v9
  deprecation warning in dev.
- **2026-07-01** — **UX bug-fix pass (motion, i18n, perf, routing, copy).** Why (review):
  (1) Workspace UI used scroll-gated `MotionReveal` — pet tabs and dashboard sections
  could stay `opacity-0` until scroll; switched to `MotionPop` on all workspace surfaces
  (landing/marketing still uses `MotionReveal`). (2) Locale hydration: `setLocale` no
  longer updates client state before `router.refresh()`; cookie + server `initialLocale`
  are source of truth; stale cookie vs localStorage triggers one refresh. (3) Perf:
  founding-breeder availability cached 60s; removed from `/app` SSR `Promise.all` —
  `FoundingBreederDashboardPromo` fetches client-side. (4) `/me/pets` → redirect `/me`.
  (5) Owner home duplicate subtitle removed. (6) Pricing/owner billing: `ownerAiAssistant`
  copy (per-pet AI only — no workspace AI for owners). UX backlog in
  `docs/UX Improvement Waiting List/2026-07-01.md`.
- **2026-06-25** — **Mobile Safari / iPhone compatibility pass.** Why (user): layout and
  interaction bugs on Safari/Chrome mobile — horizontal clip, input zoom, modal scroll bleed,
  bottom nav hidden behind home indicator, and `100vh` panels taller than visible viewport.
  Fixes: `viewport-fit=cover` + safe-area padding on headers/nav/modals; 16px mobile form
  inputs; iOS scroll-lock for overlays; `dvh` height utilities for chat/workspace shells;
  `ps-scroll-x` on tab strips.
- **2026-06-25** — **Post-add microchip ID on pet profiles.** Why (user): chip numbers are often
  unknown at intake; shops and owners can now add or edit microchip on the pet header after
  creation (`updatePetMicrochip`, `PetMicrochipField`). Facilities remain read-only; value
  flows to passports.
- **2026-06-25** — **Landing clarity + founding pricing + log date validation.** Why (user):
  (1) Homepage hero and owner path copy now lead with **1 pet free forever** for owners.
  (2) Founding breeder lifetime split into **$99 early** (25 spots, `FOUNDING_BREEDER_EARLY`)
  shown above **$299 standard** (`FOUNDING_BREEDER_LIFETIME`); $299 stays available when early
  sells out; auto-checkout prefers early. Env: `STRIPE_FOUNDING_BREEDER_EARLY_PRICE_ID`,
  `FOUNDING_BREEDER_EARLY_LIMIT`.
  (3) Health log `occurredAt` rejects future dates server-side (`resolveLogOccurredAt` →
  `DATE_FUTURE`); reminders still allow future `dueAt`.
- **2026-06-25** — **Admin import workspace (`/admin/imports/[id]`).** Why (user): ops tool to
  view CSV rows + PDFs and assign data to pets, logs, weights, and document attachments — manual
  today, same `DataImportProcessingState` JSON for future AI automation. Auto-parses CSV with
  column alias map; per-row apply bypasses pet quota; PDFs copied from private blob to public
  attachments. Linked from `/admin` import queue. Migration `20260625140000_data_import_processing_state`.
- **2026-06-25** — **Manual data import queue (CSV + PDF).** Why (user): reduce switching
  friction from competitor apps / paper records without building full AI ingestion yet.
  `DataImportRequest` stores private doc refs; shop/owner dashboards expose upload UI with
  honest SLA copy (up to 24h for messy scans, no mention of manual ops); `/admin` review
  queue with file proxy downloads; landing + `/shop` advertise import. AI automation is
  explicit follow-up in pending work.
- **2026-06-25** — **Breeder workflow demo video (1080p, ~2:00).** Why (user): one silent
  screen recording of the **real app** for breeder marketing + later English VO. Output
  `public/demos/breeders/breeder-workflow.{mp4,webm}` (1920×1080, trimmed to 120s); script in
  `docs/BREEDER_DEMO_SCRIPT.md`. Playwright recorder `npm run record:breeder-workflow` (verify →
  dashboard → Pearl log/tabs → transfer → passport); demo seed adds **Pearl** + `emailVerifiedAt`
  on all demo users. Legacy four 9s synthetic clips (`record:breeder-demos`, `/demo/capture/breeder-*`)
  superseded but left in repo.
- **2026-06-17** — **Feedback form replaces public support email.** Why (user): avoid
  exposing operator inbox; `/feedback` collects email, optional name, and message with a
  UUID reference; Resend delivers to `FEEDBACK_INBOX_EMAIL`. Nav link on landing, pricing,
  owner header, shop mobile header, and sidebar.
- **2026-06-17** — **AI provider: Groq (replaces Google Gemini).** Why (user): switch to
  Groq for chat/triage/structuring via `@ai-sdk/groq`; env `GROQ_API_KEY`, optional
  `GROQ_MODEL` / `GROQ_VISION_MODEL`. PDF attachments stay metadata-only; images use vision model.
- **2026-06-17** — **Hotfix: homepage server error.** `FoundingBreederHomepageSection` was a client
  component receiving the full i18n `Dictionary` (with functions) from the server — React 19 rejects
  that. Pass pre-rendered price strings from the server parent instead.
- **2026-06-17** — **Founding breeder funnel + permanent forfeiture.** Why (user): homepage founding
  CTA → `/shop?founding=1` with intent cookie; after email verify, `/app?founding=1` auto-starts
  Stripe checkout; KYC gate skipped while intent cookie + STARTER. `Organization.foundingBreederEligible`
  set false on monthly/yearly SHOP activation; billing shows greyed-out founding card with
  explanation. Migration `20260617150000_founding_breeder_eligible`.
- **2026-06-17** — **Founding breeder UI: dashboard promo + live countdown + sold-out removal.** Why
  (user): show founding lifetime on shop dashboard (`/app` home) for STARTER orgs; display real
  remaining/limit with progress bar (`FoundingBreederSpotCounter`, polls
  `/api/founding-breeder-lifetime/availability` every 30s); when cap reached hide offer from all
  surfaces (homepage, pricing, billing, dashboard) — no disabled “sold out” card. Lifetime orgs
  still see active badge on billing.
- **2026-06-17** — **Founding Breeder Lifetime Deal ($299 one-time).** Why (user): offer early
  breeders lifetime access to core passport features without recurring subscription. Plan key
  `FOUNDING_BREEDER_LIFETIME` (same SHOP entitlements, `planInterval: lifetime`); Stripe
  one-time Checkout; cap via `FOUNDING_BREEDER_LIFETIME_LIMIT`; pricing UI + `/app` home promo +
  `/app/billing` + homepage founding section; analytics `founding_lifetime_cta_clicked`.
- **2026-06-17** — **Homepage proof strip copy.** Why (user): reflect broader early
  traction — "Now reaching 50+ testers worldwide" on production homepage proof strip.
- **2026-06-17** — **Owner Plus subscription (replaces per-pet slots).** Why (user): simplify
  owner billing to $6.99/mo or $80/yr for 5 pets; remove extra-slot purchases. New `PLUS` plan
  in `USER_PLANS`; `/me/billing` uses `OwnerBilling`; entitlements by plan tier only. Legacy
  `user_slot` Stripe subs still reverse via webhook sync.
- **2026-06-16** — **Passport-first homepage (production `/`).** Why (user approved after
  `/demo/homepage-v2` review): replaced legacy landing with passport-first layout — dual shop/owner
  hero CTAs, proof strip, owner-first paths, founding offer, shop+owner mini dashboards. Shared
  component `PassportHomepageLanding`; demo route kept as archive with banner.
- **2026-06-16** — **Shop quota frees on passport issue.** Why (user): transferred pets should
  not keep consuming roster quota or paid `shop_pet` slots. `getOrgUsage` + `assignShopPetSlot`
  count only `ACTIVE`/`UNDER_OBSERVATION` pets; `createTransfer` calls `releaseShopSlotForPet`.
- **2026-06-16** — **Workspace AI for shops & facilities (`/app/ai`).** Why (user request):
  facilities lacked org-wide AI in marketing preview and needed roster-level agents for shops too.
  `getOrgPetsForAI()` loads shop roster or facility active stays; `/api/org/chat` streams answers;
  `generateOrgWardTriageReport` action runs ward triage. Nav + home promo cards; landing/pricing
  copy updated. Per-pet AI/triage on facility pet pages unchanged (active stays only).
- **2026-06-16** — **Homepage mini dashboard 16:9 frame.** Why (squashed portrait slot in narrow
  column): `MiniDashboardFrame` uses `aspect-video` + internal scroll; showcase block is full width
  with callout copy below.
- **2026-06-16** — **Homepage interactive mini dashboards (production).** Why (user request):
  replace static screenshot mocks with clickable previews on `/` between “How it works” and the
  sample passport. Reuses real `*HomeView` components via optional `preview` props; pet drill-in
  uses `pet-tab-model.ts` + `PetTabsInteractive` + `PreviewPetTabPanels`. Sample data in
  `lib/dashboard-preview-data.ts`. `/demo/landing-dashboards` mirrors the live block.
- **2026-06-16** — **Pet page navigation + logging expansion.** Why (user approved
  `/demo/pet-nav` preview). Replaced the single-page sidebar layout with major tabs on
  all account types: Logs (Quick Log / Food / Activity sub-tabs), AI, Triage, Reminders,
  Weight, Documents, Check-in (owners) or Transfer (shops). Weight tab: SVG trend chart +
  collapsible history; Documents: category sub-tabs. New `FoodLogEntry` /
  `ActivityLogEntry` models + CRUD actions; AI triage/chat cross-reference all three log
  types. Owners can edit/delete health logs (with save warning); shop/facility logs stay
  immutable. `/demo/triage-pdf` remains preview-only (not wired to triage yet).
- **2026-06-16** — **Password reset (`/forgot-password`).** Why (user request): email+password
  accounts had no recovery path. Resend email with 6-digit code + magic link (1h TTL); reset at
  `/reset-password` via link or code; invalidates owner `sessionId` on success; no email enumeration
  on request.
- **2026-06-16** — **Email verification hardening.** Why (3 sign-ups delivered but never
  verified): plain magic links alone are fragile in CN inboxes. Added 6-digit code + HTML email
  (button + monospace code + link fallback), code entry on `/verify-email`, stronger spam/QQ/163
  copy, register send-failure surfaced, `/admin` unverified queue with manual mark verified.
- **2026-06-16** — **Admin entitlement grants (`/admin`).** Why (user request): comp slots or
  SHOP plan by email without SQL or Stripe coupons. New `comped` flag on `OwnerPetSlot` /
  `OrgSlot`; Stripe sync only revokes non-comped ACTIVE slots. Grant types: owner extra pet,
  facility care slot, org SHOP plan (monthly).
- **2026-06-16** — **Mobile dashboard viewport clamp (follow-up).** Why (owner `/me`
  still clipped on iPhone): long flex text (scan passport copy) was expanding layout width
  past the viewport while `overflow-x-hidden` clipped the right edge. Fix: `overflow-x: clip`
  + `max-width: 100%` on html/body/workspace shells; explicit `grid-cols-1` + `min-w-0`
  on dashboard grids/cards; scan card description uses `break-words` instead of nowrap truncate.
- **2026-06-16** — **50% pricing reduction + mobile dashboard fixes.** Why (2-day ad
  campaign learnings): halved all USD prices in `plans.ts` — SHOP $14.99/mo · $149/yr;
  extra slots $2.49/mo; owner extra pet $1.49/mo. Stripe Checkout reads from same constants.
  Mobile: bottom tab bar uses shorter labels + no duplicate locale toggle; dashboard cards/headers
  stack on narrow screens; attention rows truncate instead of overflowing.
- **2026-06-09** — **Passport-first marketing pages (production).** Why (user approved deploy
  after `/demo/messaging` review). Replaced `/`, `/owner`, `/shop`, `/facility` copy with
  passport-first messaging; extracted landing i18n to `landing-en.ts` / `landing-zh.ts` and
  shared components under `components/landing/` (sample passport mirrors real
  `/passport/[token]`; removed "exportable records" claim). `/demo/messaging/*` kept as
  noindex preview archive.
- **2026-06-09** — **Messaging preview demo (`/demo/messaging/*`).** Why (user request):
  review passport-first landing copy before replacing production `/`, `/owner`, `/shop`,
  `/facility`. Demo routes only (noindex) — sample passport mock mirrors real
  `/passport/[token]` layout; trust copy avoids unimplemented "exportable records".
  Production pages unchanged until explicit deploy request.
- **2026-06-09** — **Pet closure (owner memorial + shop delete).** Why (user request). Owners
  can **remove** a pet (hard-delete self-added pets; claimed breeder pets → `ownerUserId: null`)
  or **archive after passing** (`status: DECEASED` → Memorial tab on `/me`, read-only, never
  deleted). Death archive requires tenure (6+ mo paid extra slot OR 2+ yr free account) + ≥2
  proof docs → `PetDeathClaim` PENDING; admin approves → Stripe customer balance credit ≈ 3×
  extra-pet slot fee (`deathCondolenceCreditUsd`). Memorial tab hidden when empty. Shops get
  regular delete only (blocked if passport issued or owner claimed). UI: `ClosePetPanel`,
  `DeleteShopPetPanel`, admin death-claim queue + private doc API.
- **2026-06-09** — **GSC canonical detection fix.** Why (user: Search Console showed no
  user-declared canonical). Next.js 16 streams metadata after the HTML shell — GSC can miss
  late `<link rel="canonical">`; set `htmlLimitedBots: /.*/` to render metadata synchronously
  in `<head>`. Marketing pages now emit absolute canonical URLs; removed root default
  `canonical: "/"` (was inherited by `/login` etc.); www → apex redirect on Caddy + Vercel.
- **2026-06-09** — **Edit/delete documents, weights, reminders.** Why (user request). New
  server actions `updateReminder`, `deleteReminder`, `updateWeight`, `updateAttachment`;
  panels get inline edit (pencil) + always-visible delete; `requirePetWriteAccess` gates all
  writes; headline `pet.weightKg` recalculates from latest entry on weight change/delete.
- **2026-06-09** — **Owner pet profile photo after creation.** Why (user request). Owner pet
  header uses `PetPhotoUpload` (same as shop); `updatePetPhoto` gated by `canAccessPet` +
  `canLog`; `/me` revalidated on upload.
- **2026-06-09** — **Remove aurora orbs from workspaces; soften marketing wash.** Why (user:
  peach/blue gradient felt awkward on pet pages). `/me` + `/app` use flat `bg-paper`; card
  motion kept. Public pages use `AuroraOrbs subtle` (brand/sage only, no gold/blue).
- **2026-06-09** — **Fix owner pet page crash.** Why (prod error on `/me/pets/[id]`). i18n
  `continueNote` is a function — can't pass it into client `OwnerPetChrome`; resolve the string
  on the server instead.
- **2026-06-09** — **Aurora motion across workspace pages.** Why (user: pet detail still
  static). `WorkspaceMotionShell` on `/me` + `/app` layouts; animated pet chrome, staggered
  panels on pet overview/chat/triage, and motion on account/billing pages.
- **2026-06-09** — **Animated full-width dashboards.** Why (user approved `/demo/dashboard`
  previews). Owner `/me` widened to `max-w-[1600px]`; shop/facility `/app` uses Aurora motion +
  bento layout (stats, attention, pets grid, reminders sidebar; facility adds capacity bar +
  admit hero). Shared `src/components/dashboard/*`; `/demo/dashboard/*` kept as noindex previews.
- **2026-06-15** — **Terms, Privacy & registration consent.** Why (user: legal compliance
  for global launch). `/terms`, `/privacy` (bilingual templates in `legal-policies.ts`);
  required checkbox on register + passport claim; `User.termsAcceptedAt` /
  `privacyAcceptedAt`. Disclaimer unchanged at `/disclaimer`.
- **2026-06-15** — **Aurora motion on marketing pages.** Why (user picked Aurora demo). Shared
  `src/components/motion/aurora.tsx` (orbs, scroll reveal, hero stagger, float on GIFs); applied to
  `/`, `/owner`, `/shop`, `/facility`, `/pricing`, `/disclaimer`, `/login`. CSS in `globals.css`;
  respects `prefers-reduced-motion`. Copy unchanged. `/demo/*` kept as noindex motion lab.
- **2026-06-14** — **English default locale (global audience).** Why (user: Google `site:`
  still Chinese; international GTM). Removed geo→zh SSR and client auto-switch — HK proxy
  tagged all traffic as HK. Default `en`; 中文 via toggle only. Marketing chrome hides 宠诺 when `en`.
- **2026-06-14** — **English SSR for search bots.** Why (GSC: zh body + en meta; international
  SEO). `getLocale()` returns `en` when User-Agent matches Googlebot/Bingbot/etc.; skip
  `LocaleBootstrap` for bots; `/api/geo` returns `en` for bots. Humans unchanged (geo → zh in CN/HK/MO).
- **2026-06-09** — **P0 SEO + GA4 for Ads.** Why (user: international traction). Added
  `metadataBase`, per-landing-page titles/descriptions/OG, `sitemap.xml`, `robots.txt`,
  `noindex` on app/auth routes, optional GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) with
  `sign_up`, `email_verified`, `begin_checkout`, `purchase` events. Manual steps in
  `docs/SEO_AND_ADS.md`.
- **2026-06-09** — **Email verify confirm → Route Handler.** Why (user: magic link 500 on
  Vercel). `cookies().set()` + `redirect()` in a Server Component page fails in production;
  moved to `GET /verify-email/confirm` route handler. Replay of consumed link still signs in
  if already verified; success banner on `/me?verified=1` / `/app?verified=1`.
- **2026-06-09** — **USD pricing + geo locale + localStorage language.** Why (user: global
  defaults). All Stripe charges in **USD** (`SHOP_BILLING` $29.99/mo · $299/yr; extra slots
  $4.99/mo; owner extra pet $2.99/mo). Language stored in **localStorage** (`pawsure-locale`)
  with client→cookie mirror for SSR; geo (CN/HK/MO → zh, else en) via `x-vercel-ip-country` /
  `/api/geo`. Removed `setLocale` server action.
- **2026-06-09** — **Account deletion with Stripe cancel.** Why (user: delete account option).
  `/me/account` and `/app/account` danger zone → `deleteAccount` action. Cancels all Stripe
  subs for the account (`cancelAllStripeSubscriptionsForCustomer`), revokes slots, then removes
  data: owner self-added pets deleted; claimed pets detached (`ownerUserId`/`orgId` nulled);
  shop/facility org deleted after detaching owner-claimed pets. Password + type `DELETE` confirm.
- **2026-06-09** — **AI sees reference documents + local timezone for dates.** Why (user:
  AI couldn't read vaccine/lab/pedigree files; log times showed UTC). `buildPetContext`
  lists attachments; chat/triage load image/PDF bytes for vision (max 4 × 8MB). Browser
  IANA timezone stored in `tz` cookie; all `formatDate`/`formatDateTime` call sites pass
  timezone + locale; `QuickAddLog` sends client `occurredAt` on save.
- **2026-06-11** — **Demo seed resets Stripe subscriptions.** Why (user: broken subs after test
  deploys). `seed-demo.ts` now cancels active Stripe subs for demo emails before DB recreate; loads
  `.env.local`; added `prisma/regression-prep.ts` for KYC steps in manual E2E.
- **2026-06-09** — **`Tests/` handbook — manual regression SOPs.** Why (user: future changes must not
  break major subsystems). Added `Tests/` with master `SOP.md`, change-impact matrix, and per-subsystem
  checklists (auth, owner/shop/facility, passport, KYC, billing, AI, i18n, UI, infra, build). `AGENTS.md`
  verify step now points here until an automated suite exists.
- **2026-06-11** — **Referral programme removed (deferred).** Why (user: too complex for
  now). Removed referral UI, `?ref=` signup, dynamic yearly discount; flat ¥4888/yr. DB columns
  kept; restore guide in `docs/REFERRALS_DEFERRED.md`. Billing safeguard rules added to
  `docs/BILLING.md` + `AGENTS.md`.
- **2026-06-11** — **Refunded slots stay revoked on billing sync.** Why (user: Happy Paws
  still showed 2 slots after Stripe refunds). `ensureOrgSlotActive` was re-activating REVOKED
  rows when old paid Checkout sessions re-synced; added `syncSlotRevocationsFromStripe` (revoke
  ACTIVE slots with no matching active subscription) and skip repair for cancelled subs.
- **2026-06-11** — **Billing page server error fix.** Why: `syncBillingFromStripe` called
  `fulfillCheckoutSession` → `revalidatePath` during RSC render (Next.js throws). Sync repair
  now passes `revalidate: false`; sync wrapped in try/catch; split `syncOrgBillingFromStripe` /
  `syncUserBillingFromStripe` for proper `cache()` keys.
- **2026-06-11** — **Billing hardening (all accounts / subscription types).** Why (user:
  watertight payment/refund/cancel). Central `applyFulfillmentFromMetadata` /
  `applyReversalFromMetadata`; refunds resolve metadata via Checkout session **or** invoice →
  subscription (fixes renewal refunds); SHOP plan included in repair + invoice backup; stale
  `PENDING` slots expire after 2h; `checkout.session.expired` webhook; `syncBillingFromStripe`
  (cached) on billing/account load; owner purchase cap uses ACTIVE slots only. Matrix:
  `docs/BILLING.md`.
- **2026-06-11** — **Slot fulfillment repair + Stripe sync on billing load.** Why (user:
  paid facility care slot in live Stripe but billing still showed 0 extras). Root causes:
  (1) `activateOrgSlot` silently no-oped when the row was missing/stuck `PENDING` while
  checkout was already marked `fulfilled=1`; (2) billing sync required `stripeCustomerId`
  but fulfillment never ran so the id was never saved. Fixes: `ensureOrgSlotActive` /
  `ensureOwnerPetSlotActive` (upsert + re-activate), repair on `fulfilled=1` replays,
  `resolveStripeCustomerId` (lookup by org member email), `syncSlotSubscriptionsFromStripe`
  + `repairUnfulfilledCheckoutSessions` on billing page load, `invoice.payment_succeeded`
  webhook backup. Facility UI now shows purchased extra slot count.
- **2026-06-11** — **Facility slot cancel webhook fix.** Why (user: cancelled care-slot
  sub but capacity stayed at 51). `handleSubscriptionEnded` for `org_slot` only decremented
  `extraPetSlots` and never called `revokeOrgSlot` — `OrgSlot` stayed ACTIVE. Now mirrors
  `user_slot` (`revokeOrgSlot(md.slotId)`). `getFacilityCapacity` + `admitPetByToken` read
  ACTIVE `OrgSlot` count (self-heals drift on billing page load).
- **2026-06-11** — **`Pet.orgSlot` back-relation.** Why: Prisma P1012 blocked Vercel deploy —
  `OrgSlot.pet` required the opposite field on `Pet` (`orgSlot OrgSlot?`).
- **2026-06-10** — **Org/facility slot IDs + live Stripe guide.** Why (user: same
  read-only downgrade for shop/facility). `OrgSlot` (`care` | `shop_pet`) with `slotId`
  in Stripe metadata for facility `org_slot`; shop pets use plan included count (STARTER 5 /
  SHOP 50) + slot-linked pets; facility base 50 + care slots on `PetStay`. Refund/cancel
  via `charge.refunded` + `customer.subscription.deleted`. `docs/LIVE_STRIPE.md` for going live.
- **2026-06-10** — **Owner pet slot IDs + read-only downgrade.** Why (user: refund/cancel
  should not delete pets; revoke AI + logging only). `OwnerPetSlot` links paid capacity to
  pets; `REVOKED` on `customer.subscription.deleted` or `charge.refunded` (when `slotId` in
  checkout metadata). Included (free) pet keeps full access; extra pets without an ACTIVE slot
  are view-only. Owner extra slots now bill as monthly subscriptions with `slotId` in metadata.
  **Not automatic today:** refunds without `slotId` metadata (legacy checkouts) need manual
  slot revoke in admin/DB.
- **2026-06-10** — **Account page + Stripe subscription cancel.** Why (user: manage/cancel
  subscriptions). `/me/account` + `/app/account`: account type, display name, current plan,
  **Manage subscription** → Stripe Customer Portal (`stripeCustomerId` on User/Organization,
  saved on checkout fulfill). Webhook `customer.subscription.deleted` downgrades org to
  STARTER or decrements facility extra slot. Billing pages keep quota/upgrades only; sidebar
  org-name box removed (duplicate). **Stripe Dashboard:** enable Customer Portal + add
  `customer.subscription.deleted` to webhook.
- **2026-06-10** — **Billing wallet note (user-facing).** Why (user: explain missing WeChat/Alipay
  without mentioning incorporation). `BillingWalletNote` under every paid checkout button; i18n
  `billing.walletsComingSoon` (EN/ZH) — frames as "coming soon" + monthly auto-renewal in progress.
- **2026-06-10** — **Remove WeChat Pay + Alipay until incorporation.** Why (user: no recurring
  on Stripe wallets; native auto-debit needs mainland merchant accounts). Removed wallet buttons
  from all billing UIs; `Provider` is `"stripe"` only in `lib/billing.ts`; card-only Checkout.
  Preserved full revisit plan in `docs/PAYMENTS_WALLETS_DEFERRED.md` (Stripe cross-border path
  + native merchant path post-incorporation).
- **2026-06-10** — **Stripe return URLs for mainland China (v2).** Why (user: Checkout stuck on
  "Processing" after Pay — browser never finishes redirect). Production was still embedding
  `success_url` on `*.vercel.app` (GFW-blocked); the first fix was not deployed. `checkoutBaseUrl()`
  now defaults production to `https://pethealthos.online` (overridable via `APP_PUBLIC_URL`).
  **Requires deploy** + users must browse via the proxy domain, not `pet-health-os.vercel.app`.
- **2026-06-10** — **Stripe fulfillment fix.** Why (user: test card/WeChat paid in Stripe but app
  didn't upgrade). Root cause: fulfillment only ran on `/billing/success` with no idempotency,
  no `revalidatePath`, success UI always showed "upgraded" even on failure, no webhook backup.
  Fix: `fulfillCheckoutSession` (metadata `fulfilled=1` guard), webhook at
  `/api/stripe/webhook` (`checkout.session.completed` + `async_payment_succeeded`), honest
  success/pending/error states. **Products/prices:** Checkout uses dynamic `price_data` (no
  pre-created Stripe Product catalog) — payments appear under Payments/Checkout, not Products.
- **2026-06-09** — **Documents panel on owner pet page.** Why (user: transferred pets should show
  shop-uploaded docs). `DocumentsPanel` added to `/me/pets/[id]` (data was already loaded via
  `getOwnedPet` → `getPet`); `deleteAttachment` now checks `canAccessPet` + `petId` match.
- **2026-06-09** — **Pricing page aligned to three account types.** Why (user: `/pricing` outdated).
  Reordered sections (owners first), fixed owner card (1 free pet, ¥15/mo extra, cap 10), shop cards
  show 50 included + ¥30/mo overage + referral yearly pitch, new facility section mirrors shop
  intervals with `facility.planBenefits` feature list; subtitle reflects trust ecosystem.
- **2026-06-09** — **Homepage trust-ecosystem narrative.** Why (user: front page should explain
  what we're truly building — trust across owners, shops, and facilities — and invite people to
  join). Rewrote hero, ecosystem steps (owner / shop / facility with matching icons), and trust-pillar
  features in `en`/`zh` i18n; hero CTA → "Join us" / `#ecosystem`; choose-path section reframed as
  "which side of the ecosystem are you?". Removed the redundant dark-green closing CTA band at the
  bottom (choose-path cards already serve that function).
- **2026-06-09** — **Enlarged home hero demo.** Why (user: GIF too small). `public/demos/home.gif`
  re-exported from the existing raw recording at its native crop width **904px** (was downscaled to
  760) for crispness; home hero grid changed to `md:grid-cols-[1fr_1.25fr]` and the image's
  `max-w-md` cap removed so the demo fills the (wider) column (~60% of the hero). shop/owner GIFs
  unchanged.
- **2026-06-09** — **Synchronous log structuring + post-scan refresh.** Why (user request: more
  flow). `addLogEntry` now **awaits** `structureLogEntry` (when `hasAI()`) and persists the final
  AI fields in one write — removed the `heuristic-now + after() refine` pattern (and the `after`
  import), so the user only ever sees the finished, structured entry (`QuickAddLog` already shows a
  "structuring…" pending state; verified no rough→structured flash). Falls back to the heuristic if
  AI is unavailable/fails. Trade-off: the save now blocks ~2–6s on the model instead of returning
  instantly — accepted for the cleaner UX. Also `AdmitScanner` calls `router.refresh()` after a
  successful admit (the `admitPetByToken` action already `revalidatePath('/app','/app/pets')`), so a
  scanned-in pet and the dashboard/in-care lists update without a manual reload.
- **2026-06-09** — **Facility plan aligned to the SHOP plan + benefits listed.** Why (user
  request): keep one coherent pricing structure. `FACILITY_BASE_CAPACITY` 20→**50**,
  `FACILITY_EXTRA_SLOT_PRICE_RMB` 15→**30** (now identical to SHOP `includedPets`/
  `extraPetPriceRmb`); subscription already shared (`SHOP_BILLING` ¥599/¥4888). Added a clear
  "What's included" benefits list (`facility.planBenefits(base, slotPrice)`) on `/app/billing`
  above the `FacilitySlots` panel (which states the ¥30/mo slot price), and a `pricingLine` on the
  `/facility` landing. Supersedes the earlier 20/¥15 entry below.
- **2026-06-09** — **Facility care-slot capacity (20 base + ¥15/mo slots).** Why (user request):
  cap concurrent pets-in-care and monetise overage. `FACILITY_BASE_CAPACITY = 20`,
  `FACILITY_EXTRA_SLOT_PRICE_RMB = 15`, `facilityCapacity(extra) = 20 + extraSlots` (no hard cap;
  `plans.ts`). Extra slots are stored in `Organization.extraPetSlots` and **persist while paid even
  when unoccupied**. `admitPetByToken` counts ACTIVE stays and returns `CAPACITY_REACHED` when a
  new/re-admitted pet would exceed the limit (re-confirming an already-active stay is free).
  `addFacilitySlot` → `buyFacilitySlot` (`billing.ts`) increments `extraPetSlots` — demo-grant now,
  Stripe path ready via metadata `scopeKind: "org_slot"` (handled in `finalizeStripeSession`).
  UI: `FacilitySlots` panel on `/app/billing` (capacity bar + buy), `AdmitScanner` surfaces the
  capacity error. Real Stripe billing for facilities is deferred (user will wire it). i18n
  `facility.slots*`/`capacityReached`.
- **2026-06-09** — **Third account type: facility (vet clinic / boarding).** Why (user request):
  serve businesses where pets come and go and "post-service" disputes are the real pressure.
  **Model:** `Organization.kind` adds `HOSPITAL`|`BOARDING` (`isFacilityKind` in `constants.ts`,
  `isFacilityOrg` in `data.ts`). Facilities reuse the `/app` workspace (branched on
  `isFacilityOrg`), reuse KYC (`/verify`) and shop billing (`SHOP_BILLING`), but **own no pets**
  and **can't issue passports**. **Access = `PetStay`** (`@@unique([petId, orgId])`,
  `ACTIVE`|`ARCHIVED`, `admittedAt`/`releasedAt`). **Flow:** owner shows a QR encoding
  `Pet.stayToken` (`ensureStayToken`); facility scans (`AdmitScanner`) → `admitPetByToken` upserts
  an ACTIVE stay; owner taps takeback (`releasePet`) → archives stays + **rotates `stayToken`** so
  an old QR can't silently re-admit; re-scan re-activates. **Privacy:** `canAccessPet` grants a
  facility access only on an ACTIVE stay (gates AI/triage/add-log/weight/reminder/attachment);
  `getFacilityPetView` windows logs/weights/attachments to `releasedAt` when ARCHIVED (read-only
  snapshot, `PetTabs onlyHealthLog`, `LogTimeline canDelete={false}`); facilities can never delete
  an owner's logs (`deleteLogEntry` blocks `currentActorIsFacility`). **Attribution:** facility
  logs set `LogEntry.loggedBy{OrgId,Name}` → "Logged by <facility>" chip in `LogTimeline`. Owner
  pet page adds `CheckinQR` (QR + "currently shared with" + takeback). New landing `/facility` +
  a third home choose-path card; `AuthCard` gains a `facility` account type (kind Hospital/
  Boarding). i18n: `facility.*`, `landing.facility*`, `me.checkin*`, `timeline.loggedBy`,
  `auth.facility*`. Migration `facility_pet_stays`. Verified end-to-end on localhost
  (admit → tagged log → owner takeback → read-only snapshot).
- **2026-06-08** — **Pet profile photo optional on create.** Why (user request). `validatePetPhoto`
  now returns null for an empty file (only size-checks when a photo is provided); `addPet` /
  `addOwnedPet` set `photoUrl = null` when none is uploaded. Both create forms mark the photo
  field "(optional)". Everything else about pet create is unchanged (name/species/breed/color/
  sex/weight still required; birth-or-intake date still required).
- **2026-06-08** — **Shop pricing changed; lifetime removed.** Why (user request): `SHOP_BILLING`
  is now `{ month: 599, year: 4888 }` (was 59 / 599 / 3888 lifetime). `BillingInterval` dropped
  `"lifetime"`; removed the lifetime tile/card from `ShopBilling` + `/pricing`, the
  `priceLifetime` prop, and i18n `shopBilling.lifetime`/`once`. Yearly referral discount (5%
  per referral, 50% cap) unchanged — e.g. 1 referral → ¥4644, 10 → ¥2444. Comparison row
  `landing.shop.diffPrice` updated.
- **2026-06-08** — **Looping demo GIFs on landing pages.** Why (user request): show the app in
  action. Three ~6s GIFs in `public/demos/` — `home.gif` (note → AI-structured log), `shop.gif`
  (issue health passport), `owner.gif` (scan passport → AI). Embedded in `/` hero (replacing the
  static steps card), `/shop` and `/owner` (a "实际效果 / See it in action" block). i18n alts:
  `landing.demo*Alt`, `landing.seeItTitle`. **How made:** built throwaway CSS-animated scenes
  using the real design tokens, captured fullscreen, converted with ffmpeg (crop 904×512,
  15fps, 760px wide, palettegen/paletteuse). The capture scaffolding (`/demos` route,
  `components/demos/DemoScenes.tsx`, `demo*` keyframes) was **removed after export** — only the
  GIFs + embeds ship. No `gifsicle` on the box, so sizes are 390/559/710 KB; revisit (or switch
  to muted-autoplay webm) if asset weight matters.
- **2026-06-08** — **Full disclaimer (免责声明) at `/disclaimer`.** Why (user request): reduce
  legal exposure. Bilingual long-form copy lives in `src/lib/legal.ts` (`getDisclaimer(locale)`,
  not in the i18n Dictionary since it's prose, not UI strings); the page is
  `src/app/disclaimer/page.tsx`. Sections: not veterinary/medical advice (AI, triage, watch are
  informational only; emergencies → vet), AI limitations, user-generated content (we don't
  verify), passport ≠ health certification, health guarantee is breeder↔buyer (PawSure not a
  party), transactions/payments, "as is" limitation of liability, data/privacy, third-party
  services, changes, contact. Linked from `LandingFooter`, `/pricing`, the register form +
  `ClaimPassport` ("you agree to…"), and `TriageReport`. `DISCLAIMER_CONTACT_EMAIL` /
  governing law are **placeholders** — flagged to the operator as a template that needs a
  lawyer's review for their jurisdiction (HK/mainland). New i18n: `landing.disclaimer`,
  `auth.agreePrefix`.
- **2026-06-08** — **Pricing overhaul: shop billing intervals + referrals; owner 1 free pet.**
  Why (user request). **Shop:** the paid SHOP plan is now sold three ways — `month` ¥59,
  `year` ¥599, `lifetime` ¥3888 (`SHOP_BILLING` in `src/lib/plans.ts`). `Organization`
  gained `planInterval`, `planActivatedAt`. Checkout is interval-aware (`startCheckout`
  takes `interval`; card month/year = real Stripe subscription, lifetime + Alipay/WeChat =
  one-time `payment`). **Referrals:** each org has a unique `referralCode`; new shops
  registering via `/shop?ref=CODE` set `referredById`. The referrer earns **5% off its
  YEARLY price per referred shop, stacking, capped at 50%** (`referralDiscountRate`,
  `yearlyPriceRmb`). Discount applies to the yearly option only. Billing page shows the
  share link + status (`getOrgReferral`, `ensureReferralCode`, `getReferralCount`).
  **Decision:** free STARTER tier kept as-is (pre-purchase default) to avoid breaking
  legacy shops — revisit if we want to force paid before passport issuance.
  **Owner:** FREE plan now `includedPets: 1` (was 2), `extraPetPriceRmb: 15` (was 25),
  cap unchanged at 10. Owners can scan a passport from `/me` (`OwnerScanCard`) and an
  already-signed-in owner claims in one tap via `claimAsOwner` (`OwnerClaimButton`) — no
  re-auth. Adding a brand-new pet past the limit shows a gentle upsell on `/me/pets/new`
  (claiming inherited pets stays unblocked). Migration: `shop_billing_referral`.
- **2026-06-08** — **Home page is account-neutral.** Why (user request): the landing copy
  leaned toward shops/breeders. Reworded hero, the "how it works" step 3, and the four
  feature cards to describe the product generally (trust, AI, reminders, bilingual).
  Moved shop-specific selling points (pedigree/vaccine certs/lab results, "honest signal
  of good care") into the `/shop` page's "what you get" bullets; owner specifics stay on
  `/owner`. Copy only — all in `landing.*` of `en.ts`/`zh.ts`.
- **2026-06-08** — **Default UI language is Chinese.** Why (user request): China-first
  product. `DEFAULT_LOCALE` → `zh` in `src/lib/i18n/config.ts`; first visit (no
  `locale` cookie) renders 简体中文. English still available via the language toggle.
- **2026-06-08** — **Intake date on pet create; birth OR intake required.** Why (user
  request): shops need to record when a pet entered their care, and shouldn't be forced to
  know birth date if unknown. **Changes:** `Pet.intakeAt` is now user-set on create
  (nullable — no longer auto-defaults to `now()`). Create forms add **Intake date**
  (入舍日期) alongside birth date; `validatePetDates` requires **at least one** of the two
  (both allowed). Migration `pet_intake_optional`. Passport shows intake only when set.
- **2026-06-08** — **Pet create: all fields required except sire, dam, notes.** Why (user
  request): incomplete pet profiles on create. **Changes:** `readPetFields` (shared by
  `addPet` + `addOwnedPet`) now requires name, species, breed, color, sex (MALE/FEMALE —
  not UNKNOWN), weight, and profile photo; sire/dam and general notes stay optional. New
  validators `validatePetSex`, `validatePetPhoto`; i18n codes `BREED_REQUIRED`,
  `COLOR_REQUIRED`, `SEX_REQUIRED`, `PHOTO_*`. Both `NewPetForm` and `OwnedPetForm` mirror
  the same client checks and mark optional fields explicitly.
- **2026-06-08** — **Transfer flow: owner registers only on scan; one passport per pet;
  archived list.** Why (user request): entering the new owner's name/email/password twice
  (shop form + claim) was redundant and confusing; shops should only issue the passport,
  and the owner creates their account when they scan the QR. Also: once a passport is
  issued the shop must not be able to issue another, and transferred pets should leave the
  active list. **Changes:**
  - Removed `newOwnerName` / `newOwnerEmail` from `TransferForm`; shop form explains that
    the owner registers on scan. `claimPassport` requires `claimedByName` (no shop prefill).
  - `createTransfer` blocks if **any** `Transfer` exists for the pet (`ALREADY_ISSUED`) or
    status is `TRANSFERRED`/`ARCHIVED` — supersedes the 2026-06-03 rule that allowed
    re-issuing unclaimed passports.
  - On issue: `status = TRANSFERRED` → shop **Archived** tab (`getArchivedPetsWithStats`).
    On claim: `status = ARCHIVED`. Dashboard + active pets list use `getActivePetsWithStats`
    (`ACTIVE` / `UNDER_OBSERVATION` only). Transfer tab shows "awaiting claim" when issued
    but not yet claimed.
- **2026-06-05** — **China access via HK reverse proxy (app-side wiring).** Why
  (user request): be reachable from mainland China without a VPN. The GFW
  interferes with `*.vercel.app` and `*.blob.vercel-storage.com`, so a Hong Kong
  VPS (`47.239.178.233`) running Caddy fronts the Vercel app on a custom domain
  (`pethealthos.online`, temp). **App changes:** (1)
  `next.config.ts` → `serverActions.allowedOrigins` so Server Actions aren't
  rejected as cross-origin behind the proxy (env `PROXY_ALLOWED_ORIGINS` adds
  more hosts without a code edit — important since the brand/domain may change);
  (2) `src/lib/img.ts` `proxyImageSrc` rewrites blob public URLs to a same-origin
  `/api/img?u=…` route (`src/app/api/img/route.ts`, SSRF-guarded to
  `*.blob.vercel-storage.com`, immutable cache) so images flow through the
  reachable domain — the blocked blob host is only fetched server-side. Applied
  in `PetAvatar`, `LogTimeline`, `DocumentsPanel`, and the public passport page.
  (3) `deploy/Caddyfile` committed: forwards to `pet-health-os.vercel.app` with
  `Host` = the vercel host (so Vercel routes) + `X-Forwarded-Host` = the real
  domain (so Next validates origins); Caddy auto-HTTPS satisfies the secure
  session cookie requirement. **Still on Vercel** — this is a proxy, not a
  migration. Escape hatch: `NEXT_PUBLIC_IMG_PROXY=0` disables image proxying.

- **2026-06-04** — **Comprehensive field validation (client + server)**. Why (user request):
  every field should be validated — emails well-formed, phone numbers auto-formatted to
  regional standards, etc. **Architecture:**
  - **One isomorphic module** `src/lib/validation.ts` holds all rules (email, password,
    name/length, phone, OTP, weight, dates, positive ints) and returns stable `VErr` CODES.
    Used by BOTH client components (instant inline UX) and server actions (the security
    source of truth) — so the two can never drift.
  - **Phone:** added `libphonenumber-js`. `formatPhoneAsYouType` formats as the user types
    (default region **CN**; a leading `+` switches to international), `toE164` canonicalizes,
    `isValidPhone` validates. `src/lib/sms.ts` `normalizePhone`/`isValidPhone` now delegate
    here (region-aware) instead of a raw 6–15 digit check.
  - **Components:** `PhoneInput` (controlled, auto-formatting) and `FieldError` (maps a code
    to a localized message via `t.validation`, falling back to any raw string). Forms set
    `noValidate` and run client checks before the server call; server still re-validates.
  - **i18n:** new `validation` namespace in `en.ts`/`zh.ts` keyed by `VErr` code.
  - **Server actions hardened:** `register`, `signIn`, `claimPassport`, `addPet`,
    `addOwnedPet` (shared `readPetFields`), `addWeight`, `addReminder`, `createTransfer`
    (email/days/terms/vet-date), `addLogEntry` (date + length) now return codes; loose
    `/.+@.+\..+/` email and ad-hoc weight checks removed. Pet `species`/`sex` whitelisted.
  - **Constraints:** weight 0–200 kg, dates not in the future where applicable (also `max`
    on `<input type=date>`), names/titles ≤ 80/120, free-text ≤ 2000, custom guarantee days
    a positive int ≤ 3650.
  - Verified in the Next runtime (`/api/vtest`, since removed): CN `13800138000` →
    `138 0013 8000` / `+8613800138000`; intl `+14155552671` → `+1 415 555 2671`; bad email →
    `EMAIL_INVALID`; 300 kg → `WEIGHT_INVALID`; future date → `DATE_FUTURE`.
- **2026-06-04** — **Health watch analyses only when needed** (cost control for A1). Why
  (user request): the daily guardian shouldn't burn AI re-checking pets that haven't changed
  or re-describing a situation the caretaker was already told about. **Two gates, no schema
  change:**
  1. **Activity gate (query-level):** `pet.findMany` now requires a `logs` or `weights`
     record `createdAt >= now - ACTIVITY_WINDOW_DAYS` (2 days, slightly wider than the daily
     cron). Dormant pets are never fetched, so they cost nothing — no detection, no AI.
  2. **New-evidence gate (per pet):** the most recent `WATCH` notification's `createdAt`
     becomes the baseline `since`; a signal only counts if its evidence was created after
     `since` (serious log `createdAt > since`; weight drop only when the latest reading is
     new; cluster needs ≥1 fresh entry). This replaced the old fixed 3-day timer — the same
     concern is never re-analysed (so AI is never re-invoked for it), while a genuinely new
     or worsening sign still gets through immediately.
  `MAX_AI` (25/run) stays as a backstop. The route now also returns `analysed` alongside
  `scanned`/`created`/`aiUsed`. Verified: after an alert fires (analysed:1, aiUsed:1), an
  immediate re-run with no new data yields analysed:0, created:0, aiUsed:0.
- **2026-06-04** — **Proactive health watch / "the guardian" (A1)**. Why (user request; and
  A1 was the highest-leverage parked idea): flip AI from a tool you open into something that
  watches the pet and comes to you, the biggest retention + emotional hook. **Design:**
  detection is **rule-based** (deterministic, free, reliable); AI only *phrases* what the
  rules found, so it can never invent a finding.
  - **Cron:** new `GET /api/cron/health-watch` (auth via `CRON_SECRET`, same as reminders),
    scheduled daily at `30 8 * * *` in `vercel.json` (offset from the 08:00 reminders job).
  - **Signals (per ACTIVE/UNDER_OBSERVATION pet, last 30d):** (1) a HIGH/CRITICAL log in the
    last 7 days; (2) weight down ≥10% over ≥5 days (earliest vs latest in window); (3) a
    cluster of ≥2 MEDIUM+ entries in the last 14 days. Title is the highest-priority signal.
  - **Recipient:** one caretaker per pet — the owner if claimed (`ownerUserId`), else the
    shop (`orgId`) — to avoid double-notifying.
  - **Dedupe:** skip if a `WATCH` notification for the same pet+caretaker exists in the last
    3 days, so the guardian doesn't nag.
  - **AI:** `summarizeHealthWatch` in `src/lib/ai.ts` (`generateText`) writes one calm
    sentence; capped at 25 AI calls per run (`MAX_AI`) with a deterministic template
    fallback when AI is absent/over-cap/failing.
  - **Surfacing:** notifications are kind `"WATCH"`; they flow through the existing
    `getOrgNotifications`/`getUserNotifications` + unread badge with no query change.
    `NotificationList` shows an amber `ShieldAlert` icon for `WATCH` entries.
  - **Known limitation / fast-follow:** notification text is English (matches the existing
    REMINDER cron); localized notifications are a future task. Verified end-to-end against a
    seeded HIGH-severity entry (`created:1, aiUsed:1`).
- **2026-06-04** — **Passport reads like a verifiable credential (B2)**. Why (user request;
  trust is the product): the public passport should feel like a certificate, not a profile.
  - **Credential band** at the top of `/passport/[token]`: PawSure mark, "Verifiable,
    tamper-evident health record" title, a **✓ Verified shop** badge when
    `pet.org.verificationStatus === "APPROVED"`, and four fields — issuer, issue date
    (`transfer.createdAt`), **certificate no.** (`PS-XXXX-XXXX` from the token), and a
    **record seal**.
  - **Record seal:** `sha256` (Node `crypto`) over `pet.id | token | issue date | each
    frozen (locked) log's id:occurredAt:createdAt` (frozen logs sorted by id for
    determinism), shown as a short `XXXX-XXXX-XXXX` hash. It changes if any frozen entry is
    altered, doubling as a tamper signal. Computed server-side at render (no schema change).
  - **i18n:** `passport.cert*`, `verifiedShop`, `recordSeal`, `sealNote` (en/zh). New local
    `CertField` component. Verified via rendered HTML (badge + `PS-…` + seal present).
  - **Fast-follow:** a public verify endpoint so buyers can independently recompute the seal.
- **2026-06-04** — **Photo logs are AI-analysed only with an accompanying note** (refines the
  A2 photo-logging behaviour). Why (user request): an AI reading a photo with no written
  context can hallucinate misleading/incorrect tags and observations. **Behaviour now:**
  *Photo only* → saved as a plain "Photo log" (`OBSERVATION`, `NONE`, no tags, `aiProcessed:
  true`); the AI is never called. *Photo + note* → the note is the ground truth; the photo is
  passed to the model only as supporting context with an explicit instruction not to
  contradict the note, infer unmentioned conditions, or invent findings. **Code:**
  `addLogEntry` branches on `hasText`; image bytes are read only when there's text;
  `structureLogEntry`'s image system prompt rewritten. `QuickAddLog` hint is now dynamic
  (`photoWithNote` / `photoNoNote`).
- **2026-06-03** — **A passport can only be transferred (claimed) once**. Why (user request):
  once a buyer registers an account through a pet's passport, the record belongs to that
  owner; letting the shop mint a second passport for the same pet would undermine the
  one-owner, single-source-of-truth model and the trust the passport represents. Gate is on a
  *claimed* transfer (not merely issued), so an unclaimed/abandoned passport can still be
  re-issued. **Code:** `createTransfer` returns `ALREADY_CLAIMED` if any `Transfer` for the
  pet has `claimedAt != null`; the shop's Transfer tab
  (`/app/pets/[id]/transfer`) hides the form and shows a "already claimed by <name> on
  <date>" notice instead. i18n: `transferPage.alreadyClaimed*`, `transferForm.alreadyClaimed`.
- **2026-06-03** — **Admin updates log + docs viewer**. Why (user request): give the team a
  single place to see what's shipped and read the project docs without leaving the app.
  - **Updates log:** new `docs/UPDATES.md` — a plain-English, newest-first changelog. Agents
    must append a bullet here in the same commit as any user-facing change (see `AGENTS.md`).
  - **Docs viewer:** `/admin` now renders the updates log + a read-only browser of every
    `*.md` in `/docs`. `src/lib/docs.ts` reads the files at request time (admin-gated);
    `AdminDocs.tsx` renders them with a richer markdown component. Because Vercel's runtime
    filesystem only has traced files, `next.config.ts` sets
    `outputFileTracingIncludes: { "/admin": ["./docs/**/*.md"] }` so the docs ship with the
    admin function. Keep `/docs` free of secrets — it's viewable by any admin.
- **2026-06-03** — **Health-guarantee passport (B1)**. Why (user: the passport is the
  shop's killer feature and needs to be more than a profile): bake the breeder's warranty
  into the passport so it becomes a tamper-evident contract that reduces post-sale disputes
  and gives buyers a concrete reason to value it.
  - **Schema:** `Transfer` gained `guaranteeType` (`NONE|D7|D30|CONGENITAL_1Y|CUSTOM`),
    `guaranteeDays` (window length; drives active/expired status), `guaranteeTerms`,
    `vetCheckedAt`, `vetCheckNote`. Presets live in `src/lib/constants.ts`
    (`GUARANTEE_TYPES`, `GUARANTEE_PRESET_DAYS`). Migration `guarantee_and_log_media`.
  - **Flow:** `TransferForm` adds a guarantee dropdown (default `D30`), a custom-days field,
    a "what's covered" textarea, and an optional vet-check date + note. `createTransfer`
    stores them frozen at issue (alongside the existing log-lock). The public
    `/passport/[token]` page renders a guarantee credential block: type badge, live status
    (`Active · N days remaining` / `Expired on <date>` computed from `createdAt + days`),
    terms, and a "Vet-checked at handover" line. i18n keys under `transferForm.*`,
    `guaranteeType.*`, and `passport.*` in both `en`/`zh`.
- **2026-06-03** — **Photo / video logging + visual triage (A2)**. Why (user: AI is only
  "nice to have"): let people log a photo (Gemini reads it) to cut typing friction — the #1
  reason logs die — and add real "should I worry?" value.
  - **Schema:** `LogEntry` gained `imageUrl` + `imageMime`. `addLogEntry` now takes a
    `FormData` (was `(petId, rawText)`) with an optional `photo` file; text **or** a photo is
    enough to log. Images ≤10 MB are stored via `saveUpload` (Blob/local) and analysed;
    videos are stored & displayed (`<video>`) but **not** analysed yet (fast-follow).
  - **AI:** `structureLogEntry` takes an optional `image` ({data, mediaType}); when present it
    sends a multimodal `messages` payload so the model folds visible findings into
    summary/tags/severity. Enrichment still runs in `after()` (the image bytes are captured in
    the closure), keeping the instant-save UX. `QuickAddLog` has a photo/video picker +
    preview; `LogTimeline` and the passport timeline render the media inline.
- **2026-06-03** — **Grey out the Phone (SMS-OTP) auth tab**. Why (user request): phone
  registration/login can't deliver codes in production until an SMS provider is wired, and
  the founder is deferring the HK company, so the deliverable mainland path (Aliyun/Tencent,
  needs entity) isn't available yet. Gated behind `PHONE_AUTH_ENABLED` (a single `boolean`
  in `src/components/AuthCard.tsx`, currently `false`): the Phone tab renders greyed/
  non-clickable, the OTP form isn't mounted, and a direct `defaultTab="phone"` falls back to
  sign-in. The server actions (`requestPhoneOtp`/`verifyPhoneOtp`) and `lib/sms.ts` are
  untouched — flip the flag to `true` to restore the whole flow once Twilio (HK/intl) or
  Aliyun/Tencent (mainland) is configured. Email + QR-claim auth are unaffected.
- **2026-06-03** — **Route Alipay + WeChat Pay through Stripe** + **China go-to-market /
  payments path**. Why (user is a HK resident and asked to be ready to charge Chinese
  users): a HK setup avoids mainland ICP/company requirements, and Stripe can process the
  Chinese wallets cross-border.
  - **GTM/compliance findings (on record):** HK hosting needs **no company and no ICP** —
    rent a HK server as an individual; it's reachable from the mainland without a VPN.
    Mainland hosting needs an **ICP filing**, and a *commercial* app needs a **mainland
    company + commercial ICP licence**. To take money you do **not** need an incorporated
    company: in a Stripe-supported country an **individual / sole proprietor** can onboard.
    Our founder is a **HK resident**, so the lightweight legal path is **sole proprietor +
    a HK Business Registration (BR) certificate + Stripe HK** (no Companies Registry
    incorporation, no audit). Incorporate a HK Ltd later for liability/investment/native
    WeChat-Alipay merchant or app-store accounts. Native Alipay/WeChat *merchant* accounts
    are the only path that strictly requires a business licence — Stripe sidesteps it.
  - **Code:** `createStripeCheckout` in `lib/billing.ts` now backs all three pay buttons.
    `provider` maps to a Stripe `payment_method_types` value (`card`/`alipay`/`wechat_pay`);
    cards stay `mode:"subscription"`, the wallets use `mode:"payment"` (one-time, since
    Stripe has no recurring support for them) with `wechat_pay.client:"web"`. The native
    `WECHAT_PAY_*`/`ALIPAY_*` stub path only runs if Stripe is *not* configured. No new env
    vars — needs `STRIPE_SECRET_KEY` + Alipay/WeChat enabled in the Stripe Dashboard.
- **2026-06-03** — **AI assistant + triage for owners**. Why (user question "Do pet
  owners not get to use AI?"): the conversational assistant and triage report were only
  surfaced in the shop workspace (`/app/pets/[id]`), so owners couldn't use them — even
  though AI log auto-structuring already runs for any pet. Owner pets were a single page;
  converted `/me/pets/[id]` into a tabbed layout (`layout.tsx` holds the header + `PetTabs`)
  with sub-routes `chat` and `triage`, mirroring the shop (no Transfer tab — owners can't
  issue passports). `PetTabs` gained `base`/`includeTransfer` props; triage rendering was
  extracted into a shared `TriageReport` component reused by both shop and owner pages.
  - **Security:** the chat API (`/api/pets/[id]/chat`) previously had **no auth** — any
    petId was chattable. Added `canAccessPet(petId)` (owner of the pet, or member of its
    org) in `lib/data.ts`; the chat route returns 403 and `generateTriageReport` returns
    `{ error: "Forbidden" }` otherwise. The chat system prompt now adapts its wording for
    owners ("a regular pet parent") vs shops. No new env vars; owners are uncapped on AI
    for now (free, pilot).
- **2026-06-03** — **Fix pet-add crash on photo upload**. Why (bug report): adding a
  pet with a photo > ~1 MB crashed with "This page couldn't load". Root cause was
  **not** Blob — Next.js Server Actions default to a **1 MB** body limit, but photos
  (and verification docs) are submitted in the action body and `saveUpload` allows up
  to 8 MB. Set `experimental.serverActions.bodySizeLimit: "12mb"` in `next.config.ts`.
- **2026-06-03** — **Mobile sign-out fix**. Why (bug report): shop accounts had no
  way to sign out on mobile — the `Sidebar` (which holds sign-out) is `hidden md:flex`
  and `MobileNav` had none. Added a `md:hidden` top header to `/app/layout.tsx` (brand +
  locale + sign-out). Also hardened the `/me` header so the sign-out button never clips
  on narrow screens (`min-w-0`/`shrink-0`, tagline hidden < `sm`).
- **2026-06-03** — **Single-device owners, multi-device shops**. Why (user request):
  make the account types more distinct and discourage shops from sharing a cheap owner
  account across a business — a shop genuinely needs many devices.
  - Added `User.sessionId` + `sessionExpiresAt` (migration `single_device_session`).
    Cookie token now encodes `userId.sid.exp` (legacy `userId.exp` still parses → forces a
    re-login). `setSession(id,{single})` records the sid for owners only; shops leave it
    null and stay multi-device. `getCurrentUser` logs out an owner device whose `sid` ≠
    stored `sessionId`. New helpers `hasActiveSession`, `clearUserSession` (sign-out).
  - All owner sign-ins return `{ conflict: true }` when already active; `AuthCard` shows a
    kick/cancel prompt that resubmits with `force=1`. `verifyOtp` gained `{ consume:false }`
    so the phone code survives the conflict pre-check + forced retry. No live push — the
    other device is logged out on its next request.
- **2026-06-03** — **Owner per-extra-pet pricing** + **shop verification (KYC)**.
  Why (user request): a fairer owner model, and trust that every passport-issuing shop
  is a real, vetted business.
  - **Owner pricing:** dropped the "Owner Plus" tier. Owner's Account is now 2 pets free,
    **¥25/mo per extra pet, hard cap 10** (`Plan.petCap`, `maxExtraSlots`, `petLimit`
    clamp). New `addOwnerPetSlot`/`buyOwnerPetSlot` + `OwnerExtraSlots` on `/me/billing`
    (demo-grants a slot when no provider; Stripe per-slot subscription otherwise,
    finalised via `finalizeStripeSession` `user_slot`).
  - **Shop verification:** added `Organization.verification*` fields (migration
    `shop_verification`). New shops are routed to **`/verify`** to upload a 营业执照 or
    alternative proof (private Blob). `/app` layout gates `UNVERIFIED`/`REJECTED` →
    `/verify`; `PENDING` shows a banner. `createTransfer` now requires
    `verificationStatus === "APPROVED"` (error `NOT_VERIFIED`, surfaced in `TransferForm`).
    Admin review at **`/admin`** (`src/lib/admin.ts`: `ADMIN_PASSWORD` cookie +/or
    `ADMIN_EMAILS`); private doc proxy `/api/admin/doc/[orgId]`; `reviewOrg` approve/reject
    with reason; `notifyAdmins` emails the team on new submissions.
  - **New env vars:** `ADMIN_PASSWORD` (required to open `/admin`), optional `ADMIN_EMAILS`,
    optional `RESEND_API_KEY` + `RESEND_FROM` for team email pings.
  - ⚠️ **Migration side-effect:** all existing orgs default to `UNVERIFIED`, so any
    pre-existing shop is now blocked from `/app` until it verifies. For the demo, approve
    them via `/admin` (or set their `verificationStatus` to `APPROVED` in the DB).
  - Verified end-to-end locally (signup → `/verify` → pending banner → admin approve →
    unlocked). File upload couldn't be browser-automated; the PENDING step was simulated
    via DB and the rest exercised through the UI.

- **2026-06-02** — Built **public landing pages** (`/`, `/owner`, `/shop`) and switched
  to **unified auth**. Why (user request): a real front door that explains the product
  and routes people to the right account.
  - `User.orgId` added (migration `unified_auth_user_org`); a user with an org = shop,
    without = owner. Sign-up takes an `accountType`; shop sign-up also creates the org.
  - Breeder workspace **moved from `/` to `/app`** (route group `(app)` → segment `app`);
    Sidebar/links/`revalidatePath`/redirects updated. `getActiveOrg()` now resolves the
    logged-in user's org; `requireActiveOrg()` gates `/app` (redirects to `/shop`).
  - Owner page offers **start-fresh** (register) or **scan passport QR** (`html5-qrcode`
    camera + paste-link fallback → `/passport/[token]`). Logged-in users are redirected
    from landing pages to their workspace.
  - **Deployed to production** (pushed to `main` + `vercel --prod`); migration was
    already applied to the shared Neon DB.
  - ⚠️ **Prod-data implication:** with auth now required on `/app`, the legacy
    single-org prototype data ("My Cattery & Kennel") has no linked user and is now
    orphaned (unreachable in the UI). Acceptable for a fresh pilot; to reclaim it, set
    that org's id as `orgId` on a shop `User`. A test shop account
    (`shoptest+landing@example.com`, org "晨曦猫舍 Sunrise Cattery") created during
    verification can be removed.
- **2026-06-02** — Added `AGENTS.md` operating guide + this `CONTEXT.md`. Why:
  preserve context across agents/clones (chat history doesn't travel with the
  repo) and standardise behaviour (ask questions; keep docs updated after every change).
- **2026-06-02** — Defined the **Owner's Account** (owner `FREE` plan): free, capped
  at **2 pets**, cannot issue passports; created on transfer-claim or self-signup.
  Added a server-side passport-issuance guard in `createTransfer`. Why: explicit
  consumer tier distinct from breeder/shop accounts.
- **2026-06-02** — Diagnosed "slow load times" as **client-side packet loss to
  Vercel's edge**, not DB/region (measured). Decided **not** to move DB/region.
  Agreed the real fix is China-reachable hosting (HK proxy, pending). Brand work
  deployed to production.
- **2026-06-02** — Applied the **PawSure brand kit + UI system** and added the
  `/brand` showcase. Deployed.
