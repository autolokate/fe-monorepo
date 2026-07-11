# Post-Activation PWA — Implementation Report

**Date:** 2026-06-17  
**Reference audit:** `docs/POST_ACTIVATION_QR_AUDIT.md`  
**Figma section:** Scanner · QR Scan (Post-Activation) · Web PWA · READY FOR DEV (`843:2079`)

---

## Summary

Implemented a **fully isolated** Post-Activation Web PWA at `/pwa/scan/*`, separate from onboarding journey orchestration and session schema. All **30 audited frames** have dedicated routes, real browser APIs (camera, geolocation, permissions), and reuse of existing onboarding primitives.

| Metric | Value |
|--------|-------|
| Figma frames implemented | **30 / 30** |
| PWA routes | **30** |
| Onboarding flows modified | **0** (entry card only on `/journey`) |
| Promoted UI components | **8** |
| Build status | **PASS** |
| TypeScript errors | **0** |

---

## Entry point

**`/journey`** — 4th card added:

- **Label:** QR Scan (Post-Activation)
- **Description:** Already activated vehicle
- **Action:** Navigates to `/pwa/scan/loading`

Direct deep links: `/pwa/scan/*` (e.g. `/pwa/scan/vehicle`, `/pwa/scan/sos`)

---

## Architecture

```
JourneyOrchestrator
├── /pwa/scan/*     → PwaScanProvider + PwaScanRoutes (isolated)
└── /*              → JourneyProvider + JourneyRoutes (onboarding)
```

- **Session:** `sessionStorage` key `al-pwa-scan-v1` — not shared with `al-journey-v1`
- **Feature root:** `apps/qr/src/features/post-activation-pwa/`

---

## Implemented screens (30)

| # | Frame | Route | Component |
|---|-------|-------|-----------|
| 01 | Loading | `/pwa/scan/loading` | `PwaLoadingRoute` |
| 02 | Vehicle found | `/pwa/scan/vehicle` | `PwaVehicleFoundRoute` |
| 03 | Verify · Mobile | `/pwa/scan/verify/mobile` | `PwaVerifyMobileRoute` |
| 04 | Verify · OTP | `/pwa/scan/verify/otp` | `PwaVerifyOtpRoute` |
| 05 | Verify · Name | `/pwa/scan/verify/name` | `PwaVerifyNameRoute` |
| 06 | Park Me · Vehicle number | `/pwa/scan/park-me/vehicle-number` | `PwaParkMeVehicleNumberRoute` |
| 07 | Park Me · Looking up | `/pwa/scan/park-me/looking-up` | `PwaParkMeLookingUpRoute` |
| 08 | Park Me · Confirm | `/pwa/scan/park-me/confirm` | `PwaParkMeConfirmRoute` |
| 08b | Park Me · Confirm protected | `/pwa/scan/park-me/confirm-protected` | `PwaParkMeConfirmProtectedRoute` |
| 09a | Allow camera & location | `/pwa/scan/park-me/permissions` | `PwaParkMePermissionsRoute` |
| 09 | Take two photos | `/pwa/scan/park-me/photos` | `PwaParkMePhotosRoute` |
| 09b | Photos captured | `/pwa/scan/park-me/review` | `PwaParkMeReviewRoute` |
| 10 | Status · checking | `/pwa/scan/park-me/status/checking` | `PwaParkMeStatusCheckingRoute` |
| 11 | Status · calling | `/pwa/scan/park-me/status/calling` | `PwaParkMeStatusCallingRoute` |
| 12 | Status · resolved | `/pwa/scan/park-me/status/resolved` | `PwaParkMeStatusResolvedRoute` |
| 13 | Photo not clear | `/pwa/scan/park-me/photo-not-clear` | `PwaParkMePhotoNotClearRoute` |
| 14 | Emergency · SOS | `/pwa/scan/sos` | `PwaSosRoute` |
| 14b | SOS · holding | `/pwa/scan/sos/holding` | `PwaSosHoldingRoute` |
| 14c | SOS · allow location | `/pwa/scan/sos/allow-location` | `PwaSosAllowLocationRoute` |
| 14d | SOS · leave confirm | `/pwa/scan/sos/leave-confirm` | `PwaSosLeaveConfirmRoute` |
| 15 | Add scene photo | `/pwa/scan/sos/scene-photos` | `PwaSosScenePhotosRoute` |
| 15b | Scene photos captured | `/pwa/scan/sos/scene-photos/captured` | `PwaSosScenePhotosCapturedRoute` |
| 16 | Location unavailable | `/pwa/scan/sos/location-unavailable` | `PwaSosLocationUnavailableRoute` |
| 17 | Sending alert | `/pwa/scan/sos/sending` | `PwaSosSendingRoute` |
| 18 | Couldn't send | `/pwa/scan/sos/couldnt-send` | `PwaSosCouldntSendRoute` |
| 19 | Help received | `/pwa/scan/sos/help-received` | `PwaSosHelpReceivedRoute` |
| 20 | Help dispatched | `/pwa/scan/sos/help-dispatched` | `PwaSosHelpDispatchedRoute` |
| 21 | Incident resolved | `/pwa/scan/sos/resolved` | `PwaSosResolvedRoute` |
| 22 | Alert cancelled | `/pwa/scan/sos/alert-cancelled` | `PwaSosAlertCancelledRoute` |
| 23 | Contacts only | `/pwa/scan/sos/contacts-only` | `PwaSosContactsOnlyRoute` |

---

## Reused components (onboarding / DS)

| Component | Used in PWA |
|-----------|-------------|
| `A1MobileScreen` | Verify mobile (bystander copy) |
| `A2OtpScreen` | Verify OTP |
| `A3VehicleOwnerScreen` | Verify name |
| `R03VehicleNumberScreen` | Park Me plate entry |
| `R04FetchingVehicleScreen` | Looking up / sending |
| `R05ConfirmVehicleScreen` | Confirm plain + protected |
| `PurchaseStatusShell` | Loading, errors, status heroes |
| `InlineConsentBlock` | Bystander consent variant |
| `AlButton`, `AlTextField`, `AlOtpInput`, `AlPlateInput`, `AlCheckbox` | Throughout |
| `AlVehicleRcCard`, `AlScreenBg`, `AlScreenSpinner` | Vehicle + loading |
| `FetchFailedHalo` | Network / location errors |
| Auth validation | `clampMobileInput`, OTP rules |

---

## Web PWA capabilities

| Capability | Implementation |
|------------|----------------|
| Camera | `useCameraCapture` — native file input with `capture="environment"` |
| Geolocation | `useGeolocationCapture` — `navigator.geolocation` |
| Media permissions | `requestMediaPermissions` — `getUserMedia` preflight |
| Offline | Loading/error states; session persisted in `sessionStorage` |
| Refresh | Session restore from `al-pwa-scan-v1` |

---

## Motion (Framer Motion)

- `PwaFade` — screen enter transitions
- `PwaSpringPress` — hub card press/select
- SOS hold progress — CSS + `useHoldProgress` rAF
- Timeline steps — CSS transitions on `AlDispatchTimeline`

---

## Exclusions (per project rules)

- No StatusBar / battery / carrier / signal
- No language switcher / picker on verify mobile

---

## Demo credentials

| Input | Value |
|-------|-------|
| Mobile | `9999999999` |
| OTP valid | `123456` |
| OTP expired | `000000` |
| Consumer reporter plate | `MH 12 AB 3456` → protected confirm (08b) |

---

## Build status

```bash
pnpm --filter @autolokate/ui build        # PASS
pnpm --filter @autolokate/qr build # PASS
```

---

## Final verdict

**READY**

All 30 frames routed, promoted components in core, onboarding flows untouched, build passing.
