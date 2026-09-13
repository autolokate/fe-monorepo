# Autolokate Platform Architecture Audit and Migration Plan

**Date:** 2026-08-30  
**Scope:** Phase 1 repository audit and Phase 2 proposal only  
**Status:** Reviewed; M0 foundation completed (see `MILESTONE_M0_FOUNDATION_REPORT_2026-08-30.md`)

## Executive verdict

The repository is not a blank-slate redesign candidate. It already contains broad public-site, QR/PWA, admin, and design-system implementations, and the QR app has substantial journey, offline, Firebase, Razorpay, and deep-link logic worth preserving. The safest path is an incremental boundary correction and product-quality program.

The largest architectural defect is inconsistent API ownership. QR mostly follows the intended `API client -> service -> hook -> screen` flow, and admin approximates it with TanStack Query. The website instead maintains its own endpoint registry, HTTP clients, DTOs, and token/session behavior; one purchase client also hardcodes a temporary ngrok origin. This contradicts the required single source of truth and creates contract, security, and release risk.

The current repository cannot be called production-ready from this checkout. The active runtime is Node 22.19.0 rather than Node 24+, dependency state does not match the workspace manifest, the baseline lint/build pipeline aborts while pnpm attempts a non-interactive modules reinstall, admin typechecking fails against unresolved/stale package exports, and automated coverage is limited. Earlier signoff documents describe older conditions and cannot substitute for a fresh green baseline.

## Audit method and constraints

- Inspected root manifests, workspace/Turbo/TypeScript configuration, all app/package manifests, route declarations, source structure, API/auth modules, environment access, SEO files, tests, and active architecture documents.
- Preserved pre-existing changes in `apps/qr/src/platform/api/qr-api-client.ts`, `apps/ui-preview/src/preview.css`, `apps/website/next.config.ts`, and `pnpm-workspace.yaml`.
- Did not install packages, alter generated output, contact live backends, run destructive commands, or implement product changes.
- Source counts include application assets/configuration and are directional: website ~925 files, QR ~590, admin ~209, UI preview ~61, shared UI ~186.

## Baseline results

| Check                    | Result                               | Interpretation                                                                                                                                                                          |
| ------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node                     | **FAIL**: 22.19.0                    | Root requires `>=24`.                                                                                                                                                                   |
| pnpm                     | PASS: 11.10.0                        | Matches the pinned package manager.                                                                                                                                                     |
| Root `pnpm lint`         | **BLOCKED**                          | Dependency/workspace state triggered `pnpm install`, then aborted because modules removal required a TTY.                                                                               |
| Turbo lint attempt       | **BLOCKED**                          | Same install-state failure in package tasks; no valid lint result.                                                                                                                      |
| Website typecheck        | PASS                                 | Direct `tsc --noEmit` completed successfully.                                                                                                                                           |
| UI preview typecheck     | PASS                                 | Direct `tsc --noEmit` completed successfully.                                                                                                                                           |
| QR typecheck             | **BLOCKED**                          | Installed dependency graph lacks `node` and `vite/client` types for this workspace.                                                                                                     |
| Admin typecheck          | **FAIL / dependency-state affected** | Missing Playwright types and many missing exports from built `@autolokate/api-client` / `@autolokate/ui`; rebuild/install is required to separate stale-dist errors from source errors. |
| Unit tests               | **MISSING**                          | No unit-test runner or unit suites were found.                                                                                                                                          |
| E2E                      | NOT RUN                              | Two admin Playwright specs require services/credentials; one QR FID script exists.                                                                                                      |
| Production build         | **BLOCKED**                          | A trustworthy build requires Node 24 and a workspace install consistent with the current manifest.                                                                                      |
| Accessibility/Lighthouse | NOT RUN                              | No stable production build/server baseline; no automated a11y script is exposed.                                                                                                        |

Before milestone implementation, use Node 24, perform an approved frozen install, rebuild shared packages, then run `pnpm lint`, recursive typechecks, tests, and `pnpm build` in CI mode.

## Current architecture

### Workspace

- pnpm workspace and Turborepo cover 5 app directories and 10 shared packages. `apps/onboarding` is empty but still matched by `apps/*` unless excluded by current workspace edits.
- Root Turbo defines build, lint, typecheck, dev, format, and clean, but the root package lacks `typecheck` and `test` scripts. There is no unified verification command.
- Shared packages publish `dist` exports, so stale or absent builds can make app typechecks misleading. Source references/path aliases are not consistently used during development.
- Package responsibilities broadly match the requested ownership model, but actual consumers do not consistently respect it.

### Public website (`apps/website`)

Existing functionality includes marketing/home, features, how it works, products, pricing, emergency safety, cars/bikes catalogue and model pages, explore/compare, blog, media, contact, legal pages, profile, auth, booking, addresses, checkout, orders, tracking, and purchase flows.

Strengths:

- Next.js 15 App Router with route groups and server-capable public pages.
- Broad page coverage, redirects for several legacy URLs, local font optimization, error/not-found screens, and many per-page metadata modules.
- Service and hook directories already separate some domain operations from views.

Problems and risks:

- It does not depend on `@autolokate/api-client`, `@autolokate/auth`, or `@autolokate/types`.
- `src/lib/api/endpoints.ts` duplicates `packages/api-client/src/endpoints.ts`.
- `src/services/purchase/client.ts` owns refresh behavior and hardcodes `https://malisa-noninclusive-davin.ngrok-free.dev`, bypassing central environment configuration.
- Catalogue, legal, purchase, auth, booking, and other API contracts are app-local, so contract drift is likely.
- 191 of 364 TSX files declare `use client`; this is not automatically wrong, but it warrants a route-by-route server/client audit to reduce hydration and JS.
- Root metadata still says “Autolokate FE” and describes a starter stack. No `sitemap.ts` or `robots.ts` was found.
- Remote image configuration permits every HTTPS hostname, increasing SSRF/proxy and operational risk; use an audited allowlist or an explicit image proxy policy.
- Several feature components are 600–965 LOC, mixing orchestration, state, and presentation.
- No website E2E, accessibility, SEO, or performance tests were found.

### QR activation PWA (`apps/qr`)

Existing functionality includes QR/deep-link dispatch, purchase/prepaid/B2B2C flows, OTP/profile/consent, vehicle lookup, plans/promo/order/payment polling, QR attach, rider/emergency-contact UI, journey persistence/resume, PWA install/update/offline behavior, Firebase messaging, scanning, SOS, Park Me, camera/location, and legacy redirects.

Strengths:

- The intended `JourneyOrchestrator -> guards/routes -> hooks -> services -> API client` shape is already visible.
- Typed environment access, token manager integration, query-preserving redirects, session versioning, offline UI, and PWA infrastructure are reusable.
- API documentation explicitly identifies live versus mock/local behavior and idempotent purchase operations.

Problems and risks:

- There are parallel legacy and new route systems (`router/routes.schema.ts`, `journey/routes`, older feature flow folders), including an empty `purchaseFlowRoutes` registry and known orphan screens.
- Routing decisions remain spread across route components, `activation-routing.ts`, dispatch helpers, resolver modules, and large route files. Centralization is incomplete.
- `EmergencyRoutes.tsx` (1,090 LOC) and `AuthRoutes.tsx` (819 LOC) combine screen composition and transition logic; duplicate emergency route implementations also exist in submodules.
- Journey state uses Context/session storage rather than an explicit transition model with serializable events and centrally testable eligibility rules.
- TanStack Query is effectively absent, so request caching, cancellation, stable keys, and mutation coordination are bespoke.
- Active API documentation states only ~54% of relevant consumer operations are integrated, ~10% of screens use live API data, emergency contacts/media are pending, and rider APIs are missing. Those figures need reconciliation with current source/backend OpenAPI.
- Previous performance evidence reports a ~1.1 MB JS chunk and 3.5 MB SOS audio, no route-level splitting, and no measured field Core Web Vitals.
- Only one focused FID integration test is exposed; critical activation variants and payment recovery lack automated coverage.

### Admin (`apps/admin`)

Existing modules cover OTP login, dashboard, users, support, orders, subscriptions, shipments, payments, finance, promos, catalogue, inventory, QR batches, ownership transfers, audit, and incidents. Routes, permission-aware navigation, services, TanStack Query hooks, TanStack Table, React Hook Form, and Zod are present.

Strengths:

- Feature folders and service/hook separation align with the target direction.
- Central route metadata, RBAC definitions, query keys, filters, detail sheets, and sensitive incident concepts exist.
- Admin uses real typed service interfaces rather than obvious hardcoded production records.

Problems and risks:

- The app owns an `admin-api-client` fetch wrapper even though endpoint and DTO ownership is required in `@autolokate/api-client`; transport setup should be shared while app services retain orchestration.
- `packages/api-client/src/admin.ts` is 1,595 LOC and is itself a monolith. Split it by admin domain without changing the public contract.
- Current typecheck is red/inconclusive due missing Playwright packages and shared-package export mismatch; this is a release blocker until reproduced after a clean build.
- Dashboard composition appears to aggregate existing resource queries; every displayed metric must be classified as exact backend data, derived data with definition, or unavailable.
- Only two E2E specs exist, covering QR provisioning and user roles. Core auth expiry, permissions, finance, refunds, incidents, pagination, and failure states lack automation.
- Frontend permission checks are helpful UX but require a documented backend authorization matrix and audit guarantees.

### UI preview and shared packages

Strengths:

- Packages already exist for design system, UI, icons, brand, hooks, types, utilities, auth, API, and config.
- UI includes primitives and admin table/dialog foundations; design-system CSS exposes theme tokens; UI preview documents a meaningful component inventory.

Problems and risks:

- `@autolokate/hooks` and `@autolokate/utils` are very small while app-local equivalents proliferate; promotion criteria have not been applied consistently.
- `@autolokate/types` is small relative to duplicated app DTO/domain types. API DTOs should remain in API client; only stable cross-app domain concepts belong in types.
- `packages/ui/src/components/admin/DataTable.tsx` is 649 LOC and couples a shared visual package to TanStack Table behavior. Separate headless table contracts/state helpers from composable visual pieces.
- The UI preview uses a live DiceBear URL and is not a complete automated visual/accessibility contract.
- Existing docs conflict: architecture is described as “locked” and “production ready,” while the same documents disclose mock-heavy screens, route guard gaps, oversized bundles, and absent device evidence. Replace status assertions with dated evidence.

## Cross-cutting findings

### API, auth, and backend dependencies

Canonical consumer domains already represented in the shared client include auth, consent/legal, profile, devices, QR, vehicle lookup, plans, orders/payments, promos, riders, activation, and admin operations. Website-owned clients additionally cover catalogue, pricing, booking, contact, addresses, carts, purchase, and taxonomy; these must be inventoried and moved into the shared client before screen refactors.

Backend work or confirmation required:

1. Publish/version an authoritative OpenAPI spec and CI contract-diff process.
2. Confirm rider setup endpoints and entitlements.
3. Complete emergency-contact OTP/CRUD and bystander emergency contracts, including audited access and idempotency.
4. Confirm media presign/upload/complete contracts and retention/privacy rules.
5. Provide authoritative admin dashboard metrics and definitions; do not synthesize operational KPIs in the UI.
6. Confirm export endpoints, pagination semantics, sort/filter coverage, refund/cancellation states, fulfilment transitions, and ownership-transfer workflows.
7. Confirm auth cookie/token strategy across website, QR, and admin, including refresh rotation, logout, deep-link preservation, and step-up auth.
8. Confirm payment verification/webhook source of truth and safe retry/idempotency behavior.
9. Provide SEO catalogue completeness, canonical slug rules, redirects, and content freshness fields.

### Type safety and maintainability

- A text scan found 73 occurrences of `any` in TypeScript sources; each needs classification because some are prose/type utility matches, but the target is zero unsafe explicit `any`.
- No `@ts-ignore` or `@ts-nocheck` directives were found.
- At least 14 TypeScript files exceed 500 lines, including API, route, table, checkout, profile, address, and catalogue modules.
- Dead code is documented in older reports but must be proven unreachable through imports/routes/build output before removal.

### Accessibility

The shared stack uses Radix and `jsx-a11y`, which is a useful foundation, but WCAG 2.2 AA is not demonstrated. Missing evidence includes keyboard journey tests, automated axe coverage, focus restoration, live-region behavior for async state, contrast reports in both themes, 200% zoom/reflow, reduced motion, target-size checks, table semantics, and screen-reader validation. Large route components make focus and announcement behavior difficult to reason about.

### SEO

The website has useful metadata scaffolding and redirects, but lacks a complete crawl-control system. Required work includes route classification (`index`/`noindex`), `robots.ts`, `sitemap.ts`, canonical and OG defaults, structured data for organization/product/FAQ/breadcrumbs where truthful, dynamic catalogue metadata validation, semantic heading audits, and redirects based on an exported legacy URL inventory. QR, admin, auth, profile, checkout, orders, and transient pages must be explicitly non-indexable.

### Performance

No current measurements support the requested LCP/INP/CLS targets. Known risks are the QR monolithic bundle/audio asset, heavy client-component usage on the website, unrestricted remote image sources, large components, and absent bundle budgets. Performance signoff must include reproducible Lighthouse runs and preferably real-user monitoring; static review alone is insufficient.

### Security and reliability

Highest-priority issues are the website hardcoded API origin, duplicated refresh/token flows, broad image host wildcard, incomplete route guards, and mock/local behavior in safety-critical flows. Sensitive analytics/logging schemas, CSP/security headers, redaction, emergency data access, and backend RBAC need explicit verification. No secrets were intentionally printed during this audit.

## Reuse, refactor, replace

| Disposition              | Candidates                                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preserve and extend      | pnpm/Turbo layout, Next App Router, Vite apps, QR orchestrator entry, session-version migration concept, typed env modules, auth token manager, API envelope/error handling, admin feature structure, query/table/form libraries, Radix foundations, tokens/icons/brand packages, legacy redirects. |
| Refactor incrementally   | Website API/services into shared client; shared client admin monolith; QR route/state centralization; large route/components; table composition; shared query conventions; design-token coverage; docs/status evidence; package build/dev resolution.                                               |
| Replace after validation | Hardcoded purchase Axios client, duplicate website endpoint registry, mock production data paths, starter metadata, orphan/dead routes proven unreachable, unrestricted remote image wildcard, obsolete signoff claims.                                                                             |

## Target architecture

```text
apps/<app>/src/
  app/ or routes/          route composition and route metadata only
  features/<domain>/
    components/            feature presentation
    hooks/                 query/mutation and UI-facing state
    services/              application use cases and DTO mapping
    schemas/               form/input schemas
    state/                 feature state machines/reducers when needed
    types.ts, constants.ts
  platform/                app bootstrap, routing, telemetry, environment adapters

packages/api-client/src/
  core/                    transport, envelope, errors, auth middleware
  auth/ catalogue/ cart/ orders/ activation/ emergency/ admin/<domain>/
packages/auth/             tokens, refresh coordination, auth contracts/adapters
packages/types/            stable cross-app domain types only
packages/design-system/    semantic tokens, themes, motion
packages/ui/               accessible visual primitives/compositions
packages/icons/            generated icon components
packages/brand/            approved brand assets
packages/hooks/            genuinely generic React hooks
packages/utils/            framework-independent helpers
```

Allowed dependency direction:

```text
app route -> feature component -> feature hook -> feature service
           -> @autolokate/ui
feature service -> @autolokate/api-client -> @autolokate/auth
all layers -> types/design tokens/utils only when ownership applies
```

Applications must never import another application. Shared packages must not import apps. Components must not construct backend URLs, manage bearer tokens, or decode API envelopes. API client modules own paths, HTTP DTOs, and transport calls; app services own business orchestration and DTO-to-view-model mapping; hooks own caching/concurrency and UI result shapes.

Enforce these rules with ESLint restricted imports, dependency-cruiser or Madge cycle checks, package export maps, and CI contract tests.

## Proposed product maps

### Website information architecture

- **Discover:** Home, Cars, Bikes, Brands, Models, Explore, Compare.
- **Product:** QR sticker/product, Features, How it works, Emergency safety, Plans/pricing.
- **Buy:** Plan selection, authentication/verification, cart, address, review, payment, confirmation, orders/tracking.
- **Trust:** About, media, real testimonials/proof, FAQs, contact/support, grievance, privacy, terms, shipping, refunds.
- **Account:** Login/signup, profile, preferences, bookings, orders; all noindex where private.

Preserve current public slugs until search analytics and redirect inventories justify changes.

### QR deterministic state model

```text
ENTRY -> RESOLVING -> INVALID | BLOCKED | ALREADY_ACTIVE | AUTH_REQUIRED | ELIGIBLE
AUTH_REQUIRED -> MOBILE -> OTP -> PROFILE/CONSENT -> RESUME
ELIGIBLE -> PURCHASE | PREPAID | B2B | B2B2C
PURCHASE -> VEHICLE -> PLAN -> RIDERS -> SUMMARY -> PAYMENT -> VERIFYING
PREPAID/B2B/B2B2C -> PREVIEW -> REDEEM
VERIFYING/REDEEM -> ASSOCIATING -> EMERGENCY_SETUP -> ACTIVATED
any resumable state -> OFFLINE/RETRY -> prior state
```

Represent this as a versioned discriminated union plus events, a pure transition/resolver function, centralized guards, persisted non-sensitive context, and a server reconciliation step on resume. Routes become projections of state, not independent decision makers. Legacy deep links first normalize into an entry command, and authentication returns to the preserved command.

### Admin module map

- Access: OTP, session expiry, roles, step-up authentication.
- Operations: dashboard, customers, vehicles/subscriptions, orders, shipments, QR inventory/batches/allocation.
- Commercial: plans, products/SKUs, promotions, B2B/B2B2C accounts.
- Finance: payments, refunds, cancellations, reconciliation/clawbacks.
- Safety/support: tickets, ownership transfers, incidents with break-glass access.
- Governance: audit events, exports, permission matrix, administrative activity.

Each module owns route, service, query keys/hooks, table/form schemas, permissions, and tests. Cross-module dashboard cards consume backend metric endpoints or explicitly defined derived selectors.

## Design-system specification and component inventory

Define primitive scales for color, typography, space, size, radius, shadow, breakpoint, z-index, and duration/easing; expose semantic aliases such as `surface`, `content`, `border`, `action`, `feedback`, and `focus` for light/dark themes. Avoid app-specific meaning in primitive tokens.

Required documented inventory:

- Inputs: text, phone, OTP, select, checkbox, radio, switch, search, date, file/photo, field/help/error.
- Actions: button, icon button, link, split/destructive action.
- Feedback: spinner, skeleton, progress, toast, inline alert, empty/error/offline/retry/success states.
- Containers: card, section, sheet/dialog, popover/menu, tabs, accordion, stepper.
- Navigation: website header/footer/breadcrumbs, admin sidebar/top bar, QR mobile step chrome/bottom action.
- Data: table, filters, pagination, sort, bulk selection, status badge, detail list, export state.
- Domain compositions remain app-owned until proven useful across at least two apps.

Every preview example must cover themes, keyboard/focus, disabled/loading/error states, narrow/wide layouts, reduced motion, and automated accessibility assertions.

## Data-fetching conventions

- One configured API transport per runtime, injected with environment and auth adapters.
- Stable query-key factories colocated with each feature domain.
- Pass `AbortSignal` from TanStack Query through service to API client.
- Explicit stale/cache policies by volatility; never use one global default blindly.
- Mutations define idempotency, optimistic behavior only when reversible, invalidation/update rules, and duplicate-submit protection.
- Next public pages prefer server fetch/cache/revalidation; interactive islands use client queries only when necessary.
- Normalize API errors once, map them to domain errors in services, and render consistent user-safe messages in components.
- Never silently fall back to fake production data. Development fixtures must be gated and visibly labelled.

## Quality strategy and budgets

- **Unit:** transition resolvers, guards, mappers, schemas, query keys, error handling, reducers, formatters.
- **Component:** forms, dialogs, tables, empty/error/loading states, keyboard navigation, themes.
- **Contract:** generated/OpenAPI DTO compatibility and endpoint snapshots.
- **Integration:** service + mocked transport, auth refresh queue, resume/offline/payment reconciliation.
- **E2E:** public discovery/purchase; all QR variants and invalid states; OTP; payment success/failure/cancel/retry; resume; admin RBAC and sensitive actions.
- **Visual/a11y:** Playwright snapshots at 320/375/768/1024/1440, axe, keyboard scripts, reduced motion, zoom/reflow.
- **Performance:** public p75 LCP <=2.5s, INP <=200ms, CLS <=0.1; per-route JS and image budgets set after the first measured baseline. Initial guardrails: no unapproved >250 KB first-party route JS gzip, no eager multi-megabyte media, and CI regression thresholds of 10%.

## Incremental migration milestones

Each milestone begins with a clean baseline and ends with typecheck, lint, relevant tests, production builds, and documented evidence.

### M0 — Reproducible foundation

Use Node 24, reconcile the workspace/install without overwriting user changes, remove or formally exclude the empty onboarding app, add root `typecheck`, `test`, and `verify` scripts, fix package build resolution, and establish CI artifacts. Acceptance: all current workspaces build/lint/typecheck or every remaining pre-existing failure has an owner and approved waiver.

### M1 — Contract and boundary consolidation

Inventory every endpoint, move website/admin endpoint definitions and DTOs into domain modules in `@autolokate/api-client`, centralize auth/refresh behavior, remove the hardcoded purchase origin, and add boundary/cycle linting. Preserve UI and routes. Acceptance: no app-level backend endpoint constants or direct transport calls outside platform adapters/tests.

### M2 — Design foundations

Audit tokens and components, define semantic themes/responsive/accessibility rules, split oversized shared components, and make UI preview the living contract with a11y/visual tests. Acceptance: agreed tokens/inventory and migrated foundations with no arbitrary new values.

### M3 — Website shell, SEO, and performance

Correct metadata defaults, add crawl controls/sitemap/canonicals/structured data, classify routes, establish server-first fetching and measured budgets, then migrate global navigation/footer/error states. Acceptance: SEO validation, no private indexing, preserved redirects, measured Lighthouse baseline.

### M4 — Website domain slices

Migrate in vertical slices: home/product/trust; catalogue/discovery/compare; auth/profile; booking; purchase/orders. Each slice uses shared contracts and maintains existing URLs. Acceptance: real-data behavior and E2E coverage for each released slice.

### M5 — QR state and routing foundation

Create the versioned state/event model, pure resolver, central guards, route adapter, analytics schema, and persistence migration while maintaining legacy deep links. Run old and new resolution in shadow tests before switching. Acceptance: exhaustive transition tests and manual URL skipping prevented.

### M6 — QR flow slices

Migrate auth, purchase/payment, prepaid, B2B/B2B2C, rider/emergency contacts, confirmation, and post-activation PWA one flow at a time. Add offline/retry/resume tests and lazy route boundaries; optimize SOS audio. Acceptance: every backend-supported variant passes E2E, missing APIs render honest unavailable states.

### M7 — Admin operational slices

Stabilize auth/RBAC shell, then customer/vehicle/subscription, QR inventory, catalogue/promos/B2B, orders/fulfilment, finance, support/safety, and audit. Acceptance: real APIs only, backend permission verification, pagination/filter/export tests, confirmation/step-up for sensitive actions.

### M8 — Production hardening and cleanup

Remove only proven dead paths, add monitoring/redaction/CSP, complete browser/device/a11y/performance matrices, validate redirects and service-worker upgrade behavior, and publish deployment/runbook evidence. Acceptance: green CI, measured targets or explicit launch blockers, rollback plans, and no unresolved P0/P1 defects.

## Key risks and mitigations

| Risk                                                        | Mitigation                                                                                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Existing “locked” QR decisions conflict with redesign goals | Treat them as compatibility constraints; change only through an ADR, transition tests, storage migration, and rollback plan. |
| Backend gaps block honest UI                                | Use typed capability interfaces and explicit unavailable states; never ship fixtures as production data.                     |
| API consolidation breaks three apps                         | Migrate one domain at a time behind compatibility exports and contract tests.                                                |
| Stale `dist` hides source truth                             | Fix M0 project references/build order before judging TypeScript health.                                                      |
| Deep links/session upgrades strand users                    | Normalize legacy entries and version/migrate persisted state with server reconciliation.                                     |
| SEO redesign loses rankings                                 | Freeze route inventory, export redirects, monitor 404/canonical/index coverage, and release incrementally.                   |
| Safety/payment regressions                                  | Require idempotency, backend source-of-truth reconciliation, E2E failure-path coverage, and guarded rollout.                 |
| Visual rewrite grows client JS                              | Establish route budgets and server/client boundaries before screen work.                                                     |

## Decision requests before implementation

1. Approve M0 as the next milestone and provide/confirm the supported Node 24 toolchain and dependency-install policy.
2. Confirm the authoritative backend OpenAPI source and whether the checked-in API client or live spec wins on conflicts.
3. Confirm which existing QR “locked” behavior is contractual versus historical design guidance.
4. Provide production domains, indexing policy, analytics/RUM provider, and target browser/device matrix.
5. Assign backend owners for rider, emergency, media, admin metrics, and authorization gaps.

No broad implementation should begin until these decisions and the M0 baseline are reviewed.
