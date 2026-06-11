# 12 — Build, lint & deploy

Minimum automated gate for **every** change. See [SOP.md](./SOP.md) Phase 2.

---

## Lint

```bash
npm run lint
```

| Step | Pass criteria |
|------|---------------|
| 1 | Exit code 0 |
| 2 | No new warnings in changed files (fix or justify) |

---

## Production build

```bash
npx next build
```

| Step | Pass criteria |
|------|---------------|
| 1 | TypeScript check passes |
| 2 | All routes compile (see route list in build output) |
| 3 | No Prisma client/schema errors |

Full deploy script (includes migrations):

```bash
npm run build
```

Runs `prisma migrate deploy && next build` — same as Vercel.

---

## Prisma

| Step | Command | When |
|------|---------|------|
| 1 | `npm run db:migrate` | Schema change locally |
| 2 | `npm run db:deploy` | Verify deploy migration applies |
| 3 | `npm run db:studio` | Inspect data after billing/auth tests |

---

## Local smoke after build

```bash
npm run start
```

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `http://localhost:3000` | Landing loads |
| 2 | Sign in demo account | Workspace loads |

---

## Pre-push checklist (user requested deploy)

| # | Item |
|---|------|
| 1 | `docs/CONTEXT.md` decision log updated |
| 2 | `docs/UPDATES.md` if user-visible |
| 3 | `Tests/` checklist updated if flows changed |
| 4 | `npm run lint` + `npx next build` green |
| 5 | Manual tests per [change-impact.md](./change-impact.md) |
| 6 | No secrets in staged files |

---

## Deploy verification

After `vercel --prod --yes`:

| Step | Action | Expected |
|------|--------|----------|
| 1 | Production URL loads | No 5xx on `/` |
| 2 | Check Vercel build logs | Migrations applied |
| 3 | Run smoke from [SOP.md](./SOP.md) Phase 4 on production |
| 4 | Billing change | Re-run [07](./07-billing-payments.md) on live/test keys as appropriate |

---

## Common build failures

| Error | Fix |
|-------|-----|
| `zh.ts` missing keys | Mirror `en.ts` shopBilling/etc. |
| Prisma P1012 relation | Add opposite model field |
| `revalidatePath` during render | Pass `{ revalidate: false }` in billing sync |
| Module not found after move | Update imports + run build again |
