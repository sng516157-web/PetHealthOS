# 02 — Owner workspace

**Routes:** `/me`, `/me/pets/*`, `/me/billing`, `/me/account`.

**Account:** `owner.demo@pawsure.test` · **Code:** `src/app/me/**`, `getUserUsage`, `getPetEntitlements`.

---

## Dashboard

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/me` | Pet list loads |
| 2 | Empty owner (new signup) | Empty state + CTA to add pet |

---

## Pet CRUD

| Step | Action | Expected |
|------|--------|----------|
| 1 | Add pet within free quota (1 included) | Pet created |
| 2 | Add second pet without slot | Blocked or prompted to buy slot |
| 3 | Edit pet profile (name, species, photo) | Saves; photo displays (via `/api/img` if blob) |
| 4 | Delete pet (if exposed) | Removed from list |

---

## Quota enforcement

| Step | Action | Expected |
|------|--------|----------|
| 1 | At cap (10 pets) | Cannot add more |
| 2 | Revoked slot pet | View-only: no new logs, no AI (see entitlements) |

Reference: `OWNER_EXTRA_PET_CAP = 10`, 1 included, ¥15/mo extras.

---

## Health log

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open pet → Health Log | Timeline renders |
| 2 | Add log entry (text + optional photo) | Appears immediately; AI enrichment may follow async |
| 3 | Add reminder-linked entry if UI supports | Reminder surfaces on dashboard |

---

## Facility sharing (owner side)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open pet with stay token / QR | Check-in code visible |
| 2 | "Currently shared with" shows active facility | Matches `PetStay` ACTIVE |
| 3 | **Take back** | Stay archived; token rotates; facility loses live access |

Cross-test with [04-facility-stays.md](./04-facility-stays.md).

---

## Billing (`/me/billing`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Page loads without server error | Slot count + pricing shown |
| 2 | Purchase extra pet slot (demo or Stripe) | `OwnerPetSlot` ACTIVE; quota increases |
| 3 | Refresh after payment | Count stable; not duplicated |

Full payment matrix: [07-billing-payments.md](./07-billing-payments.md).

---

## Account (`/me/account`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Page loads | Profile fields shown |
| 2 | Open Stripe Customer Portal (if configured) | Portal opens; return URL works |

---

## Tabs: no Transfer

| Step | Action | Expected |
|------|--------|----------|
| 1 | Pet detail tabs | Health Log · AI · Triage — **no** Transfer tab |
