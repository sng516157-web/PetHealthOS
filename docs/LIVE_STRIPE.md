# Switching to live Stripe

Checklist for going from Stripe **test mode** to **live** on PawSure.

---

## 1. Stripe Dashboard (Live mode)

Toggle **Test mode → Live** (top-right).

- [ ] Finish **account activation** (HK sole prop + BR, bank account for payouts).
- [ ] **Settings → Billing → Customer portal** — enable; allow customers to **cancel subscriptions** and update payment methods.
- [ ] Copy **Live** secret key: `sk_live_…` (Developers → API keys).

Cards only for now — WeChat/Alipay are deferred (`docs/PAYMENTS_WALLETS_DEFERRED.md`).

---

## 2. Live webhook

**Developers → Webhooks → Add endpoint** (Live mode):

| Field | Value |
|-------|--------|
| URL | `https://pet-health-os.vercel.app/api/stripe/webhook` |
| Events | `checkout.session.completed` |
| | `checkout.session.async_payment_succeeded` |
| | `checkout.session.expired` |
| | `invoice.payment_succeeded` |
| | `customer.subscription.deleted` |
| | `charge.refunded` |

Copy the signing secret → `whsec_…`

Use the **Vercel URL** for webhooks (not `pethealthos.online`). Stripe servers call Vercel directly.

---

## 3. Vercel production env vars

**Project → Settings → Environment Variables → Production:**

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_…` (replace test `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Live `whsec_…` from step 2 |
| `APP_PUBLIC_URL` | `https://pethealthos.online` |

Remove or do not set test keys in Production.

---

## 4. Deploy

```bash
git push origin main
vercel --prod --yes
```

Build runs `prisma migrate deploy` — ensures `OwnerPetSlot`, `OrgSlot`, `stripeCustomerId` columns exist.

---

## 5. Smoke test (live, small real charge)

Browse **https://pethealthos.online** only.

1. **Owner extra pet slot** — ¥15/mo subscription; confirm `slotId` in Stripe session metadata.
2. **Shop SHOP monthly** — confirm subscription + org plan upgrade.
3. **Facility care slot** — confirm `org_slot` + `slotId` metadata.
4. **Account → Manage subscription** — portal opens; cancel test sub.
5. **Webhook log** — all events return **200**.
6. After cancel/refund — pet goes **view-only** (no new logs / AI); dashboard still loads.

---

## 6. Sandbox → live data

- Test-mode customers/subscriptions **do not** carry over.
- Users who paid in test mode need to **check out again** in live mode.
- `stripeCustomerId` is saved on first **live** checkout.

---

## 7. Manual refunds

Refunding in Stripe Dashboard fires `charge.refunded` when the checkout session had **`slotId`** in metadata. Without it (legacy payments), revoke slots manually in the DB or ask engineering.

**SHOP plan cancel** fires `customer.subscription.deleted` with `scopeKind: org` → org downgrades to `STARTER`; pets beyond the free tier become view-only automatically.

---

## Quick reference

| What | Where |
|------|--------|
| User-facing site (China) | https://pethealthos.online |
| Webhook endpoint | https://pet-health-os.vercel.app/api/stripe/webhook |
| Account / cancel | `/me/account` or `/app/account` |
| Slot + entitlement logic | `src/lib/owner-slots.ts`, `src/lib/org-slots.ts` |
