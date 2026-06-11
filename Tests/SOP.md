# Standard Operating Procedure — testing changes

Every agent (and human) **must follow this SOP** when changing PawSure code. Skipping
steps is how billing entitlements, auth sessions, and passport flows silently break.

---

## Phase 0 — Classify the change

1. Read `docs/CONTEXT.md` if you have not this session.
2. List **subsystems touched** (auth, billing, facility, UI, etc.).
3. Open [change-impact.md](./change-impact.md) and note the **minimum test docs** to run.
4. If the change touches **billing** (`src/lib/billing.ts`, slots, webhooks, checkout):
   read `docs/BILLING.md` **before writing code**.

---

## Phase 1 — Pre-flight (local environment)

| Step | Command / action | Pass criteria |
|------|------------------|---------------|
| Env | `vercel env pull` or copy `.env.example` → `.env.local` | `DATABASE_URL`, `AUTH_SECRET` set |
| DB schema | `npm run db:migrate` | Migrations apply without error |
| Demo data (manual tests) | `npx tsx prisma/seed-demo.ts` | See [accounts.md](./accounts.md) |
| Dev server | `npm run dev` | App loads at `http://localhost:3000` |

**Stripe:** For payment tests use **test mode** keys locally unless explicitly testing live.
Set `APP_PUBLIC_URL=http://localhost:3000` locally.

**China/proxy:** Only required when testing `pethealthos.online`, `/api/img`, or
`serverActions` from the proxy domain — see [11-infrastructure-china-access.md](./11-infrastructure-china-access.md).

---

## Phase 2 — Automated gates (always)

Run **every time** before reporting done:

```bash
npm run lint
npx next build
```

| Gate | Pass criteria | On failure |
|------|---------------|------------|
| ESLint | Exit 0 | Fix reported issues in changed files |
| TypeScript (via build) | Exit 0 | Fix types; if i18n error, sync `en.ts` ↔ `zh.ts` shape |
| Prisma (production build script) | `prisma migrate deploy` succeeds | Fix schema/migrations |

Optional but recommended after schema changes:

```bash
npm run db:studio
```

Visually confirm affected tables/rows match expectations.

---

## Phase 3 — Manual subsystem tests

1. Run every checklist marked **Required** in [change-impact.md](./change-impact.md).
2. Work through checkboxes in each linked subsystem doc.
3. Use demo accounts from [accounts.md](./accounts.md) unless the scenario needs a fresh signup.
4. For UI changes, spot-check **`/brand`** plus **one real page** in the affected workspace.

### Evidence to collect

Record enough detail that another person can reproduce your result:

- **What** you tested (account, URL, action)
- **Expected** vs **actual**
- **Environment** (local / staging / production)
- For billing: Stripe Dashboard event ID or subscription ID; DB row state (`OrgSlot.status`, `org.plan`)
- For bugs fixed: note the **before** behaviour if known

Do **not** paste secrets, full card numbers, or webhook signing secrets in commits or chat.

---

## Phase 4 — Regression smoke (any non-trivial change)

After subsystem tests, run this **5-minute smoke** unless the change is docs-only:

| # | Smoke test | Pass |
|---|------------|------|
| 1 | `/` loads; locale toggle works | ☐ |
| 2 | Sign in as **owner** → `/me` loads | ☐ |
| 3 | Sign in as **verified shop** → `/app` loads | ☐ |
| 4 | Sign in as **facility** → dashboard shows care list | ☐ |
| 5 | Open any pet → Health Log tab renders | ☐ |

---

## Phase 5 — Pre-deploy (when user asks to ship)

Only when explicitly asked to commit/push/deploy:

1. Update `docs/CONTEXT.md` decision log (+ `docs/UPDATES.md` if user-visible).
2. If behaviour rules changed, update `AGENTS.md` and any affected `Tests/` checklist.
3. Re-run Phase 2 automated gates.
4. Re-run **Required** manual tests on the **target environment** after deploy.
5. For billing deploys: confirm live webhook endpoint has all six events (`docs/LIVE_STRIPE.md`).

Deploy command (when requested): `vercel --prod --yes` after push to `main`.

---

## Phase 6 — Sign-off template

Copy into your completion message:

```
## Verification
- Subsystems: [list]
- Automated: lint ✅/❌, build ✅/❌
- Manual: [docs run, e.g. 07-billing, 03-shop]
- Environment: local / production
- Not tested: [anything skipped + why]
```

---

## When to add or update Tests/ docs

Update the relevant subsystem file and [change-impact.md](./change-impact.md) when:

- A new user-facing flow is added
- A gate/enforcement rule changes (quotas, auth, entitlements)
- A new Stripe product or webhook handler is added
- A new route or account type is introduced

Keep checklists **actionable** (imperative steps + expected outcome). Avoid duplicating
`docs/BILLING.md` — link to it and test the behaviours it describes.
