# Architecture Audit Report

**Date:** 2026-06-20  
**Scope:** React architecture — routes, guards, session, feature boundaries, hooks, context

---

## 1. Route Architecture ✅ PASS

### JourneyOrchestrator
- `/pwa/scan/*` is the first `<Route>` — structurally isolated before JourneyProvider
- `JourneyProvider` wraps only the catch-all `path="*"` — correct
- PWA cannot accidentally inherit journey context

### JourneyRoutes
All 6 journey flow entry points present with correct guards:

| Route | Guard |
|-------|-------|
| `/journey/auth/*` | None (entry point) |
| `/journey/purchase/*` | `RequireAuthCompleted` + `RequireSelectedFlowMatch('purchase')` |
| `/journey/emergency/*` | `RequireAuthCompleted` + `RequireSelectedFlow` |
| `/journey/prepaid/*` | None (entry, has own welcome) |
| `/journey/b2b2c/*` | None (entry, has own welcome) |
| `/pwa/scan/*` | Isolated (PwaScanProvider only) |

### Guards
- `RequireAuthCompleted` — checks `authStatus !== AUTH_COMPLETED`, redirects to `auth/mobile` ✅
- `RequireSelectedFlow` — checks `selectedFlow` null, branches on authStatus for redirect target ✅
- `RequireSelectedFlowMatch` — checks both null and mismatch ✅
- All guards import `AUTH_COMPLETED` from `features/shared-auth/types.js` (single source) ✅

---

## 2. Session Model ✅ PASS

| Key | Store | Verified |
|-----|-------|---------|
| `al-journey-v1` | sessionStorage | ✅ |
| `al-selected-flow` | localStorage | ✅ |
| `al-qr-theme` | localStorage | ✅ |
| `al-pwa-scan-v1` | sessionStorage | ✅ |

- `clearJourney()` resets `{ selectedFlow: null, authStatus: 'pending', session: {} }` and calls `setPhase('home')` ✅
- `completeAuth()` sets `AUTH_COMPLETED` + calls `setPhase('activation')` ✅
- `updateSession()` does shallow merge (`{ ...current.session, ...patch }`) + immediate persistence ✅

---

## 3. Feature Boundary Check

### Cross-feature imports

**Emergency ← qr-purchase (MEDIUM concern)**

Emergency screens import plan types and default plan IDs directly from `qr-purchase/`:
- `E05ContactsEmptyScreen.tsx` — imports `DEFAULT_PURCHASE_PLAN_ID` from `../../../qr-purchase/data/purchase-plans.js`
- `E09ContactsSummaryScreen.tsx` — imports `PurchasePlanId` type from `../../../qr-purchase/types-checkout.js`
- `E10RidersSummaryScreen.tsx` — same
- `E01RiderPromptScreen.tsx` — imports `DEFAULT_PURCHASE_PLAN_ID`

These bypass the `emergency-limits.ts` abstraction. The `emergency-limits.ts` file already imports and re-exports the plan types for this purpose. Emergency screens should use `emergency-limits.ts` as the single entry point for plan-related constants.

**Emergency ← shared-auth (LOW concern)**

- `E02RiderMobileScreen.tsx`, `E06ContactMobileScreen.tsx` — import `demoMobileDisplay`, `MOBILE_INPUT_DISPLAY_MAX` from `shared-auth/`
- `EmergencyOtpScreen.tsx` — imports `OTP_LENGTH` from `shared-auth/auth-flow/auth-flow.validation.js`
- `demo-data.ts` — imports `demoMobileRaw` from `shared-auth/data/demo-data.js`

These constants are needed for demo mode and input constraints. The coupling is shallow (constants only, no hook coupling). Acceptable but the auth constants could be moved to `shared-auth/index.ts` for cleaner import surface.

**PWA ← any non-PWA feature: PASS**  
Zero imports from non-PWA features in `post-activation-pwa/`. Fully isolated.

**qr-purchase ← emergency: PASS**  
No imports from emergency in qr-purchase.

---

## 4. Hook Audit ✅ PASS (with notes)

### Custom hooks in scope

| Hook | Location | Cross-feature coupling |
|------|----------|----------------------|
| `useThemeMode` | `apps/qr/src/hooks/` | None |
| `useRouteProgress` | `journey/progress/` | Journey-internal only |
| `use-welcome-landing` | `features/b2b-shared/` | None |
| `use-camera-capture` | `features/post-activation-pwa/hooks/` | PWA-internal only |
| `use-geolocation` | `features/post-activation-pwa/hooks/` | PWA-internal only |
| `use-hold-progress` | `features/post-activation-pwa/hooks/` | PWA-internal only |
| `use-hold-progress-from` | `features/post-activation-pwa/hooks/` | PWA-internal only |
| `use-pwa-photo-capture` | `features/post-activation-pwa/hooks/` | PWA-internal only |
| `use-resolve-stored-location-name` | `features/post-activation-pwa/hooks/` | PWA-internal only |

**useJourney() not used in PWA:** ✅ Confirmed zero usages in `post-activation-pwa/`

**Note:** `shared-legal/hooks/useThemeMode.ts` re-exports from `../../../hooks/useThemeMode.js` — this is a re-export barrel, not a duplicate implementation. Acceptable pattern.

**Note:** `PrepaidWelcomeScreen` and `PartnerWelcomeScreen` call `useJourney()` directly from within their feature files. This is a mild layering inversion (feature calling context directly instead of receiving callbacks from route). No runtime impact since both screens run inside `JourneyProvider`.

---

## 5. Emergency Plan Limits ✅ PASS

In `apps/qr/src/features/emergency/emergency-limits.ts`:

| Plan | Max Contacts | Max Riders |
|------|-------------|------------|
| `safe` | 1 | 0 |
| `secure` | 2 | 2 |
| `shield` | 3 | 2 |
| `shield-plus` | 3 | 2 |

`RIDER_ADDON_PRODUCT_CAP = 2` ✅  
Plan limit numbers only defined in `emergency-limits.ts` — not duplicated as raw numbers elsewhere ✅

---

## 6. PWA Isolation ✅ PASS

- `PwaScanContext.tsx` has zero imports from `JourneyContext`
- Storage key `al-pwa-scan-v1` confirmed
- `PwaScanRoutes.tsx` wraps with `PwaScanProvider` + `PwaScanErrorBoundary` only — no `JourneyProvider`
- Structural isolation guaranteed by `JourneyOrchestrator.tsx`

---

## 7. Recommendations

### Medium Priority
- Refactor emergency screens to import plan constants through `emergency-limits.ts` only — eliminate direct `qr-purchase` imports from E01, E05, E09, E10

### Low Priority
- Add `ScreenDevApp.tsx` import of `THEME_KEY` from constants (currently hardcoded string)
- The `b2b-shared/` shared layer between `qr-prepaid` and `qr-b2b2c` is a good pattern — continue using it for any additional shared B2B logic
