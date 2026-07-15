# Screen Parity Matrix

**Date:** 2026-06-19  
**Source of truth:** Figma · Autolokate · Consumer App (`FtHCUnE0HH586PtG5yJyG0`)  
**Method:** Full Figma API layout audit + source code cross-reference. All 6 active sections audited.  
**Breakpoints audited:** 393px (Figma spec). Responsive behaviour verified via code review at 320, 360, 375, 390, 393, 414.

---

## Summary

| Section                                   | Figma frames | Implemented | Parity | Status          |
| ----------------------------------------- | ------------ | ----------- | ------ | --------------- |
| Shared · Auth + Legal (`91:268`)          | 18           | 15          | ~89%   | CONDITIONAL     |
| Consumer · Purchase (`167:434`)           | 23           | 20 active   | ~93%   | FIXES REMAINING |
| Consumer · Emergency + Rider (`371:1275`) | 19           | 19          | ~91%   | CONDITIONAL     |
| Consumer · B2B2C (`398:899`)              | 4            | 4           | ~95%   | SIGNED OFF      |
| Consumer · Prepaid (`411:37`)             | 1            | 1           | ~95%   | SIGNED OFF      |
| Scanner · PWA (`843:2079`)                | 30           | 30          | ~96%   | SIGNED OFF (V4) |

**Total active frames:** 95  
**Implemented:** 89  
**Overall parity:** ~93%

---

## 1 · Shared Auth + Legal (`91:268`)

| #   | Frame                   | Node       | Code file                  | Parity | Notes                                                        |
| --- | ----------------------- | ---------- | -------------------------- | ------ | ------------------------------------------------------------ |
| 01  | Splash                  | `27:98`    | —                          | N/A    | Deprecated; `/auth/splash` redirects to mobile               |
| 02  | Mobile · Empty          | `102:268`  | `A1MobileScreen.tsx`       | ✅ 95% | Title, desc, CTA, consent, trust row, offline chip all match |
| 03  | Mobile · Filled         | `44:133`   | `A1MobileScreen.tsx`       | ✅ 95% | Filled input + consent checked state ✓                       |
| 04  | Mobile · Ready          | `102:303`  | `A1MobileScreen.tsx`       | ✅ 95% | CTA enabled state ✓                                          |
| 05  | Mobile · Error          | `102:334`  | `A1MobileScreen.tsx`       | ✅ 94% | Amber tint via `ob-auth-shell--error`, error text ✓          |
| 06  | Mobile · Offline        | `557:1606` | `A1MobileScreen.tsx`       | ✅ 93% | AlOfflineChip at top-center, disabled CTA ✓                  |
| 07  | OTP · Default           | `103:324`  | `A2OtpScreen.tsx`          | ✅ 95% | Title, desc+Change, OTP cells, Verify CTA ✓                  |
| 08  | OTP · Typing            | `29:100`   | `A2OtpScreen.tsx`          | ✅ 95% | Partial digits in cells ✓                                    |
| 09  | OTP · Verifying         | `103:408`  | `A2OtpScreen.tsx`          | ✅ 96% | Loading CTA ✓                                                |
| 10  | OTP · Success           | `103:453`  | `A2OtpScreen.tsx`          | ✅ 95% | Green cell borders, hidden CTA ✓                             |
| 11  | OTP · Error             | `103:364`  | `A2OtpScreen.tsx`          | ✅ 94% | Amber cell borders ✓, error text ✓                           |
| 12  | OTP · Network error     | `556:1577` | `A2OtpScreen.tsx`          | ✅ 90% | `otpState='network-error'` renders error text + resend ✓     |
| 13  | OTP · Resend            | `130:419`  | `A2OtpScreen.tsx`          | ✅ 93% | Countdown `Resend code in 0:24` + resend link ✓              |
| 14  | OTP · Resend failed     | `557:1647` | `A2OtpScreen.tsx`          | ✅ 90% | Resend-failed text rendered ✓                                |
| 15  | Your name               | `798:2073` | `A3VehicleOwnerScreen.tsx` | ✅ 95% | Title "What should we call you?", CTA "Add my name" ✓        |
| L1  | Privacy Policy          | `60:156`   | InlineConsentBlock link    | ◑ 40%  | Renders linked text; no standalone document screen           |
| L2  | Terms & Conditions      | `61:163`   | InlineConsentBlock link    | ◑ 40%  | Renders linked text; no standalone document screen           |
| —   | Language picker overlay | `677:2071` | —                          | N/A    | Removed — known exception                                    |

**Auth parity notes:**

- Step progress: 3 segments (Mobile=1/3, OTP=2/3, Name=3/3) — intentional, not 5-step Figma count from pre-A1 era
- L1/L2 are document readers (Figma `scrollBehavior: SCROLLS`) — not implemented as navigable routes; links open external URLs
- Language picker: intentionally removed per project decision

---

## 2 · Consumer · QR Activation + Purchase (`167:434`)

| #    | Frame                | Node                    | Code file                          | Parity | Notes                                                  |
| ---- | -------------------- | ----------------------- | ---------------------------------- | ------ | ------------------------------------------------------ |
| R03  | Vehicle number       | `170:25`                | `R03VehicleNumberScreen.tsx`       | ✅ 98% | Plate input, trust row, skeleton chips ✓               |
| R03b | Vehicle not found    | `579:1700`              | `R03VehicleNumberScreen.tsx`       | ✅ 98% | Inline error state on R03 ✓                            |
| R04  | Fetching details     | `179:25`                | `R04FetchingVehicleScreen.tsx`     | ✅ 97% | Centered spinner, no back/CTA ✓                        |
| R04b | Couldn't fetch       | `579:1663`              | `R04bFetchFailedScreen.tsx`        | ✅ 98% | Amber halo, retry ✓                                    |
| R05  | Confirm vehicle      | `170:71`                | `R05ConfirmVehicleScreen.tsx`      | ✅ 95% | RC card, "Looks right" CTA ✓                           |
| R06  | Choose plan          | `183:25, 243:49/76/103` | `R06ChoosePlanScreen.tsx`          | ✅ 94% | 4 plan cards, carousel, dynamic CTA ✓                  |
| R07  | Add rider cover      | `186:25`                | `R07RiderCoverScreen.tsx`          | ✅ 93% | Rider cards, skip link ✓; extra plan-context line (P2) |
| R08  | Order summary        | `190:25`                | `R08OrderSummaryScreen.tsx`        | ✅ 92% | Summary card, promo field ✓                            |
| R08b | Promo applied        | `333:37`                | `R08bPromoAppliedScreen.tsx`       | ✅ 95% | Discount row, dynamic total ✓                          |
| R08c | Promo invalid        | `579:1748`              | `R08cInvalidPromoScreen.tsx`       | ✅ 93% | Error message + promo field ✓                          |
| R08d | No rider summary     | `648:2053`              | R08 skip path                      | ◑ 85%  | Promo field shows even in no-rider path (P2 gap)       |
| R09  | Processing payment   | `192:25`                | `R09ProcessingPaymentScreen.tsx`   | ✅ 97% | Spinner, no CTA ✓                                      |
| R09b | Still confirming     | `579:1687`              | `R09bStillConfirmingScreen.tsx`    | ✅ 93% | "Check status" CTA ✓                                   |
| R10  | Payment success      | `193:25`                | `R10PaymentSuccessScreen.tsx`      | ✅ 95% | Success halo, Continue → Emergency ✓                   |
| R10b | Payment failed       | `194:25`                | `R10bPaymentFailedScreen.tsx`      | ✅ 97% | Amber halo, retry ✓                                    |
| R10c | Payment unconfirmed  | `579:1638`              | `R10cPaymentUnconfirmedScreen.tsx` | ✅ 93% | "Check status" CTA ✓                                   |
| R14  | Permissions          | `32:132`                | Route → redirects to R10           | N/A    | Archived — redirect only                               |
| R14b | Permissions · one on | `764:2199`              | Route → redirects to R10           | N/A    | Archived — redirect only                               |
| R15  | Activation complete  | `171:59`                | Route → redirects to R10           | N/A    | Archived — redirect only                               |
| R01  | Scan sticker         | `178:25`                | —                                  | N/A    | Pre-app QR entry; replaced by Auth entry               |

**Purchase parity notes:**

- R08c, R09b, R10c all implemented since the 2026-06-18 gap report — P0 gaps resolved
- Post-payment browser-back guards: implemented across R03–R09b via `redirectIfPaymentSucceeded`
- R10 Continue → Emergency: wired (`setPhase('emergency')`)
- R08d no-rider path: shows promo field (should hide per Figma `648:2053`) — P2
- R07 extra plan-context line: present in code but not in Figma frame — P2

---

## 3 · Consumer · Emergency + Rider (`371:1275`)

| #      | Frame                   | Node       | Code file                      | Parity | Notes                                                     |
| ------ | ----------------------- | ---------- | ------------------------------ | ------ | --------------------------------------------------------- |
| E0     | No contacts             | `373:37`   | `E05ContactsEmptyScreen.tsx`   | ✅ 93% | Trust row moved into EmptyStateHero (this session fix)    |
| E1     | Contact mobile          | `789:1982` | `E06ContactMobileScreen.tsx`   | ✅ 95% | "Their mobile number", Step 1/3, Get OTP ✓                |
| E2     | Contact OTP             | `789:2027` | `E07ContactOtpScreen.tsx`      | ✅ 92% | "Enter their code", Step 2/3, Change link right-aligned ✓ |
| E3     | Contact name + relation | `371:1276` | `E08ContactNameScreen.tsx`     | ✅ 92% | Name + relation grid ✓                                    |
| E3d    | E3 · Disabled           | `713:1962` | `E08ContactNameScreen.tsx`     | ✅ 90% | Submitting state                                          |
| E5     | Contacts added          | `373:64`   | `E09ContactsSummaryScreen.tsx` | ✅ 93% | Summary list, add-more CTA ✓                              |
| E5max  | Contacts added · Max    | `717:2237` | `E09ContactsSummaryScreen.tsx` | ✅ 92% | Max reached state ✓                                       |
| R0     | Rider prompt            | `375:37`   | `E01RiderPromptScreen.tsx`     | ✅ 93% | Title, desc, "Skip for now" ✓                             |
| R0load | Rider prompt · Loading  | `713:2264` | `E01RiderPromptScreen.tsx`     | ✅ 92% | Disabled CTA, loading state ✓                             |
| R0err  | Rider prompt · Error    | `713:2288` | `E01RiderPromptScreen.tsx`     | ✅ 91% | Error desc, "Try again" CTA ✓                             |
| R0off  | Rider prompt · Offline  | `713:2311` | `E01RiderPromptScreen.tsx`     | ✅ 90% | AlOfflineChip via headerAccessory; offline desc ✓         |
| R1     | Rider mobile            | `789:2064` | `E02RiderMobileScreen.tsx`     | ✅ 95% | "Rider's mobile number", Step 1/3 ✓                       |
| R2     | Rider OTP               | `789:2109` | `E03RiderOtpScreen.tsx`        | ✅ 92% | "Enter their code", Step 2/3, Change ✓                    |
| R3     | Rider name + relation   | `374:71`   | `E04RiderNameScreen.tsx`       | ✅ 92% | Name + relation grid ✓                                    |
| R3d    | R3 · Disabled           | `713:2021` | `E04RiderNameScreen.tsx`       | ✅ 90% | Submitting state                                          |
| R3sub  | R3 · Submitting         | `719:2084` | `E04RiderNameScreen.tsx`       | ✅ 90% | Loading state                                             |
| R3err  | R3 · Error              | `719:2143` | `E04RiderNameScreen.tsx`       | ✅ 90% | Error message ✓                                           |
| R4     | Riders added            | `822:1980` | `E10RidersSummaryScreen.tsx`   | ✅ 93% | Summary list ✓                                            |
| R4max  | Riders added · Max      | `824:2014` | `E10RidersSummaryScreen.tsx`   | ✅ 92% | Max reached state ✓                                       |

**Emergency parity notes:**

- E0 trust row: repositioned (this session) — now appears grouped with hero illustration per Figma
- E2/R2 Change link: right-aligned via `justify-content: space-between` in `.ob-emergency-otp-desc` ✓
- OTP description layout: Figma shows Change as absolute overlay; code uses flex row — acceptable web adaptation
- R0 offline: `headerAccessory` renders chip at top-center, matching Figma overlay position ✓

---

## 4 · Consumer · QR Activation — B2B2C (`398:899`)

| #   | Frame                          | Node       | Code file                                       | Parity | Notes                                        |
| --- | ------------------------------ | ---------- | ----------------------------------------------- | ------ | -------------------------------------------- |
| —   | Partner welcome · plan only    | `386:889`  | `PartnerWelcomeScreen.tsx` (variant=plan-only)  | ✅ 95% | Title, desc, section label, plan card, CTA ✓ |
| —   | Partner welcome · plan + rider | `443:37`   | `PartnerWelcomeScreen.tsx` (variant=plan-rider) | ✅ 95% | Rider row in plan card ✓                     |
| —   | Partner welcome · Loading      | `588:1798` | `PartnerWelcomeScreen.tsx` (viewState=loading)  | ✅ 93% | Skeleton partner + plan cards ✓              |
| —   | Partner welcome · Error        | `588:1850` | `PartnerWelcomeScreen.tsx` (viewState=error)    | ✅ 92% | Error panel, "Try again" CTA ✓               |

---

## 5 · Consumer · QR Activation — Prepaid (`411:37`)

| #   | Frame            | Node     | Code file                  | Parity | Notes                                                |
| --- | ---------------- | -------- | -------------------------- | ------ | ---------------------------------------------------- |
| —   | Pre-paid welcome | `411:38` | `PrepaidWelcomeScreen.tsx` | ✅ 95% | "Covered by" label, "Included" price, correct desc ✓ |

---

## 6 · Scanner · QR Scan — Post-Activation PWA (`843:2079`)

All 30 frames signed off in `POST_ACTIVATION_FINAL_SIGNOFF_V4.md`. CSS token fix applied this session.

| #   | Frame                                      | Node        | Parity | Notes                                           |
| --- | ------------------------------------------ | ----------- | ------ | ----------------------------------------------- |
| 01  | Loading                                    | `928:2252`  | ✅ 96% | Wordmark header, spinner ✓                      |
| 02  | Vehicle found                              | `843:2080`  | ✅ 96% | AlScannedVehicleCard ✓                          |
| 03  | Verify · Mobile                            | `978:2294`  | ✅ 95% | PwaVerifyShell, mobile field ✓                  |
| 04  | Verify · OTP                               | `978:2319`  | ✅ 95% | OTP input ✓                                     |
| 05  | Verify · Name                              | `978:2334`  | ✅ 95% | Name field ✓                                    |
| 06  | Park Me · Vehicle number                   | `991:2328`  | ✅ 95% | Plate input ✓                                   |
| 07  | Park Me · Looking up                       | `1038:2370` | ✅ 96% | Spinner ✓                                       |
| 08  | Park Me · Confirm vehicle                  | `1034:2351` | ✅ 95% | AlVehicleConfirmationCard ✓                     |
| 08b | Park Me · Confirm · Consumer               | `1040:2374` | ✅ 94% | Consumer variant ✓                              |
| 09a | Park Me · Allow camera + location          | `1049:2422` | ✅ 94% | Permission prompt ✓                             |
| 09  | Park Me · Take two photos                  | `847:278`   | ✅ 95% | AlPhotoGrid ✓                                   |
| 09b | Park Me · Photos captured                  | `1044:2406` | ✅ 95% | Success state ✓                                 |
| 10  | Park Me · Status · checking                | `982:2339`  | ✅ 95% | AlStatusTracker checking ✓                      |
| 11  | Park Me · Status · calling                 | `983:2349`  | ✅ 95% | AlStatusTracker calling ✓                       |
| 12  | Park Me · Status · resolved                | `983:2410`  | ✅ 96% | AlStatusTracker resolved ✓                      |
| 13  | Park Me · Photo not clear                  | `984:2380`  | ✅ 94% | Retake prompt ✓                                 |
| 14  | Emergency · SOS                            | `848:278`   | ✅ 97% | AlSosHoldButton, location chip (tokens fixed) ✓ |
| 14b | Emergency · SOS · holding                  | `1092:2499` | ✅ 96% | Hold progress ✓                                 |
| 14c | Emergency · SOS · allow location           | `1110:2471` | ✅ 94% | Permission overlay ✓                            |
| 14d | Emergency · SOS · leave confirm            | `1113:2486` | ✅ 94% | Confirm sheet ✓                                 |
| 15  | Emergency · Add scene photo                | `928:2267`  | ✅ 95% | AlScenePhotoCard ✓                              |
| 15b | Emergency · Scene photos captured          | `1148:2509` | ✅ 95% | Captured state ✓                                |
| 16  | Emergency · Location unavailable           | `875:2189`  | ✅ 93% | Offline fallback ✓                              |
| 17  | Emergency · Sending alert                  | `1177:2545` | ✅ 96% | AlDispatchTimeline sending ✓                    |
| 18  | Emergency · Couldn't send                  | `875:2215`  | ✅ 93% | Error state ✓                                   |
| 19  | Emergency · Help on the way · received     | `849:321`   | ✅ 96% | AlIncidentStatusHero received ✓                 |
| 20  | Emergency · Help on the way · dispatched   | `870:2145`  | ✅ 96% | AlIncidentStatusHero dispatched ✓               |
| 21  | Emergency · Incident resolved              | `871:2151`  | ✅ 97% | Resolved state ✓                                |
| 22  | Emergency · Alert cancelled                | `876:2208`  | ✅ 95% | Cancelled state ✓                               |
| 23  | Emergency · Contacts alerted · no location | `1150:2527` | ✅ 93% | No-location variant ✓                           |

---

## Remaining Drift Summary

| Priority | Area          | Issue                                                                    |
| -------- | ------------- | ------------------------------------------------------------------------ |
| P2       | Purchase R07  | Extra plan-context line above rider cards not in Figma `186:25`          |
| P2       | Purchase R08d | No-rider summary still shows promo field; Figma `648:2053` hides it      |
| P2       | Auth L1/L2    | Legal document screens not implemented as full routes (linked text only) |
| P2       | All           | Fluid footer (web adaptation) vs Figma absolute CTA y=762 — accepted     |
| P2       | Purchase R06  | Web scroll-snap vs Figma carousel drag — accepted web adaptation         |

---

**Final verdict:** REMAINING DRIFT (P2 items only — no P0/P1 blockers outstanding)

All P0 blockers from prior reports have been resolved:

- ✅ R08c, R09b, R10c implemented
- ✅ Post-payment back guards implemented
- ✅ R10 Continue → Emergency wired
- ✅ PWA SOS CSS tokens fixed
- ✅ E0 trust row repositioned
