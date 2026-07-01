# PawSure key features registry

Living list of shipped product capabilities with implementation dates where known. For architecture and decisions see [`CONTEXT.md`](CONTEXT.md); user-facing changelog in [`UPDATES.md`](UPDATES.md).

## Account & auth

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Unified auth (owner `/me`, shop/facility `/app`) | 2026-06 | `User.orgId` routing |
| Single-device owner sessions | 2026-06-03 | `sessionId` + kick-other-device |
| Phone OTP sign-in | 2026-06 | SMS OTP; CN tab deferred |
| Email verification + password reset | 2026-06 | Resend magic link + 6-digit code |
| Shop KYC (`/verify`, `/admin`) | 2026-06-03 | Required before passport issue |
| Account delete + Stripe portal | 2026-06 | `/me/account`, `/app/account` |

## Owner experience

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Owner home dashboard | 2026-06 | `/me` |
| Add pet + health log + AI + triage | 2026-06 | Per-pet tabs |
| Passport scan / claim | 2026-06 | `PassportScanner` + `claimPassport` |
| **Prominent scan CTA on owner home** | **2026-07-01** | Header button + always-visible scanner |
| Facility stay QR check-in | 2026-06-09 | `stayToken`, admit/release |
| Owner Plus billing (5 pets) | 2026-06-17 | Stripe subscriptions |
| Memorial / deceased archive | 2026-06-15 | Read-only memorial tab |
| Data import request | 2026-06-25 | PDF upload, admin processing |

## Shop / breeder workspace

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Shop dashboard + pet roster | 2026-06 | `/app` |
| Health log, reminders, workspace AI | 2026-06 | Shared pet tab model |
| Health passport issue + transfer | 2026-06 | `/passport/[token]`, guarantees |
| **Shop onboarding checklist** | **2026-07-01** | Add pet → vaccine log → passport |
| **Mobile nav “More” menu** | **2026-07-01** | Billing, account, feedback |
| Founding breeder lifetime deal | 2026-06-17 | Dashboard promo + Stripe |
| **Vaccine schedule templates** | **2026-07-01** | Org templates → litter reminders |
| **Litter grouping + bulk log** | **2026-07-01** | `litterName` filter, bulk entry |
| **Buyer preview link** | **2026-07-01** | `/preview/[token]` before issue |
| **PDF / print handover summary** | **2026-07-01** | `/app/pets/[id]/handover` |
| **WhatsApp / WeChat share** | **2026-07-01** | Passport + preview share buttons |
| **Editable pet profile** | **2026-07-01** | Edit intake fields after create |

## Facility (hospital / boarding)

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Scan-to-admit via owner QR | 2026-06-09 | `PetStay` time-boxed access |
| Capacity slots (50 + $2.49/mo) | 2026-06-10 | Mirrors shop slot model |
| Archived stay read-only window | 2026-06-09 | Logs capped at `releasedAt` |

## Platform

| Feature | Implemented | Notes |
|---------|-------------|-------|
| Bilingual UI (en / zh) | 2026-06 | Cookie + localStorage sync |
| Stripe card checkout (USD) | 2026-06 | All paid plans |
| Vercel Blob uploads | 2026-06 | KYC docs, pet photos |
| AI chat + triage (Groq) | 2026-06 | Vision on attachments |
| Public passport page | 2026-06 | Tamper-evident seal |
| HK reverse proxy (China access) | 2026-06 | `pethealthos.online` |
| Homepage interactive dashboard preview | 2026-06 | Landing mini dashboards |

## Deferred / not built

See [`UX Improvement Waiting List/`](UX%20Improvement%20Waiting%20List/) for backlog items, [`REFERRALS_DEFERRED.md`](REFERRALS_DEFERRED.md), [`PAYMENTS_WALLETS_DEFERRED.md`](PAYMENTS_WALLETS_DEFERRED.md).
