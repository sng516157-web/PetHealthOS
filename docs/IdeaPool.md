# IdeaPool — parked feature ideas

A backlog of feature ideas from brainstorming, kept so we don't lose them. Newest
clusters on top. When an idea graduates to "building", note it and move the detail
into `docs/CONTEXT.md` (decision log) once shipped.

> **Status legend:** 🟢 building now · ⚪ parked · ✅ shipped

Guiding lens: a feature earns its place if it is **proactive** (comes to the user),
**tied to money/risk** (using it avoids a real loss), or **habit-forming** (touched
regularly without a decision). Reactive "nice-to-have" tools rank below these.

---

## 2026-06-03 brainstorm — "make AI a must-have, refine the passport"

### Built (2026-06-03, local — not yet deployed)
- ✅ **B1 — Health-guarantee / warranty passport.** Guarantee type + window + terms +
  optional vet-check, frozen at issue; passport shows a live credential block
  (active/expired). See CONTEXT decision log. *Fast-follow:* attach vaccination/deworming
  proof to the guarantee, and a verified "issued by" seal (overlaps B2).
- ✅ **A2 — Photo logging + visual triage.** Photo attached to a log entry → Gemini
  multimodal reads it into summary/tags/severity. See CONTEXT decision log. *Fast-follow:*
  **video analysis** (currently videos are stored & shown but not AI-analysed); multi-photo
  per entry.

### Parked — AI must-have ideas
- ⚪ **A1 — Proactive health watch ("the guardian").** AI continuously reads log +
  weight + reminders and *pushes* alerts ("water intake dropped, weight down 8% in 2
  weeks — worth watching") via the existing Notification system. Flips AI from a tool
  you open into a guardian that watches a pet (or a whole litter). Biggest retention +
  emotional hook. Needs: a scheduled scan (cron) + thresholds/anomaly prompts + dedupe.
- ⚪ **A3 — Auto-built care schedules.** From breed + age + history, AI generates the
  vaccination / deworming / flea-tick / grooming schedule with real due dates, then
  nudges. Owners get a recurring habit loop; shops get litter-wide scheduling. Builds on
  the existing Reminder model.

### Parked — passport refinements
- ⚪ **B2 — Make the passport look like a credential, not a profile.** Public
  `/passport` page should read like a verifiable certificate: "Issued by [✓ Verified
  Cattery]", issue date, content hash/seal, microchip #, lineage. Trust is the product.
- ⚪ **B3 — Pre-sale passport as a WeChat sales tool.** Let shops share a passport
  *before* the sale to prospective buyers (logged health history closes sales, justifies
  a premium). Today the passport only exists at transfer — pull it earlier as a marketing
  asset. (Consider a "preview/sales" passport state distinct from a claimed transfer.)
- ⚪ **B4 — Lineage / pedigree on the passport.** Surface a mini pedigree from the
  existing `sire`/`dam` links; with permission, link to parents' health records. Premium
  signal for serious buyers.
- ⚪ **B5 — Litter/batch issuance + light reputation layer.** Issue a whole litter's
  passports at once; each buyer claims theirs. Over time a shop accrues "X healthy
  passports issued, Y% claimed" — a cheap reputation moat (full reputation was parked
  earlier; this is the light version).

### Cross-cutting notes
- The spine that compounds: **B1 (guarantee) makes shops need the passport** (money /
  disputes) and **A2 (photo logging) makes owners keep filling records** (habit) →
  better records → more credible passports → more shop value.
- China-market reminders: WeChat login + Aliyun/Tencent SMS + native WeChat/Alipay
  merchant are all gated on a mainland entity (see CONTEXT). Don't design parked ideas to
  depend on those until the entity exists.
