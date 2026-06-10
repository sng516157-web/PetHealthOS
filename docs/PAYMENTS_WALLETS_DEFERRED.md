# WeChat Pay & Alipay — deferred until incorporation

**Status:** Removed from the product (2026-06-10). **Card-only** checkout via Stripe HK until the founder incorporates and can pursue native mainland wallet merchants.

This doc preserves what we built, why we paused it, and exactly how to bring wallets back.

---

## Why wallets are off for now

1. **Recurring billing** — Mainland users expect WeChat/Alipay. Through Stripe HK, wallets are **one-time** only (`mode: "payment"`); cards auto-renew via subscriptions. True wallet auto-debit needs **native** merchant accounts (委托代扣 / 周期扣款), which require a **mainland business licence** — not just HK sole prop + BR.

2. **Product simplicity** — Until incorporation, we ship **one payment path**: Stripe Checkout with **card** only. Fewer support edge cases (async wallet confirmation, manual renewals, stuck redirects).

3. **Legal path** — Documented in `docs/CONTEXT.md` (2026-06-03): HK sole prop + Stripe HK is enough for **cards** cross-border; native WeChat/Alipay merchants are the post-incorporation track.

---

## What was removed (2026-06-10)

| Area | Change |
|------|--------|
| **UI** | WeChat/Alipay buttons removed from `ShopBilling`, `UpgradePanel`, `OwnerExtraSlots`, `FacilitySlots` |
| **`lib/billing.ts`** | `Provider` is `"stripe"` only; `chinaPayConfigured` and wallet `payment_method_types` removed |
| **i18n** | `billing.payWechat` / `billing.payAlipay` removed from `en.ts` + `zh.ts` |
| **Legal copy** | Disclaimer §7 now references Stripe (card) only |
| **Env** | `WECHAT_PAY_*` / `ALIPAY_*` stubs dropped from `.env.example` (documented here instead) |

**Unchanged:** Webhook (`/api/stripe/webhook`), fulfillment (`fulfillCheckoutSession`), `APP_PUBLIC_URL` / `checkoutBaseUrl()`, demo mode when `STRIPE_SECRET_KEY` is unset.

---

## Current live setup (card only)

- **Processor:** Stripe HK — `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` on Vercel Production.
- **Checkout:** `createStripeCheckout` → `payment_method_types: ["card"]`, `mode: "subscription"` when `interval` is `month` or `year`.
- **Return URLs:** `APP_PUBLIC_URL=https://pethealthos.online` (mainland-reachable proxy).
- **Webhook URL:** `https://pet-health-os.vercel.app/api/stripe/webhook` (Stripe servers; not the HK proxy).
- **Events:** `checkout.session.completed`, `checkout.session.async_payment_succeeded`.

Going live: see decision log in `docs/CONTEXT.md` and agent notes in `AGENTS.md`.

---

## Historical: Stripe cross-border wallets (pre-removal)

Before 2026-06-10, all three billing buttons routed through **one** Stripe Checkout session:

```ts
// Removed pattern — do not re-enable without reading Stripe's current wallet docs
provider === "wechat" → payment_method_types: ["wechat_pay"]
provider === "alipay"  → payment_method_types: ["alipay"]
// Always mode: "payment" for wallets (never subscription)
// wechat_pay: { client: "web" }
```

**Stripe Dashboard (when re-testing cross-border):** enable Alipay + WeChat Pay under Payment methods (Live mode).

**Limitations that motivated deferral:**

- Checkout **subscription mode** does not support WeChat/Alipay.
- No true auto-renew on wallets without native merchants or a custom Setup Intent / invoice flow.
- Alipay recurring on Stripe is **invite-only**.

---

## Future path A — Re-enable Stripe cross-border wallets (quick, still no auto-renew)

Use when you want wallets back **before** mainland incorporation, accepting one-time charges + manual renewal UX.

### Code checklist

1. **`src/lib/billing.ts`**
   - Extend `Provider` → `"stripe" | "wechat" | "alipay"`.
   - Restore `stripeMethodFor()` mapping to `wechat_pay` / `alipay`.
   - In `createStripeCheckout`: `recurring = method === "card" && interval`; wallets → `mode: "payment"`.
   - Restore `wechat_pay` `payment_method_options: { client: "web" }`.
   - Optional: restore `chinaPayConfigured()` stub for a future **native** path when Stripe is unset.

2. **UI** — Restore wallet buttons in:
   - `src/components/ShopBilling.tsx`
   - `src/components/UpgradePanel.tsx`
   - `src/components/OwnerExtraSlots.tsx`
   - `src/components/FacilitySlots.tsx`

3. **i18n** — Re-add `billing.payWechat` / `billing.payAlipay` in **both** `en.ts` and `zh.ts`.

4. **Legal** — Update `src/lib/legal.ts` §7 (EN + ZH).

5. **Product** — Strongly recommend adding before wallets go live:
   - `planExpiresAt` on `Organization` / `User`
   - Renewal banner + cron reminders (wallets = pay again each period)
   - See conversation / `docs/CONTEXT.md` decision log for "manual renew" design

### Stripe Dashboard

- Live mode → Payment methods → enable **Alipay** and **WeChat Pay**.
- No new env vars for the Stripe-routed path.

### Test matrix

| Flow | Card | WeChat | Alipay |
|------|------|--------|--------|
| Shop monthly | subscription | one-time | one-time |
| Shop yearly | subscription | one-time | one-time |
| Owner extra slot | one-time today* | one-time | one-time |
| Facility extra slot | subscription | one-time | one-time |

\* Owner slots should be switched to card subscriptions when revisiting billing.

---

## Future path B — Native WeChat / Alipay merchants (post-incorporation)

Use when you have a **mainland entity** and want **true recurring** wallet billing.

### Prerequisites

- Mainland **营业执照** (business licence)
- WeChat Pay merchant account (微信支付商户号)
- Alipay merchant account (支付宝商家)
- ICP if hosting on mainland (optional if users still hit HK proxy for the web app)

### Env vars (never wired in production — stubs only existed pre-removal)

```env
WECHAT_PAY_MCH_ID=""
WECHAT_PAY_API_KEY=""
WECHAT_PAY_CERT_PATH=""   # platform cert — exact names TBD at integration time

ALIPAY_APP_ID=""
ALIPAY_PRIVATE_KEY=""
ALIPAY_PUBLIC_KEY=""
```

### Implementation sketch (greenfield)

1. New module e.g. `src/lib/china-pay.ts` — separate from Stripe.
2. Wallet checkout creates provider-specific orders; webhooks at `/api/wechat/webhook`, `/api/alipay/notify`.
3. **WeChat 委托代扣** / **Alipay 周期扣款** for auto-renew; store `walletAgreementId` + `planExpiresAt`.
4. Billing UI: wallet buttons call native flow when `chinaPayConfigured()` && incorporated flag/env.
5. Keep Stripe card as parallel option for HK/overseas cards.

### Compliance

- User consent screens for auto-debit (mandatory in China).
- Refund/chargeback flows per provider rules.
- Lawyer review for mainland subscription terms.

---

## Files to touch when revisiting

| File | Role |
|------|------|
| `src/lib/billing.ts` | Provider types, Checkout session creation |
| `src/app/actions.ts` | `provider` from FormData → checkout helpers |
| `src/components/ShopBilling.tsx` | Shop/facility plan purchase UI |
| `src/components/UpgradePanel.tsx` | Generic plan upgrade UI |
| `src/components/OwnerExtraSlots.tsx` | Owner ¥15/mo extra pet |
| `src/components/FacilitySlots.tsx` | Facility ¥30/mo care slot |
| `src/lib/i18n/en.ts` + `zh.ts` | Wallet button labels |
| `src/lib/legal.ts` | Disclaimer payment section |
| `docs/CONTEXT.md` | Decision log + billing section |
| `docs/UPDATES.md` | User-facing changelog |
| `AGENTS.md` | Agent quick facts |
| `.env.example` | Env inventory |

---

## Decision record

- **2026-06-03** — Routed wallets through Stripe HK (cross-border, one-time). See `docs/CONTEXT.md`.
- **2026-06-10** — **Removed wallet UI and code** until incorporation; card-only Stripe. Why: no recurring on Stripe wallets, native path needs mainland company, simplify GTM.
