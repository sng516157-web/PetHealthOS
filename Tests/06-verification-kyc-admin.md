# 06 — Verification, KYC & admin

**Routes:** `/verify`, `/admin`, `/api/admin/doc/[orgId]`.

**Code:** `submitVerification`, `reviewOrg`, `src/lib/admin.ts`.

**Accounts:** `shop.unverified@pawsure.test`, admin password from [accounts.md](./accounts.md).

---

## Shop verification submission

| Step | Action | Expected |
|------|--------|----------|
| 1 | UNVERIFIED shop signs in | Redirect to `/verify` |
| 2 | Upload licence (image/PDF) | Stored private Blob; status → PENDING |
| 3 | After submit | Can access `/app` with pending banner |
| 4 | Re-submit while PENDING | Behaviour per spec (replace or reject duplicate) |

---

## Passport lock until approved

| Step | Action | Expected |
|------|--------|----------|
| 1 | PENDING shop → Transfer | Blocked |
| 2 | APPROVED shop → Transfer | Allowed |

---

## Admin queue

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/admin` without auth | Password gate |
| 2 | Wrong password | Denied |
| 3 | Correct password | Queue loads |
| 4 | `ADMIN_EMAILS` user logged in | Access without password (if configured) |

---

## Review actions

| Step | Action | Expected |
|------|--------|----------|
| 1 | View uploaded document | Proxy `/api/admin/doc/[orgId]` serves file |
| 2 | **Approve** | `verificationStatus` APPROVED; shop banner clears |
| 3 | **Reject** with reason | REJECTED; shop sent back to `/verify` with note |
| 4 | Email notify on new submission | Admin email if `RESEND_API_KEY` set |

---

## Facility verification

| Step | Action | Expected |
|------|--------|----------|
| 1 | New facility signup | Same `/verify` flow as shop |
| 2 | Approved facility | Can admit pets; cannot issue passports |

---

## Regression after admin changes

| Step | Action | Expected |
|------|--------|----------|
| 1 | Approved shop issues passport | Still works — [05](./05-passport-transfer-claim.md) |
| 2 | Rejected shop existing pets | Still viewable; no new passports |
