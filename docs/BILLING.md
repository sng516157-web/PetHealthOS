# Billing — Stripe sync matrix

How PawSure maps Stripe events to app entitlements. All subscription checkouts embed
`scopeKind`, `scopeId`, and (for slots) `slotId` in **Checkout session metadata** and
**subscription metadata** (`subscription_data.metadata`).

## Products

| Product | `scopeKind` | Stripe mode | On pay | On cancel (`subscription.deleted`) | On refund (`charge.refunded`) |
|---------|-------------|-------------|--------|-------------------------------------|-------------------------------|
| Shop / facility SHOP plan | `org` | subscription (month/year) | `activatePlan` → SHOP | `activatePlan` → STARTER | `activatePlan` → STARTER |
| Owner extra pet slot | `user_slot` | subscription (month) | `ensureOwnerPetSlotActive` | `revokeOwnerPetSlot` | `revokeOwnerPetSlot` |
| Facility care slot | `org_slot` | subscription (month) | `ensureOrgSlotActive` | `revokeOrgSlot` | `revokeOrgSlot` |

**Read-only downgrade:** revoked slots and STARTER plan downgrade keep dashboards viewable;
affected pets lose new logs + AI (`OwnerPetSlot` / `OrgSlot` + `getPetEntitlements`).

## Fulfillment paths (idempotent)

1. **Webhook** `checkout.session.completed` / `async_payment_succeeded` → `fulfillCheckoutSession`
2. **Success page** `/billing/success?session_id=…` → `finalizeStripeSession`
3. **Backup** `invoice.payment_succeeded` → `applyFulfillmentFromMetadata` from subscription metadata
4. **Billing load** `syncBillingFromStripe` (cached per request) — reconciles active subs + unpaid-fulfilled checkouts

Checkout sessions are marked `metadata.fulfilled=1` after success. Replays repair stuck slots/plans.

## Reversal paths

1. **Webhook** `customer.subscription.deleted` → `applyReversalFromMetadata`
2. **Webhook** `charge.refunded` → metadata via Checkout session **or** invoice → subscription
3. **Abandoned checkout** `checkout.session.expired` → revoke `PENDING` slot only

## Self-heal on billing / account pages

`syncBillingFromStripe` runs when loading `/me/billing`, `/app/billing`, or `/app/account`:

- Expire `PENDING` slots older than 2 hours
- Match active Stripe subscriptions → DB entitlements
- Re-fulfill paid Checkout sessions missing `fulfilled=1`
- `resolveStripeCustomerId` — find Stripe customer by account email if not yet saved

## Live webhook events (required)

See `docs/LIVE_STRIPE.md`. Minimum set:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `invoice.payment_succeeded`
- `customer.subscription.deleted`
- `charge.refunded`

## Code map

| Concern | File |
|---------|------|
| Checkout + fulfill + sync | `src/lib/billing.ts` |
| Owner slots | `src/lib/owner-slots.ts` |
| Org / facility slots | `src/lib/org-slots.ts` |
| Webhook router | `src/app/api/stripe/webhook/route.ts` |
| Entitlements UI gates | `src/lib/data.ts` → `getPetEntitlements` |
