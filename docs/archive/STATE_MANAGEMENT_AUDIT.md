# State Management Audit

**Date:** 2026-06-20  
**Scope:** JourneySession, PwaScanSession, persistence, providers, race conditions

---

## Single Source of Truth ✅

| Domain              | Store            | Provider          |
| ------------------- | ---------------- | ----------------- |
| Activation flows    | `JourneySession` | `JourneyProvider` |
| Post-activation PWA | `PwaScanSession` | `PwaScanProvider` |

No duplicate journey state. PWA isolation is intentional.

---

## JourneySession Fields

### Persisted (sessionStorage `al-journey-v1`)

| Field                 | Nested Keys                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `auth`                | mobile, mobileDisplay, consentAccepted, languageId, otpVerified, ownerName                                     |
| `vehicle`             | plate, fields, fetchStatus, confirmed                                                                          |
| `purchase`            | selectedPlanId, riderCount, promoCode, promoApplied, promoInvalid, checkoutReady, paymentStatus, paidAmountInr |
| `prepaid.entitlement` | partnerName, planId, riderCount, etc.                                                                          |
| `b2b2c`               | entitlement + variant                                                                                          |
| `emergency`           | riderSkipped, rider, riders, contactDraft, contacts, riderPromptLoadFailed                                     |
| Deprecated roots      | plate, mobile, otpVerified, legalAccepted (legacy — still persisted if set)                                    |

### NOT Persisted

| Field           | Behavior                                                                |
| --------------- | ----------------------------------------------------------------------- |
| `phase`         | Resets to `'home'` on refresh; self-heals via route segment `useEffect` |
| Context methods | `setSelectedFlow`, `completeAuth`, `updateSession`, etc.                |

### Mirror Persistence

- `selectedFlow` also in `localStorage` (`al-selected-flow`) for cross-tab flow hint

---

## PwaScanSession

**Key:** `sessionStorage` `al-pwa-scan-v1`

| Field                        | Purpose                      |
| ---------------------------- | ---------------------------- |
| `scannedVehicle`             | Plate, model, protected flag |
| `verified`, `mobile`, `name` | Bystander verify chain       |
| `parkMePhotos`, `sosPhotos`  | Base64 captures              |
| `location`, `locationName`   | Geo capture                  |
| `sosStatus`, `parkMeStatus`  | Timeline state               |
| `permissionsGranted`         | Camera gate                  |
| `pendingFlow`                | Park Me vs SOS intent        |

**Quota handling:** `savePwaScanSession` returns `{ ok: false, code: 'QuotaExceededError' }` — surfaced via `storageError` in context.

---

## Race Conditions Reviewed

| Scenario                                | Status                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Purchase payment timer + refresh        | ✅ `paymentStatus` persisted; `redirectIfPaymentSucceeded` handles resume |
| Purchase effect loop from unstable deps | ✅ Fixed — memoized `patchPurchase`                                       |
| PWA photo save quota exceeded           | ✅ Error surfaced, session not corrupted                                  |
| SOS hold timer + release before engage  | ✅ Ref guards prevent false navigation                                    |
| Geolocation async + unmount             | ✅ `mountedRef` prevents setState after unmount                           |
| Concurrent `updateSession` patches      | ✅ Functional updates in `setSession`                                     |

---

## Provider Conflicts

**None.** Journey and PWA providers never nest. `JourneyOrchestrator` routes `/pwa/scan/*` outside `JourneyProvider`.

---

## Refresh / Back / Tab Restore Matrix

| Action       | Journey                                           | PWA                     |
| ------------ | ------------------------------------------------- | ----------------------- |
| Hard refresh | Session restored from sessionStorage              | Session restored        |
| Browser back | Per-screen handlers + guards                      | Per-screen handlers     |
| Forward      | React Router history                              | React Router history    |
| New tab      | Flow hint from localStorage; session may be empty | Fresh session           |
| Tab restore  | sessionStorage survives                           | sessionStorage survives |

---

## Issues Fixed This Pass

| Issue                                                       | Fix                                     |
| ----------------------------------------------------------- | --------------------------------------- |
| Unstable `session.purchase ?? {}` in PurchaseRoutes effects | Memoized patch + optional chaining      |
| Geolocation setState after unmount                          | `mountedRef` in `useGeolocationCapture` |
| PwaScanContext boolean compare lint                         | Simplified `!pending.result.ok`         |

---

## Remaining Gaps (Not Fixed)

1. **`phase` not persisted** — acceptable; route-driven recovery
2. **Split persistence** — `selectedFlow` in localStorage but auth in sessionStorage only
3. **PWA memory vs storage drift** on quota errors — user sees banner, partial state possible

---

## Verdict

**PASS** — Single source of truth maintained. Critical race conditions addressed. No session schema changes made.
