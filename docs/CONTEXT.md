# PawSure 宠诺 — Project Context (living document)

> This file preserves the decisions and reasoning that don't live in the code.
> **Every agent must keep it current** — see the rules in `/AGENTS.md`. After any
> decision or code change, update the relevant section and append to the
> Decision log below.

Last updated: 2026-06-02

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
- **AI:** Google Gemini via the Vercel AI SDK (`@ai-sdk/google`); logic in
  `src/lib/ai.ts`. Locale-aware. Log enrichment runs in the background via
  `after()` so saves feel instant.
- **Uploads:** Vercel Blob in prod, local filesystem fallback in dev (`saveUpload`).
- **i18n:** `en`/`zh` dictionaries in `src/lib/i18n/` (`en.ts` is the source of
  truth; `zh.ts` must mirror its shape — enforced by the `Dictionary` type).
- **Auth:** **unified** — one `User` account system (scrypt email+password and/or
  phone OTP, signed cookies; `src/lib/auth.ts`). A `User` with `orgId` set is a
  **shop** account (manages an `Organization`); a `User` without `orgId` is an
  **owner** account. Sign-up picks the type (shop also creates the `Organization`).
- **Routes:**
  - `/` = **public landing** (marketing + choose owner/shop + log in). `/owner`,
    `/shop` = per-type landing pages (explain + login/create). Logged-in users are
    redirected away from these to their workspace.
  - `/app/*` = **shop/breeder workspace** (sidebar; moved here from `/`). Gated by
    `requireActiveOrg()` → redirects non-shop / logged-out users to `/shop`.
  - `/me/*` = owner workspace. `/passport/[token]` = public passport.
  - `/login` = shared auth entry; `/pricing`, `/app/billing`, `/me/billing`,
    `/billing/success|cancelled`; `/brand` = design-system showcase.
- **Cron:** `/api/cron/reminders` (daily, `vercel.json`), guarded by `CRON_SECRET`.

---

## 3. Account & plan model

Defined in `src/lib/plans.ts`. Quotas are **hard-enforced** on pet creation.

**Organisations (breeders/shops)** — `ORG_PLANS`, **can issue passports**:
- `STARTER` — free, 5 pets.
- `SHOP` — ¥2000/mo, 50 pets (+¥30/mo per extra), multi-seat.

**Owners (consumers)** — `USER_PLANS`, **cannot issue passports**:
- `FREE` = the **"Owner's Account"** (zh: 主人账户) — free, **2 pets**. Created
  when a pet is transferred to a new owner (claim) **or** when an existing owner
  signs up directly. The everyday consumer account.
- `PLUS` = "Owner Plus" — paid upgrade, 25 pets (future expansion path).

Notes:
- Passport issuance is enforced **server-side** in `createTransfer` (only org pets
  on a passport-capable plan); owner-managed pets (no `orgId`) are blocked, not
  just hidden in the UI.
- Claiming a transferred pet is intentionally **not** quota-blocked (protects the
  breeder→buyer handoff). The 2-pet cap applies to pets an owner adds themselves.

---

## 4. Key flows

- **Transfer / passport:** breeder calls `createTransfer` → freezes pre-transfer
  history (`lockedAt`), adds a "🏡 Homecoming day" milestone, marks pet
  `TRANSFERRED`, returns a token → public `/passport/[token]`.
- **Claim:** if the breeder enabled it, a buyer claims the passport (`claimPassport`),
  which creates/signs into an Owner's Account and sets `ownerUserId`.
- **Owner self-signup:** from `/` → `/owner`, "start fresh" → `register` (owner) → `/me`;
  or "scan a passport QR" (`PassportScanner`: camera via `html5-qrcode` + paste-link
  fallback) → `/passport/[token]` claim.
- **Shop signup:** from `/` → `/shop` → `register` with `accountType=shop` creates an
  `Organization`, links the `User` (`orgId`), and lands in `/app`. `getActiveOrg()`
  resolves the logged-in user's org; `requireActiveOrg()` enforces it for `/app`.
- **Billing:** provider-agnostic `startCheckout` — Stripe wired; WeChat Pay/Alipay
  stubbed; demo mode activates plans instantly when no provider is configured.

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
  `GOOGLE_GENERATIVE_AI_API_KEY`, plus Neon `POSTGRES_*`/`PG*`/`NEON_*`. Optional:
  `TWILIO_*`, `STRIPE_SECRET_KEY`, `WECHAT_PAY_*`, `ALIPAY_*`, Resend key. See
  `.env.example`. Fresh clone: `vercel link` → `vercel env pull`.

---

## 6. Brand kit

- Tokens (re-mapped Tailwind v4 theme) in `src/app/globals.css`: Sage Trust
  `#6FAF98` (actions), Forest Calm `#24594C` (headings), Soft Paper `#FFF8EF`
  (bg), Sand, Ink, Promise Gold, Calm Blue, Gentle Alert. Soft shadows, rounded
  surfaces, warm cream cards.
- Fonts: **Nunito** (en) + system CJK (zh) — no heavy CJK web font shipped.
- Logo: `src/components/PawSureLogo.tsx` (custom SVG mark). App icons/favicons via
  `src/app/icon.png` + `apple-icon.png`; assets in `public/brand/`.
- Reusable component kit: `src/components/pawsure/` (Button, Input/Search,
  Chip/StatusBadge, Card/PetCard/ProfileCard, Modal, BottomSheet, Toast,
  TopAppBar, BottomTabBar, EmptyState, OnboardingCard). Review all of it at `/brand`.

---

## 7. Known gotchas

- **China access:** the site currently needs a **VPN** in mainland China. The
  cause is GFW interference with Vercel's edge/`*.vercel.app` domain — **not** the
  DB or region. Verified: server render ~0.3s, edge ~7ms when reachable; the spikes
  are intermittent TCP **SYN packet loss** (1s→3s→7s… retransmit backoff). Moving
  the Vercel region or DB will **not** fix reachability.
- **Hydration warning in the in-IDE browser** is a false positive — the Cursor
  browser injects `data-cursor-ref` attributes. Not a real bug; ignore.
- **Vercel Blob URLs** (`*.blob.vercel-storage.com`) are also GFW-blocked → pet
  photos break in mainland China without a proxy/CDN.
- `zh.ts` must mirror `en.ts` exactly (type-enforced). Update both together.

---

## 8. Pending / next steps

- **China-accessible hosting (not started).** Chosen plan: a **Hong Kong reverse
  proxy** (Caddy) in front of the existing Vercel app + a custom domain — reachable
  from China without a VPN, no ICP needed (user has only a personal Chinese ID, so
  mainland ICP/commercial hosting is out for now). Required code changes when it
  proceeds: (1) add `experimental.serverActions.allowedOrigins` in `next.config`
  so POST/actions work behind the proxy domain; (2) proxy Vercel Blob image URLs
  through the domain; (3) commit a `deploy/Caddyfile`. User must provision the
  domain + HK server (Alibaba Cloud HK recommended). Latency optimisation (move
  compute+DB to Singapore) is a later step, only after validation.
- Real payment provider keys (Stripe / WeChat Pay / Alipay) when ready.

---

## Decision log

Newest first. One entry per decision/change: date — what — why.

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
  - ⚠️ **Prod-data implication (not yet deployed):** with auth now required on `/app`,
    the legacy single-org prototype data ("My Cattery & Kennel") has no linked user and
    would be orphaned after deploy. Acceptable for a fresh pilot; if that data must stay
    reachable, link it to a shop user before deploying. A local test shop account
    (`shoptest+landing@example.com`, org "晨曦猫舍 Sunrise Cattery") was created during
    verification and can be removed.
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
