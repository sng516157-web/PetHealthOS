# SEO & Google Ads — setup checklist

Shipped in code (P0): sitemap, robots, per-page metadata, `noindex` on private routes,
GA4 events when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

## You do manually

### 1. Canonical domain (required)

1. Vercel → **Domains** → add `pethealthos.online` (+ `www` if used).
2. Set **Primary domain** and redirect `*.vercel.app` → custom domain.
3. Vercel env (Production):
   - `APP_PUBLIC_URL=https://pethealthos.online`
   - `NEXT_PUBLIC_APP_URL=https://pethealthos.online` (same value)

Redeploy after env changes.

### 2. Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → **Domain** `pethealthos.online` (DNS TXT record).
3. After deploy, submit sitemap: `https://pethealthos.online/sitemap.xml`
4. Use **URL inspection** on `/`, `/shop`, `/owner`, `/facility`, `/pricing`.

### 3. GA4 property

1. [analytics.google.com](https://analytics.google.com) → Admin → Create property **PawSure**.
2. Data stream → **Web** → URL `https://pethealthos.online`.
3. Copy **Measurement ID** (`G-XXXXXXXXXX`).
4. Vercel env: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` → redeploy.
5. Real-time report: visit `/shop`, register — confirm `page_view` and `sign_up`.

**Mark as conversions** (Admin → Events → Mark as conversion):

| Event | Funnel |
|-------|--------|
| `sign_up` | Registration |
| `email_verified` | Email confirmed |
| `begin_checkout` | Stripe redirect |
| `purchase` | Paid return URL |

Event params include `account_type`: `owner` | `shop` | `facility`.

### 4. Google Ads (after GA4 works)

1. [ads.google.com](https://ads.google.com) → New account.
2. **Tools → Linked accounts** → link GA4.
3. **Goals → Conversions** → Import from GA4 (`sign_up`, `email_verified`, `purchase`).
4. Create **3 Search campaigns** (start ~$15–20/day each or $30/day total):

| Campaign | Final URL | Keywords (examples) |
|----------|-----------|-------------------|
| PawSure — Owners | `/owner` | pet health tracker, digital pet medical records |
| PawSure — Shops | `/shop` | breeder software, cattery records, pet shop software |
| PawSure — Facilities | `/facility` | veterinary boarding software, pet hospital records |

Use **phrase/exact match** first. Ad copy must match landing page (trust + passport + AI).

### 5. Optional upgrades (not in P0 code)

- **`public/og-cover.png`** (1200×630) — update `src/lib/seo.ts` `DEFAULT_OG` when ready.
- **Blog / for-breeders pages** — content SEO (Phase 2).
- **Google Tag Manager** — only if you need non-devs to manage tags.

### Search bots always get English

Googlebot, Bingbot, etc. receive **English SSR** (`lang="en"`, English body copy) even when
the crawler IP is in CN/HK. Human visitors default to **English** too; 中文 is opt-in via the
language toggle (geo auto-switch was removed — the HK proxy made every visitor look HK).

Verify: `curl -A Googlebot https://pethealthos.online/ | findstr "lang="` → `lang="en"`.

### Google still shows Chinese? (stale index)

If `site:pethealthos.online` shows Chinese titles/snippets, that is usually an **old index**
from before English metadata + bot SSR shipped. Live HTML is already English — confirm with
URL Inspection → **View crawled page** in Search Console.

After deploy, **request indexing** for `/`, `/owner`, `/shop`, `/facility`, `/pricing`,
`/disclaimer`. Snippets can take days to refresh; titles usually update first.

## Verify nothing broke

- Register owner / shop / facility → still gates on `/verify-email`.
- `/me` and `/app` → `robots: noindex` in HTML source.
- `curl https://pethealthos.online/robots.txt` → disallows `/app`, `/me`.
- `curl https://pethealthos.online/sitemap.xml` → lists 6 marketing URLs.

## Indexable URLs (sitemap)

- `/` — home
- `/owner` — pet owners
- `/shop` — breeders & pet shops
- `/facility` — hospitals & boarding
- `/pricing` — plans
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/disclaimer` — health / AI disclaimer
