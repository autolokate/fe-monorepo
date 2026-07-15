# Code Cleanup Report

**Date:** 2026-06-20 (Production Hardening Pass)  
**Scope:** Dead code, duplicates, lint cleanup, deprecated API removal

---

## Fixed This Pass ✅

| Item                                     | Action                             | Files                                                 |
| ---------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| ESLint deprecated `protectedLabel`       | Migrated to `footerLabel`          | `ScannedVehicleCard.tsx`, `pwa-shared-routes.tsx`     |
| ESLint deprecated `locationPreview`      | Removed legacy render path         | `PhotoGrid.tsx`                                       |
| ESLint deprecated `RELATIONSHIP_OPTIONS` | Use `CONTACT_RELATIONSHIP_OPTIONS` | `EmergencyContactRow.tsx`, `RelationshipSelector.tsx` |
| Unused `ParkMePhotoSlot` type            | Removed                            | `pwa-park-me-routes.tsx`                              |
| Unused `journeyPaths` import             | Removed                            | `AuthRoutes.tsx`                                      |
| Unused `updateSession` in OTP route      | Removed destructure                | `pwa-shared-routes.tsx`                               |
| Template literal ESLint                  | `String()` coercion                | `DispatchTimeline.tsx`, `ScreenSpinner.tsx`           |
| `navigator.platform` deprecated          | Removed                            | `SosHoldButton.tsx`                                   |
| Purchase unstable effect deps            | Memoized `patchPurchase`           | `PurchaseRoutes.tsx`                                  |
| Geolocation unmount leak                 | `mountedRef` guard                 | `use-geolocation.ts`                                  |
| SOS hold stale closure                   | Ref-based timer guards             | `pwa-sos-routes.tsx`                                  |
| Park Me auto-locate effect               | Ref + `useCallback`                | `pwa-park-me-routes.tsx`                              |
| Unnecessary type assertions              | Removed                            | `use-pwa-photo-capture.ts`                            |
| `return-await` lint                      | Fixed                              | `compress-capture-image.ts`                           |
| PwaScanContext boolean compare           | Simplified                         | `PwaScanContext.tsx`                                  |

---

## Orphan Files — Not Deleted (Dev Harness)

Protected by `ScreenDevApp.tsx` / dev preview flag:

| Path                                                    | Reason                          |
| ------------------------------------------------------- | ------------------------------- |
| `features/qr-purchase/screens/p01-r01/` … `p06-*/`      | Dev-only, not in PurchaseRoutes |
| `features/qr-purchase/screens/r14-permissions/`         | Archived                        |
| `features/qr-purchase/screens/r15-activation-complete/` | Archived                        |
| `components/compositions/language-picker-sheet/`        | Removed from exports            |
| `dev/ScreenDevApp.tsx` (1043 lines)                     | Dev preview — intentional       |

**Not deleted per constraint:** no flow/graph changes.

---

## Duplicate Helpers (Documented — P2)

| Helpers                                 | Locations                                      |
| --------------------------------------- | ---------------------------------------------- |
| `formatMobileForDisplay`                | `shared-auth/demo-data`, `emergency/demo-data` |
| `formatMobileInput` / `normalizeMobile` | `auth-flow.validation.ts`                      |
| `formatMobileNumber`                    | `@autolokate/utils` (unused package)           |

---

## Unused Package

`@autolokate/utils` — 0 runtime imports. Valid types; reserved for API integration phase.

---

## No Action Required

- All `*Routes.tsx` files mounted in route hierarchy ✅
- No duplicate route components ✅
- No duplicate motion wrappers beyond feature scope ✅

---

## Risk Assessment

| Change Type                     | Regression Risk |
| ------------------------------- | --------------- |
| Deprecated prop migration       | Low             |
| Lint/effect fixes               | Low             |
| Orphan file deletion (not done) | None            |

---

## Verdict

**PASS** — Production source lint-clean. Dev orphan files documented for future cleanup sprint.
