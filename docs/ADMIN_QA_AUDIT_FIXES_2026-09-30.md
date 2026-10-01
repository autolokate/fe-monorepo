# Admin QA Audit (Staging, 30 Sep 2026) — Fixes & Follow-ups

Source: manual QA audit of `https://admin-staging.autolokate.com` (17 findings, AL-01 … AL-17).
Branch: `bugFixes-29-09`.

This document records what was fixed in the frontend, what still needs **backend / data / infra**
work, and the frontend ↔ API integration inventory against the live staging OpenAPI spec
(`https://api-staging.autolokate.com/openapi.json`, 179 operations).

---

## 1. Status at a glance

| ID    | Title                                         | Severity | Status                                              | Owner           |
| ----- | --------------------------------------------- | -------- | --------------------------------------------------- | --------------- |
| AL-01 | `/login` and deep links return 404 from S3    | High     | Fixed for top-level routes; full fix needs CDN rule | FE ✅ / Infra   |
| AL-02 | Customer mobile search returns nothing        | Critical | Input fixed; backend lookup still to verify         | FE ✅ / Backend |
| AL-03 | `RJ 55 SA 3003` resolves to wrong vehicle     | Critical | Backend / vendor data                               | Backend         |
| AL-04 | Audit "load older" `ERR_CONNECTION_CLOSED`    | High     | UI retry added; server crash to investigate         | FE ✅ / Backend |
| AL-05 | Expired token not handled by UI               | High     | Fixed                                               | FE ✅           |
| AL-06 | Same `x-correlation-id` on every request      | Medium   | Fixed                                               | FE ✅           |
| AL-07 | Notifications: no deep link / clear / dismiss | Medium   | Fixed (browser-local read state)                    | FE ✅           |
| AL-08 | Notifications show raw codes                  | Low      | Fixed                                               | FE ✅           |
| AL-09 | Mobile layout overflows, tables cut off       | High     | Fixed                                               | FE ✅           |
| AL-10 | Mobile "Jump to" shows only `⌘K`              | Low      | Fixed                                               | FE ✅           |
| AL-11 | Live plans with "Not published" window        | Medium   | Label clarified; data needs backfill                | FE ✅ / Backend |
| AL-12 | Two SHIELD PLUS versions Live at once         | Medium   | Backend data / publish logic                        | Backend         |
| AL-13 | Inconsistent plan names                       | Low      | Backend data                                        | Backend         |
| AL-14 | Duplicate sidebar icons                       | Low      | Fixed                                               | FE ✅           |
| AL-15 | Disabled pagination looks active              | Low      | Fixed                                               | FE ✅           |
| AL-16 | Notification panel overlaps page actions      | Low      | Fixed                                               | FE ✅           |
| AL-17 | ngrok logic in shipped bundle                 | Low      | Fixed                                               | FE ✅           |

---

## 2. Frontend fixes (this branch)

### AL-01 — SPA routes returned HTTP 404

- **Root cause (verified with curl):** S3 has no object for client-side routes; `GET /login`
  answered `404 NoSuchKey` and only rendered because the error document is `index.html`.
- **Fix:** `.github/workflows/deploy-staging.yml` (deploy-admin) now publishes `index.html` at every
  top-level admin route (`login`, `dashboard`, `users`, `support`, `orders`, `subscriptions`,
  `shipments`, `payments`, `finance`, `promos`, `catalog`, `inventory`, `qr-batches`,
  `ownership-transfers`, `audit-events`, `incidents`) with `Content-Type: text/html` and
  `Cache-Control: no-cache`. These keys are excluded from `s3 sync --delete`.
- **Maintenance:** keep `ADMIN_SPA_ROUTES` in step with `apps/admin/src/app/routes/admin-paths.ts`.
- **Still open:** dynamic routes (`/inventory/{id}`, `/qr-batches/{id}`) — see Infra section.
- **Verify after deploy:** `curl -I https://admin-staging.autolokate.com/login` → `200`.

### AL-02 — Customer search by mobile

- **Root cause (frontend part):** the lookup only accepted strict E.164 (`+919079269147`); typing
  `9079269147` was rejected.
- **Fix:** `adminPhoneE164Schema` now normalises `9079269147`, `09079269147`, `919079269147`,
  `+91 90792 69147` → `+919079269147` before calling `GET /admin/v1/users?phone=`.
  A 404 now shows "No account is registered with this number…".
- Files: `platform/validation/admin-openapi-schemas.ts`, `features/users/*`,
  `hooks/users/useAdminUserRoles.ts`.

### AL-04 — Audit events "load older"

- An older-page failure now shows inline ("Couldn't load older events. … [Retry]") instead of only a
  toast; first-page errors behave as before.
- Files: `hooks/audit/useAuditExplorer.ts`, `features/audit/AuditEventsPage.tsx`, `audit-events.css`.

### AL-05 — Expired / invalid token

- **Root cause:** `registerAdminAuthFailureHandler` was never called, so when refresh failed the
  tokens were cleared but React state stayed "authenticated" (empty, broken pages).
- **Fix:** `AdminAuthProvider` registers the handler → signs out, shows "Your session expired. Sign in
  again to continue.", and `RequireAuth` redirects to `/login` (returning to the same page after
  sign-in). The shared client also treats a **401 after a successful refresh** as a session failure.
- Files: `providers/AdminAuthProvider.tsx`, `packages/api-client/src/client.ts`.

### AL-06 — Correlation ID reused

- **Root cause:** `ApiClient` stored the correlation ID from the first response and sent it on every
  later request.
- **Fix:** a fresh `X-Correlation-Id` (`crypto.randomUUID()`) per HTTP request
  (applies to admin and qr — shared client).

### AL-07 / AL-08 / AL-16 — Notifications

- Items are human-readable: "Audit log exported by an admin · Audit log · 5h ago".
- Clicking an item deep-links to the Activity Log filtered to that action and opens the event
  (`/audit-events?action=…&event=…`).
- **Mark all read**, **Clear all**, per-item **dismiss**; badge counts **unread** only.
- Read/dismiss state is stored in the browser (`localStorage`) — there is no admin notifications
  API (see backend asks).
- Panel is taller with its own scroll area, closes on outside click / Esc, full width on mobile.
- Activity Log table also shows readable action/entity labels.
- Files: `platform/components/AdminActivityNotification.tsx`, `activity-read-state.ts`,
  `platform/utils/audit-labels.ts`, `app/routes/admin-paths.ts` (`adminAuditEventsPath`).

### AL-09 / AL-10 — Mobile layout

- **Root cause:** the layout grid used `1fr` tracks (cannot shrink below content) so wide tables
  stretched the page past the viewport; and `.al-page-layout .admin-command-trigger { min-width:
16rem }` overrode the mobile rule.
- **Fix:** `minmax(0, 1fr)` grid tracks, `min-width: 0` on content and tables (tables scroll inside
  their own container), header actions shrink, search shows an icon (no `⌘K` on touch devices),
  mobile drawer uses full height and hides the collapse/role footer.
- Files: `packages/ui/.../PageLayout.css`, `DataTable.css`, `apps/admin/src/styles/admin-shell.css`,
  `layouts/AdminHeader.tsx`, `layouts/AdminShellLayout.tsx`.

### AL-11 — Catalog effective window label

- When a plan is effective but has no `effectiveFrom`, the window now reads "No start date" instead
  of the contradictory "Not published". Data still needs backfill (backend).

### AL-14 — Sidebar icons

- Each destination has a distinct icon (Tickets no longer uses the notification bell).

### AL-15 — Disabled pagination

- Disabled buttons are visibly muted with `cursor: not-allowed`; Previous/Next are hidden when there
  is only one page.

### AL-17 — ngrok header logic

- Now only included in dev builds (`import.meta.env.DEV`); verified absent from the production bundle.

### Related hardening

- QR app: plate compaction strips every non-alphanumeric (`RJ-55-SA-3003` → `RJ55SA3003`) to match
  the API pattern `^[A-Z0-9]{5,12}$`.

### Verification

- `tsc --noEmit`: admin, qr, website, api-client, ui — pass.
- ESLint on all changed files — pass.
- Admin production build — pass; `ngrok` absent from bundle.
- Mobile layout not yet verified on a device (needs a staging login) — please re-test AL-09/10.

---

## 3. Backend / Data / Infra asks

### Backend

1. **AL-02 — Customer phone lookup.** Confirm account for `+919079269147` exists and that the
   phone blind index (keyed HMAC) is written on registration for every account. If
   `GET /admin/v1/users?phone=%2B919079269147` returns 404 for a registered user, the registration
   pipeline is not writing the index (or writes a non-E.164 form).
2. **AL-03 — Wrong vehicle for `RJ55SA3003`.** Frontend sends the exact normalised plate to
   `GET /v1/vehicles/lookup?plate=RJ55SA3003` (no partial match, cache keyed per plate). Please check
   the raw Vahan response / staging mock / cached RC record for this plate. Also consider adding a
   vehicle class (2W/4W) to `RcRecordDto` so plan eligibility can be validated.
3. **AL-04 — `GET /admin/v1/audit-events?cursor=OTc&limit=50` drops the connection** (no HTTP
   response). Check logs for correlation ID `e64441c1-8fe9-4c7a-a790-7013602b059e` (~08:50 GMT,
   30 Sep). Decode/validate the cursor defensively and return `400` for a bad cursor instead of
   crashing. (Unauthenticated probes return a normal 401, so the failure is after auth.)
4. **AL-05 — Session role after refresh.** Confirm `POST /v1/auth/refresh` keeps the elevated
   `ADMIN` session role; if it falls back to `CONSUMER`, admin calls fail right after refresh.
5. **AL-11 / AL-12 / AL-13 — Catalog data.**
   - Backfill `effective_from` for SAFE v1, SECURE v1, SHIELD v1, SHIELD PLUS v1; disallow
     `isEffectiveNow = true` without `effectiveFrom`.
   - Publishing SHIELD PLUS v2 should set v1 `effective_to = v2.effective_from` (only one Live
     version per tier).
   - Normalise plan names (`SHIELD +` vs `Shield+`).
6. **Admin notifications (AL-07, optional).** The admin bell currently shows the latest audit events
   with browser-local read state. For cross-device read state, expose an admin inbox (or allow
   `/v1/notifications`, `/read-all`, `/{id}/read` for admin accounts).
7. **Website endpoints missing on staging (404 — features broken).** These are called by the
   website but are not in the staging spec and return 404:
   - Catalogue & compare: `/v1/catalogue/*` (brands, models, variants, trending, search, compare),
     `/v1/taxonomy`
   - Price tools: `/v1/prices/tco/{variantId}`, `/v1/prices/emi`, `/v1/prices/fuel`,
     `/v1/prices/fuel/history`, `/v1/prices/ev-subsidies`, `/v1/prices/resale/{variantId}`
   - Expert-session booking: `/v1/bookings/*` and its payments `/v1/payments/orders`,
     `/v1/payments/verify`, `/v1/payments/{id}`
   - Contact form: `/v1/contact-us`

   Please confirm whether these moved to another service (and its base URL) or are not deployed.

### Infra / DevOps

1. **AL-01 — SPA fallback at the CDN.** Add a Cloudflare rule/Worker (or CloudFront custom error
   response) that rewrites any non-asset path on `admin-staging.autolokate.com` to `/index.html`
   with status **200**. This covers dynamic routes (`/inventory/{id}`, `/qr-batches/{id}`) and
   lets us remove the per-route copies from the deploy workflow. The QR app bucket likely needs
   the same rule.

---

## 4. API integration inventory (vs staging OpenAPI)

### Admin — 44 / 52 operations integrated

Integrated: audit events, clawbacks, incidents (list/detail), inventory, orders (list/detail/refund),
ownership transfers (create/approve), partner reorder fulfil, payments (list/detail), plans
(list/create/update/features), promos (list/create), QR auto-detach sweep, QR batches
(create/generate/provision/distribute/codes/export), QR replace/retire, settlement batch, shipments
(list/detail/status), SKUs (list/create/update), subscriptions (list/detail), support tickets
(list/detail/update), users (lookup, grant/revoke role).

Client function exists but no admin screen uses it (lists only):
`GET /admin/v1/orders/{orderId}`, `/payments/{paymentId}`, `/shipments/{orderId}`,
`/subscriptions/{subscriptionId}`.

**Not integrated (no frontend):**

| Method | Path                                           |
| ------ | ---------------------------------------------- |
| POST   | `/admin/v1/bulk-allocations`                   |
| POST   | `/admin/v1/bulk-allocations/{id}/ship`         |
| POST   | `/admin/v1/bulk-orders/{id}/confirm`           |
| POST   | `/admin/v1/bulk-orders/{id}/cancel`            |
| POST   | `/admin/v1/corporate-accounts`                 |
| POST   | `/admin/v1/invoices`                           |
| POST   | `/admin/v1/kyc-verifications/{orgId}/decision` |
| POST   | `/admin/v1/prepaid-subscriptions/void`         |

### Consumer — available on backend, not used by any app

- Notifications: `GET /v1/notifications`, `POST /v1/notifications/read-all`,
  `POST /v1/notifications/{id}/read`
- Notification preferences: `GET /v1/notification-preferences`,
  `PUT …/categories/{category}`, `PUT …/quiet-hours`
- Account: `DELETE /v1/account`, `POST /v1/auth/logout-all`
- `GET /v1/home`
- Support: `GET/POST /v1/support/tickets`
- Subscriptions: `GET /v1/subscriptions/{id}`, `POST /v1/subscriptions/{id}/auto-renew`,
  `GET /v1/subscriptions/{id}/setup`
- `PUT /v1/me/active-vehicle`
- Media: `POST /v1/media`, `GET /v1/media/{id}`, `POST /v1/media/{id}/complete`
- Emergency: `GET /v1/emergency/incidents`, `POST /v1/emergency/incidents/{id}/resolve`
- `POST /v1/park/{id}/resolve`
- Invoices: `GET /v1/invoices`, `POST /v1/invoices/{invoiceId}/pay`
- Bulk orders: `GET/POST /v1/bulk-orders`, `GET /v1/bulk-orders/{id}`
- Partner: ~38 `/v1/partner/*` operations (partner app — not in this repo)

### Frontend calls with no staging endpoint

- Website legacy services (see Backend ask 7) — **return 404 on staging**.
- `packages/api-client`: `validatePromo` → `POST /v1/promos/validate` (404; unused — QR applies
  promos via `PATCH /v1/cart/{cartId}`), and unused endpoint entries `'/vehicles'`,
  `'/plans/{id}'`. Candidates for removal.
