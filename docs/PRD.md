# Pet Health OS — Product & Strategy Spec

_Status: living document · consolidates ideation as of 2026-05-29_

---

## 1. One-liner

A health **system of record** for pet **breeders** (catteries/kennels) that turns
everyday health logging into a portable, AI-powered **health passport** which
follows the animal to its new owner — building trust, commanding higher prices,
and turning every sale into a new long-term user.

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

## 4. Personas

- **Breeder (primary buyer/user):** manages a handful of breeding adults +
  periodic litters; needs fast logging, schedules, and a credible sale artifact.
- **New owner (consumer / growth):** receives the passport on purchase; engaged,
  often affluent; long-term user we acquire for free.
- **Veterinarian (stakeholder, parked):** today only via owner-shared read-only
  passport links; dedicated vet accounts deferred.

## 5. MVP scope

**In:**
- Health Log with **hybrid AI structuring** (freeform note → type, severity,
  title, tags).
- **Per-pet AI assistant**, grounded only in that pet's log.
- **Triage**: proactive flags for serious recent entries + on-demand vet-prep
  report (urgency, concerns, recommendation, questions for the vet).
- **Reminders** (vaccines, meds, deworming, appointments).
- **Health passport + transfer** (see §6).
- **Basic lineage**: dam/sire parent links (not full litter management yet).
- **Optional media attachments** on records/passport (vaccine certs, pedigree,
  lab results) — never forced.

**Deferred:**
- Full litter management (queen → litter → split individuals on sale). _Phase 2._
- Structured genetic/health-testing schemas (PKD, HCM, hip scores, FeLV/FIV,
  brucellosis). _Phase 2._
- Registry integration (CKU/TICA/CFA/CAA) beyond optional doc attachments.
- Consumer monetization (insurance, telehealth, commerce, Plus). _Parked._
- Multi-staff roles, vet accounts, passport branding. _Later._

## 6. Transfer mechanics (load-bearing — decided)

- **Continuous timeline:** the pet keeps **one lifelong health history**; the
  new owner continues the same timeline rather than starting fresh.
- **Homecoming milestone:** the transfer inserts a special marker/celebration
  event ("🎉 Went home with <owner> on <date>") to make the moment feel special.
- **Consent-based privacy (configurable):**
  - **Default:** breeder retains a **read-only copy**; new owner gets their own
    continuable record.
  - **Opt-in shared record:** if breeder and new owner agree, they can keep a
    shared, jointly-visible record.
- **Excluded from passport:** internal AI conversations.

## 7. Data model

One database, **strict per-pet logical scoping** (the AI only ever sees one
pet's context). Current entities: `Organization → Pet → { LogEntry, Reminder,
Conversation/Message, TriageReport, Transfer }`. MVP additions: `Pet.sireId /
damId` (basic lineage), media attachments on `LogEntry`/passport, and a transfer
privacy/visibility setting + homecoming milestone entry.

## 8. Platform & tech

- **Now:** responsive **web** for the shop/breeder console (managing many animals
  is a big-screen job). Current prototype: Next.js 16 + React 19 + Tailwind v4,
  Prisma 7 + SQLite, Vercel AI SDK (with rule-based fallback).
- **Consumer surface (later, China):** most likely a **WeChat Mini Program**
  (built with Taro/uni-app, sharing a backend), enabling one-tap passport claim
  from a WeChat chat. Decision deferred.
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
  pedigree, lab result) shown on the passport; consent-based transfer
  (read-only copy vs shared) with a continuous lifelong timeline + "🏡 Homecoming
  day" milestone and a welcome hero on the passport. _Remaining: willingness-to-pay
  discovery with real breeders._
- **Phase 2:** litter management, health-testing schemas, multi-staff/roles,
  passport branding.
- **Phase 3:** consumer surface (WeChat Mini Program), payments, consumer
  monetization (insurance/telehealth/commerce), vet stakeholder.

## 11. Open questions (still TBD)

- **Exact pricing numbers** — pending willingness-to-pay discovery with breeders.
- **Competitive landscape in China** — vet/clinic SaaS, breeder tools, pet
  super-apps (e.g. Boqii/波奇) — who we replace or sit beside.
- **Go-to-market:** how to land the first 10 breeders (network, distributor,
  associations, WeChat groups).
- **Consumer surface specifics** (Mini Program vs other).
- **Vet stakeholder** model (accounts vs link-only).

## 12. Key risks

- Pricing gates out the long tail of breeders → starves the flywheel (mitigate
  with an entry tier).
- AI/triage liability & claims (mitigate: framing, disclaimers, no diagnosis).
- China platform/compliance overhead (ICP, PIPL, Mini Program review).
- Building monetization/commerce before PMF (avoid — stay focused on the loop).
