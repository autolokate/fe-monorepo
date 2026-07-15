# Post-Activation PWA — Screen Matrix

**Audit date:** 2026-06-18  
**Verification:** Code inspection + live UI (`localhost:5175`) + Figma MCP node compare  
**Parity scale:** Per-screen % vs Figma frame (100% = exact match excluding approved exclusions)

**Approved exclusions:** StatusBar, language switcher.

---

## Summary

| Journey        | Frames | Avg parity | Routes OK | Branches OK         |
| -------------- | ------ | ---------- | --------- | ------------------- |
| Shared + entry | 5      | 84%        | ✅        | ✅                  |
| Park Me        | 13     | 68%        | ✅        | ❌ (13 unreachable) |
| SOS            | 14     | 72%        | ✅        | ❌ (18 unreachable) |
| **Overall**    | **30** | **~71%**   | **✅**    | **❌**              |

---

## Shared entry + verify

### 01 · Loading

| Field                 | Value                                                     |
| --------------------- | --------------------------------------------------------- |
| **Node ID**           | `928:2252`                                                |
| **Route**             | `/pwa/scan/loading`                                       |
| **Parity %**          | **82%**                                                   |
| **Missing assets**    | None                                                      |
| **Missing icons**     | None                                                      |
| **Layout drift**      | Spinner centered lower in Figma (~y180); impl flex-center |
| **Spacing drift**     | Gap 18px Figma vs 24px impl                               |
| **Typography drift**  | Title OK; subtitle wrong string                           |
| **Color drift**       | None significant                                          |
| **Animation drift**   | Spinner arc vs filled circle in Figma                     |
| **CTA drift**         | N/A                                                       |
| **Responsive issues** | None at 320–414                                           |
| **Theme issues**      | OK dark/light                                             |

**Copy drift:** Figma "No app needed. Loading the scanner securely." → impl "Getting this vehicle ready for you"

---

### 02 · Vehicle found

| Field                 | Value                                                        |
| --------------------- | ------------------------------------------------------------ |
| **Node ID**           | `843:2080`                                                   |
| **Route**             | `/pwa/scan/vehicle`                                          |
| **Parity %**          | **74%**                                                      |
| **Missing assets**    | None                                                         |
| **Missing icons**     | Emergency card: Figma `icon/bell` → impl `icon/heart`        |
| **Layout drift**      | **Major:** full `AlVehicleRcCard` vs compact 104px chip card |
| **Spacing drift**     | RC card adds ~300px vertical vs Figma                        |
| **Typography drift**  | Headlines match                                              |
| **Color drift**       | Park Me card border neutral OK; emergency tint OK            |
| **Animation drift**   | Spring press present ✅                                      |
| **CTA drift**         | Card titles/subtitles match ✅                               |
| **Responsive issues** | RC card overflow risk at 320px                               |
| **Theme issues**      | OK                                                           |

---

### 03 · Verify · Mobile

| Field                 | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| **Node ID**           | `978:2294`                                             |
| **Route**             | `/pwa/scan/verify/mobile`                              |
| **Parity %**          | **92%**                                                |
| **Missing assets**    | None                                                   |
| **Missing icons**     | None                                                   |
| **Layout drift**      | Auth shell vs Figma logo-top layout (acceptable reuse) |
| **Spacing drift**     | Minor — step progress hidden ✅                        |
| **Typography drift**  | Title/description match Figma                          |
| **Color drift**       | None                                                   |
| **Animation drift**   | Fade transition ✅                                     |
| **CTA drift**         | "Get OTP" matches                                      |
| **Responsive issues** | None                                                   |
| **Theme issues**      | OK                                                     |
| **Exclusions**        | Language switcher correctly omitted ✅                 |

**Consent copy:** Bystander variant matches Figma ✅

---

### 04 · Verify · OTP

| Field                 | Value                        |
| --------------------- | ---------------------------- |
| **Node ID**           | `978:2319`                   |
| **Route**             | `/pwa/scan/verify/otp`       |
| **Parity %**          | **90%**                      |
| **Missing assets**    | None                         |
| **Missing icons**     | None                         |
| **Layout drift**      | Reuses A2 shell              |
| **Spacing drift**     | Minor                        |
| **Typography drift**  | Minor — WhatsApp line format |
| **Color drift**       | Amber errors ✅              |
| **Animation drift**   | OK                           |
| **CTA drift**         | "Verify" + Change link ✅    |
| **Responsive issues** | None                         |
| **Theme issues**      | OK                           |

---

### 05 · Verify · Name

| Field                 | Value                   |
| --------------------- | ----------------------- |
| **Node ID**           | `978:2334`              |
| **Route**             | `/pwa/scan/verify/name` |
| **Parity %**          | **91%**                 |
| **Missing assets**    | None                    |
| **Missing icons**     | None                    |
| **Layout drift**      | Reuses A3 shell         |
| **Spacing drift**     | Minor                   |
| **Typography drift**  | PWA copy matches intent |
| **Color drift**       | None                    |
| **Animation drift**   | OK                      |
| **CTA drift**         | "Continue" ✅           |
| **Responsive issues** | None                    |
| **Theme issues**      | OK                      |

---

## Park Me

### 06 · Vehicle number

| Field                 | Value                              |
| --------------------- | ---------------------------------- |
| **Node ID**           | `991:2328`                         |
| **Route**             | `/pwa/scan/park-me/vehicle-number` |
| **Parity %**          | **88%**                            |
| **Missing assets**    | None                               |
| **Missing icons**     | None                               |
| **Layout drift**      | R03 reuse — custom title ✅        |
| **Spacing drift**     | Minor                              |
| **Typography drift**  | Custom copy matches audit          |
| **Color drift**       | None                               |
| **Animation drift**   | OK                                 |
| **CTA drift**         | "Continue" / plate validation ✅   |
| **Responsive issues** | None                               |
| **Theme issues**      | OK                                 |

---

### 07 · Looking up vehicle

| Field                 | Value                                             |
| --------------------- | ------------------------------------------------- |
| **Node ID**           | `1038:2370`                                       |
| **Route**             | `/pwa/scan/park-me/looking-up`                    |
| **Parity %**          | **85%**                                           |
| **Missing assets**    | None                                              |
| **Missing icons**     | None                                              |
| **Layout drift**      | R04 reuse                                         |
| **Spacing drift**     | OK                                                |
| **Typography drift**  | **Drift:** purchase R04 copy not Park Me specific |
| **Color drift**       | None                                              |
| **Animation drift**   | Spinner OK                                        |
| **CTA drift**         | N/A                                               |
| **Responsive issues** | None                                              |
| **Theme issues**      | OK                                                |

---

### 08 · Confirm vehicle (plain)

| Field                 | Value                       |
| --------------------- | --------------------------- |
| **Node ID**           | `1034:2351`                 |
| **Route**             | `/pwa/scan/park-me/confirm` |
| **Parity %**          | **86%**                     |
| **Missing assets**    | None                        |
| **Missing icons**     | None                        |
| **Layout drift**      | R05 reuse                   |
| **Spacing drift**     | OK                          |
| **Typography drift**  | OK                          |
| **Color drift**       | Plain card OK               |
| **Animation drift**   | OK                          |
| **CTA drift**         | "Confirm" ✅                |
| **Responsive issues** | None                        |
| **Theme issues**      | OK                          |

---

### 08b · Confirm · Autolokate consumer

| Field                 | Value                                 |
| --------------------- | ------------------------------------- |
| **Node ID**           | `1040:2374`                           |
| **Route**             | `/pwa/scan/park-me/confirm-protected` |
| **Parity %**          | **84%**                               |
| **Missing assets**    | None                                  |
| **Missing icons**     | None                                  |
| **Layout drift**      | Green glow added in CSS — approximate |
| **Spacing drift**     | OK                                    |
| **Typography drift**  | Plan label present                    |
| **Color drift**       | Protected green OK                    |
| **Animation drift**   | OK                                    |
| **CTA drift**         | "Confirm" ✅                          |
| **Responsive issues** | None                                  |
| **Theme issues**      | OK                                    |

---

### 09a · Allow camera & location

| Field                 | Value                           |
| --------------------- | ------------------------------- |
| **Node ID**           | `1049:2422`                     |
| **Route**             | `/pwa/scan/park-me/permissions` |
| **Parity %**          | **87%**                         |
| **Missing assets**    | None                            |
| **Missing icons**     | None                            |
| **Layout drift**      | Sheet over dimmed backdrop ✅   |
| **Spacing drift**     | OK                              |
| **Typography drift**  | Sheet copy reasonable           |
| **Color drift**       | OK                              |
| **Animation drift**   | Sheet CSS transition ✅         |
| **CTA drift**         | "Allow access" ✅               |
| **Responsive issues** | None                            |
| **Theme issues**      | OK                              |

---

### 09 · Take two photos

| Field                 | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| **Node ID**           | `847:278`                                                         |
| **Route**             | `/pwa/scan/park-me/photos`                                        |
| **Parity %**          | **52%** ❌                                                        |
| **Missing assets**    | Map tile imagery                                                  |
| **Missing icons**     | Figma `icon/camera` → impl `icon/scan-line`                       |
| **Layout drift**      | **Critical:** 2-col grid vs 2 stacked 361×160 boxes               |
| **Spacing drift**     | Box heights 160px Figma vs square aspect-ratio                    |
| **Typography drift**  | Title "Add photos and location" → "Take two photos"; labels wrong |
| **Color drift**       | OK                                                                |
| **Animation drift**   | OK                                                                |
| **CTA drift**         | **"Send to owner"** → **"Continue"**; missing helper text         |
| **Responsive issues** | Grid OK; layout still wrong vs Figma                              |
| **Theme issues**      | OK                                                                |

---

### 09b · Photos & location captured

| Field                 | Value                      |
| --------------------- | -------------------------- |
| **Node ID**           | `1044:2406`                |
| **Route**             | `/pwa/scan/park-me/review` |
| **Parity %**          | **78%**                    |
| **Missing assets**    | Map preview                |
| **Missing icons**     | None                       |
| **Layout drift**      | Review grid approximate    |
| **Spacing drift**     | OK                         |
| **Typography drift**  | Headline OK                |
| **Color drift**       | OK                         |
| **Animation drift**   | OK                         |
| **CTA drift**         | "Send to owner" ✅         |
| **Responsive issues** | None                       |
| **Theme issues**      | OK                         |

---

### 10 · Status · checking

| Field                 | Value                                                     |
| --------------------- | --------------------------------------------------------- |
| **Node ID**           | `982:2339`                                                |
| **Route**             | `/pwa/scan/park-me/status/checking`                       |
| **Parity %**          | **48%** ❌                                                |
| **Missing assets**    | Amber active glyph blur                                   |
| **Missing icons**     | `icon/shield-check` active glyph                          |
| **Layout drift**      | 4 steps vs **6** Figma steps; no subtitles                |
| **Spacing drift**     | Tracker height ~420px Figma vs compact                    |
| **Typography drift**  | "Reaching the owner" → "Reaching owner"; missing subtitle |
| **Color drift**       | Amber active state simplified                             |
| **Animation drift**   | Auto-advance OK                                           |
| **CTA drift**         | N/A                                                       |
| **Responsive issues** | None                                                      |
| **Theme issues**      | OK                                                        |

---

### 11 · Status · calling

| Field                 | Value                                             |
| --------------------- | ------------------------------------------------- |
| **Node ID**           | `983:2349`                                        |
| **Route**             | `/pwa/scan/park-me/status/calling`                |
| **Parity %**          | **50%** ❌                                        |
| **Missing assets**    | Same as 10                                        |
| **Missing icons**     | Same                                              |
| **Layout drift**      | Simplified timeline                               |
| **Spacing drift**     | Same                                              |
| **Typography drift**  | "Calling owner" vs "Calling the owner" + subtitle |
| **Color drift**       | Same                                              |
| **Animation drift**   | Step transition OK                                |
| **CTA drift**         | N/A                                               |
| **Responsive issues** | None                                              |
| **Theme issues**      | OK                                                |

---

### 12 · Status · resolved

| Field                 | Value                                    |
| --------------------- | ---------------------------------------- |
| **Node ID**           | `983:2410`                               |
| **Route**             | `/pwa/scan/park-me/status/resolved`      |
| **Parity %**          | **55%** ❌                               |
| **Missing assets**    | Final step "Owner is moving it"          |
| **Missing icons**     | None                                     |
| **Layout drift**      | 4 steps vs 6; missing final step         |
| **Spacing drift**     | Same                                     |
| **Typography drift**  | "Owner notified" vs "Owner is moving it" |
| **Color drift**       | OK                                       |
| **Animation drift**   | OK                                       |
| **CTA drift**         | "Done" ✅                                |
| **Responsive issues** | None                                     |
| **Theme issues**      | OK                                       |

---

### 13 · Photo wasn't clear

| Field                 | Value                                |
| --------------------- | ------------------------------------ |
| **Node ID**           | `984:2380`                           |
| **Route**             | `/pwa/scan/park-me/photo-not-clear`  |
| **Parity %**          | **65%** (UI only) / **0% branch** ❌ |
| **Missing assets**    | None                                 |
| **Missing icons**     | None                                 |
| **Layout drift**      | Screen renders on deep link          |
| **Spacing drift**     | OK                                   |
| **Typography drift**  | Headline OK                          |
| **Color drift**       | Amber error step present             |
| **Animation drift**   | N/A                                  |
| **CTA drift**         | "Retake photo" ✅                    |
| **Responsive issues** | None                                 |
| **Theme issues**      | OK                                   |
| **Branch**            | **UNREACHABLE** from status flow     |

---

## SOS

### 14 · Emergency · SOS

| Field                 | Value                                          |
| --------------------- | ---------------------------------------------- |
| **Node ID**           | `848:278`                                      |
| **Route**             | `/pwa/scan/sos`                                |
| **Parity %**          | **79%**                                        |
| **Missing assets**    | None                                           |
| **Missing icons**     | None                                           |
| **Layout drift**      | Hold button present; chip differs              |
| **Spacing drift**     | OK                                             |
| **Typography drift**  | "Emergency" → "Emergency SOS"                  |
| **Color drift**       | Red ambient OK                                 |
| **Animation drift**   | Hold navigates to separate route (split state) |
| **CTA drift**         | "Or call 112 directly" → "Call 112"            |
| **Responsive issues** | SOS disc OK at 320px                           |
| **Theme issues**      | OK                                             |

---

### 14b · SOS · holding

| Field                 | Value                               |
| --------------------- | ----------------------------------- |
| **Node ID**           | `1092:2499`                         |
| **Route**             | `/pwa/scan/sos/holding`             |
| **Parity %**          | **83%**                             |
| **Missing assets**    | None                                |
| **Missing icons**     | None                                |
| **Layout drift**      | Separate route vs in-place on Figma |
| **Spacing drift**     | OK                                  |
| **Typography drift**  | "Keep holding" ✅                   |
| **Color drift**       | OK                                  |
| **Animation drift**   | Progress ring ✅                    |
| **CTA drift**         | N/A                                 |
| **Responsive issues** | None                                |
| **Theme issues**      | OK                                  |

---

### 14c · SOS · allow location

| Field                 | Value                          |
| --------------------- | ------------------------------ |
| **Node ID**           | `1110:2471`                    |
| **Route**             | `/pwa/scan/sos/allow-location` |
| **Parity %**          | **88%**                        |
| **Missing assets**    | None                           |
| **Missing icons**     | None                           |
| **Layout drift**      | Sheet ✅                       |
| **Spacing drift**     | OK                             |
| **Typography drift**  | OK                             |
| **Color drift**       | OK                             |
| **Animation drift**   | OK                             |
| **CTA drift**         | "Allow location" ✅            |
| **Responsive issues** | None                           |
| **Theme issues**      | OK                             |

---

### 14d · SOS · leave confirm

| Field                 | Value                         |
| --------------------- | ----------------------------- |
| **Node ID**           | `1113:2486`                   |
| **Route**             | `/pwa/scan/sos/leave-confirm` |
| **Parity %**          | **89%**                       |
| **Missing assets**    | None                          |
| **Missing icons**     | None                          |
| **Layout drift**      | Sheet ✅                      |
| **Spacing drift**     | OK                            |
| **Typography drift**  | OK                            |
| **Color drift**       | OK                            |
| **Animation drift**   | OK                            |
| **CTA drift**         | Stay / Leave anyway ✅        |
| **Responsive issues** | None                          |
| **Theme issues**      | OK                            |

---

### 15 · Add scene photo

| Field                 | Value                                          |
| --------------------- | ---------------------------------------------- |
| **Node ID**           | `928:2267`                                     |
| **Route**             | `/pwa/scan/sos/scene-photos`                   |
| **Parity %**          | **86%**                                        |
| **Missing assets**    | None                                           |
| **Missing icons**     | `icon/camera` → `icon/scan-line`               |
| **Layout drift**      | 2×2 grid matches Figma ✅                      |
| **Spacing drift**     | Cell 174.5×140 Figma vs aspect-ratio 1:1       |
| **Typography drift**  | "Add photos of the scene" → "Add scene photos" |
| **Color drift**       | OK                                             |
| **Animation drift**   | OK                                             |
| **CTA drift**         | "Send without photos" ✅                       |
| **Responsive issues** | Minor cell proportion at 320px                 |
| **Theme issues**      | OK                                             |

---

### 15b · Scene photos captured

| Field                 | Value                                 |
| --------------------- | ------------------------------------- |
| **Node ID**           | `1148:2509`                           |
| **Route**             | `/pwa/scan/sos/scene-photos/captured` |
| **Parity %**          | **88%**                               |
| **Missing assets**    | None                                  |
| **Missing icons**     | Same camera icon drift                |
| **Layout drift**      | OK                                    |
| **Spacing drift**     | OK                                    |
| **Typography drift**  | OK                                    |
| **Color drift**       | OK                                    |
| **Animation drift**   | OK                                    |
| **CTA drift**         | "Send now" ✅                         |
| **Responsive issues** | None                                  |
| **Theme issues**      | OK                                    |

---

### 16 · Location unavailable

| Field                 | Value                                      |
| --------------------- | ------------------------------------------ |
| **Node ID**           | `875:2189`                                 |
| **Route**             | `/pwa/scan/sos/location-unavailable`       |
| **Parity %**          | **83%**                                    |
| **Missing assets**    | SOS-specific halo (uses fetch-failed halo) |
| **Missing icons**     | None                                       |
| **Layout drift**      | PurchaseStatusShell pattern                |
| **Spacing drift**     | OK                                         |
| **Typography drift**  | Approximate                                |
| **Color drift**       | Attention ambient OK                       |
| **Animation drift**   | OK                                         |
| **CTA drift**         | Both CTAs present ✅                       |
| **Responsive issues** | None                                       |
| **Theme issues**      | OK                                         |

---

### 17 · Sending alert

| Field                 | Value                   |
| --------------------- | ----------------------- |
| **Node ID**           | `1177:2545`             |
| **Route**             | `/pwa/scan/sos/sending` |
| **Parity %**          | **85%**                 |
| **Missing assets**    | None                    |
| **Missing icons**     | None                    |
| **Layout drift**      | Status shell OK         |
| **Spacing drift**     | OK                      |
| **Typography drift**  | OK                      |
| **Color drift**       | OK                      |
| **Animation drift**   | Spinner ✅              |
| **CTA drift**         | Cancel as text link ✅  |
| **Responsive issues** | None                    |
| **Theme issues**      | OK                      |

---

### 18 · Couldn't send

| Field                 | Value                                                   |
| --------------------- | ------------------------------------------------------- |
| **Node ID**           | `875:2215`                                              |
| **Route**             | `/pwa/scan/sos/couldnt-send`                            |
| **Parity %**          | **80%** (UI) / **0% branch** ❌                         |
| **Missing assets**    | Dedicated halo                                          |
| **Missing icons**     | None                                                    |
| **Layout drift**      | OK                                                      |
| **Spacing drift**     | OK                                                      |
| **Typography drift**  | OK                                                      |
| **Color drift**       | OK                                                      |
| **Animation drift**   | OK                                                      |
| **CTA drift**         | "Retry now" ✅                                          |
| **Responsive issues** | None                                                    |
| **Theme issues**      | OK                                                      |
| **Branch**            | **UNREACHABLE** — `simulateNetworkFail` never triggered |

---

### 19 · Help on the way · received

| Field                 | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| **Node ID**           | `849:321`                                                  |
| **Route**             | `/pwa/scan/sos/help-received`                              |
| **Parity %**          | **42%** ❌                                                 |
| **Missing assets**    | Amber activity glyph                                       |
| **Missing icons**     | `icon/activity`                                            |
| **Layout drift**      | **10 Figma steps** → **4 impl steps**                      |
| **Spacing drift**     | Major — tracker height                                     |
| **Typography drift**  | "Help is on the way" → "Help on the way"; missing subtitle |
| **Color drift**       | OK                                                         |
| **Animation drift**   | Auto-advance OK                                            |
| **CTA drift**         | "I'm safe, cancel alert" → "Cancel alert"                  |
| **Responsive issues** | Long timeline would scroll in Figma; impl short            |
| **Theme issues**      | OK                                                         |

---

### 20 · Help on the way · dispatched

| Field                 | Value                                         |
| --------------------- | --------------------------------------------- |
| **Node ID**           | `870:2145`                                    |
| **Route**             | `/pwa/scan/sos/help-dispatched`               |
| **Parity %**          | **45%** ❌                                    |
| **Missing assets**    | Same as 19                                    |
| **Missing icons**     | Same                                          |
| **Layout drift**      | Simplified timeline                           |
| **Spacing drift**     | Same                                          |
| **Typography drift**  | "Help dispatched" vs Figma progressive labels |
| **Color drift**       | OK                                            |
| **Animation drift**   | OK                                            |
| **CTA drift**         | Cancel drift                                  |
| **Responsive issues** | None                                          |
| **Theme issues**      | OK                                            |

---

### 21 · Incident resolved

| Field                 | Value                    |
| --------------------- | ------------------------ |
| **Node ID**           | `871:2151`               |
| **Route**             | `/pwa/scan/sos/resolved` |
| **Parity %**          | **50%** ❌               |
| **Missing assets**    | Full timeline completion |
| **Missing icons**     | None                     |
| **Layout drift**      | 4 steps vs 10            |
| **Spacing drift**     | Same                     |
| **Typography drift**  | "Incident resolved" OK   |
| **Color drift**       | OK                       |
| **Animation drift**   | OK                       |
| **CTA drift**         | "Done" ✅                |
| **Responsive issues** | None                     |
| **Theme issues**      | OK                       |

---

### 22 · Alert cancelled

| Field                 | Value                           |
| --------------------- | ------------------------------- |
| **Node ID**           | `876:2208`                      |
| **Route**             | `/pwa/scan/sos/alert-cancelled` |
| **Parity %**          | **82%**                         |
| **Missing assets**    | Neutral halo asset              |
| **Missing icons**     | None                            |
| **Layout drift**      | Status shell                    |
| **Spacing drift**     | OK                              |
| **Typography drift**  | OK                              |
| **Color drift**       | OK                              |
| **Animation drift**   | OK                              |
| **CTA drift**         | "Done" ✅                       |
| **Responsive issues** | None                            |
| **Theme issues**      | OK                              |

---

### 23 · Contacts alerted · no location

| Field                 | Value                                  |
| --------------------- | -------------------------------------- |
| **Node ID**           | `1150:2527`                            |
| **Route**             | `/pwa/scan/sos/contacts-only`          |
| **Parity %**          | **75%**                                |
| **Missing assets**    | None                                   |
| **Missing icons**     | None                                   |
| **Layout drift**      | 2-step timeline vs Figma short variant |
| **Spacing drift**     | OK                                     |
| **Typography drift**  | "Contacts alerted" OK                  |
| **Color drift**       | OK                                     |
| **Animation drift**   | OK                                     |
| **CTA drift**         | "Turn on location" ✅                  |
| **Responsive issues** | None                                   |
| **Theme issues**      | OK                                     |

---

## Entry · QR Scan (not a numbered frame)

| Field              | Value                                 |
| ------------------ | ------------------------------------- |
| **Node ID**        | N/A (product entry)                   |
| **Route**          | `/journey` card → `/pwa/scan/loading` |
| **Parity %**       | **70%**                               |
| **Missing assets** | QR scanner viewport                   |
| **Missing icons**  | None                                  |
| **Layout drift**   | No camera scan screen                 |
| **Branch**         | Functional entry ✅                   |

---

## Responsive matrix (sampled)

| Width | Screen          | Overflow | Clipping | Notes                 |
| ----- | --------------- | -------- | -------- | --------------------- |
| 320   | Vehicle found   | ⚠️       | ⚠️       | Full RC card tall     |
| 360   | Verify mobile   | ✅       | ✅       | OK                    |
| 375   | SOS hold        | ✅       | ✅       | OK                    |
| 390   | Park Me photos  | ✅       | ✅       | Wrong layout but fits |
| 393   | Reference       | ✅       | ✅       | Target width          |
| 414   | Status checking | ✅       | ✅       | OK                    |

---

## Theme matrix (sampled)

| Screen         | Dark | Light |
| -------------- | ---- | ----- |
| Vehicle found  | ✅   | ✅    |
| Verify mobile  | ✅   | ✅    |
| Park Me photos | ✅   | ✅    |
| SOS            | ✅   | ✅    |
| Status shells  | ✅   | ✅    |

Light theme inherits from `/journey` toggle; no in-PWA theme control.
