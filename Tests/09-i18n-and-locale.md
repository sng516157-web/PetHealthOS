# 09 — i18n & locale

**Code:** `src/lib/i18n/en.ts` (source of truth), `zh.ts`, `Dictionary` type, locale cookie.

---

## Type parity (build gate)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Add/remove key in `en.ts` only | `npx next build` **fails** |
| 2 | Mirror key in `zh.ts` | Build passes |

**Rule:** always edit `en.ts` and `zh.ts` together.

---

## Locale switching

| Step | Action | Expected |
|------|--------|----------|
| 1 | Default (no cookie) | Chinese UI (`DEFAULT_LOCALE` zh) |
| 2 | Switch to English | Cookie set; persists on refresh |
| 3 | Switch back to Chinese | Cookie updated |
| 4 | Landing `/` | Toggle works |

---

## Coverage spot-check

For any new UI string, verify **both** locales on:

| Surface | URLs |
|---------|------|
| Landing | `/`, `/pricing` |
| Owner | `/me`, `/me/billing` |
| Shop | `/app`, `/app/billing` |
| Facility | `/app` (facility copy) |
| Auth | `/login`, `/owner`, `/shop` |
| Public | `/passport/[token]` |

---

## Formatting & interpolation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Strings with `¥` amounts | Correct numbers from `plans.ts` |
| 2 | Plural / count helpers `(n) => …` | Grammar OK in en and zh |
| 3 | Date formatting | Locale-appropriate display |

---

## No raw keys in UI

| Step | Action | Expected |
|------|--------|----------|
| 1 | Browse changed pages in en | No `shopBilling.foo` literals |
| 2 | Browse in zh | No English leaks unless intentional (brand name) |

---

## AI locale

| Step | Action | Expected |
|------|--------|----------|
| 1 | zh user → chat | Chinese responses |
| 2 | en user → triage | English report |

See [08-ai-chat-triage.md](./08-ai-chat-triage.md).
