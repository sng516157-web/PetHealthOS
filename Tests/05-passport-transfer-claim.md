# 05 — Passport, transfer & claim

**Routes:** `/app/pets/[id]/transfer`, `/passport/[token]`.

**Code:** `createTransfer`, `claimPassport`, transfer visibility settings.

**Accounts:** `shop.verified@pawsure.test` (issue), fresh owner or claim flow.

---

## Issue passport (shop)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Verified shop → pet → Transfer | Form: guarantee, visibility, claimability |
| 2 | Submit transfer | Pet status TRANSFERRED; archived in shop list |
| 3 | Pre-transfer history | `lockedAt` set; milestone "Homecoming day" added |
| 4 | Unverified shop attempts transfer | Server-side block |
| 5 | Second transfer same pet | `ALREADY_ISSUED` |

---

## Public passport page

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/passport/[token]` logged out | Public view per visibility settings |
| 2 | Hidden fields respect breeder config | No leaked private data |
| 3 | QR on page scans correctly | Same token URL |

---

## Claim passport

| Step | Action | Expected |
|------|--------|----------|
| 1 | Claim enabled → register on passport page | Owner account created; `ownerUserId` set |
| 2 | Pet lands in owner `/me` | ARCHIVED or active per product rules |
| 3 | Claiming does **not** block on owner pet quota | Handoff protected |
| 4 | Claim disabled | Register CTA hidden / error |

---

## Owner signup via scanner

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/owner` → scan QR (`PassportScanner`) | Camera or paste fallback |
| 2 | Invalid token | Error message |
| 3 | Valid token | Navigates to passport / claim |

---

## Post-claim continuity

| Step | Action | Expected |
|------|--------|----------|
| 1 | Owner adds log after claim | Appears on timeline |
| 2 | Shop no longer edits transferred pet as active | Archived on shop side |
| 3 | Passport link still works | Shows frozen + post-claim history per visibility |

---

## Security

| Step | Action | Expected |
|------|--------|----------|
| 1 | Guess random token | 404 or generic not found |
| 2 | Owner B tries `/me/pets/[id]` for unowned pet | Access denied |
