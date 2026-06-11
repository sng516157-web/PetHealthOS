# Test / demo accounts

> **Full test SOPs:** see [`Tests/`](../Tests/README.md) (subsystem checklists + agent procedures).
> This file is the quick credential reference.

Demo accounts for exercising every pipeline on the live site
([https://pet-health-os.vercel.app](https://pet-health-os.vercel.app)) and locally. Recreate any time with:

```bash
npx tsx prisma/seed-demo.ts
```

Uses `.env.local` (`DATABASE_URL` + `STRIPE_SECRET_KEY`). Cancels active Stripe
subscriptions on demo emails before recreating accounts — run this to clear broken
billing state from prior test runs.

> ⚠️ These are **throwaway demo credentials** for a pilot/demo environment only.
> Don't reuse these passwords for anything real. Rotate or remove before any
> production launch with real users.

---

## Shared password

All seeded accounts use the same password: `**Demo123456`**

Sign in at `**/login`** (or via the relevant landing page: `/owner`, `/shop`).

---

## Accounts & what they test

### 1. Owner account — `owner.demo@pawsure.test`

- Free **Owner's Account** (workspace at `/me`).
- **Pipelines to test:** owner dashboard, adding pets (**1 free**, then ¥15/mo per
extra on `/me/billing`; hard cap = 10 pets total), and claiming a passport.

### 2. Verified shop — `shop.verified@pawsure.test`

- Shop account on the `SHOP` plan, **already approved** (workspace at `/app`).
- Comes with **2 demo pets** (Mochi, Biscuit).
- **Pipelines to test:** full shop workspace, logs/reminders/AI/triage, and
**issuing a health passport** (Pets → a pet → Transfer). Passport issuance is
unlocked because the shop is verified.

### 3. Unverified shop — `shop.unverified@pawsure.test`

- Shop account, **not yet verified** (status `UNVERIFIED`).
- **Pipelines to test:** the **verification flow**. On sign-in you're routed to
`**/verify`** to upload a business licence (营业执照) or alternative proof. After
submitting, the shop is `PENDING` and can use `/app` (with a banner) but **cannot
issue passports** until approved in `/admin`.

### 4. Facility (vet hospital) — `facility.demo@pawsure.test`

- Facility account (`kind = HOSPITAL`), **already approved** (workspace at `/app`).
- Comes with the owner's pet **Coco already in its care** (an active `PetStay`) plus a
facility-tagged log, so the dashboard and stay flow are demoable immediately.
- **Pipelines to test:** facility dashboard (照护中), **scan/paste to admit** an owner's
check-in token, logging tagged "Logged by …", and the read-only snapshot after the owner
takes the pet back. Owner side: `owner.demo@pawsure.test` → open **Coco** → check-in QR +
"currently shared with" + **take back**. Facilities **cannot issue passports**.

---

## Admin / review team

- **URL:** `**/admin`**
- **Password:** set via the `ADMIN_PASSWORD` env var (production value is set in
Vercel). Locally it's `pawsure-admin-dev` in `.env.local`.
- **Pipeline to test:** review the queue, **view the uploaded document**, and
**approve / reject** with a reason. Approving the unverified shop above unlocks
its passport issuance; rejecting sends it back to `/verify` with your note.
- Optionally set `ADMIN_EMAILS` (comma-separated) so logged-in users with those
emails are admins and receive new-submission email pings (needs `RESEND_API_KEY`).

---

## Suggested end-to-end test run

1. **Admin:** open `/admin`, sign in. Queue should be empty (or show pending shops).
2. **Unverified shop:** sign in as `shop.unverified@pawsure.test` → you're sent to
  `/verify` → upload any image/PDF → you land in `/app` with a "pending" banner.
3. **Admin:** refresh `/admin` → the shop is now pending → view its doc → **Approve**.
4. **Unverified shop (now approved):** the banner disappears; issuing passports works.
5. **Verified shop:** sign in as `shop.verified@pawsure.test` → open a pet → **Transfer**
  → create a passport link/QR.
6. **Owner:** open the passport link, **claim** it (creates/links an owner account),
  or sign in as `owner.demo@pawsure.test` and try the extra-pet purchase on `/me/billing`.

