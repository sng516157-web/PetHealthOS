# PawSure test handbook

Manual test plans and **Standard Operating Procedures (SOPs)** for verifying changes
before they ship. This repo has **no automated test suite yet** — these documents are
the regression safety net until unit/e2e tests are added.

## How to use this directory

| Document | When to read |
|----------|----------------|
| **[SOP.md](./SOP.md)** | **Always** — before and after any code change |
| **[change-impact.md](./change-impact.md)** | Pick which subsystem checklists to run |
| **[accounts.md](./accounts.md)** | Credentials, seed commands, account matrix |
| Subsystem files (`01-` … `12-`) | Deep checklists for the area you touched |

## Subsystem index

| # | Area | File |
|---|------|------|
| 01 | Auth & sessions | [01-auth-and-sessions.md](./01-auth-and-sessions.md) |
| 02 | Owner workspace | [02-owner-workspace.md](./02-owner-workspace.md) |
| 03 | Shop workspace | [03-shop-workspace.md](./03-shop-workspace.md) |
| 04 | Facility stays | [04-facility-stays.md](./04-facility-stays.md) |
| 05 | Passport, transfer & claim | [05-passport-transfer-claim.md](./05-passport-transfer-claim.md) |
| 06 | Verification, KYC & admin | [06-verification-kyc-admin.md](./06-verification-kyc-admin.md) |
| 07 | Billing & payments | [07-billing-payments.md](./07-billing-payments.md) |
| 08 | AI chat & triage | [08-ai-chat-triage.md](./08-ai-chat-triage.md) |
| 09 | i18n & locale | [09-i18n-and-locale.md](./09-i18n-and-locale.md) |
| 10 | UI/UX & brand | [10-ui-ux-brand.md](./10-ui-ux-brand.md) |
| 11 | Infrastructure & China access | [11-infrastructure-china-access.md](./11-infrastructure-china-access.md) |
| 12 | Build, lint & deploy | [12-build-lint-deploy.md](./12-build-lint-deploy.md) |

## Related technical docs

- Product/architecture: `docs/CONTEXT.md`
- Billing rules (read before touching payments): `docs/BILLING.md`
- Live Stripe checklist: `docs/LIVE_STRIPE.md`
- Demo accounts (legacy path): `docs/TestAccounts.md` — prefer [accounts.md](./accounts.md)

## Agent rule (from `AGENTS.md`)

> Verify changes — run lint/build and, for UI, check on `localhost` (`/brand` for design
> system) before reporting done.

Extend that with: run the **minimum checklist set** from [change-impact.md](./change-impact.md)
for every behaviour change, and follow [SOP.md](./SOP.md) for evidence and sign-off.
