# Engineering Hardening Report

**Date:** 2026-06-17  
**Scope:** Full monorepo engineering-quality pass (Phases 1–9)  
**Constraint:** No changes to flow order, business rules, session/provider architecture, route graph, or Figma UI

---

## Executive Summary

| Check | Before | After |
|-------|--------|-------|
| `pnpm run lint` (monorepo) | **31 errors** (onboarding) | **0 errors** |
| `tsc --noEmit` (all packages) | 0 errors | 0 errors |
| `pnpm run build` (onboarding) | Pass | Pass |
| `console.log/warn/error` in `src/` | 2 intentional | 2 intentional |
| `@ts-ignore` / `any` in TS source | 0 | 0 |

**Verdict:** Engineering quality improved; lint blockers removed. Release still gated on real-device evidence (see `FINAL_SANITY_REPORT.md`).

---

## Phase 1 — Repository Audit

### Monorepo layout

| Path | Role | Status |
|------|------|--------|
| `apps/onboarding/` | Production PWA + journey | Active |
| `apps/ui-preview/` | Component preview | Active |
| `packages/ui/` | Shared UI primitives | Active |
| `packages/icons/` | Icon set | Active |
| `packages/design-system/` | Tokens | Active |
| `packages/brand/` | Brand assets | Active |
| `docs/` | Active docs (10 files after cleanup) | Consolidated |
| `docs/archive/` | Historical reports (231+ files) | Archive |
| `apps/onboarding/scripts/` | 8 maintenance scripts | Active |

### Dead / orphan inventory (documented, not removed — by constraint)

| Item | Location | Evidence |
|------|----------|----------|
| Legacy P01–P06 purchase screens | `steps.config.ts` lines 57–94 marked `@deprecated` | Not mounted in `JourneyRoutes.tsx` |
| `purchase-activation/` feature folder | `features/purchase-activation/screens/r01–r06` | Orphan screens; active purchase uses `qr-purchase/` |
| Deleted iOS contact fallback | `ios-contact-pick-sheet/` | Glob search returns 0 files; no imports of `IosContactPickSheet` |
| R14 / R15 routes | `routes.schema.ts` | Catalog-only; commented deprecated in PROJECT_STATUS |

### Scripts

All 8 scripts under `apps/onboarding/scripts/` are referenced by package workflows or doc regeneration (`visual-truth-capture.mjs`, `deploy-vercel.sh`, etc.). None are orphaned.

### Assets

| Asset | Size | Usage |
|-------|------|-------|
| `sos-emergency-alarm-*.wav` | 3,528 KB | Imported by SOS hold flow |
| `al-logo-figma-dark-*.png` | 9 KB | Brand |
| `docs/visual-truth/**/*.png` | 61 files | Visual evidence samples (not bundled) |

---

## Phase 2 — React Architecture

See `REACT_ARCHITECTURE_SIGNOFF.md` for detail.

**Large route files (justified — route-as-composition pattern):**

| File | Lines |
|------|------:|
| `EmergencyRoutes.tsx` | 918 |
| `PurchaseRoutes.tsx` | 861 |
| `pwa-sos-routes.tsx` | 749 |
| `pwa-park-me-routes.tsx` | 605 |

**Provider tree (verified in code):**

```
JourneyOrchestrator
└── AutolokateRootProvider
    ├── JourneyProvider
    └── PwaScanProvider
        └── Routes (/pwa/scan/* | /journey/*)
```

PWA uses separate `PwaScanContext` storage (`al-pwa-scan-v1`) but shares root `JourneyProvider` shell — docs previously stated "no JourneyProvider" for PWA; corrected in `PROJECT_STATUS.md`.

---

## Phase 3 — TypeScript

See `TYPESCRIPT_SIGNOFF.md`. All packages pass `tsc --noEmit`.

**Fixes applied this pass:**

- `JourneyCompletedScreen.tsx` — removed deprecated `session.plate` fallback
- `parse-qr-url.ts` — removed unused import, non-null assertions, unnecessary conditional
- `flow-entry-registry.ts` — replaced `!` with explicit throw

---

## Phase 4 — Console Audit

Grep across `apps/onboarding/src` and `packages/`:

| File | Call | Classification |
|------|------|----------------|
| `PwaScanErrorBoundary.tsx:33` | `console.error('[pwa-scan-error-boundary]', …)` | Intentional error boundary telemetry |
| `pwa-photo-diagnostics.ts:28` | `console.info('[pwa-photo]', …)` | Intentional diagnostics wrapper (dev/support) |

**Target met:** 0 stray `console.log` / `console.warn` in application source.

---

## Phase 5 — Performance

See `PERFORMANCE_SIGNOFF.md`.

Production build (2026-06-17):

- `index-*.js`: **1,107 KB** (282 KB gzip) — Rollup chunk warning
- `index-*.css`: 167 KB (23 KB gzip)
- SOS wav: **3,528 KB** — largest static asset

---

## Phase 6 — Import Architecture

| Pattern | Count (onboarding `src/`) |
|---------|---------------------------|
| `@/` alias imports | ~60 files |
| Relative `../` imports | ~120 files (typical for co-located routes) |
| `../../../../` deep imports | **0** |
| `../../../` to platform/pwa | **5 files** (PWA routes → `platform/` / `pwa/`) |

No circular import tooling run; manual inspection of provider graph shows acyclic: `platform/` → `journey/` + `features/` only.

---

## Phase 7 — Component Ownership

UI primitives consumed from `@autolokate/ui` across 40+ onboarding files (`AlButton`, `AlTextField`, `AlOtp`, `AlChip`, etc.). No duplicate button/input/OTP implementations found in `apps/onboarding/src` (grep for local `function Button` / duplicate OTP components: 0).

App-level compositions (`EmergencyContactRow`, `InlineConsentBlock`, `AuthStepShell`) wrap `@autolokate/ui` — correct ownership boundary.

---

## Phase 8 — Flow Regression (code-level)

| Flow | Entry | Verified wiring |
|------|-------|-----------------|
| Purchase QR | `/journey?type=purchase&token=…` | `FlowEntryScreen` → `parseQrFromSearchParams` → `dispatchQrPayload` |
| Prepaid | `?type=prepaid&voucherId=…` | Same dispatcher |
| B2B2C | `?type=b2b2c&partnerId=…&variant=…` | Same dispatcher |
| Post-activation | `?type=activated&vehicleId=…&plate=…` | PWA `/pwa/scan` + shared QR parser |
| Rider skip | R0 confirmation sheet | `riderSkipped: true` → `setPhase('completed')` → `/journey/completed` (`EmergencyRoutes.tsx`) |
| iOS contacts | E0 | `shouldShowAddFromContactsCTA()` → false on iOS (`device-contact-picker.ts`) |
| Purchase → Emergency | R10 success | `getPurchasePostPaymentEmergencyPath()` → `contacts-empty` |

**Not verified this pass:** runtime behaviour on physical devices (see `REAL_DEVICE_EVIDENCE_REPORT.md`).

---

## Phase 9 — Documentation Cleanup

- **46 sprint reports** moved from `docs/` → `docs/archive/sprint-reports-2026-06-17/`
- **10 active docs** remain at `docs/` root (see `memory/MEMORY.md`)
- Updated: `MEMORY.md`, `PROJECT_STATUS.md`, `CLAUDE_PROJECT_INDEX.md`

---

## Code Changes (This Pass)

| File | Change |
|------|--------|
| `EmergencyRoutes.tsx` | Remove unused `selectedFlow` destructure |
| `JourneyCompletedScreen.tsx` | Use `session.vehicle?.plate` only |
| `emergency-limits.ts` | Remove redundant `Boolean()` cast |
| `parse-qr-url.ts` | Lint-safe QR param parsing |
| `flow-entry-registry.ts` | Explicit throw vs non-null assertion |
| `generate-visual-truth-matrix.mjs` | Remove dead regression helpers |
| `visual-truth-analyze.mjs` | Remove unused import |
| `eslint.config.js` | Browser globals for Playwright scripts |

---

## Remaining Gaps (P2 / out of scope)

1. Real-device QA matrix — no screenshots attached
2. Main JS bundle > 500 KB — no code-splitting applied (constraint: no route graph changes)
3. SOS alarm wav 3.5 MB — compression deferred
4. Orphan `purchase-activation/` screens — catalog retention only
5. Route guard gaps documented in `FINAL_PRODUCTION_READINESS.md` — unchanged by constraint
