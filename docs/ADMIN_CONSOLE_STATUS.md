# Admin console — module status

**Last updated:** 2026-11-01 · app: `apps/admin` (Vite + React 19, TanStack Query/Table) · client: `packages/api-client`

This file is the current status of the Admin console. `PROJECT_STATUS.md` covers the QR onboarding PWA only.
Backend routes marked _contract_ are defined in the shared parallel-fix contract and may not be deployed on
every environment; the console shows "Not available on this server yet" (naming the missing route) when one
answers 404, and never shows placeholder rows.

## Access model (what the server enforces)

| Gate          | Behaviour                                                                                                                                                                                                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Sign-in       | Phone OTP (`/v1/auth/otp/request                                                                                                                                                                                                                                                                                                                                    | verify`) → `GET /v1/profiles`→`POST /v1/auth/session`; switches to `OPERATOR` when the account holds it. |
| Role          | Only an active `OPERATOR` (legacy `ADMIN`) session reaches the shell. Any other role sees an access-denied screen. There are **no** server-side sub-roles, so the console has no client-only permission tiers.                                                                                                                                                      |
| Step-up (2FA) | Every `/admin/v1/*` route requires the `step_up` claim. If the access token is a JWT with `step_up: false`, the operator confirms an OTP via `POST /v1/auth/step-up/otp/request` → `/verify` (_contract_); the returned short-lived token is stored. Any `403 step_up_required` re-opens the prompt. Dev servers may auto-grant `step_up` (explicit server config). |
| Sign-out      | `POST /v1/auth/logout` (revokes the session family), then local clear.                                                                                                                                                                                                                                                                                              |
| Tokens        | sessionStorage `al-admin-auth-tokens-v1` (per tab). No token export helpers in app code.                                                                                                                                                                                                                                                                            |

## Navigation

Operations · Partners · Taxi · Garage · Catalog & Plans · Content · Safety · Finance · Users · Audit
(`apps/admin/src/app/routes/admin-paths.ts` is the single source for sidebar and ⌘K palette).

## Modules

| Area            | Screen                                                                                     | Backend                                                                                                         | Status                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operations      | Dashboard, Orders, Coverage, Deliveries, Ownership transfers/claims                        | existing `/admin/v1/*`                                                                                          | Live. Order refund and manual shipment status have **no server route** — shown as unavailable with a reason.                                                                              |
| Partners        | Directory, detail (GST decision, publish store)                                            | existing                                                                                                        | Live. `type` filter uses the explicit storefront surface type.                                                                                                                            |
| Partners        | KYC review                                                                                 | `GET /admin/v1/partners/kyc` (default `PENDING_REVIEW`) + `POST /admin/v1/garage/orgs/{orgId}/gst-verification` | New. Sandbox self-verification never yields `VERIFIED`; an operator decides.                                                                                                              |
| Partners        | Requests & bids                                                                            | existing read-only inbox                                                                                        | Live (read-only).                                                                                                                                                                         |
| Taxi            | Bookings list/detail (checkouts, refunds), cancel (reason, refundAdvance), deposit release | _contract_ `/admin/v1/taxi/bookings*`                                                                           | New; not-deployed state until the routes ship. Amounts are server-computed.                                                                                                               |
| Taxi            | Taxi partners (enrollments) — suspend/reinstate, provision by owner phone                  | _contract_ `/admin/v1/taxi/enrollments*`, existing `POST /admin/v1/taxi/provision`, `GET /admin/v1/users?phone` | New.                                                                                                                                                                                      |
| Taxi            | Policy                                                                                     | `GET/PUT /admin/v1/taxi/policy`, `/publish`, `/history`                                                         | All fields editable (advance, deposit, no-show, deposit release, dispute SLA, cancel ladder, notes). Live vs draft side by side; publish requires a confirm with a diff.                  |
| Garage          | Commercial, Taxonomy                                                                       | existing                                                                                                        | Live.                                                                                                                                                                                     |
| Catalog & Plans | Plans & SKUs, Promos, QR stock, QR batches, Services hub                                   | existing                                                                                                        | Live. Services hub Save is disabled when the server config failed to load (no defaults-on-error overwrite). QR codes CSV export remains unavailable (no route).                           |
| Content         | Discovery Q&A/replies/reels, Daily Drive, Academy                                          | existing                                                                                                        | Live.                                                                                                                                                                                     |
| Content         | Experts                                                                                    | `PUT /admin/v1/experts`, `…/session-types`, `POST …/slots`, `POST /admin/v1/expert-bookings/{id}/confirm`       | New. Write-only: the server has no admin list/read for experts; confirm does not verify payment server-side.                                                                              |
| Safety          | Incidents (break-glass dual control)                                                       | existing                                                                                                        | A pending grant is polled every 5 s. The incident list itself cannot poll: each read consumes a single-use grant (needs a PII-free incident feed on the server for true live monitoring). |
| Finance         | Payments, Settlements                                                                      | existing                                                                                                        | Settlements shows recent clawbacks/payouts from the audit log (no list endpoints exist).                                                                                                  |
| Users           | Customers                                                                                  | existing                                                                                                        | Live. Role grant/revoke has no server route.                                                                                                                                              |
| Audit           | Activity log                                                                               | `GET /admin/v1/audit-events`                                                                                    | Live.                                                                                                                                                                                     |

Out of scope: QR Partner business workflows (`/v1/partner/*` inventory/wallet/attach/payouts).

## Verification

```
pnpm install
pnpm turbo run build --filter='./packages/*'
pnpm --filter @autolokate/admin typecheck
pnpm --filter @autolokate/admin lint
pnpm --filter @autolokate/admin test:hermetic   # Playwright, stubbed API, no credentials
pnpm --filter @autolokate/admin build
```

Local dev: copy `apps/admin/.env.example` to `.env.development`. The local-dev guard refuses staging/prod hosts.
