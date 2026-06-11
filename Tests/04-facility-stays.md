# 04 — Facility stays

**Account:** `facility.demo@pawsure.test` + `owner.demo@pawsure.test` (Coco in care).

**Code:** `admitPetByToken`, `releasePet`, `getFacilityPetView`, `PetStay`, `isFacilityOrg`.

---

## Facility dashboard

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in as facility → `/app` | "In care" / 照护 list, not breeder pet ownership UI |
| 2 | Coco appears (seeded active stay) | Facility can open pet record |
| 3 | No Transfer tab on facility pet view | Facilities cannot issue passports |

---

## Admit pet

| Step | Action | Expected |
|------|--------|----------|
| 1 | Owner opens pet → stay QR / token | Token visible |
| 2 | Facility: scan or paste token | `admitPetByToken` → ACTIVE `PetStay` |
| 3 | Admit same pet while already in care elsewhere | Rejected or idempotent per spec |
| 4 | Admit when at capacity | `CAPACITY_REACHED` — base 50 + paid extras |

---

## Logging during active stay

| Step | Action | Expected |
|------|--------|----------|
| 1 | Facility adds log | Saved with `loggedByOrgId` / facility name |
| 2 | Owner adds log while stay ACTIVE | Owner log visible to facility |
| 3 | Log list shows "Logged by &lt;facility&gt;" | i18n correct in en/zh |

---

## Release / take-back

| Step | Action | Expected |
|------|--------|----------|
| 1 | Owner taps **take back** | Stay ARCHIVED; `stayToken` rotated |
| 2 | Facility scans old QR | Fails / invalid |
| 3 | Facility opens archived pet view | Read-only; logs windowed to stay period |
| 4 | Archived view: no AI / triage / delete | Tabs hidden or disabled |

---

## Capacity & care slots

| Step | Action | Expected |
|------|--------|----------|
| 1 | Billing shows base 50 + purchased extras | Matches ACTIVE `OrgSlot` count |
| 2 | Buy care slot → admit when at 50 | 51st admit succeeds |
| 3 | Cancel slot subscription | Slot revoked; capacity drops; **cannot** admit over new cap |

Billing: [07-billing-payments.md](./07-billing-payments.md) § Facility care slot.

---

## Facility billing UI

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/app/billing` facility copy | Plan benefits + ¥30/mo slot price |
| 2 | `FacilitySlots` component | Shows purchased extras + in-care bar |

---

## KYC

Facilities use same `/verify` + `/admin` flow as shops — [06-verification-kyc-admin.md](./06-verification-kyc-admin.md).
