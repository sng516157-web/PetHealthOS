# 03 — Shop workspace

**Routes:** `/app`, `/app/pets/*`, `/app/billing`, `/app/account`, `/app/reminders`, `/app/notifications`.

**Account:** `shop.verified@pawsure.test` · **Code:** `requireActiveOrg`, org pet flows.

---

## Dashboard & navigation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in → `/app` | Sidebar + pet list |
| 2 | Archived vs active pets | Transferred pets in archived list |
| 3 | Notifications / reminders pages | Load without error |

---

## Pet management

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create pet within plan limit | Success (STARTER 5 / SHOP 50) |
| 2 | Exceed limit without slot | Server rejects with clear message |
| 3 | Open pet → all tabs | Health Log · AI · Triage · **Transfer** |

---

## Multi-seat (SHOP plan)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Two users same org (if seeded) | Both access same pets |
| 2 | STARTER org | Single-seat behaviour per product rules |

---

## Verification gate interaction

| Step | Action | Expected |
|------|--------|----------|
| 1 | UNVERIFIED shop | `/verify` redirect from `/app` layout |
| 2 | PENDING shop | `/app` works; banner; passport still locked |
| 3 | APPROVED shop | No banner; Transfer allowed |

Details: [06-verification-kyc-admin.md](./06-verification-kyc-admin.md).

---

## Transfer / passport issuance

| Step | Action | Expected |
|------|--------|----------|
| 1 | APPROVED + SHOP/STARTER → Transfer tab | Form available |
| 2 | UNVERIFIED → Transfer | Blocked |
| 3 | Issue passport | Pet TRANSFERRED; public link works |
| 4 | Second issue same pet | `ALREADY_ISSUED` error |

Full flow: [05-passport-transfer-claim.md](./05-passport-transfer-claim.md).

---

## Billing (`/app/billing`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | STARTER shop sees upgrade CTA | Monthly ¥599 / yearly ¥4888 |
| 2 | Upgrade to SHOP (demo or Stripe) | `org.plan` SHOP; limits increase |
| 3 | Cancel subscription | Downgrade to STARTER; read-only over-quota pets |
| 4 | Extra shop pet slot (¥30/mo) if over 50 | `OrgSlot` shop_pet ACTIVE |

Payment details: [07-billing-payments.md](./07-billing-payments.md).

---

## Account (`/app/account`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Loads without error | Org name / billing link |
| 2 | Stripe portal | Manage subscription |

---

## AI surfaces

| Step | Action | Expected |
|------|--------|----------|
| 1 | Chat tab | Shop-toned responses |
| 2 | Triage tab | Report renders |

See [08-ai-chat-triage.md](./08-ai-chat-triage.md).
