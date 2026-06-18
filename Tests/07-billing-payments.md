# 07 — Billing & payments

**Read first:** `docs/BILLING.md`, `docs/LIVE_STRIPE.md`.

**Code:** `src/lib/billing.ts`, `owner-slots.ts`, `org-slots.ts`,
`src/app/api/stripe/webhook/route.ts`, `/billing/success`, `/billing/cancelled`.

---

## Environment matrix

| Mode | `STRIPE_SECRET_KEY` | Expected behaviour |
|------|---------------------|-------------------|
| Demo | unset | Instant grant on purchase buttons |
| Test | `sk_test_…` | Stripe Checkout test card `4242…` |
| Live | `sk_live_…` | Real money — only when user requests |

Always set `APP_PUBLIC_URL` to the URL users return to after Checkout.

---

## Product catalog (subscription metadata contract)

Every checkout must set `scopeKind`, `scopeId`, and `slotId` (slots) on session +
`subscription_data.metadata`.

| Product | scopeKind | Fulfill | Reversal |
|---------|-----------|---------|----------|
| Shop/facility SHOP plan | `org` | `activatePlan` → SHOP | → STARTER |
| Owner Plus | `user` | `activatePlan` → PLUS | → FREE |
| Owner extra pet *(legacy)* | `user_slot` | `ensureOwnerPetSlotActive` | `revokeOwnerPetSlot` |
| Facility care slot | `org_slot` | `ensureOrgSlotActive` | `revokeOrgSlot` |

---

## Scenario A — Owner Plus

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/me/billing` → choose monthly or yearly → pay | Checkout or demo grant |
| 2 | Complete payment | `User.plan` = `PLUS`; limit = 5 pets |
| 3 | Add pets up to 5 | Allowed |
| 4 | Open `/billing/success?session_id=…` | Idempotent fulfill |
| 5 | Refresh `/me/billing` | Shows active plan; page loads (no server error) |
| 6 | Cancel sub in Stripe portal | Plan → `FREE`; limit = 1 |
| 7 | Refresh billing again | Still FREE — **not** re-activated |
| 8 | Pets beyond free tier after cancel | View-only (no log/AI) |

## Scenario A-legacy — Owner extra pet slot *(deprecated)*

| Step | Action | Expected |
|------|--------|----------|
| 1 | Existing `user_slot` subscription only | Webhook sync still revokes on cancel |

---

## Scenario B — Shop plan upgrade

| Step | Action | Expected |
|------|--------|----------|
| 1 | STARTER → upgrade monthly/yearly | Checkout |
| 2 | Pay | `org.plan` SHOP; interval stored |
| 3 | Cancel subscription | Downgrade STARTER |
| 4 | Pets over STARTER limit | Read-only per `getPetEntitlements` |

---

## Scenario C — Facility care slot

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/app/billing` → buy care slot | `OrgSlot` PENDING → ACTIVE |
| 2 | UI shows +1 purchased slot | `FacilitySlots` |
| 3 | `getFacilityCapacity` | 50 + ACTIVE org_slot count |
| 4 | Cancel / refund | Slot REVOKED; capacity drops |

---

## Scenario D — Abandoned checkout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start slot checkout, abandon | `OrgSlot`/`OwnerPetSlot` PENDING |
| 2 | Wait 2h or trigger `checkout.session.expired` | PENDING revoked |
| 3 | Billing page load | Stale PENDING cleaned |

---

## Scenario E — Webhook fulfillment

Required events (live + test endpoint):

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `invoice.payment_succeeded`
- `customer.subscription.deleted`
- `charge.refunded`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Stripe CLI or Dashboard → resend event | Handler returns 200 |
| 2 | Duplicate event | Idempotent (no double slots) |
| 3 | Wrong signature | 400 |

---

## Scenario F — Sync on page load

| Step | Action | Expected |
|------|--------|----------|
| 1 | Pay but miss success redirect | Open `/me/billing` or `/app/billing` |
| 2 | Entitlements self-heal | Active subs matched |
| 3 | No `revalidatePath` crash | Account pages load |

---

## Scenario G — Customer portal

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/me/account` or `/app/account` → portal | Stripe portal opens |
| 2 | Return URL | Lands back on account page |

---

## Stripe Dashboard checks (live)

- [ ] Webhook endpoint on **Vercel URL** (not proxy domain)
- [ ] All six events enabled
- [ ] Customer portal: cancel + update payment method
- [ ] `APP_PUBLIC_URL=https://pethealthos.online` in production

---

## DB spot checks (Prisma Studio)

| Table | Field | When |
|-------|-------|------|
| `Organization` | `plan`, `planInterval`, `stripeCustomerId` | After org plan purchase |
| `OwnerPetSlot` | `status` ACTIVE/REVOKED/PENDING | Owner slots |
| `OrgSlot` | `status`, `kind` care/shop_pet | Facility/shop slots |
| Checkout metadata | `fulfilled=1` | After successful fulfill |
