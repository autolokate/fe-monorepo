# Staging End-to-End Test Report & Work Status — 13 Oct 2026

Branch: `bugFixes-29-09` (parent: `staging`) · Environments tested:

| App                                                      | URL                                  |
| -------------------------------------------------------- | ------------------------------------ |
| Website (Next.js, Docker blue/green on EC2 behind Caddy) | https://staging.autolokate.com       |
| Admin (Vite SPA on S3 + Cloudflare)                      | https://admin-staging.autolokate.com |
| QR (Vite SPA / PWA on S3 + Cloudflare)                   | https://qr-staging.autolokate.com    |
| API                                                      | https://api-staging.autolokate.com   |

---

## 1. TL;DR

- Everything merged so far (PR #3 → `staging`, merge `0d76c54`) is **deployed and working on the website**.
  All 101 website routes respond correctly, SEO files (`robots.txt`, `sitemap.xml`, `llms.txt`) are live, and
  static assets are served with long cache headers.
- **3 frontend bugs found and fixed in this pass** (see §4): wrong plan names in the buy flow / order history,
  and a blank QR app screen.
- **1 infra bug that must be fixed outside this repo branch**: an old deploy workflow on `main` re-deploys
  admin/QR ~3 minutes after every staging deploy and undoes the SPA-route fix (admin `/login` hard refresh → 404)
  and the cache headers. Needs the repo admin (§5.1).
- **1 pricing decision needed**: Guardian Plus is ₹3,999 in the API/checkout but ₹2,999 on the static Pricing page (§5.2).
- **Logged-in flows (sign-in with OTP, payment, book-session, admin) were not executed end-to-end**: staging has no
  test OTP. A manual checklist is in §6.
- Several screens are blocked by **backend endpoints that return 404 on staging** (§5.3).

---

## 2. What has been done so far (history)

| #   | Work                                                                                                              | Commit      | Status                 |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------- |
| 1   | Admin staging QA audit fixes AL-01…AL-17 + backend follow-up list — see `docs/ADMIN_QA_AUDIT_FIXES_2026-09-30.md` | `a6862ad`   | Merged to `staging`    |
| 2   | Website performance, caching, SEO & AEO (details below)                                                           | `5dfd228`   | Merged to `staging`    |
| 3   | Staging E2E test pass + fixes in this document                                                                    | this commit | Pending PR → `staging` |

### 2.1 Performance / caching / SEO / AEO (commit `5dfd228`)

Performance

- Home hero (`CinematicScene`): poster image paints first, the video is deferred until after load.
- Removed `priority` from below-the-fold home images so the browser only preloads the LCP image.
- Heavy background images converted to WebP; `next/image` serves AVIF/WebP with a long `minimumCacheTTL`
  and a 2560 device size for large screens.
- `optimizePackageImports` for icon/UI packages to shrink bundles.
- Home sections use `content-visibility: auto` (`HomeReveal`) so off-screen sections are not rendered until scrolled to.
- Plans API responses are cached server-side for 10 minutes (`getCachedPlans`).

Caching

- `next.config.ts` `headers()`: hashed `/_next/static` assets are immutable; images/fonts get a one-week cache.
- `deploy-staging.yml` (admin/QR on S3): `assets/` uploaded as `immutable`, `index.html` and everything else `no-cache`,
  and a copy of `index.html` is uploaded at each admin SPA route so a hard refresh returns 200.

SEO / AEO

- `lib/seo/site.ts` (site URL, indexability, default share image), `lib/seo/structured-data.ts`, `components/seo/JsonLd.tsx`.
- `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` (AI-answer-engine summary).
- Organization/WebSite, FAQ and Article JSON-LD; share image (`/og/autolokate-og.jpg`) set on every page's Open Graph.
- Non-production hosts are `noindex` and `robots.txt` is `Disallow: /` (verified on staging — correct).

---

## 3. Test results

Legend: ✅ pass · ⚠️ works but degraded (backend gap) · ❌ bug · ⏸ not executed (needs OTP)

### 3.1 Deploy verification

| Check                                                             | Result                                       |
| ----------------------------------------------------------------- | -------------------------------------------- |
| Website serves the merged build                                   | ✅                                           |
| `robots.txt` (staging → `Disallow: /`), `sitemap.xml`, `llms.txt` | ✅                                           |
| Image/static Cache-Control (1 week / immutable)                   | ✅                                           |
| Admin & QR cache headers + admin SPA route keys in S3             | ❌ overwritten by the `main` workflow — §5.1 |

### 3.2 Website (desktop + mobile)

| Area                                                             | Result             | Notes                                                                                                      |
| ---------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| Route sweep (101 routes)                                         | ✅                 | 200 everywhere; `/compare`, `/explore` → 307 by design; unknown path → 404                                 |
| Page quality                                                     | ✅                 | One `<h1>` per page, no broken images, no horizontal overflow on mobile                                    |
| Home, features, how-it-works, pricing, about, blog, media, legal | ✅                 |                                                                                                            |
| Plan names on `/buy`                                             | ❌ → fixed         | Showed API names "Secure / Shield / SHIELD +" instead of "Protect / Guardian / Guardian Plus"              |
| Prices                                                           | ❌ decision needed | Guardian Plus ₹3,999 (API) vs ₹2,999 (static copy) — §5.2                                                  |
| `/cars`, `/bikes`, explore, compare, brand/model pages           | ⚠️                 | Catalogue/taxonomy APIs 404; UI shows "The catalogue is being populated"                                   |
| Contact form                                                     | ⚠️                 | `POST /v1/contact-us` → 404; error shown inline to the user                                                |
| Book session (logged out)                                        | ✅                 | Form disabled with "Sign in to load available slots"                                                       |
| Book session (logged in)                                         | ⏸                  | Slots API `/v1/bookings/*` is 404 on staging, so it will degrade                                           |
| Sign-in / sign-up UI                                             | ✅                 | Mobile layout good; invalid number → toast "Please enter a valid 10-digit mobile number." with no API call |
| OTP verify, profile, checkout, Razorpay payment, orders          | ⏸                  | Needs real OTP — §6                                                                                        |

### 3.3 Admin

| Area                                            | Result | Notes                                                                       |
| ----------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| App loads, unauthenticated redirect to `/login` | ✅     |                                                                             |
| Hard refresh on `/login` (and other routes)     | ❌     | HTTP 404 status (page still renders via S3 error document) — caused by §5.1 |
| OTP login and all admin pages                   | ⏸      | Needs staff phone + OTP                                                     |

### 3.4 QR app

| Area                                                     | Result     | Notes                                                                                                        |
| -------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| Splash / boot                                            | ✅         |                                                                                                              |
| Opening the app without a QR code (`/` → `/q`)           | ❌ → fixed | Rendered a blank page (route redirected to itself). Also hit by the **"Go to home" button after activation** |
| QR deep link `/q/:code`, activation, purchase, emergency | ⏸          | Needs a real sticker code + OTP                                                                              |

---

## 4. Bugs fixed in this pass

### 4.1 Plan names shown from raw API values (website)

- **Symptom**: buy-flow plan picker and order history showed "Secure", "Shield", "SHIELD +".
- **Cause**: `normalizePlan` used the API `name`; the top tier is spelled `SHIELD +` by the API, which the
  display-name lookup did not recognise.
- **Fix**:
  - `apps/website/src/lib/plan-display-names.ts` — `getPlanDisplayName` now normalises any spelling
    (`SHIELD_PLUS`, `shield-plus`, `Shield+`, `SHIELD +`) to the tier before mapping to the customer name.
  - `apps/website/src/services/plans/plans-api.ts` — plan name is derived from the tier (fallback: API name).
  - `apps/website/src/services/purchase/orders-api.ts` — order list maps `planName` to the display name.

### 4.2 QR app blank screen at `/q`

- **Symptom**: `qr-staging.autolokate.com` without a QR code, and the "Go to home" button on the activation-complete
  screen, showed an empty page.
- **Cause**: `/q` had no route; the catch-all redirected back to `/q`, which renders nothing.
- **Fix**: new `apps/qr/src/journey/screens/QrEntryScreen.tsx` (+ `.css`) mounted at `/q` in `JourneyRoutes.tsx` —
  explains how to scan a sticker and links to support. Verified locally at 390×844.

Checks: `tsc --noEmit` and ESLint pass for website and QR.

---

## 5. Open issues (not fixable in this branch)

### 5.1 Old deploy workflow on `main` overwrites admin/QR deploys — **Infra / repo admin**

- `main` is the repository's default branch and still has an **old** `.github/workflows/deploy-staging.yml`
  triggered by `workflow_run` (after CI on `staging`). GitHub always runs `workflow_run` workflows from the
  default branch, so after every staging push:
  1. the correct staging-branch deploy runs (SPA route keys + cache headers), then
  2. ~3 minutes later the `main` copy runs `aws s3 sync --delete` and **deletes the admin SPA route keys and strips
     Cache-Control** (observed: run 38361983787, bucket objects rewritten at 07:21 after the good deploy ended at 07:18).
- **Impact**: admin hard refresh returns HTTP 404 (re-opens audit item AL-01); admin/QR `index.html` may be cached by
  Cloudflare for 4 h, so users can see a stale build after a deploy.
- **Fix (needs repo admin)** — any one of:
  - delete `.github/workflows/deploy-staging.yml` on `main`, or remove its `workflow_run` trigger; or
  - sync `main` with `staging`; or
  - change the repository default branch to `staging`.

### 5.2 Guardian Plus price mismatch — **Product decision**

- Live public API (`GET /v1/plans`, no login) returns `SHIELD_PLUS` **version 2** at `pricePaise: 399900` (₹3,999);
  checkout charges this.
- Static copy still says ₹2,999:
  - `apps/website/src/app/(site)/pricing/components/PricingPlansSection/constants.tsx`
  - `apps/website/src/app/(site)/pricing/components/ComparePlansSection/constants.tsx`
  - `apps/website/src/app/(purchase)/purchase/constants.tsx`
  - `apps/website/src/app/home/components/SafetyPacksSection/constants.tsx` (server-render fallback; the
    home page briefly shows ₹2,999 then switches to ₹3,999 after loading).
- This is **not** an existing-subscription/upgrade discount: the API was called anonymously. The `version: 2` indicates
  the price was re-published in admin. Product to confirm the correct price; then either update the static copy to
  ₹3,999 or revert the plan price in admin.

### 5.3 Backend endpoints returning 404 on staging — **Backend team**

| Endpoint                          | Used by                                                                       | Current UX                     |
| --------------------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| `/v1/catalogue/*`, `/v1/taxonomy` | `/cars`, `/bikes`, explore, compare, brand/model pages                        | "Catalogue is being populated" |
| `POST /v1/contact-us`             | Contact form                                                                  | Inline error, message not sent |
| `/v1/bookings/*`                  | Book a session                                                                | No slots                       |
| `/v1/payments/*`                  | Book-session payment (plan purchase uses `/v1/orders/{id}/pay`, which exists) | Session booking cannot be paid |

Also see the backend asks in `docs/ADMIN_QA_AUDIT_FIXES_2026-09-30.md` §3.

### 5.4 Testing blocker — **Backend team**

Staging has no test phone number/OTP, so authenticated flows cannot be automated. Request a staging-only test
number with a fixed OTP (or an OTP bypass header for CI).

---

## 6. Manual checklist for logged-in flows (to run with a real phone)

Website — sign-up / sign-in

1. `/auth/signup` → enter new number → OTP arrives → verify → profile form saves → redirected to the page you came from.
2. Sign out → `/auth/login` with the same number → OTP → lands logged in; header shows profile.
3. A wrong OTP shows an error and does not log in.

Website — purchase & payment (Razorpay test mode on staging)

1. `/buy` → plan cards show **Protect / Guardian / Guardian Plus** with API prices.
2. Pick a plan + rider option → vehicle details → review shows correct total.
3. Pay with Razorpay test card `4111 1111 1111 1111`, any future expiry, any CVV, OTP page → success.
4. Success page shows order; order history (`/orders`, `/my-orders`) shows the display plan name and "Paid".
5. Repeat and cancel/close Razorpay → failure/retry screen; no paid order created.

Website — book session (after login): slots load (currently expected to fail — §5.3).

Admin

1. `/login` → staff phone → OTP → dashboard.
2. Hard refresh on `/customers`, `/orders` etc. returns 200 once §5.1 is fixed.
3. Customer search by mobile, audit events "load older", notifications, catalog — per audit doc.

QR app

1. Scan a staging sticker (`/q/<code>`) → splash → correct flow (purchase / emergency).
2. Purchase: OTP → vehicle lookup → plan → Razorpay test payment → activation complete → "Go to home" shows the
   new "Scan an Autolokate QR" screen (not blank).
3. Emergency scan of an activated sticker as a stranger → contact owner screen.
