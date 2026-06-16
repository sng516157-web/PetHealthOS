# Change impact matrix

When you change files in column **Touch**, run at minimum the **Required tests**.
Run **Recommended** tests for risky or cross-cutting edits.

---

## By source path

| Touch (paths / symbols) | Required tests | Recommended |
|-------------------------|----------------|-------------|
| `src/lib/auth.ts`, `AuthCard`, `/login`, `/owner`, `/shop`, `/facility` | 01, 12 | 02, 03, smoke |
| `src/app/me/**`, owner components | 02, 09, 12 | 05, 07, 08 |
| `src/app/app/**` (non-facility-specific) | 03, 09, 12 | 05, 06, 07, 08 |
| `src/lib/*facility*`, `PetStay`, `admitPetByToken`, `releasePet` | 04, 12 | 02, 07 |
| `createTransfer`, `claimPassport`, `/passport/**` | 05, 12 | 01, 02, 03, 06 |
| `submitVerification`, `reviewOrg`, `/verify`, `/admin` | 06, 12 | 03, 05 |
| `src/lib/billing.ts`, `owner-slots.ts`, `org-slots.ts`, Stripe webhook, `/billing/**` | **07, 12** | 02, 03, 04, account pages |
| `src/lib/ai.ts`, `/api/pets/*/chat`, triage pages | 08, 12 | 02, 03, 04 |
| `src/lib/i18n/**`, locale cookie, `Dictionary` type | **09, 12** | 10, all workspaces |
| `src/components/pawsure/**`, `globals.css`, `/brand` | 10, 12 | workspace using changed component |
| `OwnerHomeView`, `ShopHomeView`, `FacilityHomeView`, `pet-tab-model`, `dashboard-preview-data`, `LandingMiniDashboards`, `/` homepage | 10, 12 | `/` + `/demo/landing-dashboards` — click all three roles, open a pet, switch tabs |
| `next.config.ts`, `src/lib/img.ts`, `/api/img`, `deploy/Caddyfile` | 11, 12 | 06 (admin doc proxy) |
| `prisma/schema.prisma`, migrations | 12 | all subsystems using affected models |
| `src/lib/plans.ts`, pricing copy | 07, 09, 10 | `/pricing`, billing pages |
| Docs only | 12 (if examples include commands) | — |

---

## By change type

| Change type | Required |
|-------------|----------|
| Bug fix in one screen | Subsystem for that screen + 12 |
| New API route with auth | 01 + owning subsystem + 12 |
| New paid feature | 07 + owning subsystem + `docs/BILLING.md` update |
| Refactor (no behaviour change) | 12 + smoke |
| Dependency upgrade (Next/React/Prisma) | **12 + full smoke + 01** |
| Stripe Dashboard / webhook config | 07 (all scenarios) on target env |

---

## Billing change — extra mandatory scenarios

If **any** billing file changes, run these from [07-billing-payments.md](./07-billing-payments.md):

1. Pay → entitlements appear (webhook **or** billing page refresh)
2. Cancel subscription → downgrade / slot revoked
3. Refund → stays revoked after billing refresh (no zombie slots)
4. Abandon checkout → `PENDING` slot expires/revokes
5. Billing + account pages load without server error

---

## UI change — extra mandatory checks

If **visual / UX** changes:

1. `/brand` — component still matches design tokens
2. Mobile width (~390px) — no horizontal scroll on changed page
3. `zh` and `en` — no missing keys / layout breaks ([09](./09-i18n-and-locale.md))
