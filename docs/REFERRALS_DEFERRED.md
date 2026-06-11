# Shop referral programme — deferred

The referral system (share link → 5% off yearly per referred shop, 50% cap) was **removed
from the product** on 2026-06-11. Pricing is now flat: **¥199/mo** or **¥2188/yr**
(`SHOP_BILLING` in `src/lib/plans.ts`) with no discounts.

## What was removed

- Referral link card on `/app/billing`
- `?ref=CODE` on `/shop` signup attribution
- Dynamic yearly price based on `referralCount`
- `ensureReferralCode` / `getReferralCount` runtime usage

## What remains in the DB (intentionally)

`Organization.referralCode`, `referredById`, and the `Referrals` self-relation are **still
in the schema** from migration `shop_billing_referral`. Columns are unused; no migration
needed to drop them until we revisit the feature.

## To bring referrals back

1. Restore UI in `ShopBilling`, `/shop?ref=`, `AuthCard`, pricing copy.
2. Restore `referralDiscountRate` / `yearlyPriceRmb` in `plans.ts`.
3. Restore `ensureReferralCode`, `getReferralCount`, `getOrgReferral` in `billing.ts` / `data.ts`.
4. Restore signup attribution in `register` (`actions.ts`).
5. Decide whether Stripe Checkout amount must match discounted yearly price at purchase time.
6. Add decision-log entry + `UPDATES.md` bullet.

See git history before `2026-06-11` referral removal for the prior implementation.
