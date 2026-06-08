# Updates log

A running, human-readable changelog of what shipped. **Newest first.** Each entry:
`YYYY-MM-DD — title — one-line summary of what changed and why it matters`.

This is surfaced in the `/admin` page so the team can see what's changed at a glance.
Agents: append a bullet here in the **same commit** as any user-facing change (see
`AGENTS.md`). Keep entries short; deeper rationale lives in `docs/CONTEXT.md`.

---

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
