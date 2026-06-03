# Updates log

A running, human-readable changelog of what shipped. **Newest first.** Each entry:
`YYYY-MM-DD — title — one-line summary of what changed and why it matters`.

This is surfaced in the `/admin` page so the team can see what's changed at a glance.
Agents: append a bullet here in the **same commit** as any user-facing change (see
`AGENTS.md`). Keep entries short; deeper rationale lives in `docs/CONTEXT.md`.

---

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
