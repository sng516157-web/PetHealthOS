# Updates log

A running, human-readable changelog of what shipped. **Newest first.** Each entry:
`YYYY-MM-DD — title — one-line summary of what changed and why it matters`.

This is surfaced in the `/admin` page so the team can see what's changed at a glance.
Agents: append a bullet here in the **same commit** as any user-facing change (see
`AGENTS.md`). Keep entries short; deeper rationale lives in `docs/CONTEXT.md`.

- **2026-07-01 — Workspace UX & speed fixes.** Dashboards and pet pages show content immediately (no scroll-to-reveal); language switching is more stable; shop home loads faster; `/me/pets` redirects to `/me`; owner pricing correctly lists per-pet AI only. Dev pg SSL deprecation warning silenced for Neon URLs.

- **2026-06-25 — Microchip ID after pet creation.** Shops and owners can add or edit a pet's microchip number from the pet profile header — useful when the chip isn't known at intake.

- **2026-06-25 — Landing & founding pricing.** Homepage now highlights **1 pet free** for owners; breeders see **$99 early lifetime** (25 spots) above the **$299** deal; health logs can't be dated in the future (reminders still can).

- **2026-06-25 — Mobile Safari fixes.** iPhone layouts no longer clip horizontally; form fields won't trigger page zoom on focus; bottom nav and modals respect the home-indicator safe area; chat panels size correctly when the browser chrome shows/hides.

- **2026-06-25 — Admin import workspace.** Pending data imports on `/admin` open a workspace to map CSV rows to pets, logs, and weight, and PDFs to document attachments — same plan format reserved for future AI automation.

- **2026-06-25 — Data import from competitors.** Shop and owner dashboards now have **Import data** — upload a CSV roster plus PDFs (competitor exports, vaccine cards, scanned notes). Processing is queued (up to 24h for messy files); `/admin` lists pending imports with file downloads and a **Mark complete** action. Landing page and `/shop` advertise switching from other tools.

- **2026-06-25 — Breeder workflow demo.** One ~2:00 silent 1080p screen recording of the real shop workflow (`public/demos/breeders/breeder-workflow.mp4`) — verify, log care, issue passport, buyer view — for marketing voiceover in post.

---

- **2026-06-17 — Homepage fix.** Fixed a server error on `/` caused by passing i18n functions into a client component.

- **2026-06-17 — Founding breeder signup → checkout.** Landing founding CTA routes to shop signup; after email verify the dashboard auto-starts Stripe checkout (KYC can wait). Monthly/yearly shop subs permanently forfeit the founding deal — shown greyed out on billing.

- **2026-06-17 — Founding breeder countdown & dashboard.** Shop home shows the founding lifetime deal with a live spots counter; when all spots are claimed the offer disappears everywhere (not just “sold out”).

- **2026-06-17 — Feedback page.** Contact us via `/feedback` instead of a public support email — each submission gets a reference ID and is emailed privately to the team.

- **2026-06-17 — AI on Groq.** Chat, triage, and log structuring now use Groq (`GROQ_API_KEY`) instead of Google Gemini.

- **2026-06-17 — Founding Breeder Lifetime.** Breeders can claim a limited $299 one-time deal for lifetime core passport access — on `/pricing`, homepage, and `/app/billing` after signup.

- **2026-06-17 — Homepage traction copy.** Proof strip now says we’re reaching 50+ testers worldwide.

- **2026-06-17 — Owner Plus pricing.** Owners get 1 pet free; **Owner Plus** is **$6.99/mo or $80/yr for up to 5 pets**. Per-pet slot purchases removed — upgrade on `/me/billing`.

- **2026-06-16 — Passport-first homepage.** `/` now leads with QR health passports for breeders
  and owners — dual CTAs, proof strip, founding offer, and interactive shop/owner dashboard previews.

- **2026-06-16 — Shop quota on transfer.** Issuing a passport frees the pet from shop roster quota
  and unlinks any paid extra slot, so breeders can add new pets after handover.

- **2026-06-16 — Workspace AI for shops & facilities.** `/app/ai` adds roster-wide assistant + ward triage across all pets in care; home promo cards, landing/pricing copy, and mini-dashboard preview updated.

- **2026-06-16 — Homepage dashboard frame.** Mini dashboard preview uses a full-width 16:9
  viewport so owner/shop/facility layouts aren’t squashed on the landing page.

- **2026-06-16 — Homepage mini dashboards.** The public `/` page now has clickable owner, shop,
  and facility dashboard previews (open pets, switch tabs) using the same UI components as the
  real app — no sign-in required.

- **2026-06-16 — Pet page tabs + food/activity logs.** Pet detail pages use major tabs
  (Quick Log, Food, Activity, Reminders, Weight, Documents, Check-in or Transfer) instead
  of a sidebar; weight shows a trend chart; documents filter by category; owners can
  edit/delete their health logs; AI triage cross-references all log types.

- **2026-06-16 — Password reset.** Forgot-password flow at `/forgot-password` and
  `/reset-password` — email sends a 6-digit code + HTML link (1-hour TTL); sign-in tab links
  to it; resets clear other owner sessions.

- **2026-06-16 — Email verification hardening.** Sign-up emails now include a 6-digit code
  plus an HTML button/link; `/verify-email` accepts the code; clearer spam/QQ/163 hints;
  `/admin` lists unverified sign-ups with one-click mark verified.

- **2026-06-16 — Admin entitlement grants.** `/admin` can comp an owner extra pet slot,
  facility care slot, or SHOP plan by account email; comped slots survive Stripe billing sync.

- **2026-06-16 — Owner dashboard mobile clip (fix).** `/me` no longer cuts off cards on
  iPhone — content stays within the screen width and long Chinese labels wrap instead of
  pushing the layout sideways.

- **2026-06-16 — 50% price cut.** All plans and add-ons are half the previous USD price
  (e.g. shop plan $14.99/mo or $149/yr; extra slots $2.49/mo; owner extra pets $1.49/mo).

- **2026-06-16 — Mobile dashboard layout.** Shop, facility, and owner home dashboards no longer
  overflow on phones — bottom nav, headers, and action buttons stay reachable on small screens.

- **2026-06-09 — Passport-first marketing pages.** Homepage and owner, shop, and facility
  landing pages now lead with the digital health passport — what it is, who issues it, and
  how handover works — instead of ecosystem/AI-first messaging. Sample passport mock matches
  the real issued passport layout.

- **2026-06-09 — Close or archive a pet's record.** Owners can permanently remove a pet or
  archive it to Memorial after passing (with optional condolence credit after admin review).
  Shops can delete unclaimed pets before a passport is issued.

- **2026-06-09 — Canonical URLs for Google Search Console.** Marketing pages now declare
  absolute canonical links in the HTML head (not streamed), and www redirects to the main
  domain so Google picks one preferred URL.

- **2026-06-09 — Edit documents, weights, and reminders.** You can now change or remove
  uploaded files, weight entries, and scheduled reminders after they're created.

- **2026-06-09 — Add or change pet profile photo.** Owners can tap the avatar on a pet's page
  to upload a photo anytime — not just when creating the pet.

- **2026-06-09 — Cleaner workspace backgrounds.** Dashboard and pet pages no longer show the
  drifting color gradient; marketing pages use a softer green wash instead of peach/blue.

- **2026-06-09 — Fix: pet profile page crash.** Opening a pet from the owner dashboard no longer
  throws a server error.

- **2026-06-09 — Aurora motion on all dashboard pages.** Pet profiles, chat, triage, account,
  and billing now use the same animated layout as the home dashboard — not just the landing view.

- **2026-06-09 — Livelier dashboards.** Owner, shop, and facility home screens now use full-width
  layouts (up to 1600px) with Aurora motion, stat cards, and bento grids — no more narrow column
  on desktop.

- **2026-06-15 — Terms, Privacy & signup consent.** New legal pages; you must accept Terms
  and Privacy Policy before creating an account or claiming a passport.

- **2026-06-15 — Livelier landing pages.** Soft floating backgrounds, scroll-in sections, and
  gentle hero animations on the homepage and all public marketing pages (owner, shop, facility,
  pricing, disclaimer, login).

- **2026-06-14 — English by default on the public site.** New visitors see English; Chinese
  is still available via the language toggle. Helps Google show English snippets after re-crawl.

- **2026-06-14 — English pages for search engines.** Google and other crawlers now see English
  page content (matching your English meta tags); human visitors in China are unchanged.

- **2026-06-09 — SEO & analytics foundation.** Sitemap, search-friendly page titles, and
  Google Analytics events (sign-up, verification, checkout) when you add a GA4 measurement ID.

- **2026-06-09 — Verify your email.** New accounts must click a link sent to their inbox
  before using the app; powered by Resend for international users.

- **2026-06-09 — Pricing in USD.** All plans and Stripe checkout now use US dollars
  ($29.99/mo or $299/yr shop plan; $4.99/mo extra slots; $2.99/mo owner extra pets).

- **2026-06-09 — Language from localStorage + geo default.** Your language choice is saved
  in the browser; first-time visitors in China (incl. HK/Macao) see Chinese, others English.

- **2026-06-09 — Delete your account.** Account settings now let owners and shops permanently
  delete their account; active Stripe subscriptions are cancelled and personal data is removed.

- **2026-06-09 — AI can read your pet's documents.** Chat and triage now include vaccine
  certs, lab results, and other uploaded files (images and PDFs) in the AI's context.

- **2026-06-09 — Log times match your local timezone.** The app detects your browser
  timezone automatically so health log dates and times display correctly wherever you are.

- **2026-06-11 — Referral programme removed.** Shop yearly price is now a flat ¥4888 with no
  referral links or discounts; the idea is parked for a future version.

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
