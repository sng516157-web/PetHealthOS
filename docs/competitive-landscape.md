# Competitive Landscape — China (Pet Health OS)

_Compiled 2026-05-29 from market research. Treat specifics as directional; verify
the starred ⚠️ inferences directly with users/competitor trials._

## TL;DR

- **The pain is validated at the highest level.** "星期猫/星期狗" (animals that
  sicken/die ~a week after sale) is now in courts (退一赔三 / refund + 3× damages),
  has produced **criminal convictions** (a Shanghai ring got up to 14 years, 174
  victims), and the **China Animal Husbandry Association's pet division is
  drafting transaction standards** — explicitly noting **vaccines are easily
  faked and there is NO national, unified, trustworthy health/vaccine record**.
  This is a massive, official tailwind for a credible health passport.
- **There is a close direct competitor: 宠舍管家** (breeder management + AI +
  Mini Program). We should **not** try to out-build them on breeder ops.
- **Our defensible wedge = the trust-and-transfer flywheel**: a lifelong,
  *credible* (logged-over-time, immutable) health record that transfers to the
  buyer and turns them into a user. We're not "breeder software" — we're **the
  trust layer between breeder and buyer**.

---

## 1. Direct competitor — breeder-focused

### 宠舍管家 ("Cattery Steward") ⚠️ closest competitor
- **Who:** SaaS aimed squarely at 猫舍/犬舍 breeders.
- **Has:** breeding plan mgmt (配种, 预产期 tracking), pedigree tree (血统树),
  health/vaccine records, income/expense + profit analytics, team collaboration
  with multi-stage task assignment, **generates a standalone Mini Program**,
  an **"AI 管家"** (with weight/receipt tool renderers), **litter weight-trend
  charts aggregated by day**, and a "想要同款" (want-the-same) buyer-facing hook.
- **Strong where we're weak:** breeding operations + litter/neonate tracking +
  already shipping AI and a Mini Program shopfront.
- **Likely gap (verify ⚠️):** appears focused on *breeder operations*. Unclear it
  has our **buyer-side lifelong transfer + claim + continuous-timeline flywheel**
  or an explicit credibility model (logged-over-time / immutable-after-issue).
- **Implication:** they own "breeder ops." We win on **trust + the buyer flywheel
  + health/triage AI**, not on out-feature-ing their kennel management.

---

## 2. Consumer pet-health-record / passport apps

| Player | What it is | Note for us |
| --- | --- | --- |
| **AegisPet** | **QR-tag digital pet passport**, scan via WeChat/browser (no app), **encrypted unique ID, anti-tamper (防伪防篡改)**, medical records, lost-pet recovery; **SaaS backend to batch-generate tags** for institutions; API | Closest to our *passport* idea. Their anti-tamper framing validates our "immutable after issue." But it's identity/lost-pet + generic medical, sold via physical tags — **not** breeder-sale flywheel or AI triage. |
| **VetPassport** | Consumer app: vaccine/treatment records, reminders, multi-pet, AI quick-setup (photo→autofill), measurements | Direct analog to our *consumer* side. ¥38/mo, ¥168/yr. iOS-only, international. Shows consumers will pay ~¥168/yr. |
| **宠物疫苗管家** | Vaccine reminders, health scoring, multi-pet; Android/iOS/HarmonyOS | Single-purpose, free-ish. Low threat, but owns "vaccine reminders." |

## 3. Adjacent — vet/clinic & store SaaS (potential partners, not rivals)

- **骁宠 (Pet360 / 艾迪加):** clinic SaaS with an owner-facing mini-program
  (宠宝宝) pushing e-records/health reports. **Owns clinic-generated data** →
  potential source of *vet-verified* records.
- **小弗, 它它医生:** clinic management suites (records, vaccines, inventory).
- **宠老板 (60k+ stores), 友吱宠物, 银豹/POSPAL, 宠想来 (Pet Saas PRO):** pet-store
  POS/management with pet 档案 tied to membership; store-centric, not breeder or
  buyer-trust focused.
- **Takeaway:** these own the *clinic/store* relationship; they're plausible
  **integration partners** (verified vaccine/exam data) rather than head-on
  competitors.

## 4. Registry / pedigree authority

- **CKU (China Kennel Union)** via the **宠爱王国 APP**: FCI-recognized **dog**
  pedigree registry. Does litter registration (配种证明, 新生犬登记卡, 血统证书),
  **owner-change registration (犬主变更)**, and a **DNA gene-registration 5-yr plan**
  with **10-item genetic disease screening** and a "gold" DNA pedigree cert for
  traceability/health guarantee. Breeder memberships ¥1,120–4,240/yr; also a
  **champion-dog biological-asset insurance** program. **No cat equivalent.**
- **Implication:** CKU is a parallel *trust mechanism at the genetic/lineage
  level*, not a daily health-log/AI product — a likely **partner/integration**
  (pull pedigree/DNA cert as a trust badge) and proof that breeders already pay
  four figures/yr for credibility. The cat side is wide open.

---

## 5. The whitespace (where we can win)

No one cleanly owns: **a credible, lifelong, AI-assisted health record that (a)
the breeder maintains day-to-day, (b) is believable to a skeptical buyer
(logged-over-time + immutable), and (c) transfers to the buyer as their own
record — converting them into a user.** Closest analogs each miss a piece:
- 宠舍管家 → breeder ops, but (likely) not the buyer-trust flywheel.
- AegisPet → tamper-proof passport, but no breeder workflow / AI / sale loop.
- CKU → lineage/DNA trust, but not daily health or buyer hand-off UX.
- Clinic SaaS → owns vet data, but clinic-centric, not breeder/buyer.

## 6. Positioning recommendation

**Stop framing as "breeder management software" (宠舍管家's turf). Frame as the
trust layer that makes a pet's health credible to its next owner — the antidote
to 星期猫/星期狗.** Breeder tooling is the means; the buyer-trust flywheel + AI
triage is the moat and the macro-aligned story.

Concrete tie-ins from the research:
- **Antibody test results (抗体检测) beat vaccine claims** as proof (industry
  bodies say so) → let breeders attach antibody/lab results to the passport (fits
  our light-vet/Documents approach).
- **Immutable-after-issue** maps directly to AegisPet's anti-tamper positioning —
  lean into it as a buyer-facing promise.
- **Cat side is underserved** (CKU is dogs-only) — a possible focal point.

## 7. Partnership opportunities

- **Vet clinic SaaS** (骁宠 etc.) → verified vaccine/exam data feed.
- **CKU / 宠爱王国** → pedigree/DNA cert as an embedded trust badge (dogs).
- **Insurance** (CKU already does champion-dog insurance) → ties to the parked
  consumer insurance-referral monetization; a clean health passport is exactly
  what underwriters want.

## 8. Threats / watch-outs

- **宠舍管家 adding a transfer/passport flywheel** would erode our wedge — move
  with intent on the buyer-trust loop.
- **An official national standard / platform** (associations are drafting one)
  could commoditize basic records — be the *best UX + AI + trust layer* on top,
  and consider aligning to the emerging 健康档案共享 standard early.
- **Incumbent clinic/store SaaS** bundling breeder/passport features.

## Open verifications (do these)

- Trial 宠舍管家: does it transfer a lifelong record to the *buyer* and convert
  them to a user? Does it surface credibility (logged-over-time / immutable)?
- Confirm whether breeders in your network already use 宠舍管家, CKU, or nothing.
- Gauge buyer trust in a digital passport vs CKU paper/DNA certs.
