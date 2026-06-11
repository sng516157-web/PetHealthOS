# Beta distribution readiness

Living checklist for shipping PawSure to beta testers. Re-run after each production deploy.

**Last diagnosis:** 2026-06-09 · Deploy `7574f75` · Production alias `pet-health-os.vercel.app`

---

## Verdict: **Ready for closed beta** (with pre-flight below)

Core flows work on both Vercel and the China proxy domain. Suitable for a **small, invited** beta using documented demo accounts or fresh signups. Not yet ready for a **public open beta** without addressing security and ops gaps in §Blockers.

---

## Pre-flight before sharing with testers

| # | Action | Owner |
|---|--------|-------|
| 1 | Share **`https://pethealthos.online`** with mainland testers (not `*.vercel.app`) | Team |
| 2 | Re-seed demo accounts if facility stay / shop pets look empty: `npx tsx prisma/seed-demo.ts` (uses `DATABASE_URL`) | Team |
| 3 | Distribute credentials from [accounts.md](./accounts.md) — password `Demo123456` | Team |
| 4 | Confirm Stripe mode (test vs live) matches what beta testers should be charged | Founder |
| 5 | Stripe Dashboard → Webhooks: all **6** events enabled per `docs/LIVE_STRIPE.md` | Founder |
| 6 | Tell testers billing is **card only**; WeChat/Alipay deferred | Comms |

---

## Automated gates (2026-06-09)

| Gate | Result |
|------|--------|
| `npx next build` (local) | ✅ Pass |
| Vercel production build | ✅ Pass (migrations applied) |
| `npm run lint` | ⚠️ 8 errors (pre-existing `Date.now` in RSC, conditional `useId`) — **does not block build** |

---

## Production smoke (2026-06-09)

| Check | URL | Result |
|-------|-----|--------|
| Landing | `pethealthos.online/` | ✅ 200 |
| Login | `pethealthos.online/login` | ✅ 200 |
| Pricing (no referral copy) | `pethealthos.online/pricing` | ✅ 200, flat tiers |
| Shop login → workspace | `shop.verified@pawsure.test` | ✅ `/app` |
| Shop billing page | `/app/billing` | ✅ loads, 2/50 pets, no server error |
| Facility login | `facility.demo@pawsure.test` | ✅ facility UI; **0 pets in care** (re-seed recommended) |
| Cron auth | `/api/cron/reminders` no secret | ✅ 401 |
| China proxy | `pethealthos.online` vs Vercel | ✅ Both serve app |

---

## Environment (Vercel production)

| Variable | Status | Beta impact |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ Set | — |
| `AUTH_SECRET` | ✅ Set | — |
| `ADMIN_PASSWORD` | ✅ Set | Admin review works |
| `BLOB_READ_WRITE_TOKEN` | ✅ Set | Uploads / KYC docs |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ Set | AI chat/triage |
| `STRIPE_SECRET_KEY` | ✅ Set | Real/test checkout |
| `STRIPE_WEBHOOK_SECRET` | ✅ Set | Fulfillment |
| `APP_PUBLIC_URL` | ✅ Set | Checkout return via proxy |
| `CRON_SECRET` | ✅ Set | Daily reminders cron |
| `RESEND_API_KEY` | ❌ Not set | Email reminders + admin ping emails **in-app only** |
| `ADMIN_EMAILS` | ❌ Not set | No email-based admin bypass / notifications |
| `TWILIO_*` | ❌ Not set | Phone OTP disabled (expected) |

---

## Subsystem status

| Subsystem | Beta-ready? | Notes |
|-----------|-------------|-------|
| Auth (email) | ✅ | Phone tab disabled |
| Owner workspace | ✅ | Run [02](./02-owner-workspace.md) for full regression |
| Shop workspace | ✅ | Verified demo has Mochi + Biscuit |
| Facility stays | ⚠️ | Login OK; demo in-care pet missing — run seed |
| Passport / transfer | ✅ | Requires approved shop |
| KYC / admin | ✅ | `/admin` password-protected |
| Billing / Stripe | ✅ | Referrals removed; sync hardened |
| AI | ✅ | Key configured on prod |
| i18n | ✅ | zh default, en toggle |
| China access | ✅ | Proxy domain live with HTTPS |

---

## Blockers for **open** beta (not closed invite)

1. **Demo credentials on production** — `Demo123456` is a known password; rotate or remove before public launch.
2. **No automated test suite** — regressions rely on `Tests/` manual SOPs.
3. **Email notifications off** — set `RESEND_API_KEY` + `RESEND_FROM` if testers expect reminder emails.
4. **Lint purity errors** — fix `Date.now()` in server components before stricter CI.
5. **WeChat/Alipay** — intentionally deferred; set expectations for CN users.

---

## Recommended beta test script

Give testers this path (≈30 min) — full detail in [accounts.md](./accounts.md):

1. Owner: add log, view AI tab  
2. Unverified shop: upload KYC → admin approve  
3. Verified shop: issue passport → owner claim  
4. Facility: scan owner QR → log → owner take-back  
5. Optional: purchase slot / plan on billing (Stripe test card `4242 4242 4242 4242`)

---

## Re-run diagnosis

```bash
npm run lint
npx next build
# HTTP smoke (PowerShell example)
Invoke-WebRequest https://pethealthos.online/login -UseBasicParsing
```

Then follow [SOP.md](./SOP.md) Phase 4 smoke on production.
