# Post-Activation PWA — Visual Reconstruction Audit

**Audit date:** 2026-06-18  
**Method:** Human side-by-side comparison of Figma PNG exports vs live PWA screenshots only  
**Capture set:** `docs/audit-screenshots/{figma,live,compare}/` · viewport 393×852 · dark theme  
**Excluded from scoring:** Parity percentages, prior reports, DOM/overflow instrumentation

**Question answered:** If a designer opens Figma and the live app side by side, which screens would they say are completely different?

---

## Classification key

| Grade | Meaning                                                                             |
| ----- | ----------------------------------------------------------------------------------- |
| **A** | Visually identical — designer would not flag the screen                             |
| **B** | Minor drift — same screen; spacing, typography, or chrome tweaks                    |
| **C** | Major drift — same screen intent; obvious visual differences                        |
| **D** | Different screen — different hierarchy, hero, cards, timeline, or interaction model |

---

## Screen-by-screen audit (30/30)

### 01 · Loading

| Field              | Value                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `928:2252`                                                                                                                                                                                                  |
| **Live route**     | `/pwa/scan/loading`                                                                                                                                                                                         |
| **Classification** | **B — Minor drift**                                                                                                                                                                                         |
| **Reason**         | Same centered spinner + headline + subtext composition. Live drops the Autolokate wordmark (icon-only header), spinner sits lower, and arc weight differs slightly. Still reads as the same loading screen. |
| **Screenshots**    | [compare/01-loading.png](audit-screenshots/compare/01-loading.png) · [figma](audit-screenshots/figma/01-loading.png) · [live](audit-screenshots/live/01-loading.png)                                        |

---

### 02 · Vehicle found

| Field              | Value                                                                                                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `843:2080`                                                                                                                                                                                                                                                                             |
| **Live route**     | `/pwa/scan/vehicle`                                                                                                                                                                                                                                                                    |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                                                                    |
| **Reason**         | Same three-block hierarchy (headline → vehicle chip → two action cards) but headline scale/wrapping is heavier, emergency card border/glow is oversaturated, vehicle badge adds extra “· Safe” copy, and header wordmark is missing. Cards read as the same pattern with wrong polish. |
| **Screenshots**    | [compare/02-vehicle-found.png](audit-screenshots/compare/02-vehicle-found.png) · [figma](audit-screenshots/figma/02-vehicle-found.png) · [live](audit-screenshots/live/02-vehicle-found.png)                                                                                           |

---

### 03 · Verify · Mobile

| Field              | Value                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Figma node**     | `978:2294`                                                                                                                                                                                                                                                                     |
| **Live route**     | `/pwa/scan/verify/mobile`                                                                                                                                                                                                                                                      |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                                                            |
| **Reason**         | Form skeleton matches (back, title, phone field, consent, CTA) but Figma’s centered logo + language row is gone, live adds “Enter your number to continue” helper, checkbox/link styling diverges, and field state differs (filled vs empty). Same step, different auth shell. |
| **Screenshots**    | [compare/03-verify-mobile.png](audit-screenshots/compare/03-verify-mobile.png) · [figma](audit-screenshots/figma/03-verify-mobile.png) · [live](audit-screenshots/live/03-verify-mobile.png)                                                                                   |

---

### 04 · Verify · OTP

| Field              | Value                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `978:2319`                                                                                                                                                                                                                   |
| **Live route**     | `/pwa/scan/verify/otp`                                                                                                                                                                                                       |
| **Classification** | **C — Major drift**                                                                                                                                                                                                          |
| **Reason**         | OTP boxes and resend timer align, but wordmark header is missing, live adds a green radial wash not in Figma, active box focus ring absent, and Verify button width/contrast reads disabled vs Figma’s full-width white CTA. |
| **Screenshots**    | [compare/04-verify-otp.png](audit-screenshots/compare/04-verify-otp.png) · [figma](audit-screenshots/figma/04-verify-otp.png) · [live](audit-screenshots/live/04-verify-otp.png)                                             |

---

### 05 · Verify · Name

| Field              | Value                                                                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `978:2334`                                                                                                                                                                                                                                      |
| **Live route**     | `/pwa/scan/verify/name`                                                                                                                                                                                                                         |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                             |
| **Reason**         | Single-field form matches structurally, but subcopy differs (“reported it” vs “reached out”), Figma helper line above CTA is missing on live, wordmark header absent, and CTA emphasis inverts (grey disabled in Figma vs solid white on live). |
| **Screenshots**    | [compare/05-verify-name.png](audit-screenshots/compare/05-verify-name.png) · [figma](audit-screenshots/figma/05-verify-name.png) · [live](audit-screenshots/live/05-verify-name.png)                                                            |

---

### 06 · Park Me · Vehicle number

| Field              | Value                                                                                                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `991:2328`                                                                                                                                                                                                                                                                  |
| **Live route**     | `/pwa/scan/park-me/vehicle-number`                                                                                                                                                                                                                                          |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                    |
| **Reason**         | Figma is a minimal plate field (“Your vehicle number” → Continue). Live is a Vahan lookup screen with different headline, six metadata chips, encryption footnote, and “Fetch from Vahan” CTA. Different layout hierarchy and interaction model despite same route purpose. |
| **Screenshots**    | [compare/06-park-me-vehicle-number.png](audit-screenshots/compare/06-park-me-vehicle-number.png) · [figma](audit-screenshots/figma/06-park-me-vehicle-number.png) · [live](audit-screenshots/live/06-park-me-vehicle-number.png)                                            |

---

### 07 · Park Me · Looking up

| Field              | Value                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1038:2370`                                                                                                                                                                                                      |
| **Live route**     | `/pwa/scan/park-me/looking-up`                                                                                                                                                                                   |
| **Classification** | **C — Major drift**                                                                                                                                                                                              |
| **Reason**         | Spinner loading pattern matches Frame 01, but logo wordmark missing, headline wraps to two lines on live, and vertical centering sits lower. Same loading archetype, not the same composition.                   |
| **Screenshots**    | [compare/07-park-me-looking-up.png](audit-screenshots/compare/07-park-me-looking-up.png) · [figma](audit-screenshots/figma/07-park-me-looking-up.png) · [live](audit-screenshots/live/07-park-me-looking-up.png) |

---

### 08 · Park Me · Confirm vehicle (plain)

| Field              | Value                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1034:2351`                                                                                                                                                                                                                                                               |
| **Live route**     | `/pwa/scan/park-me/confirm`                                                                                                                                                                                                                                               |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                  |
| **Reason**         | Figma uses a compact vehicle chip (car icon + plate + color/model + “From your RC records”). Live uses a full RC certificate card (RC label, Verified pill, oversized plate, watermark). Different card structure, copy, and CTA label (“Yes, that’s mine” vs “Confirm”). |
| **Screenshots**    | [compare/08-park-me-confirm.png](audit-screenshots/compare/08-park-me-confirm.png) · [figma](audit-screenshots/figma/08-park-me-confirm.png) · [live](audit-screenshots/live/08-park-me-confirm.png)                                                                      |

---

### 08b · Park Me · Confirm · protected

| Field              | Value                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1040:2374`                                                                                                                                                                                                                                                                           |
| **Live route**     | `/pwa/scan/park-me/confirm-protected`                                                                                                                                                                                                                                                 |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                              |
| **Reason**         | Figma green-bordered chip keeps “Protected by Autolokate · Shield plan” inside the card footer. Live repeats the RC certificate paradigm with protection callout moved outside the card. Different hero card and headline intent (“Is this your vehicle?” vs “Confirm your vehicle”). |
| **Screenshots**    | [compare/08b-park-me-confirm-protected.png](audit-screenshots/compare/08b-park-me-confirm-protected.png) · [figma](audit-screenshots/figma/08b-park-me-confirm-protected.png) · [live](audit-screenshots/live/08b-park-me-confirm-protected.png)                                      |

---

### 09 · Park Me · Add photos and location

| Field              | Value                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `847:278`                                                                                                                                                                                                                                                                 |
| **Live route**     | `/pwa/scan/park-me/photos`                                                                                                                                                                                                                                                |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                  |
| **Reason**         | Figma stacks three equal dashed capture tiles (label above icon). Live inverts each tile (icon above label), changes proportions, fills the location tile solid grey instead of dashed, and drops the wordmark. Card structure and visual rhythm are not the same screen. |
| **Screenshots**    | [compare/09-park-me-photos.png](audit-screenshots/compare/09-park-me-photos.png) · [figma](audit-screenshots/figma/09-park-me-photos.png) · [live](audit-screenshots/live/09-park-me-photos.png)                                                                          |

---

### 09a · Park Me · Allow camera & location

| Field              | Value                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Figma node**     | `1049:2422`                                                                                                                                                                                                                    |
| **Live route**     | `/pwa/scan/park-me/permissions`                                                                                                                                                                                                |
| **Classification** | **C — Major drift**                                                                                                                                                                                                            |
| **Reason**         | Bottom sheet pattern matches, but background cards invert label/icon order, sheet body copy differs, live adds “Not now” secondary action, and header wordmark missing. Same overlay type, different content and card grammar. |
| **Screenshots**    | [compare/09a-park-me-permissions.png](audit-screenshots/compare/09a-park-me-permissions.png) · [figma](audit-screenshots/figma/09a-park-me-permissions.png) · [live](audit-screenshots/live/09a-park-me-permissions.png)       |

---

### 09b · Park Me · Check and send

| Field              | Value                                                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1044:2406`                                                                                                                                                                                                                                                                                  |
| **Live route**     | `/pwa/scan/park-me/review`                                                                                                                                                                                                                                                                   |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                                     |
| **Reason**         | Figma shows two large photo review cards with retake icons plus a map/location card. Live renders **no photo cards at all** — only a simplified location block — leaving a void where the primary content should be. Different layout hierarchy and interaction model (retake vs send-only). |
| **Screenshots**    | [compare/09b-park-me-review.png](audit-screenshots/compare/09b-park-me-review.png) · [figma](audit-screenshots/figma/09b-park-me-review.png) · [live](audit-screenshots/live/09b-park-me-review.png)                                                                                         |

---

### 10 · Park Me · Reaching the owner (checking)

| Field              | Value                                                                                                                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `982:2339`                                                                                                                                                                                                                                                     |
| **Live route**     | `/pwa/scan/park-me/status/checking`                                                                                                                                                                                                                            |
| **Classification** | **B — Minor drift**                                                                                                                                                                                                                                            |
| **Reason**         | Six-step dispatch timeline, vehicle chip, and amber active step match Figma’s composition after reconstruction. Drift is systemic: missing wordmark, wrong vehicle icon glyph, and stronger active-step glow. Designer would recognize the same status screen. |
| **Screenshots**    | [compare/10-park-me-checking.png](audit-screenshots/compare/10-park-me-checking.png) · [figma](audit-screenshots/figma/10-park-me-checking.png) · [live](audit-screenshots/live/10-park-me-checking.png)                                                       |

---

### 11 · Park Me · Calling the owner

| Field              | Value                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `983:2349`                                                                                                                                                                                           |
| **Live route**     | `/pwa/scan/park-me/status/calling`                                                                                                                                                                   |
| **Classification** | **B — Minor drift**                                                                                                                                                                                  |
| **Reason**         | Timeline advances to step 4 with orange phone active state; structure and copy align. Same minor header/icon/glow/spacing deltas as Frame 10.                                                        |
| **Screenshots**    | [compare/11-park-me-calling.png](audit-screenshots/compare/11-park-me-calling.png) · [figma](audit-screenshots/figma/11-park-me-calling.png) · [live](audit-screenshots/live/11-park-me-calling.png) |

---

### 12 · Park Me · Owner notified

| Field              | Value                                                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `983:2410`                                                                                                                                                                                               |
| **Live route**     | `/pwa/scan/park-me/status/resolved`                                                                                                                                                                      |
| **Classification** | **B — Minor drift**                                                                                                                                                                                      |
| **Reason**         | All-green completed six-step timeline + Done CTA matches Figma intent. Wrong vehicle icon and missing wordmark remain; Done button sits slightly higher.                                                 |
| **Screenshots**    | [compare/12-park-me-resolved.png](audit-screenshots/compare/12-park-me-resolved.png) · [figma](audit-screenshots/figma/12-park-me-resolved.png) · [live](audit-screenshots/live/12-park-me-resolved.png) |

---

### 13 · Park Me · Photo wasn’t clear

| Field              | Value                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `984:2380`                                                                                                                                                                                           |
| **Live route**     | `/pwa/scan/park-me/photo-not-clear`                                                                                                                                                                  |
| **Classification** | **B — Minor drift**                                                                                                                                                                                  |
| **Reason**         | Amber error step on six-step timeline + Retake photo CTA matches Figma. Same vehicle-icon and header wordmark gaps; timeline vertical rhythm is looser on live.                                      |
| **Screenshots**    | [compare/13-photo-not-clear.png](audit-screenshots/compare/13-photo-not-clear.png) · [figma](audit-screenshots/figma/13-photo-not-clear.png) · [live](audit-screenshots/live/13-photo-not-clear.png) |

---

### 14 · SOS · Emergency

| Field              | Value                                                                                                                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `848:278`                                                                                                                                                                                                                                                                                                                  |
| **Live route**     | `/pwa/scan/sos`                                                                                                                                                                                                                                                                                                            |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                                                                   |
| **Reason**         | Figma shows full emergency page: title, subtitle, glowing red hold disc, inline “Turn on location” row, 112 link. Live capture is dominated by a location bottom sheet; Emergency headline/subtitle are absent, hold button is darker/misaligned, and inline location pattern becomes modal. Different visual composition. |
| **Screenshots**    | [compare/14-sos.png](audit-screenshots/compare/14-sos.png) · [figma](audit-screenshots/figma/14-sos.png) · [live](audit-screenshots/live/14-sos.png)                                                                                                                                                                       |

---

### 14b · SOS · Keep holding

| Field              | Value                                                                                                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1092:2499`                                                                                                                                                                                                                                                |
| **Live route**     | `/pwa/scan/sos/holding`                                                                                                                                                                                                                                    |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                   |
| **Reason**         | Figma preserves Emergency page frame (back, title, subtitle, hold disc, location chip, 112 link) with “Keep holding” inside the disc. Live strips the page down to icon + disc + overlapping helper text; footer actions and Emergency hierarchy are gone. |
| **Screenshots**    | [compare/14b-sos-holding.png](audit-screenshots/compare/14b-sos-holding.png) · [figma](audit-screenshots/figma/14b-sos-holding.png) · [live](audit-screenshots/live/14b-sos-holding.png)                                                                   |

---

### 14c · SOS · Allow location sheet

| Field              | Value                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1110:2471`                                                                                                                                                                                                                                                               |
| **Live route**     | `/pwa/scan/sos/allow-location`                                                                                                                                                                                                                                            |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                  |
| **Reason**         | Figma keeps Emergency hero + hold disc visible above “Share your location” sheet with pin icon and single Allow CTA. Live removes Emergency title/subtitle and inline location row; sheet title/copy/iconography differ and add “Not now”. Different stacked composition. |
| **Screenshots**    | [compare/14c-sos-allow-location.png](audit-screenshots/compare/14c-sos-allow-location.png) · [figma](audit-screenshots/figma/14c-sos-allow-location.png) · [live](audit-screenshots/live/14c-sos-allow-location.png)                                                      |

---

### 14d · SOS · Leave confirm

| Field              | Value                                                                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1113:2486`                                                                                                                                                                                                                                                                |
| **Live route**     | `/pwa/scan/sos/leave-confirm`                                                                                                                                                                                                                                              |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                   |
| **Reason**         | Figma shows Emergency page + hold disc + “Leave emergency?” sheet with full copy and “Stay on this screen”. Live drops back arrow, Emergency headline, and subtitle; sheet copy shortens to “Leave SOS?” / “Stay”. Page hierarchy behind the sheet is not the same design. |
| **Screenshots**    | [compare/14d-sos-leave-confirm.png](audit-screenshots/compare/14d-sos-leave-confirm.png) · [figma](audit-screenshots/figma/14d-sos-leave-confirm.png) · [live](audit-screenshots/live/14d-sos-leave-confirm.png)                                                           |

---

### 15 · SOS · Add scene photos

| Field              | Value                                                                                                                                                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `928:2267`                                                                                                                                                                                                                                                              |
| **Live route**     | `/pwa/scan/sos/scene-photos`                                                                                                                                                                                                                                            |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                                                     |
| **Reason**         | 2×2 dashed capture grid and bottom CTA match in broad strokes, but back navigation and wordmark are missing, title/subtitle copy changes, cell proportions differ, red ambient wash absent, and button corner radius is pillier. Same grid screen, not the same polish. |
| **Screenshots**    | [compare/15-sos-scene-photos.png](audit-screenshots/compare/15-sos-scene-photos.png) · [figma](audit-screenshots/figma/15-sos-scene-photos.png) · [live](audit-screenshots/live/15-sos-scene-photos.png)                                                                |

---

### 15b · SOS · Scene photos captured

| Field              | Value                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1148:2509`                                                                                                                                                                                                                           |
| **Live route**     | `/pwa/scan/sos/scene-photos/captured`                                                                                                                                                                                                 |
| **Classification** | **D — Different screen**                                                                                                                                                                                                              |
| **Reason**         | Figma “Check and send” review uses retake icons on four photo tiles. Live renames to “Scene photos captured”, drops subtitle, and replaces retake affordance with corner labels + green checkmarks. Different card interaction model. |
| **Screenshots**    | [compare/15b-sos-scene-captured.png](audit-screenshots/compare/15b-sos-scene-captured.png) · [figma](audit-screenshots/figma/15b-sos-scene-captured.png) · [live](audit-screenshots/live/15b-sos-scene-captured.png)                  |

---

### 16 · SOS · Location unavailable

| Field              | Value                                                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `875:2189`                                                                                                                                                                                                                                                        |
| **Live route**     | `/pwa/scan/sos/location-unavailable`                                                                                                                                                                                                                              |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                                               |
| **Reason**         | Orange pin halo + headline + two stacked actions match intent, but logo is missing, “Alert contacts only” becomes plain text instead of outlined button, primary button is pill-shaped, and halo scale is smaller. Same message screen, different button grammar. |
| **Screenshots**    | [compare/16-location-unavailable.png](audit-screenshots/compare/16-location-unavailable.png) · [figma](audit-screenshots/figma/16-location-unavailable.png) · [live](audit-screenshots/live/16-location-unavailable.png)                                          |

---

### 17 · SOS · Sending alert

| Field              | Value                                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Figma node**     | `1177:2545`                                                                                                                                                                                                                                                                                      |
| **Live route**     | `/pwa/scan/sos/sending`                                                                                                                                                                                                                                                                          |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                                         |
| **Reason**         | Figma uses red emergency spinner on red wash, “Sending your alert” copy, bordered “I’m safe, cancel alert” button, and logo. Live uses **green** spinner on flat black, different body copy, text-link cancel, no branding. Different color system and interaction model for an emergency state. |
| **Screenshots**    | [compare/17-sending-alert.png](audit-screenshots/compare/17-sending-alert.png) · [figma](audit-screenshots/figma/17-sending-alert.png) · [live](audit-screenshots/live/17-sending-alert.png)                                                                                                     |

---

### 18 · SOS · Couldn’t send

| Field              | Value                                                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `875:2215`                                                                                                                                                                                                                             |
| **Live route**     | `/pwa/scan/sos/couldnt-send`                                                                                                                                                                                                           |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                    |
| **Reason**         | Warning triangle hero + Retry CTA align, but logo missing, orange halo is dimmer/smaller, headline wraps to two lines, and subtext contrast inverts (grey in Figma, white on live). Same error archetype with weakened hero treatment. |
| **Screenshots**    | [compare/18-couldnt-send.png](audit-screenshots/compare/18-couldnt-send.png) · [figma](audit-screenshots/figma/18-couldnt-send.png) · [live](audit-screenshots/live/18-couldnt-send.png)                                               |

---

### 19 · SOS · Help on the way (received)

| Field              | Value                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `849:321`                                                                                                                                                                                                                                                                                                   |
| **Live route**     | `/pwa/scan/sos/help-received`                                                                                                                                                                                                                                                                               |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                                                                                    |
| **Reason**         | Figma fits long incident timeline **and** pinned “I’m safe, cancel alert” footer in one viewport. Live stretches timeline spacing until the footer CTA is **off-screen**; wordmark missing. Visual composition and interaction model break — designer sees a scroll dump, not the designed terminal layout. |
| **Screenshots**    | [compare/19-help-received.png](audit-screenshots/compare/19-help-received.png) · [figma](audit-screenshots/figma/19-help-received.png) · [live](audit-screenshots/live/19-help-received.png)                                                                                                                |

---

### 20 · SOS · Help on the way (dispatched)

| Field              | Value                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `870:2145`                                                                                                                                                                                                |
| **Live route**     | `/pwa/scan/sos/help-dispatched`                                                                                                                                                                           |
| **Classification** | **D — Different screen**                                                                                                                                                                                  |
| **Reason**         | Same failure mode as Frame 19: timeline consumes the canvas, **cancel CTA missing from view**, header wordmark absent, vehicle icon wrong. Designed sticky-footer status screen is not what live renders. |
| **Screenshots**    | [compare/20-help-dispatched.png](audit-screenshots/compare/20-help-dispatched.png) · [figma](audit-screenshots/figma/20-help-dispatched.png) · [live](audit-screenshots/live/20-help-dispatched.png)      |

---

### 21 · SOS · Incident resolved

| Field              | Value                                                                                                                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `871:2151`                                                                                                                                                                                                                                           |
| **Live route**     | `/pwa/scan/sos/resolved`                                                                                                                                                                                                                             |
| **Classification** | **D — Different screen**                                                                                                                                                                                                                             |
| **Reason**         | Figma shows completed green timeline with **Done** CTA visible at bottom. Live timeline bloat pushes **Done off-screen**; glow-heavy nodes and wrong vehicle icon further diverge. Terminal success screen loses its closing action in the viewport. |
| **Screenshots**    | [compare/21-incident-resolved.png](audit-screenshots/compare/21-incident-resolved.png) · [figma](audit-screenshots/figma/21-incident-resolved.png) · [live](audit-screenshots/live/21-incident-resolved.png)                                         |

---

### 22 · SOS · Alert cancelled

| Field              | Value                                                                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `876:2208`                                                                                                                                                                                                                          |
| **Live route**     | `/pwa/scan/sos/alert-cancelled`                                                                                                                                                                                                     |
| **Classification** | **C — Major drift**                                                                                                                                                                                                                 |
| **Reason**         | Center success check + Done button match structurally, but white halo behind icon is missing, logo absent, subtitle contrast wrong, background gradient flat, button corners pillier. Same confirmation moment, reduced hero craft. |
| **Screenshots**    | [compare/22-alert-cancelled.png](audit-screenshots/compare/22-alert-cancelled.png) · [figma](audit-screenshots/figma/22-alert-cancelled.png) · [live](audit-screenshots/live/22-alert-cancelled.png)                                |

---

### 23 · SOS · Contacts only (no location)

| Field              | Value                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma node**     | `1150:2527`                                                                                                                                                                                                                  |
| **Live route**     | `/pwa/scan/sos/contacts-only`                                                                                                                                                                                                |
| **Classification** | **C — Major drift**                                                                                                                                                                                                          |
| **Reason**         | Three-step orange-active timeline + Turn on location outline button align in structure, but wordmark missing, vehicle icon wrong, active glow oversaturated, button/footer spacing off. Same status variant, not pixel-same. |
| **Screenshots**    | [compare/23-contacts-only.png](audit-screenshots/compare/23-contacts-only.png) · [figma](audit-screenshots/figma/23-contacts-only.png) · [live](audit-screenshots/live/23-contacts-only.png)                                 |

---

## Totals

| Classification             |  Count |
| -------------------------- | -----: |
| **A — Visually identical** |  **0** |
| **B — Minor drift**        |  **5** |
| **C — Major drift**        | **12** |
| **D — Different screen**   | **13** |
| **Total screens**          | **30** |

### Screens a designer would call “completely different” (Grade D)

06, 08, 08b, 09, 09b, 14, 14b, 14c, 14d, 15b, 17, 19, 20, 21 — **13 screens (43%)**

---

## TOP 10 SCREENS THAT MUST BE REBUILT

Not tweaked. Not patched. **Rebuilt** from Figma composition down.

| Rank | Screen                           | Node                      | Route                              | Why rebuild                                                                                                                                                                               |
| :--: | -------------------------------- | ------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1   | **09b · Check and send**         | `1044:2406`               | `/pwa/scan/park-me/review`         | Primary content (two photo review cards with retake) is **missing**. Live shows an empty middle and a stub location block — a different screen, not a styling gap.                        |
|  2   | **06 · Vehicle number**          | `991:2328`                | `/pwa/scan/park-me/vehicle-number` | Live implements a **Vahan purchase lookup** (chips, Fetch CTA). Figma is a **single plate field + Continue**. Wrong product surface entirely.                                             |
|  3   | **08 / 08b · Confirm vehicle**   | `1034:2351` / `1040:2374` | `/pwa/scan/park-me/confirm*`       | Figma compact vehicle chip ≠ live RC certificate card. Card hierarchy, protection footer placement, and CTAs must be rebuilt as one component system.                                     |
|  4   | **09 · Add photos and location** | `847:278`                 | `/pwa/scan/park-me/photos`         | Capture tiles use **inverted internal hierarchy** (icon/text order), wrong tile styling on location, and different proportions. Rebuild the three-tile grid as designed.                  |
|  5   | **14 · Emergency SOS**           | `848:278`                 | `/pwa/scan/sos`                    | Emergency hero (title, subtitle, red hold disc, inline location, 112 link) must be one composed page — not a modal-first fragment with a muted disc.                                      |
|  6   | **14b · Keep holding**           | `1092:2499`               | `/pwa/scan/sos/holding`            | Holding state should be an **in-place variant** of the Emergency page, not a stripped skeleton missing back, titles, and footer safety actions.                                           |
|  7   | **17 · Sending alert**           | `1177:2545`               | `/pwa/scan/sos/sending`            | Emergency send uses **red** visual language + bordered cancel in Figma; live shows **green** spinner and text-link cancel. Wrong state design — rebuild the status shell for SOS urgency. |
|  8   | **19 · Help on the way**         | `849:321`                 | `/pwa/scan/sos/help-received`      | Long timeline + **sticky cancel CTA** is the designed composition. Live timeline spacing ejects the footer from view — rebuild shell + timeline density together.                         |
|  9   | **20 · Help dispatched**         | `870:2145`                | `/pwa/scan/sos/help-dispatched`    | Same structural failure as 19: status tracker without visible cancel action. Rebuild as fixed header / scroll body / pinned footer.                                                       |
|  10  | **21 · Incident resolved**       | `871:2151`                | `/pwa/scan/sos/resolved`           | Success terminal requires visible **Done** CTA. Live capture shows timeline bleeding past the footer zone — rebuild resolved-state layout, not spacing tweaks.                            |

**Honorable mention (11th):** **15b · Scene photos captured** (`1148:2509`) — retake-icon review grid must replace label/checkmark tiles; different interaction model.

---

## Systemic visual gaps (cross-cutting)

These appear on most screens and explain why **0 screens rate Grade A**:

1. **Header wordmark** — Figma shows pin + “Autolokate” on nearly every frame; live shows pin-only or nothing.
2. **Vehicle chip icon** — Figma car glyph replaced by generic device/box icon on status screens.
3. **Purchase-flow reuse** — Park Me confirm + vehicle number inherit RC/Vahan layouts not in Post-Activation Figma.
4. **SOS page frame** — Emergency title/subtitle/footer row dropped on 14–14d variants.
5. **Status shell footer** — SOS long timelines do not preserve pinned CTAs visible in Figma.

---

## Final conclusion

### How many screens actually **look** like Figma?

**5 of 30 (17%)** — Frames **01, 10, 11, 12, 13** — read as the same screens with minor drift (Grade B).  
**0 of 30** are visually identical (Grade A).

A designer doing a side-by-side would flag **25 of 30 (83%)** as needing meaningful visual work (Grade C or D). They would call **13 of 30 (43%)** completely different screens — not the same layout — even where the user journey matches.

### How many only **behave** like Figma?

**30 of 30 (100%)** — Every audited frame has a routed live screen and the core user actions exist (scan → verify → Park Me or SOS → status terminals).

**25 of 30 (83%)** implement the correct **flow** but **not** the correct **visual design**. The gap is largest where purchase/onboarding shells were reused (06, 08, 08b), where composite screens were split incorrectly (14 family), and where review/status layouts lost primary content or footers (09b, 19–21).

**Bottom line:** The PWA is **functionally complete** but **visually immature**. It behaves like the Figma journey; it does not yet look like the Figma product. Reconstruction effort should prioritize the **Top 10** list above before polish passes on Grade B screens.

---

_Evidence: human review of 30 side-by-side PNG pairs in `docs/audit-screenshots/compare/` captured 2026-06-18._
