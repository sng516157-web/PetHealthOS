# 10 — UI/UX & brand

**Code:** `src/app/globals.css`, `src/components/pawsure/**`, page-level layouts.

**Showcase:** `/brand` — run after any visual change.

---

## Design system (`/brand`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/brand` | All PawSure components render |
| 2 | Buttons (primary/secondary/ghost) | Sage Trust `#6FAF98` actions |
| 3 | Cards, chips, badges | Warm cream surfaces, soft shadows |
| 4 | Typography | Nunito (en); headings Forest Calm `#24594C` |
| 5 | Modal / bottom sheet / toast | Open/close animations smooth |

---

## Responsive layout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Viewport ~390px width | No horizontal scroll on changed pages |
| 2 | Viewport ~1280px | Sidebar layouts correct |
| 3 | Pet detail tabs | Scrollable / tappable on mobile |

---

## Accessibility basics

| Step | Action | Expected |
|------|--------|----------|
| 1 | Keyboard focus on forms | Visible focus ring |
| 2 | Buttons have labels | Icon-only buttons have `aria-label` |
| 3 | Error states | Text + colour (not colour alone) |

---

## Workspace chrome

| Step | Action | Expected |
|------|--------|----------|
| 1 | Owner bottom nav / top bar | Active state correct |
| 2 | Shop sidebar | Current route highlighted |
| 3 | Empty states | `EmptyState` component copy + CTA |

---

## Forms & feedback

| Step | Action | Expected |
|------|--------|----------|
| 1 | Submit invalid form | Inline errors |
| 2 | Successful save | Toast or visible confirmation |
| 3 | Loading states | Button disabled / spinner; no double submit |

---

## Images & media

| Step | Action | Expected |
|------|--------|----------|
| 1 | Pet avatar from Blob | Loads via `proxyImageSrc` / `/api/img` |
| 2 | Broken image URL | Fallback avatar, no broken layout |
| 3 | Upload preview | Correct aspect ratio |

---

## Marketing pages

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/` hero + CTAs | Links to `/owner`, `/shop`, `/facility` |
| 2 | `/pricing` | Matches `plans.ts` numbers |
| 3 | `/disclaimer` | Loads |

---

## Hydration (IDE browser)

Cursor in-IDE browser may show hydration warnings from `data-cursor-ref` — **ignore**
per `docs/CONTEXT.md`. Test in normal Chrome/Safari for real hydration issues.
