# Duplicate Code Audit

**Date:** 2026-06-20

---

## Consolidated This Pass ✅

### Mobile formatters — merged to single source

| Duplicate                        | Locations (before)    | Canonical                                         | Consumers updated                        |
| -------------------------------- | --------------------- | ------------------------------------------------- | ---------------------------------------- |
| `formatMobileForDisplay` (local) | shared-auth/demo-data | `@/shared/format-mobile.ts` → `formatMobileLocal` | shared-auth/demo-data, A2 OTP            |
| `formatMobileForDisplay` (+91)   | emergency/demo-data   | `formatMobileIntl`                                | emergency/demo-data, EmergencyContactRow |
| `formatMobileForOtpDescription`  | emergency/demo-data   | `formatMobileLocal`                               | EmergencyOtpScreen                       |

**Before:** 3 parallel implementations + unused `@autolokate/utils/formatMobileNumber`  
**After:** 1 module (`src/shared/format-mobile.ts`)

---

## Already Consolidated (no action)

| Component        | Canonical                                           | Status                 |
| ---------------- | --------------------------------------------------- | ---------------------- |
| Screen spinner   | `AlScreenSpinner`                                   | Single implementation  |
| Timeline         | `AlDispatchTimeline` + `AlStatusTracker`            | No app forks           |
| Vehicle cards    | `AlScannedVehicleCard`, `AlVehicleConfirmationCard` | In @autolokate/ui      |
| Photo grid       | `AlPhotoGrid`                                       | In @autolokate/ui      |
| Permission sheet | `AlPermissionSheet`                                 | In @autolokate/ui      |
| SOS hold button  | `AlSosHoldButton`                                   | Single implementation  |
| Empty states     | `EmptyStateHero`                                    | Single app composition |

---

## Remaining Duplicates (P2 — not changed)

| Area                   | Duplicates                                              | Risk to consolidate       | Recommendation                  |
| ---------------------- | ------------------------------------------------------- | ------------------------- | ------------------------------- |
| Step shells            | AuthStepShell + FlowStepShell share ~80% chrome         | High — many screens       | Future: extract `StepShellBase` |
| Status heroes          | PurchaseStatusShell + PwaStatusHeroScreen               | Medium — different chrome | Keep separate (PWA vs journey)  |
| Inline SVG icons in UI | CarIconGlyph, CircleCheckIconGlyph vs @autolokate/icons | Low                       | Migrate to icons pipeline       |
| RetakeIcon             | packages/ui inline vs icons asset                       | Low                       | Generate rotate-ccw icon        |
| PWA loading layout     | 3 route files copy spinner+title pattern                | Low                       | Extract `PwaLoadingStatusBody`  |

---

## Removed Duplicates (via deletion)

| Removed                  | Was duplicate of            |
| ------------------------ | --------------------------- |
| P01–P06 purchase screens | R06–R10 active flow         |
| R14 permissions          | Archived — never in journey |
| R15 activation complete  | JourneyCompletedScreen      |
| R03/R04 auth scaffolds   | A1/A2 auth screens          |
| PermissionRow            | Only served R14             |

---

## Verdict

**Primary duplication eliminated:** mobile formatting. UI primitives already follow single-implementation rule. Structural shell overlap documented for future sprint — not changed to avoid regression risk.
