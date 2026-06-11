# 11 — Infrastructure & China access

**Code:** `deploy/Caddyfile`, `next.config.ts` (`serverActions.allowedOrigins`),
`src/lib/img.ts`, `/api/img`, env `APP_PUBLIC_URL`, `PROXY_ALLOWED_ORIGINS`.

---

## Domains

| URL | Audience | Use |
|-----|----------|-----|
| `https://pet-health-os.vercel.app` | Global / Stripe webhooks | Direct Vercel |
| `https://pethealthos.online` | Mainland China users | HK Caddy proxy |

**Rule:** mainland users should use `pethealthos.online`, not `*.vercel.app`.

---

## Proxy reachability

| Step | Action | Expected |
|------|--------|----------|
| 1 | Load `https://pethealthos.online` | 200; HTTPS valid |
| 2 | Login form submit | Works (secure cookies need HTTPS) |
| 3 | Server action from proxy origin | No CSRF/origin block |

If origin blocked: check `PROXY_ALLOWED_ORIGINS` includes proxy host.

---

## Image proxy

| Step | Action | Expected |
|------|--------|----------|
| 1 | Pet photo on proxied domain | URL path `/api/img?u=…` |
| 2 | Image loads on mainland network | Not blocked (unlike raw `*.blob.vercel-storage.com`) |
| 3 | `NEXT_PUBLIC_IMG_PROXY=0` | Direct blob URLs (only if CDN unblocked) |

---

## Stripe return URLs

| Step | Action | Expected |
|------|--------|----------|
| 1 | Production `APP_PUBLIC_URL` | `https://pethealthos.online` |
| 2 | Complete Checkout from mainland | Success redirect reaches app |
| 3 | Missed redirect | Webhook still fulfills; billing refresh recovers |

---

## Webhooks vs user traffic

| Step | Action | Expected |
|------|--------|----------|
| 1 | Stripe webhook URL | Points to **Vercel** `/api/stripe/webhook` |
| 2 | User browsing | Uses **proxy** domain |

---

## Cron

| Step | Action | Expected |
|------|--------|----------|
| 1 | `/api/cron/reminders` without secret | 401 |
| 2 | With `CRON_SECRET` | 200; reminders processed |

Configured in `vercel.json` (daily).

---

## Performance sanity (optional)

| Step | Action | Expected |
|------|--------|----------|
| 1 | TTFB on `/me` from proxy | Document if >2s (compare Vercel direct) |
| 2 | DB region | Neon `us-east-1` co-located with Vercel `iad1` |

Do not confuse mainland packet loss with DB slowness — measure connect/TTFB separately.
