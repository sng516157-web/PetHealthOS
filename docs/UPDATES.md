# Updates log

A running, human-readable changelog of what shipped. **Newest first.** Each entry:
`YYYY-MM-DD — title — one-line summary of what changed and why it matters`.

This is surfaced in the `/admin` page so the team can see what's changed at a glance.
Agents: append a bullet here in the **same commit** as any user-facing change (see
`AGENTS.md`). Keep entries short; deeper rationale lives in `docs/CONTEXT.md`.

---

- **2026-06-11 — Refunded care slots drop off billing.** Refreshing Plan & billing now revokes
  slots whose Stripe subscriptions are cancelled or refunded (no longer stuck at old counts).

- **2026-06-11 — Billing and account pages load again.** Fixed a server error caused by Stripe
  sync calling cache revalidation during page render.

- **2026-06-11 — Billing sync hardened across all subscription types.** Payments, refunds,
  and cancellations now reconcile reliably for shop plans, owner pet slots, and facility care
  slots — billing pages self-heal from Stripe if a webhook or redirect was missed.

- **2026-06-11 — Paid care slots sync after Stripe checkout.** Buying a facility care slot
  now reliably activates in the app (billing page self-syncs from Stripe if the webhook or
  success redirect was missed); the billing page shows how many extra slots you've purchased.

- **2026-06-11 — Facility care-slot cancel sync.** Cancelling a paid facility care slot now
  properly revokes the slot and drops capacity back to the base 50 (billing page self-heals if
  it was out of sync).

- **2026-06-10 — Shop & facility slot downgrade.** Cancelling SHOP, facility care slots, or
  refunding now keeps pet dashboards readable but pauses new logs and AI on affected pets.

- **2026-06-10 — Paid pet slots stay viewable after cancel/refund.** Cancelling or refunding an
  extra pet slot keeps the pet dashboard readable but pauses new logs and AI on that pet.

- **2026-06-10 — Account page + subscription management.** Owners and shops/facilities now have
  an Account page (profile, plan, Stripe portal to cancel or update card). Plan & billing keeps
  upgrades and usage only.

- **2026-06-10 — Wallet payments message on billing.** Billing pages now explain that WeChat Pay
  and Alipay are coming soon (with monthly auto-renewal), and that card checkout works today.

- **2026-06-10 — Card-only billing for now.** WeChat Pay and Alipay buttons are removed until
  incorporation; checkout is Stripe card only. See `docs/PAYMENTS_WALLETS_DEFERRED.md` to
  bring wallets back later.

- **2026-06-10 — Mainland-friendly payment redirects.** Stripe Checkout now returns to your HK
  proxy domain (`APP_PUBLIC_URL`) instead of `*.vercel.app`, so post-payment pages load in China
  without a VPN.

- **2026-06-10 — Reliable Stripe fulfillment.** Checkout payments now activate plans/slots via an
  idempotent fulfillment step (success page + webhook), with honest success/pending/error UI and
  billing cache refresh.

- **2026-06-09 — Owner pet documents.** Pet owners now see the same Documents panel as shops on
  `/me/pets/[id]` — pedigree certs, vaccine proofs and other files uploaded before transfer stay
  visible after passport claim.

- **2026-06-09 — Pricing page refresh.** `/pricing` now covers all three account types (owner, shop,
  facility) with current numbers — 1 free pet + ¥15/extra for owners; ¥599/mo or ¥4888/yr for shops
  and facilities (50 included, ¥30 overage).

- **2026-06-09 — Trust-ecosystem homepage.** The main landing page now tells the owner–shop–facility
  trust story and invites readers to join; the redundant dark-green bottom CTA box was removed.

- **2026-06-09 — Bigger home demo.** The animated product demo in the home-page hero is now much
  larger (and re-exported at full resolution so it stays crisp).

- **2026-06-09 — Smoother note logging + instant scan refresh.** When you log a note, the AI now
  finishes structuring it before it appears, so you see one clean, finished entry instead of a rough
  version that changes a moment later (the button shows a brief "structuring…" state). And when a
  facility scans a check-in QR, the pet and lists refresh automatically — no manual page reload.

- **2026-06-09 — Facility plan matches the shop plan.** Vet clinics / boarding now hold up to **50
  pets in care** (was 20) with extra **care slots at ¥30/month** each (was ¥15) — same structure as
  the Shop plan (¥599/mo or ¥4888/yr). The facility's Plan & billing page now lists what's included
  and exactly how much each extra slot costs, and the facility landing shows the pricing up front.

- **2026-06-09 — New account type: vet clinics & boarding (宠物医院 / 宠物寄养).** Facilities sign
  up, upload a business certificate, and admit a pet by scanning the owner's check-in QR. While the
  pet is in their care they see its full history and can log notes/weights/photos — each tagged
  "Logged by <facility>" so the owner knows. When the owner taps "I've taken my pet back," the
  facility's access freezes to a read-only snapshot (no further updates leak) and the pet moves to
  their Past stays; the next visit needs a fresh scan. Owners get a check-in QR + a "currently
  shared with / take back" control on each pet. Facilities can't issue passports.

- **2026-06-08 — Pet profile photo is now optional.** When adding a pet you no longer have to
  upload a profile photo (if you do, it's still capped at 8 MB). All other fields are unchanged.

- **2026-06-08 — Shop pricing updated.** The shop plan is now **¥599/month** or **¥4888/year**,
  and the one-time lifetime option has been removed. The yearly referral discount (5% per
  referred shop, up to 50%) still applies.

- **2026-06-08 — Animated demos on the landing pages.** The home, shop and owner pages now
  show short looping GIF demos of the product in action: writing a note that AI turns into a
  structured log (home), issuing a health passport (shop), and scanning a passport + asking the
  AI (owner). Assets live in `public/demos/`.

- **2026-06-08 — Disclaimer (免责声明) added.** A full, bilingual disclaimer now lives at
  `/disclaimer` covering "not veterinary advice", AI limitations, user-entered records, health
  passports & guarantees, transactions, payments, limitation of liability, data/privacy and
  third-party services. It's linked from the site footer, the pricing page, account sign-up and
  passport claim ("by creating an account you agree…"), and from AI triage reports.

- **2026-06-08 — New pricing: shops & owners.** Shops can now pay **¥59/month**, **¥599/year**,
  or **¥3888 once for life**, chosen on the billing page. Refer another shop with your link and
  earn **5% off your yearly price per referral** (up to 50%). Owners now get **1 free pet** (was
  2); extra pets are **¥15/month** each (was ¥25). Owners can **scan a passport from their
  dashboard** to add an inherited pet, and adding a brand-new pet beyond the free limit now shows
  a gentle upgrade prompt.

- **2026-06-08 — Home page now explains the app in general.** The landing page speaks to
  everyone who cares for a pet rather than leaning toward shops/breeders; account-specific
  details (pedigree, certificates, "proof of good care", lineage) now live on the shop page,
  with owner specifics on the owner page.

- **2026-06-08 — Chinese is now the default language.** New visitors see the app in
  简体中文 first; switch to English anytime with the language toggle.

- **2026-06-08 — Intake date when adding a pet.** You can now record when a pet entered your
  care (intake date / 入舍日期). Birth date and intake date are a pair — fill one or both,
  but at least one is required.

- **2026-06-08 — Required fields when adding a pet.** When creating a dog or cat (shop or
  owner), every field is now required except sire, dam, and general notes — including breed,
  color, sex, birth date, weight, and a profile photo. Validation runs on the form and again
  on the server.

- **2026-06-08 — Simpler passport handover.** Shops no longer enter the new owner's name or
  email when issuing a passport — the owner registers (name, email, password) only when they
  scan the QR code. Only one passport can be issued per pet; transferred pets move to an
  **Archived** tab in the shop's pet list (awaiting claim = Transferred, fully handed off =
  Archived).

- **2026-06-05 — China access: proxy domain support.** The app can now run behind a Hong
  Kong reverse proxy on a custom domain so it's reachable from mainland China without a VPN.
  Server Actions accept the proxy domain (`serverActions.allowedOrigins` in `next.config.ts`,
  default `pethealthos.online`, extendable via `PROXY_ALLOWED_ORIGINS`), and Vercel Blob images
  (pet photos, log media, attachments) are served through a same-origin proxy `/api/img` so they
  load through the reachable domain instead of the GFW-blocked blob host. Added `deploy/Caddyfile`.

- **2026-06-04 — Chinese product doc for early testers.** Added `docs/ProductDoc.md` (产品文档)
  — a non-sensitive Chinese pitch (problem, users, passport, features, model, high-level tech
  overview, roadmap, feedback asks) for sharing with technically-oriented early testers.
- **2026-06-04 — Form field validation everywhere.** Every form now validates input on the
  client (instant, localized, inline) and again on the server (the source of truth): emails
  must be well-formed, phone numbers auto-format to the region's standard as you type (China
  by default, `+` for international) and are checked with libphonenumber-js, weights must be
  0–200 kg, dates can't be in the future, required fields are enforced, and free-text is
  length-capped. Error messages are translated (en/zh).
- **2026-06-04 — Health watch only analyses when needed (AI cost cut).** The guardian now
  (1) skips any pet with no new log/weight in the last couple of days, and (2) only fires a
  signal when it's backed by data created *after* the last alert — so the same situation is
  never re-analysed and the AI runs only on genuinely new concerns. Verified: a repeat scan
  did 0 analyses and 0 AI calls.
- **2026-06-04 — Proactive health watch ("the guardian").** A daily scan now reads each
  pet's recent log, weight trend and severity signals and *pushes* an in-app alert when
  something is worth a look (serious recent entry, weight down ~10%+, or a cluster of
  concerns). The AI phrases a calm one-liner; rules do the detecting. Alerts go to the
  caretaker (owner if claimed, else shop) and are deduped so they don't nag.
- **2026-06-04 — Passport reads like a credential.** The public passport now opens with a
  certificate band: a ✓ Verified-shop badge (for reviewed shops), the issuer, issue date,
  a certificate number, and an integrity "record seal" that changes if any frozen entry is
  altered — making the passport feel like a verifiable document, not just a profile.
- **2026-06-04 — Photo logs only use AI when there's a note.** A photo on its own is now
  saved as a plain "Photo log" with no AI tags/observations (vision without context can
  mislead). When a note accompanies the photo, the note is treated as ground truth and the
  photo is used only as supporting context.
- **2026-06-03 — Passports transfer only once.** Once a new owner registers an account
  through a pet's passport, the shop can no longer issue another passport for that pet — the
  record now lives with the owner. Enforced in `createTransfer` and surfaced in the shop's
  Transfer tab.
- **2026-06-03 — Admin updates log + docs viewer.** Added this changelog and a read-only
  `/docs` viewer inside `/admin`, so the team can review updates and all project docs
  (CONTEXT, PRD, IdeaPool, test accounts, etc.) without leaving the app.
- **2026-06-03 — Health-guarantee passport.** Shops can now bake a warranty into a passport
  (type + window + terms + optional vet-check), frozen at issue. The passport shows a live
  credential block (Active · N days remaining / Expired), turning it into a dispute-reducing
  contract.
- **2026-06-03 — Photo logging + visual triage.** A log entry can include a photo; the AI
  (Gemini multimodal) reads it into the summary/tags/severity. Photos and short videos render
  inline in the timeline and on the passport. Lowers logging friction for owners and shops.
- **2026-06-03 — Phone (SMS-OTP) auth greyed out.** The phone sign-in/registration tab is
  temporarily disabled (no SMS provider wired yet); email + QR-claim are unaffected.
- **2026-06-03 — Alipay + WeChat Pay via Stripe.** All three pay buttons now route through
  Stripe (cards = subscription; wallets = one-time), so we can charge Chinese users
  cross-border from a HK setup.
- **2026-06-03 — AI for owners.** Owner accounts get the AI assistant + triage for their own
  pets (gated by `canAccessPet`), with owner-appropriate wording.
