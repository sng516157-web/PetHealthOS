# 01 — Auth & sessions

**Code:** `src/lib/auth.ts`, `src/components/AuthCard.tsx`, `src/app/login/page.tsx`,
landing auth on `/owner`, `/shop`, `/facility`.

**Accounts:** all types in [accounts.md](./accounts.md).

---

## Email + password sign-in

| Step | Action | Expected |
|------|--------|----------|
| 1 | Go to `/login`, sign in as owner (verified email) | Redirect to `/me` |
| 2 | Sign out, sign in as verified shop | Redirect to `/app` |
| 3 | Wrong password | Error shown; no session |
| 4 | Sign in as facility | `/app` facility dashboard |

---

## Registration

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/owner` → create account | Verification email sent; lands `/verify-email` until link clicked |
| 2 | Click link in email | `emailVerifiedAt` set; redirect `/me` |
| 3 | `/shop` → create shop | Same email gate, then `/verify` KYC if shop unverified |
| 4 | `/facility` → create facility | Org `kind` HOSPITAL or BOARDING; email verify then KYC gate |

**Dev without Resend:** magic link logged to server console; resend button shows prompt with link.

---

## Email verification (Resend)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Register new account | Redirect `/verify-email`; `/me` blocked |
| 2 | Resend | Rate-limited; new link emailed |
| 3 | Expired/invalid link | Error on page; can resend |
| 4 | Sign in unverified | Redirect `/verify-email` |
| 5 | Existing accounts (pre-migration) | Already verified (`emailVerifiedAt` backfilled) |

---

## Owner single-device enforcement

| Step | Action | Expected |
|------|--------|----------|
| 1 | Browser A: sign in as owner | Session active |
| 2 | Browser B (or incognito): sign in same owner | `{ conflict: true }` → "sign out other device" UI |
| 3 | Choose **cancel** | Browser B not logged in; A still works |
| 4 | Browser B: sign in with **force** | B logged in; A kicked on next navigation |
| 5 | Shop: sign in on two browsers | **Both** stay logged in (multi-device) |

---

## Phone OTP (if `TWILIO_*` configured)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Request OTP for test number | SMS or dev bypass per env |
| 2 | Wrong code | Error |
| 3 | Correct code | Session set |
| 4 | OTP + active session conflict | Same kick flow as password; code not consumed on pre-check |

If Twilio unset, confirm email auth still works and OTP UI degrades gracefully.

---

## Session persistence & sign-out

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sign in → refresh page | Still authenticated |
| 2 | Sign out | Cookie cleared; `/me` or `/app` redirects to login |
| 3 | Visit `/owner` while logged in as owner | Redirect away to workspace |

---

## Route guards

| Step | Action | Expected |
|------|--------|----------|
| 1 | Logged out → `/me` | Redirect to login/owner landing |
| 2 | Logged out → `/app` | Redirect to `/shop` |
| 3 | Owner logged in → `/app` | Blocked / redirected (no org) |
| 4 | Shop logged in → `/me` | Blocked / redirected |

---

## Passport claim auth

| Step | Action | Expected |
|------|--------|----------|
| 1 | Claim passport while logged out | Creates owner account + session |
| 2 | Claim while another owner session active | Single-device conflict if same user path applies |

See [05-passport-transfer-claim.md](./05-passport-transfer-claim.md) for full claim flow.
