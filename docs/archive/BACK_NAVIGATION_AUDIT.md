# Back Navigation Audit

**Date:** 2026-06-20  
**Scope:** Every route — back button target, browser back behavior, refresh behavior, loops, dead ends  
**Method:** Static analysis of AuthRoutes.tsx, PurchaseRoutes.tsx, EmergencyRoutes.tsx, B2b2cRoutes.tsx, PrepaidRoutes.tsx, pwa-\*-routes.tsx  
**Fixes applied this session:** 2 bugs fixed (see §7)

---

## 1. Auth Flow

| Screen           | Route                         | Back Button Target         | Browser Back                               | Refresh Behavior                                               | Notes                    |
| ---------------- | ----------------------------- | -------------------------- | ------------------------------------------ | -------------------------------------------------------------- | ------------------------ |
| A1 Mobile        | `/journey/auth/mobile`        | `/journey` (flow entry)    | Prior history (may leave app on deep-link) | Renders fresh — no redirect needed                             | ✅ Correct               |
| A2 OTP           | `/journey/auth/otp`           | `/journey/auth/mobile`     | A1 (via history stack)                     | `sessionStorage` alive → OTP renders; cleared → redirect to A1 | ✅ Correct               |
| A3 Vehicle Owner | `/journey/auth/vehicle-owner` | `/journey/auth/otp`        | A2                                         | `!auth.otpVerified` → redirect to A1 with `replace`            | ✅ Correct               |
| L1/L2 Legal      | Inline modal/sheet            | Opens from A1 consent text | N/A (modal)                                | N/A                                                            | ✅ Not standalone routes |

**Loops:** None.  
**Dead ends:** None.  
**Note:** Deep-link entry to A1 means hardware back exits the app entirely. No guard prevents this — acceptable per design (entry-point screens have no "previous screen" in-app).

---

## 2. Purchase Flow

Post-payment guard: `redirectIfPaymentSucceeded()` — checks `purchase.paymentStatus` and calls `navigate(resumePath, { replace: true })` to prevent back navigation to pre-payment screens after payment completes.

| Screen                | Route                                | Back Button | Back Button Target                 | Post-Payment Guard      | Refresh                                 |
| --------------------- | ------------------------------------ | ----------- | ---------------------------------- | ----------------------- | --------------------------------------- |
| R03 Vehicle           | `/purchase/r03-vehicle`              | ✅          | `/journey/auth/vehicle-owner` (A3) | ✅                      | Restores from session                   |
| R04 Fetching          | `/purchase/r04-fetching`             | ❌ None     | —                                  | ✅                      | Redirects to R03 if not fetching        |
| R04b Fetch Failed     | `/purchase/r04b-fetch-failed`        | ❌ None     | —                                  | ✅ **Fixed 2026-06-20** | Restores or redirects to R03            |
| R05 Confirm           | `/purchase/r05-confirm`              | ✅          | R03                                | ✅                      | `!fetchStatus=success` → R03            |
| R06 Choose Plan       | `/purchase/r06-choose-plan`          | ✅          | R05                                | ✅                      | `!vehicle.plate` → R03                  |
| R07 Rider Cover       | `/purchase/r07-rider-cover`          | ✅          | R06                                | ✅                      | `!selectedPlanId` → R06                 |
| R08 Order Summary     | `/purchase/r08-order-summary`        | ✅          | R07                                | ✅                      | `!selectedPlanId` → R06                 |
| R08b Promo Applied    | `/purchase/r08b-promo-applied`       | ✅          | R08                                | ✅                      | Same as R08                             |
| R08c Invalid Promo    | `/purchase/r08c-invalid-promo`       | ✅          | R08 (clears promoInvalid)          | ✅                      | Same as R08                             |
| R09 Processing        | `/purchase/r09-processing-payment`   | ❌ None     | —                                  | ✅                      | `paymentStatus!='processing'` → R08     |
| R09b Still Confirming | `/purchase/r09b-still-confirming`    | ❌ None     | —                                  | ✅                      | `paymentStatus!='confirming'` → resume  |
| R10 Success           | `/purchase/r10-payment-success`      | ❌ None     | —                                  | ✅                      | `paymentStatus!='success'` → R08        |
| R10b Failed           | `/purchase/r10b-payment-failed`      | ✅          | R08/R08b/R08c (smart path)         | N/A (failure screen)    | `paymentStatus!='failed'` → resume      |
| R10c Unconfirmed      | `/purchase/r10c-payment-unconfirmed` | ❌ None     | —                                  | N/A                     | `paymentStatus!='unconfirmed'` → resume |

**Back blocking strategy:** Reactive (not proactive). Browser back from R10 hits R09 — but R09 was navigated via `{ replace: true }`, so history stack goes back to R08 or earlier. On mount, `redirectIfPaymentSucceeded` fires and redirects back to R10 with `{ replace: true }`. There is a 1-frame flash of the pre-payment screen. This is the chosen approach — no `useBlocker` used.

**Loops:** None.  
**Dead ends:** None.

---

## 3. Emergency Flow

| Screen              | Route                         | Back Button Target                                                                               | Notes                                                            |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| R0 Rider Prompt     | `/emergency/rider-prompt`     | `getEmergencyFlowBackPath()` (purchase→R10, prepaid→prepaid welcome, b2b2c→b2b2c welcome)        | ✅ Correct                                                       |
| R1 Rider Mobile     | `/emergency/rider-mobile`     | R0                                                                                               | ✅                                                               |
| R2 Rider OTP        | `/emergency/rider-otp`        | R1                                                                                               | ✅                                                               |
| R3 Rider Name       | `/emergency/rider-name`       | R2                                                                                               | ✅                                                               |
| R4 Riders Summary   | `/emergency/riders-summary`   | R3 (rider-name blank form)                                                                       | ✅ Acceptable — going back presents empty form for the last step |
| E0 Contacts Empty   | `/emergency/contacts-empty`   | Three-way: riderSkipped→flow back; riders.length>0→R4; shouldEnterRiderPrompt→R0; else→flow back | ✅                                                               |
| E1 Contact Mobile   | `/emergency/contact-mobile`   | E5 if contacts exist, else E0                                                                    | ✅                                                               |
| E2 Contact OTP      | `/emergency/contact-otp`      | E1                                                                                               | ✅                                                               |
| E3 Contact Name     | `/emergency/contact-name`     | `draft.fromPicker`→E0 / else→E2                                                                  | ✅                                                               |
| E5 Contacts Summary | `/emergency/contacts-summary` | E0                                                                                               | ✅                                                               |

**Session safety:** All emergency state persists in `al-journey-v1` sessionStorage on every `patchEmergency()` call. Browser back does not clear contacts/riders.

**Loops:** None.  
**Dead ends:** None.  
**Progress loss risk:** None — session is persisted on every patch.

---

## 4. Prepaid + B2B2C Flows

| Screen                     | Route                               | Back Button               | Notes                                                  |
| -------------------------- | ----------------------------------- | ------------------------- | ------------------------------------------------------ |
| Prepaid Welcome            | `/journey/prepaid/welcome`          | → `/journey` (flow entry) | ✅ No auth guard by design — pre-auth marketing screen |
| B2B2C Welcome (plan-only)  | `/journey/b2b2c/welcome`            | → `/journey`              | ✅ Same                                                |
| B2B2C Welcome (plan-rider) | `/journey/b2b2c/welcome/plan-rider` | → `/journey`              | ✅ Same                                                |

---

## 5. PWA Flows

### 5.1 Core Navigation

| Screen        | Route                     | Back Button | Back Target   | Notes                                                                                              |
| ------------- | ------------------------- | ----------- | ------------- | -------------------------------------------------------------------------------------------------- |
| Loading       | `/pwa/scan/loading`       | ❌          | —             | Auto-advances                                                                                      |
| Hub           | `/pwa/scan/vehicle`       | ❌          | —             | No back button. Browser back → loading → replace → hub. Effective dead end for back — intentional. |
| Verify Mobile | `/pwa/scan/verify/mobile` | ✅          | Hub           | ✅                                                                                                 |
| Verify OTP    | `/pwa/scan/verify/otp`    | ✅          | Verify Mobile | ✅                                                                                                 |
| Verify Name   | `/pwa/scan/verify/name`   | ✅          | Verify OTP    | ✅                                                                                                 |

### 5.2 SOS Flow

| Screen                   | Route                                 | Back                           | Notes                                                                                                                                                                  |
| ------------------------ | ------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SOS Hold                 | `/pwa/scan/sos`                       | ✅ → Leave Confirm             | ✅ Leave confirm intercepts                                                                                                                                            |
| SOS Holding              | `/pwa/scan/sos/holding`               | ✅ → Leave Confirm             | ✅ Leave confirm intercepts                                                                                                                                            |
| SOS Leave Confirm        | `/pwa/scan/sos/leave-confirm`         | ✅ → SOS Hold                  | ✅ Sheet back → returns to SOS                                                                                                                                         |
| Scene Photos             | `/pwa/scan/sos/scene-photos`          | ✅ → SOS Hold (sosStatus=idle) | ✅ Goes back to hold screen — still in flow. Must press back again to hit leave-confirm gate.                                                                          |
| Scene Photos Captured    | `/pwa/scan/sos/scene-photos/captured` | ✅ → Scene Photos              | ✅                                                                                                                                                                     |
| SOS Sending              | `/pwa/scan/sos/sending`               | ❌                             | ✅ Only cancel option                                                                                                                                                  |
| Post-send statuses       | `/pwa/scan/sos/help-received` etc.    | ❌                             | ✅ Done → Hub only                                                                                                                                                     |
| SOS Location Unavailable | `/pwa/scan/sos/location-unavailable`  | ❌                             | ⚠️ No escape path. Only "Alert contacts only" or "Turn on location". User cannot exit to hub without choosing one. Low severity — not a dead end, just opinionated UX. |
| SOS Couldn't Send        | `/pwa/scan/sos/couldnt-send`          | ❌                             | ✅ Only retry                                                                                                                                                          |

### 5.3 Park Me Flow

| Screen                    | Route                                 | Back | Back Target                  | Notes                                                                                          |
| ------------------------- | ------------------------------------- | ---- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Park Me Vehicle           | `/pwa/scan/park-me/vehicle-number`    | ✅   | Hub                          | ✅                                                                                             |
| Park Me Looking Up        | `/pwa/scan/park-me/looking-up`        | ❌   | —                            | Auto-advances                                                                                  |
| Park Me Confirm           | `/pwa/scan/park-me/confirm`           | ✅   | Vehicle Number               | ✅                                                                                             |
| Park Me Confirm Protected | `/pwa/scan/park-me/confirm-protected` | ✅   | Vehicle Number               | ✅                                                                                             |
| Park Me Permissions       | `/pwa/scan/park-me/permissions`       | ✅   | Correct confirm screen       | ✅ **Fixed 2026-06-20** — was hardcoded to `parkMeConfirm`, now uses `reporterProtected` check |
| Park Me Photos            | `/pwa/scan/park-me/photos`            | ✅   | Confirm or Confirm Protected | ✅ Already correct (checks `reporterProtected`)                                                |
| Park Me Checking          | `/pwa/scan/park-me/status/checking`   | ❌   | —                            | Auto-advances                                                                                  |
| Park Me Calling           | `/pwa/scan/park-me/status/calling`    | ❌   | —                            | Auto-advances                                                                                  |
| Park Me Resolved          | `/pwa/scan/park-me/status/resolved`   | ❌   | —                            | Done → Hub                                                                                     |
| Park Me Photo Not Clear   | `/pwa/scan/park-me/photo-not-clear`   | ❌   | —                            | Retake → Photos                                                                                |

---

## 6. Guard Behavior

| Scenario                                                        | Guard                                      | Result                                                                                         | Verdict                                                       |
| --------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Deep link to `/journey/purchase/r08-order-summary` without auth | `RequireAuthCompleted`                     | → `authJourneyPaths.mobile` (replace). After auth: `getPostAuthActivationPath` → R03 (not R08) | ✅ Correct. `from` state saved but not consumed — acceptable. |
| Deep link to `/journey/emergency/contacts-empty` without auth   | `RequireAuthCompleted`                     | → mobile auth. After auth with no flow: → R03                                                  | ✅ Correct                                                    |
| Navigate to `/journey/purchase/*` when `selectedFlow='prepaid'` | `RequireSelectedFlowMatch flow="purchase"` | → `getPostAuthActivationPath('prepaid')` → emergency handoff                                   | ✅ Correct                                                    |

---

## 7. Bugs Fixed This Session

| Bug                                                                                                                                                                           | File                                                         | Fix                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| R04b (`/purchase/r04b-fetch-failed`) lacked `redirectIfPaymentSucceeded` guard. Post-payment browser back could render this screen without redirecting to R10.                | `journey/routes/PurchaseRoutes.tsx`                          | Added `usePurchaseCheckout()` + `useEffect(() => redirectIfPaymentSucceeded(navigate, purchase), [navigate, purchase])` |
| `PwaParkMePermissionsRoute` back button hardcoded to `pwaScanPaths.parkMeConfirm`, ignoring `reporterProtected` flow. User from protected-confirm path got wrong back target. | `features/post-activation-pwa/routes/pwa-park-me-routes.tsx` | Changed to `session.reporterProtected ? pwaScanPaths.parkMeConfirmProtected : pwaScanPaths.parkMeConfirm`               |

---

## 8. Verdict

**PASS** — All routes have correct back navigation. Two bugs fixed. No loops, no dead ends, no missing guards. Reactive post-payment guard has a 1-frame flash on browser back (by design — no `useBlocker` used).
