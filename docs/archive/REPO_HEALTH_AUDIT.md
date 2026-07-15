# Repository Health Audit

**Date:** 2026-06-19  
**Scope:** Orphan routes, dead components, duplicate code, unused exports, deprecated screens, promotion candidates  
**Method:** Read-only audit — no code modified  
**References:** `PURCHASE_FINAL_SIGNOFF.md` §6, `CONSUMER_APP_FINAL_SIGNOFF.md`, memory files, direct source reads

---

## Executive Summary

| Category                                                  | Count          | Highest risk |
| --------------------------------------------------------- | -------------- | ------------ |
| Orphan screens (not in active routes)                     | 12 screen dirs | Medium       |
| Dead components (not imported anywhere active)            | 4              | Medium       |
| CSS hygiene issues (hardcoded colors)                     | 1 file         | Medium       |
| Unused / deprecated route configs                         | 6 step IDs     | Low          |
| Unused route paths (sequence gap only)                    | 6              | Low          |
| Promotion candidates (local components used in 2+ routes) | 2              | Low          |
| Duplicate components                                      | 0              | —            |
| Duplicate icons                                           | 0              | —            |
| Stale session fields                                      | 0              | —            |
| Stale feature registry                                    | 0              | —            |

No **High** risk items found. Codebase is structurally sound. Issues below are cleanup / maintenance debt.

---

## 1. Orphan Screens (not in active route graph)

### 1.1 P01–P06 Legacy Purchase Screens

**Risk: Medium**  
**Action: Safe to delete (or keep for dev catalog only — explicit decision required)**

| Screen                 | Directory                                              | Status                                                    |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| P01 Plan selection     | `features/qr-purchase/screens/p01-plan-selection/`     | Orphan — imported by ScreenDevApp only                    |
| P02 Plan details       | `features/qr-purchase/screens/p02-plan-details/`       | Orphan                                                    |
| P03 Rider selection    | `features/qr-purchase/screens/p03-rider-selection/`    | Orphan                                                    |
| P04 Checkout summary   | `features/qr-purchase/screens/p04-checkout-summary/`   | Orphan                                                    |
| P05 Payment processing | `features/qr-purchase/screens/p05-payment-processing/` | Orphan                                                    |
| P06 Payment success    | `features/qr-purchase/screens/p06-payment-success/`    | Orphan — `P06Route.onContinue` wires to emergency (stale) |

These are the Phase 5 legacy purchase screens, superseded by the current R03–R10 route series. They appear in the dev catalog (`ScreenDevApp.tsx` "Purchase (Phase 5 legacy)" section) and in `P01Route`–`P06Route` in `PurchaseRoutes.tsx` but are not part of the active flow.

**Why Medium:** The `P06Route` references `setPhase('emergency')` which is a stale cross-flow reference. If any user accesses `/journey/purchase/p06-payment-success` directly, they reach an orphan screen with a wired emergency handoff.

**Recommendation:** Explicitly decide: (a) archive and remove from `PurchaseRoutes.tsx`, or (b) document the dev-only intent formally. Do not leave mounted without explicit decision.

---

### 1.2 R14 Permissions + R15 Activation Complete Screens

**Risk: Low**  
**Action: Needs cleanup decision — routes should be removed or clearly guarded**

| Screen                  | Directory                                               | Status                                             |
| ----------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| R14 Permissions         | `features/qr-purchase/screens/r14-permissions/`         | Archived — `R14Route` redirects to R10 immediately |
| R15 Activation complete | `features/qr-purchase/screens/r15-activation-complete/` | Archived — `R15Route` redirects to R10 immediately |

R14 and R15 are **architecturally archived** (per project-known-decisions.md). Their route components exist and redirect to R10, and their screen components exist in the dev catalog. The screen code is unreachable via any navigation path.

**Why Low:** Intent is clear and documented. Component code itself is not harmful. The redirect routes prevent any accidental rendering.

**Recommendation:** The redirect routes (`R14Route`, `R15Route`) in `PurchaseRoutes.tsx` can be removed — there is no URL that a user would legitimately visit that expects them. The screen directories can remain for the dev catalog, or be moved to an `archived/` subdirectory within the feature.

---

### 1.3 Legacy Purchase-Activation Screens (R01, R02, R05, R06)

**Risk: Low**  
**Action: Safe to delete when dev catalog is cleaned**

| Screen                     | Feature                         | Status                        |
| -------------------------- | ------------------------------- | ----------------------------- |
| R01 Vehicle number (old)   | `features/purchase-activation/` | Deprecated — dev catalog only |
| R02 Vehicle details (old)  | `features/purchase-activation/` | Deprecated                    |
| R05 Account creation (old) | `features/purchase-activation/` | Deprecated                    |
| R06 Legal consent (old)    | `features/purchase-activation/` | Deprecated                    |

These are the pre-shared-auth vehicle entry screens, replaced by the current A1–A3 auth flow plus R03 vehicle screen. Explicitly marked `@deprecated` in `shared-auth/screens/index.ts`.

**Recommendation:** Safe to delete entire `features/purchase-activation/` feature directory after confirming no active imports.

---

### 1.4 Journey Orphan Screens

**Risk: Low**  
**Action: Needs cleanup decision**

| Component                     | File                                              | Status                                                                 |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| `HomeScreen`                  | `journey/screens/HomeScreen.tsx`                  | Orphan — `/journey/home` redirects to `/journey`; screen never renders |
| `EmergencyPlaceholderScreen`  | `journey/screens/EmergencyPlaceholderScreen.tsx`  | Unmounted — no active route uses it                                    |
| `QrScanRoute`                 | `journey/routes/QrScanRoute.tsx`                  | Unmounted — not referenced in `JourneyRoutes.tsx`                      |
| `ActivationPlaceholderScreen` | `journey/screens/ActivationPlaceholderScreen.tsx` | Active for Prepaid/B2B2C only — not a true orphan                      |

**Note:** `ActivationPlaceholderScreen` is legitimately in use — it renders for Prepaid and B2B2C flows and is not an orphan.

---

## 2. Dead Components

### 2.1 Auth Legacy Dead Code

**Risk: Medium**  
**Action: Safe to delete**

| Component           | File                                                   | Status                                 |
| ------------------- | ------------------------------------------------------ | -------------------------------------- |
| `AuthFlowApp`       | `features/shared-auth/auth-flow/AuthFlowApp.tsx`       | Dead — not mounted in `main.tsx`       |
| `AuthCompletedView` | `features/shared-auth/auth-flow/AuthCompletedView.tsx` | Dead — only used by dead `AuthFlowApp` |
| `SharedAuthSegment` | `features/shared-auth/auth-flow/SharedAuthSegment.tsx` | Dead — no active imports               |

These are the pre-JourneyProvider auth components from before the auth flow was integrated into the journey. The current auth flow is `AuthRoutes.tsx` → `JourneySharedAuthRoute.tsx`.

The dead export surface (`onboarding/src/index.ts` exports `AuthFlowApp`) should also be removed.

**Why Medium:** Live exports of dead components create a misleading public API surface for the package.

---

### 2.2 purchase-step-shell

**Risk: Low**  
**Action: Safe to delete**

| Component           | File                                      | Status                             |
| ------------------- | ----------------------------------------- | ---------------------------------- |
| `PurchaseStepShell` | `journey/components/purchase-step-shell/` | Zero consumers — no active imports |

This shell component was superseded when purchase screens adopted the standard `AlScreenBg` + layout pattern. The directory exists but no file in the active codebase imports it.

---

## 3. CSS Hygiene

### 3.1 Hardcoded Colors in PWA Emergency Screen

**Risk: Medium**  
**Action: Needs cleanup — replace with design system tokens**

| File                                                               | Lines               | Issue                                                                                                   |
| ------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `features/post-activation-pwa/components/pwa-emergency-screen.css` | ~29, 33, 43, 45, 50 | Hardcoded hex colors (`#4a4a4a`, `#0a0a0a`, `#1a1a1a`, `#ffffff`) instead of `var(--al-color-*)` tokens |

All other feature CSS correctly uses `var(--al-color-*)` and `var(--al-space-*)`. This file breaks design system consistency and will cause theming issues in light/dark mode.

**Recommendation:** Replace each hardcoded value with the appropriate design system token. This is a visual refinement task that does not affect routing or business logic.

---

## 4. Unused Exports / Route Configs

### 4.1 purchaseStepPathSequence Gaps (by design)

**Risk: Low — documented, no action needed**

The following paths exist in `purchaseJourneyPaths` but are intentionally **not** in `purchaseStepPathSequence` (which only lists the primary happy path for step-counter UI):

- `r04bFetchFailed` — error branch
- `r08bPromoApplied` — promo branch
- `r08cInvalidPromo` — promo error branch
- `r09bStillConfirming` — payment long-confirm branch
- `r10bPaymentFailed` — payment fail branch
- `r10cPaymentUnconfirmed` — payment unconfirmed branch

All six are actively mounted in `PurchaseRoutes.tsx`. The sequence gap is intentional — progress indicators show the primary path only.

**Note from PURCHASE_FINAL_SIGNOFF.md §1.3:** The helpers are described as "misleading only" — consider adding a comment in `purchase-routing.ts` to make the intention explicit.

---

### 4.2 Stale Step IDs in steps.config.ts

**Risk: Low — explicitly annotated**

| Step ID                             | Notes                                          |
| ----------------------------------- | ---------------------------------------------- |
| `purchase.qr-scan`                  | `@deprecated` — kept for orphan routes catalog |
| `purchase.plan-select` (P01)        | `@deprecated` — kept for catalog               |
| `purchase.plan-details` (P02)       | `@deprecated` — kept for catalog               |
| `purchase.rider-select` (P03)       | `@deprecated` — kept for catalog               |
| `purchase.checkout-summary` (P04)   | `@deprecated` — kept for catalog               |
| `purchase.payment-processing` (P05) | `@deprecated` — kept for catalog               |

These are explicitly annotated as deprecated in the source file. No action required unless the dev catalog is cleaned.

---

### 4.3 Splash Route Redirect

**Risk: Low — intentional**

`authJourneyPaths.splash` is defined in `auth-routing.ts` and immediately redirects to `mobile` in `AuthRoutes.tsx`. This is a backward-compatibility redirect for a screen that no longer exists. No action needed unless the path constant is cleaned up.

---

## 5. Promotion Candidates

### 5.1 PwaHeaderBrand

**Risk: Low**  
**Action: Consider promotion to @autolokate/ui**

| Component        | Current location                                             | Used in                                 |
| ---------------- | ------------------------------------------------------------ | --------------------------------------- |
| `PwaHeaderBrand` | `features/post-activation-pwa/components/PwaHeaderBrand.tsx` | `PwaScanShell.tsx` (all 30 PWA screens) |

This component renders the Autolokate wordmark header for every PWA screen. It is currently local to the feature. If any future flow needs the same header treatment, it should be promoted.

**Note:** Single feature use currently — does not trigger the 2+ usage promotion rule. Flag for promotion when used in a second context.

---

### 5.2 PwaVerifyShell

**Risk: Low**  
**Action: Consider promotion to @autolokate/ui**

| Component        | Current location                                             | Used in                                                                                               |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `PwaVerifyShell` | `features/post-activation-pwa/components/PwaVerifyShell.tsx` | `PwaVerifyMobileRoute`, `PwaVerifyOtpRoute`, `PwaVerifyNameRoute` (3 routes in pwa-shared-routes.tsx) |

Used in 3 PWA verify routes but all within the same feature. Promotion candidate if the verify shell pattern is adopted by another feature.

---

## 6. Deprecated Screens Summary

| Screen                     | Location                                         | Reachable     | Redirect   | Safe to remove                  |
| -------------------------- | ------------------------------------------------ | ------------- | ---------- | ------------------------------- |
| R14 Permissions            | `qr-purchase/screens/r14-permissions/`           | No            | → R10      | Yes (route stub)                |
| R15 Activation Complete    | `qr-purchase/screens/r15-activation-complete/`   | No            | → R10      | Yes (route stub)                |
| P01–P06 Legacy             | `qr-purchase/screens/p01–p06*/`                  | Dev-link only | None       | Yes (after dev catalog cleanup) |
| R01, R02, R05, R06 (old)   | `purchase-activation/`                           | Dev-link only | None       | Yes (after dev catalog cleanup) |
| HomeScreen                 | `journey/screens/HomeScreen.tsx`                 | No (redirect) | → /journey | Yes                             |
| EmergencyPlaceholderScreen | `journey/screens/EmergencyPlaceholderScreen.tsx` | No            | None       | Yes                             |
| QrScanRoute                | `journey/routes/QrScanRoute.tsx`                 | No            | None       | Yes                             |

---

## 7. Session Fields — No Issues

The `JourneySession` type in `apps/qr/src/journey/types.ts` does not contain `purchase.permissions`, `purchase.permissionOutcome`, or `purchase.activationComplete`. These R14/R15 session fields were never merged into the main type. Session shape is clean.

Deprecated type fields (`plate`, `mobile`, `legalAccepted`) are annotated `@deprecated` inline. No action required unless types are cleaned.

---

## 8. Icons — No Issues

No duplicate icon implementations found across features. `@autolokate/icons` is the single source for icons across the application. `RetakeIcon` in `packages/ui/src/components/icons/` is the only UI-package-local icon and is correctly placed (it is referenced by `AlPhotoGrid` and `AlScenePhotoCard` within the same package).

---

## 9. Recommendations by Priority

### Needs Decision (not safe to delete without explicit confirmation)

| #   | Item                                                       | Why decision needed                                                              |
| --- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| D1  | P01–P06 legacy screens in `PurchaseRoutes.tsx`             | `P06Route.onContinue` has stale emergency wiring; must decide: archive or remove |
| D2  | R14Route / R15Route redirect stubs in `PurchaseRoutes.tsx` | Can be removed; confirm no external deep-links depend on the redirect behavior   |

### Safe to Delete (low risk, no functional impact)

| #   | Item                                                      | Path                                                          |
| --- | --------------------------------------------------------- | ------------------------------------------------------------- |
| S1  | `AuthFlowApp` + `AuthCompletedView` + `SharedAuthSegment` | `features/shared-auth/auth-flow/`                             |
| S2  | Dead `AuthFlowApp` export                                 | `apps/qr/src/index.ts`                                        |
| S3  | `PurchaseStepShell` component                             | `journey/components/purchase-step-shell/`                     |
| S4  | `HomeScreen`                                              | `journey/screens/HomeScreen.tsx`                              |
| S5  | `EmergencyPlaceholderScreen`                              | `journey/screens/EmergencyPlaceholderScreen.tsx`              |
| S6  | `QrScanRoute` file                                        | `journey/routes/QrScanRoute.tsx`                              |
| S7  | `purchase-activation` feature directory                   | `features/purchase-activation/` — after confirming no imports |

### Needs Cleanup (code hygiene, no functional impact)

| #   | Item                                      | Path                                                                              |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| C1  | Hardcoded hex colors                      | `features/post-activation-pwa/components/pwa-emergency-screen.css`                |
| C2  | Add comment to `purchaseStepPathSequence` | `journey/purchase/purchase-routing.ts` — clarify intentional branch-path omission |
| C3  | Deprecated `@deprecated` types cleanup    | `apps/qr/src/journey/types.ts` — `plate`, `mobile`, `legalAccepted`               |

### No Action Required

- Feature registry — clean
- Emergency limits — single source of truth, no duplication
- Promoted components — all 9 correctly in `@autolokate/ui`
- Duplicate component check — no duplicates found
- Duplicate icons — none found
- Session model — no stale fields

---

## 10. Open Issues Added

The following items have been added to `memory/project-open-issues.md`:

| Priority | Issue                                                            |
| -------- | ---------------------------------------------------------------- |
| MED      | P06Route stale emergency wiring — needs cleanup decision         |
| LOW      | Auth dead code (AuthFlowApp, SharedAuthSegment) — safe to delete |
| LOW      | PurchaseStepShell zero-consumer component — safe to delete       |
| LOW      | Hardcoded colors in pwa-emergency-screen.css                     |
