# Test accounts & data setup

## Seed demo accounts

```bash
npx tsx prisma/seed-demo.ts
```

Requires `.env.local` with production `DATABASE_URL` (and `STRIPE_SECRET_KEY` to
cancel stale Stripe subscriptions for demo emails before recreating accounts).

**What reset does:** deletes and recreates all four demo users/orgs; cancels active
Stripe subs on demo emails; restores Coco in care at Happy Paws; clears broken
`OrgSlot` / billing state from prior test runs.

Optional regression helper (simulate KYC upload / approve unverified shop):

```bash
npx tsx prisma/regression-prep.ts          # UNVERIFIED → PENDING
npx tsx prisma/regression-prep.ts --approve  # PENDING → APPROVED
```

**Shared password (all demo accounts):** `Demo123456`

Sign in at `/login` or via `/owner`, `/shop`, `/facility`.

> Throwaway credentials for pilot/demo only. Rotate before a real production launch.

---

## Account matrix

| Email | Type | Plan / status | Workspace | Primary test doc |
|-------|------|---------------|-----------|------------------|
| `owner.demo@pawsure.test` | Owner | FREE, 1 pet included | `/me` | [02-owner-workspace.md](./02-owner-workspace.md) |
| `shop.verified@pawsure.test` | Shop | SHOP, **APPROVED**, 2 demo pets | `/app` | [03-shop-workspace.md](./03-shop-workspace.md) |
| `shop.unverified@pawsure.test` | Shop | STARTER, **UNVERIFIED** | `/verify` → `/app` | [06-verification-kyc-admin.md](./06-verification-kyc-admin.md) |
| `facility.demo@pawsure.test` | Facility (HOSPITAL) | STARTER, **APPROVED**, Coco in care | `/app` | [04-facility-stays.md](./04-facility-stays.md) |

---

## Admin / review

| Item | Value |
|------|--------|
| URL | `/admin` |
| Local password | `pawsure-admin-dev` (`ADMIN_PASSWORD` in `.env.local`) |
| Production | `ADMIN_PASSWORD` in Vercel env |

Pipeline: review queue → view uploaded doc → approve/reject → shop passport gate unlocks.

---

## Quota reference (source: `src/lib/plans.ts`)

Verify UI copy matches these numbers when testing billing/pricing:

| Audience | Included | Extra price | Cap |
|----------|----------|-------------|-----|
| Owner | 1 pet | ¥15/mo per extra | 10 pets total |
| Shop STARTER | 5 pets | — | — |
| Shop SHOP | 50 pets | ¥30/mo per extra pet slot | — |
| Shop SHOP plan price | — | $29.99/mo or $299/yr | — |
| Facility in-care | 50 slots | ¥30/mo per care slot | no hard cap |

---

## Suggested end-to-end path (full regression ~30 min)

1. **Admin** — `/admin` → queue empty or pending shop visible.
2. **Unverified shop** — sign in → `/verify` → upload doc → `/app` with pending banner.
3. **Admin** — approve unverified shop → banner clears.
4. **Verified shop** — Transfer tab → issue passport → copy link.
5. **Owner** — open passport → claim OR use `owner.demo@pawsure.test` → billing slot purchase.
6. **Facility** — admit pet via token; owner take-back → facility read-only snapshot.

Maps to docs: 06 → 03 → 05 → 02 → 04.
