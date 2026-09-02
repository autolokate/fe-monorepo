# Flow Verification Report

**Date:** 2026-06-20  
**Scope:** All journeys — forward nav, back nav, refresh recovery, session persistence, guards, error/loading/success states

---

## 1. Auth Flow (A1 → A3)

**Route:** `/journey/auth/mobile` → `/journey/auth/otp` → `/journey/auth/vehicle-owner`

| Check                | Status                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| Forward navigation   | ✅ Mobile → OTP → Name                                                    |
| Back navigation      | ✅ OTP has Change link back to Mobile                                     |
| Session persistence  | ✅ `al-journey-v1` in sessionStorage                                      |
| Demo credentials     | ✅ Mobile `9999999999`, OTP `123456`, expired `000000`                    |
| Post-auth routing    | ✅ `getPostAuthActivationPath(flow, session)`                             |
| Guard behavior       | ✅ Purchase/Emergency redirect to Mobile if not auth-completed            |
| Legal routes (L1/L2) | ✅ Available via linked text (not standalone routes — accepted exception) |

**Visual status:** PIXEL PERFECT

---

## 2. Purchase Flow (R03 → R10c)

**Route:** `/journey/purchase/r03-vehicle` → ... → `/journey/purchase/r10-payment-success` → Emergency

| Check                        | Status                                             |
| ---------------------------- | -------------------------------------------------- |
| R03 Vehicle plate input      | ✅                                                 |
| R04 Vahan lookup             | ✅ Async loading state                             |
| R04b Fetch failed branch     | ✅ Retry + manual entry                            |
| R05 Confirm vehicle          | ✅                                                 |
| R06 Plan carousel            | ✅ Safe/Secure/Shield/Shield+                      |
| R07 Rider cover              | ✅ 0–2 rider count, skip link                      |
| R08 Order summary            | ✅ Promo code entry                                |
| R08b Promo applied branch    | ✅                                                 |
| R08c Invalid promo branch    | ✅                                                 |
| R09 Processing payment       | ✅ Timer                                           |
| R09b Still confirming branch | ✅                                                 |
| R10 Payment success          | ✅ → Emergency at `contacts-empty`                 |
| R10b Payment failed          | ✅ Retry                                           |
| R10c Unconfirmed             | ✅ Check status                                    |
| Back-button guards           | ✅ `redirectIfPaymentSucceeded` active on R03–R09b |
| Session persistence          | ✅ All purchase state in `al-journey-v1`           |

**Visual status:** PIXEL PERFECT

---

## 3. Emergency Flow (R0 → E5)

**Route:** `/journey/emergency/rider-prompt` (or `contacts-empty`) → `/journey/emergency/contacts-summary` → `/journey/completed`

| Check                      | Status                                                     |
| -------------------------- | ---------------------------------------------------------- |
| Rider prompt guard         | ✅ `shouldEnterRiderPrompt(planId, riderCount)` → R0 or E0 |
| R0 Rider prompt            | ✅                                                         |
| R1 Rider mobile            | ✅                                                         |
| R2 Rider OTP               | ✅                                                         |
| R3 Rider name + relation   | ✅                                                         |
| R4 Riders summary          | ✅                                                         |
| E0 Contacts empty          | ✅                                                         |
| E1 Contact mobile          | ✅                                                         |
| E2 Contact OTP             | ✅                                                         |
| E3 Contact name + relation | ✅                                                         |
| E5 Contacts summary        | ✅ → `/journey/completed`                                  |
| Plan limits enforcement    | ✅ `emergency-limits.ts` only source                       |
| Session persistence        | ✅ Emergency state in `al-journey-v1`                      |
| Auth guard                 | ✅ `RequireAuthCompleted` + `RequireSelectedFlow`          |

**Visual status:** PIXEL PERFECT

---

## 4. Prepaid Flow

**Route:** `/journey/prepaid/welcome` → Auth → Emergency → Completed

| Check               | Status                                                            |
| ------------------- | ----------------------------------------------------------------- |
| Welcome screen      | ✅ `PrepaidWelcomeScreen` at `/journey/prepaid/welcome`           |
| Config loading      | ✅ `getDemoPrepaidLandingEntitlement`                             |
| Error state         | ✅ `WelcomeActivationErrorPanel`                                  |
| Loading skeleton    | ✅ `PartnerActivationCardSkeleton` + `PlanActivationCardSkeleton` |
| Flow activation     | ✅ `setSelectedFlow('prepaid')` → auth                            |
| Session             | ✅ `prepaid.entitlement` written to session                       |
| No purchase/payment | ✅ Confirmed — routes directly to auth                            |

**Visual status:** PIXEL PERFECT

---

## 5. B2B2C Flow

**Route:** `/journey/b2b2c/welcome` (plan-only) or `/journey/b2b2c/welcome/plan-rider` → Auth → Emergency

| Check                  | Status                                         |
| ---------------------- | ---------------------------------------------- |
| Plan-only welcome      | ✅ `PartnerWelcomeScreen variant="plan-only"`  |
| Plan-rider welcome     | ✅ `PartnerWelcomeScreen variant="plan-rider"` |
| Error + loading states | ✅ Shared `WelcomeActivationShell` pattern     |
| No purchase/payment    | ✅ Confirmed                                   |
| Flow activation        | ✅ `setSelectedFlow('b2b2c')` → auth           |

**Visual status:** PIXEL PERFECT

---

## 6. Post-Activation PWA

### SOS Flow

**Route:** `/pwa/scan/vehicle` → `/pwa/scan/sos` → hold → location → photos → sending → resolution

| Check                       | Status                                |
| --------------------------- | ------------------------------------- |
| Loading bootstrap           | ✅ 1200ms                             |
| Vehicle found hub           | ✅ `AlScannedVehicleCard` + hub cards |
| SOS requires HOLD (4000ms)  | ✅ Tap never triggers                 |
| SOS without auth            | ✅ No auth wall on SOS path           |
| Location permission flow    | ✅ Allow / deny branches              |
| Location unavailable branch | ✅                                    |
| Scene photos (optional)     | ✅ 4-angle capture                    |
| Sending alert screen        | ✅                                    |
| Help received state         | ✅                                    |
| Help dispatched state       | ✅                                    |
| Incident resolved           | ✅                                    |
| Alert cancelled             | ✅                                    |
| Contacts-only (no location) | ✅                                    |
| Leave confirm sheet         | ✅                                    |
| Couldn't send               | ✅                                    |
| Session persistence         | ✅ `al-pwa-scan-v1`                   |

### Park Me Flow

**Route:** `/pwa/scan/vehicle` → hub → auth (verify) → `/pwa/scan/park-me/*`

| Check                      | Status                                             |
| -------------------------- | -------------------------------------------------- |
| Auth required              | ✅ verify/mobile → verify/otp → verify/name        |
| Vehicle number entry       | ✅                                                 |
| Lookup                     | ✅                                                 |
| Confirm vehicle            | ✅ `AlVehicleConfirmationCard`                     |
| Protected consumer confirm | ✅ `AlVehicleConfirmationCard` (protected variant) |
| Photo capture (2 angles)   | ✅                                                 |
| Location captured          | ✅ From geolocation API — never hardcoded          |
| Review photos              | ✅                                                 |
| Status: checking           | ✅                                                 |
| Status: calling            | ✅                                                 |
| Status: resolved           | ✅                                                 |
| Photo not clear — retake   | ✅                                                 |

**Visual status:** PIXEL PERFECT

---

## 7. Session Persistence + Refresh Recovery

| Scenario                       | Behavior                                                                      | Status      |
| ------------------------------ | ----------------------------------------------------------------------------- | ----------- |
| Refresh mid-purchase           | Restores from `al-journey-v1` sessionStorage                                  | ✅          |
| Refresh mid-emergency          | Restores from `al-journey-v1`                                                 | ✅          |
| Tab close + reopen             | sessionStorage cleared — restart from `/journey`                              | ✅ Expected |
| Selected flow (new tab)        | localStorage `al-selected-flow` persists                                      | ✅          |
| Theme (new tab)                | localStorage `al-qr-theme` persists                                           | ✅          |
| PWA scan refresh               | Restores from `al-pwa-scan-v1`                                                | ✅          |
| After payment success back-nav | `redirectIfPaymentSucceeded` guard prevents going back to pre-payment screens | ✅          |

---

## 8. Verdict

All 7 flows (Auth, Purchase, Emergency, Prepaid, B2B2C, PWA SOS, PWA Park Me) verified.  
Navigation, guards, session persistence, error/loading/success states all confirmed correct.
