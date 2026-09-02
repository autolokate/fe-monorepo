# Consumer App — Final Hardening Report (Sprint 3)

**Date:** 2026-06-17  
**Scope:** `@autolokate/qr` production hardening — design-system compliance, dead-code removal, lint/build zero-warning target  
**Verify:** `pnpm --filter @autolokate/qr lint && pnpm --filter @autolokate/qr build`

---

## Summary

Sprint 3 completes production hardening for the consumer onboarding app. All interactive UI on promoted screens now uses `@autolokate/ui` / `@autolokate/icons` / `@autolokate/design-system`. Orphan journey routes, unused exports, and stale shells were removed. ESLint went from **21 errors → 0**; TypeScript and Vite production build pass cleanly.

---

## Files Removed

| Path                                                                   | Reason                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/qr/src/journey/screens/HomeScreen.tsx`                           | Orphan — `/journey/home` redirects to flow entry |
| `apps/qr/src/journey/screens/EmergencyPlaceholderScreen.tsx`           | Orphan — emergency routes fully implemented      |
| `apps/qr/src/journey/screens/ActivationPlaceholderScreen.tsx`          | Orphan — prepaid/b2b2c have real route trees     |
| `apps/qr/src/journey/routes/QrScanRoute.tsx`                           | Never mounted in `JourneyRoutes`                 |
| `apps/qr/src/features/shared-auth/auth-flow/AuthFlowApp.tsx`           | Dead standalone auth runtime                     |
| `apps/qr/src/features/shared-auth/auth-flow/AuthCompletedView.tsx`     | AuthFlowApp-only                                 |
| `apps/qr/src/features/shared-auth/auth-flow/SharedAuthSegment.tsx`     | Zero consumers                                   |
| `apps/qr/src/features/shared-auth/auth-flow/auth-flow.css`             | AuthFlowApp-only styles                          |
| `apps/qr/src/components/onboarding-step-shell/OnboardingStepShell.tsx` | Superseded by `FlowStepShell`; zero consumers    |
| `apps/qr/src/components/onboarding-step-shell/index.ts`                | Barrel for removed shell                         |
| `apps/qr/src/components/purchase-step-shell/PurchaseStepShell.tsx`     | Superseded by `FlowStepShell`; zero consumers    |
| `apps/qr/src/components/purchase-step-shell/index.ts`                  | Barrel for removed shell                         |
| `apps/qr/src/components/purchase-step-shell/purchase-step-shell.css`   | Orphan CSS after shell removal                   |

**Runtime routes removed from `PurchaseRoutes`:** `p01-plan-selection` … `p06-payment-success` (P01–P06 legacy dev graph). P01–P06 **screen files retained** for `?dev=1` preview only.

---

## Components Promoted

| Screen / composition     | Before                                     | After                                                                               |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| **A3VehicleOwnerScreen** | Raw `<input class="ob-auth-name-field">`   | `AlTextField` from `@autolokate/ui` with Figma-aligned `.ob-auth-name-field` chrome |
| **InlineConsentBlock**   | Raw `<input type="checkbox">` + custom box | `AlCheckbox` from `@autolokate/ui`; legal copy remains adjacent with link buttons   |
| **QrScanScreen**         | Deprecated `AuthStepShell` `step` prop     | `progressConfig` from route registry pattern                                        |

**Existing DS usage confirmed (no change required):** A1 mobile (`AlTextField`), emergency mobile fields, purchase shells (`AlButton`, `AlHeading`, `AlPlanCard`, etc.), all icons via `@autolokate/icons`, theme via `@autolokate/design-system/theme.css`.

**Deferred (dev-only / low traffic):** `PromoCodeField` still uses styled native inputs — candidate for a future `AlTextField` + `AlButton` pass.

---

## Warnings Fixed

### ESLint (21 → 0)

| Area                                            | Fix                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `AuthStepShell`                                 | Removed deprecated `step` prop; internal fallback constant                      |
| `QrScanScreen`                                  | Uses `progressConfig` instead of deprecated `step`                              |
| `EmergencyContactRow`                           | Removed non-null assertions in `getInitials`                                    |
| `PurchaseRoutes` R04 fetch                      | `AbortController` instead of `cancelled` flag (fixes always-falsy lint)         |
| `PurchaseRoutes` R07                            | Removed unnecessary type assertion on rider count                               |
| `EmergencyRoutes`                               | Guarded rider mobile / contact draft before use; removed `!` and redundant `?.` |
| `activation-routing` / `JourneySharedAuthRoute` | Removed unreachable flow branches after type narrowing                          |
| `JourneyRouteGuards`                            | Removed unused `journeyPaths` import and `session` destructure                  |
| `JourneyRoutes`                                 | Removed unused `authJourneyPaths` import                                        |
| `purchase-plans`                                | Safe fallback without non-null assertion                                        |
| `purchase-pricing`                              | `String(riderCount)` in template literal                                        |
| `R05ConfirmVehicleScreen`                       | Removed unused `AlVehicleRcField` import                                        |
| `ScreenDevApp`                                  | Removed unused `isPurchase`; discriminated union for phase-A dev screens        |
| `progress/index.ts`                             | Removed deprecated `CONSUMER_ONBOARDING_PROGRESS_TOTAL` export                  |

### TypeScript

- `tsc -p tsconfig.json` — **pass** (0 errors)

### React

- App mounts under `StrictMode` (`main.tsx`) — double-invoke checks enabled in dev
- No deprecated prop usage on `AuthStepShell` in production paths

---

## Console Audit

| Check                  | Result                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| ESLint                 | **0 errors, 0 warnings**                                                                                 |
| TypeScript `--noEmit`  | **Pass** (via build `tsc`)                                                                               |
| Vite production build  | **Pass** — no compile warnings                                                                           |
| Runtime entry          | `JourneyOrchestrator` (default) / `ScreenDevApp` (`?dev=1`)                                              |
| Legacy redirects       | `/journey/home`, `/journey/qr-scan`, `/journey/purchase/qr-scan` → active paths (no orphan screen mount) |
| Unmounted QrScan route | Removed `QrScanRoute.tsx` — no dead router branch                                                        |
| StrictMode             | Enabled — surfaces unsafe side effects in dev                                                            |

**Manual smoke (recommended):** Open `/journey/flow-hub` → purchase flow R03–R10 → emergency E0–E5 at 375px light/dark; confirm zero console errors/warnings in DevTools.

---

## Performance Notes

| Metric              | Value (post-hardening build) |
| ------------------- | ---------------------------- |
| JS bundle           | 411 KB (120 KB gzip)         |
| CSS bundle          | 99 KB (14 KB gzip)           |
| Build time          | ~750 ms (Vite)               |
| Modules transformed | 408                          |

**Impact of cleanup:**

- **~125 lines removed** from `PurchaseRoutes.tsx` (P01–P06 route handlers + imports)
- Orphan shell/components deleted — smaller dev graph, fewer duplicate layout paths
- `purchaseFlowRoutes` catalog emptied — route catalog no longer duplicates legacy P-paths
- R04 Vahan fetch uses `AbortController` — cancels in-flight fetch on unmount (prevents stale navigations)

**Files still >100 lines (acceptable — route orchestrators):**

| File                  | Lines (approx.) | Notes                            |
| --------------------- | --------------- | -------------------------------- |
| `PurchaseRoutes.tsx`  | ~805            | Active R03–R10c journey          |
| `EmergencyRoutes.tsx` | ~752            | E0–E5 + legacy redirect          |
| `ScreenDevApp.tsx`    | ~1040           | Dev catalog only (`?dev=1`)      |
| `routes.schema.ts`    | ~560            | Route registry (trimmed P01–P06) |

---

## Export / Catalog Cleanup

- **`apps/qr/src/index.ts`:** Removed `AuthFlowApp`, `OnboardingStepShell`, `PurchaseStepShell`, P01–P06 screen exports
- **`features/qr-purchase/screens/index.ts`:** Production barrel exports R03–R10c only
- **`components/compositions/index.ts`:** Removed unused `compositionInventory` / `corePromotionCandidates` barrel exports (types retained)
- **`journey/purchase/purchase-routing.ts`:** Removed legacy `p01`–`p06` path constants
- **`router/routes.schema.ts`:** Removed journey P01–P06 catalog entries; `purchaseFlowRoutes` = `[]`

---

## Verification Commands

```bash
pnpm --filter @autolokate/qr lint
pnpm --filter @autolokate/qr build
```

Both pass as of this report.

---

## Sign-off

| Criterion                                                             | Status |
| --------------------------------------------------------------------- | ------ |
| UI from `@autolokate/ui` / icons / design-system on promoted surfaces | ✅     |
| Dead code & orphan routes removed                                     | ✅     |
| ESLint zero errors                                                    | ✅     |
| TypeScript clean                                                      | ✅     |
| Production build clean                                                | ✅     |
| `CONSUMER_APP_FINAL_HARDENING_REPORT.md`                              | ✅     |

**Sprint 3 — Design System and Code Health: complete.**
