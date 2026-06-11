# 08 — AI chat & triage

**Code:** `src/lib/ai.ts`, `src/lib/uploads.ts`, `/api/pets/[id]/chat`, `generateTriageReport`, `canAccessPet`.

**Requires:** `GOOGLE_GENERATIVE_AI_API_KEY` for live AI; without it expect graceful errors.

---

## Access control

| Step | Action | Expected |
|------|--------|----------|
| 1 | Owner opens own pet chat | 200; stream works |
| 2 | Owner opens another user's pet API | 403/404 |
| 3 | Shop member opens org pet | Allowed |
| 4 | Facility archived stay (read-only) | Chat/triage disabled |
| 5 | Revoked-slot owner pet | AI blocked per entitlements |

---

## Chat UI — owner (`/me/pets/[id]/chat`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Send message | Response streams |
| 2 | Tone | Owner-friendly (not clinical shop manual) |
| 3 | Context | References pet species/logs when available |
| 4 | Long conversation | No layout break; scroll works |

---

## Chat UI — shop (`/app/pets/[id]/chat`)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Send message | Shop/professional tone |
| 2 | Same pet as owner view | Different system prompt behaviour |

---

## Triage

| Step | Action | Expected |
|------|--------|----------|
| 1 | Owner triage tab → generate | `TriageReport` renders sections |
| 2 | Shop triage tab | Same component; data scoped to pet |
| 3 | Re-run triage | Updates report |
| 4 | Pet with vaccine cert / lab PDF uploaded | Triage may reference document findings |
| 5 | zh locale | Chinese output when locale zh |

---

## Log enrichment (background)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Add raw log entry | Saves immediately |
| 2 | After few seconds | Enriched fields appear (if AI key set) |

Uses `after()` — failure must not block save.

---

## Error handling

| Step | Action | Expected |
|------|--------|----------|
| 1 | Invalid API key / quota exceeded | User-visible error, not 500 crash |
| 2 | Network timeout | Retry or message; page stable |
