# Pet Health OS — Product & Strategy Spec

_Status: living document · consolidates ideation as of 2026-05-29_
_Companion docs: `competitive-landscape.md`, `wtp-interview-script(.zh).md`_

---

## 1. One-liner & positioning

A health **system of record** for pet **breeders** (catteries/kennels) that turns
everyday health logging into a portable, AI-powered **health passport** which
follows the animal to its new owner — building trust, commanding higher prices,
and turning every sale into a new long-term user.

**Positioning (decided):** lead as **"the trust layer that makes a pet's health
credible to its next owner — the antidote to 星期猫/星期狗,"** _not_ as "breeder
management software" (that's the incumbent 宠舍管家's turf). Breeder tooling is
the means; the **buyer-trust flywheel + AI triage** is the moat. We keep breeder
ops solid enough to be credible (the table-stakes floor in §5) but deliberately
don't try to out-feature incumbents on kennel operations. See
`competitive-landscape.md` for the full map and the macro tailwind (courts,
criminal cases, and industry bodies drafting standards because there is **no
national, trustworthy health/vaccine record** today).

## 2. Wedge & market

- **First customer:** breeders (猫舍/犬舍) in **China**.
- **Why breeders (not general pet shops):** they sell high-value animals
  (5,000–50,000+ RMB), to buyers who *demand* health & lineage proof, and they
  live and die by reputation/repeat business. The passport is core to their
  sale, not a nice-to-have.
- **Expansion:** general pet shops, shelters; other geographies later.

## 3. The strategic core — the passport flywheel

The portable health passport is simultaneously three things:

1. **Differentiation / value** — lets a breeder sell at higher trust & price.
2. **Acquisition loop** — every animal sold delivers the new owner a record full
   of value; in China the passport can be shared natively over WeChat, so the
   new owner becomes a user with near-zero friction and near-zero CAC. Buyers of
   pedigree animals are premium, engaged owners.
3. **Retention moat** — once a breeder's history and issued passports live in the
   system, leaving means abandoning their records and their buyers' passports.

> Pitch hierarchy (you can't lead with four things): **passport sells it →
> daily logging utility retains it → triage/health deepens trust →
> reputation is the umbrella outcome.**

### 3a. Passport credibility model (decided — Cluster A)

The flywheel only works if a skeptical buyer *believes* the record. Since the
breeder authors every entry, belief must be engineered:

- **Logged-over-time (MVP signal):** the passport surfaces *when* each entry was
  recorded and a summary ("N entries logged over X months"). A record built
  steadily looks different from one entered the night before sale.
- **Immutable-after-issue (MVP):** issuing a passport **freezes** the
  pre-transfer history (`LogEntry.lockedAt`) — it can't be backdated or edited
  afterward. Surfaced to buyers as "tamper-evident / frozen at handover."
- **Optional antibody/lab results:** attach antibody titers (抗体检测) — the proof
  buyers/industry trust more than fakeable vaccine claims. **Never forced.**
- **Light vet involvement:** breeders attach vet-signed docs (Documents feature).
  Full vet-verified badges = deferred.
- **Opt-in "prove-you're-legit" badge:** trust framed as a *competitive weapon
  good breeders show off*, not a rating imposed on them (resolves the
  payer-vs-buyer tension).
- **Deferred:** breeder reputation layer, registry/DNA verification, third-party
  data feeds (design-for, build-later).

## 4. Personas

- **Breeder (primary buyer/user):** manages a handful of breeding adults +
  periodic litters; needs fast logging, schedules, and a credible sale artifact.
- **New owner (consumer / growth):** receives the passport on purchase; engaged,
  often affluent; long-term user we acquire for free.
- **Veterinarian (stakeholder, parked):** today only via owner-shared read-only
  passport links; dedicated vet accounts deferred.

## 5. MVP scope

**Table-stakes ops floor (decided — Cluster D):** roster, health log, lineage,
reminders, documents, AI. Deliberately *skipping* breeding-plan (配种/预产期),
accounting, and Mini-Program shopfront — that's incumbent turf we won't chase.

**In:**
- Health Log with **hybrid AI structuring** (freeform note → type, severity,
  title, tags).
- **AI assistant** — **per-pet data stays isolated**, but the assistant now also
  draws on **general breeding/health knowledge** (breed care, neonate/litter
  care, weaning, nutrition, vaccination norms). This is the **primary retention
  hook** (Cluster C). Isolation = no cross-animal private data; general knowledge
  is shared.
- **Triage**: proactive flags for serious recent entries + on-demand vet-prep
  report (urgency, concerns, recommendation, questions for the vet).
- **Reminders** (vaccines, meds, deworming, appointments) — drive logging cadence.
- **Per-pet weight tracking** (Cluster C) — individual growth/neonate weights
  with a trend; the daily-use ritual. _Litter grouping deferred._
- **Health passport + transfer** with the credibility model in §3a (see §6).
- **Basic lineage**: dam/sire parent links (not full litter management yet).
- **Optional media attachments** on records/passport (vaccine certs, **antibody
  tests**, pedigree, lab results) — never forced.

**Deferred:**
- Full litter management incl. **litter weight grouping** (queen → litter → split
  individuals on sale). _Phase 2._
- Structured genetic/health-testing schemas (PKD, HCM, hip scores, FeLV/FIV,
  brucellosis). _Phase 2._
- Registry integration (CKU/TICA/CFA/CAA) beyond optional doc attachments.
- Consumer monetization (insurance, telehealth, commerce, Plus). _Parked._
- Multi-staff roles, vet accounts, passport branding. _Later._

## 6. Transfer & claim mechanics (load-bearing — decided)

- **Continuous timeline:** the pet keeps **one lifelong health history**; the
  new owner continues the same timeline rather than starting fresh.
- **Homecoming milestone:** the transfer inserts a special marker/celebration
  event ("🎉 Went home with <owner> on <date>") to make the moment feel special.
- **Claim flow (Cluster B):** the buyer **views the passport freely**, then a
  one-tap **"claim & keep it"** creates their free account and lets them continue
  the record — **but only if the breeder enabled claiming** (`Transfer.claimable`).
  Otherwise the passport is **view-only/locked**.
- **Ownership model (Cluster B):** on claim, **ownership moves to the buyer**; the
  breeder keeps a **read-only, still-connected** copy by default.
- **Consent-based privacy (configurable):**
  - **Default:** breeder retains a **read-only copy**; new owner gets their own
    continuable record.
  - **Opt-in shared record:** if both agree, the breeder stays **read-only but
    connected/visible** (not co-author).
- **Immutability:** issuing the passport freezes pre-transfer entries (§3a).
- **Excluded from passport:** internal AI conversations.

## 7. Data model

One database, **strict per-pet logical scoping** (the AI only ever sees one
pet's context). Entities: `Organization → Pet → { LogEntry, Reminder,
WeightEntry, Conversation/Message, TriageReport, Transfer, Attachment }`.

Key fields supporting today's decisions:
- `Pet.sireId / damId` — basic lineage; `Pet.weights[]` — `WeightEntry`.
- `LogEntry.lockedAt` — freeze pre-transfer history at passport issue (§3a).
- `Attachment.kind` includes `ANTIBODY_TEST` (optional trust signal).
- `Transfer.claimable` (breeder gate), `firstViewedAt`, `claimedAt`,
  `claimedByName`, `visibility (READONLY_COPY | SHARED)`.

**Architect-for-later (don't build yet — Cluster D):** partnership data feeds
(vet-clinic SaaS for verified records, CKU/宠爱王国 pedigree/DNA, insurers). Keep
a clean "source/verified" seam in mind so these slot in post-PMF.

## 8. Platform & tech

- **Now:** responsive **web** for the shop/breeder console (managing many animals
  is a big-screen job). Current prototype: Next.js 16 + React 19 + Tailwind v4,
  Prisma 7 + SQLite, Vercel AI SDK (with rule-based fallback).
- **Consumer surface (later, China):** most likely a **WeChat Mini Program**
  (built with Taro/uni-app, sharing a backend), enabling one-tap passport claim
  from a WeChat chat. Decision deferred.
- **Auth (decided — Cluster B):** plan for **WeChat login first-class _and_
  phone + SMS OTP**, so we're not boxed into China only. (Prototype has no auth
  yet; the claim flow stubs identity by name.)
- **Payments:** WeChat Pay + Alipay (when consumer/payments land).
- **Compliance (China):** ICP filing/备案, PIPL data rules; AI framed strictly as
  **record-keeping + triage-prep, not diagnosis**.
- **Deploy:** swap SQLite → Postgres (e.g. Neon) for production.

## 9. Pricing & monetization

**Principles**
- **Never meter logging** — meter active pets / seats / locations instead.
- **Tier moat = capabilities _and_ quota combined.** Only business accounts can
  *issue/transfer* passports, add seats, and (later) brand them; consumers can
  only *hold* passports.
- **Consumers free** to protect the flywheel; monetize on expansion later.

**Shops (flat tiers — exact numbers TBD via discovery)**
- Anchor proposed by founder: **2,000 RMB/mo for up to 50 pets, +30 RMB/mo per
  extra pet**. Per-pet overage is well-aligned (trivial vs. animal value).
- Open question: add a **cheap entry tier** (~399–599 RMB/mo) to maximize breeder
  breadth and fuel the flywheel, vs. holding premium. _Validate willingness-to-pay
  first._

**Consumers (parked)** — free core; potential levers, roughly in China-fit order:
pet **insurance referrals**, **telehealth** consults (triage → paid consult),
**supplies/pharmacy commerce** (reminders → reorders), **Plus** subscription,
DNA testing. Driven by the health log as purchase-intent data. Build only
post-PMF.

## 10. Roadmap

- **Phase 0 (done):** working web prototype — dashboard, hybrid log, per-pet AI,
  triage, reminders, passport transfer.
- **Phase 1 (focused breeder MVP — _built in prototype_):** reframed to breeders
  (Whisker Lane Cattery & Kennel demo); basic dam/sire lineage with parent
  pickers + display on profile & passport; document uploads (vaccine cert,
  **antibody test**, pedigree, lab result) shown on the passport; consent-based
  transfer (read-only copy vs shared) with a continuous lifelong timeline +
  "🏡 Homecoming day" milestone and a welcome hero. **Trust model:** logged-over-
  time strip, immutable-after-issue (frozen history), tamper-evident framing.
  **Claim flow:** breeder-gated `claimable` toggle + buyer "claim & keep it" CTA.
  **Per-pet weight tracking** with trend. **AI broadened** to general breeding
  knowledge while keeping per-pet data isolation. _Remaining: willingness-to-pay
  discovery with real breeders._
- **Phase 2:** litter management, health-testing schemas, multi-staff/roles,
  passport branding.
- **Phase 3:** consumer surface (WeChat Mini Program), payments, consumer
  monetization (insurance/telehealth/commerce), vet stakeholder.

## 11. Decisions log & open questions

**Resolved this session (Clusters A–D):**
- **Credibility model** → logged-over-time + immutable-after-issue + optional
  antibody/lab docs + opt-in legit badge (§3a).
- **Claim/flywheel** → breeder-gated claim, ownership transfers to buyer, breeder
  read-only; **auth = WeChat + phone OTP** (§6, §8).
- **Onboarding/retention** → one-at-a-time onboarding; **AI is the retention
  hook** (broadened scope); realistic event-based + weight-burst cadence;
  **per-pet weight tracking** added; no litter grouping yet (§5).
- **Competition/positioning** → lead with the trust layer, not breeder ops; keep
  both cats + dogs; partnerships architect-for-later (§1, `competitive-landscape.md`).
- **GTM (first 10)** → founder's own network (warm, design-partner-grade), then
  referral into WeChat breeder communities; apply Mom Test rigor (politeness bias).

**Still open (TBD):**
- **Exact pricing numbers** — pending willingness-to-pay discovery (Cluster E).
- **Consumer surface specifics** (Mini Program build details).
- **Vet stakeholder** model (accounts vs link-only) — beyond light doc attach.
- **Reputation layer** scope/timing (designed-for, deferred).

## 12. Key risks

- Pricing gates out the long tail of breeders → starves the flywheel (mitigate
  with an entry tier).
- AI/triage liability & claims (mitigate: framing, disclaimers, no diagnosis).
- China platform/compliance overhead (ICP, PIPL, Mini Program review).
- Building monetization/commerce before PMF (avoid — stay focused on the loop).
