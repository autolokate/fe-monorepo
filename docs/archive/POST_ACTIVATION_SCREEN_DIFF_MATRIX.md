# Post-Activation PWA — Screen Diff Matrix

**Date:** 2026-06-18  
**Evidence:** `docs/audit-screenshots/{figma,live,compare}/`  
**Scoring:** Strict exact-match checklist per screen (see Visual Truth Report)

---

## Matrix legend

| Column              | Meaning                                                  |
| ------------------- | -------------------------------------------------------- |
| **Parity %**        | passed_checks / total_checks                             |
| **Major**           | Structural, wrong screen, wrong component, missing block |
| **Minor**           | Copy punctuation, ±spacing, secondary color              |
| **Missing asset**   | Figma raster/SVG not present                             |
| **Wrong asset**     | Substituted illustration/icon                            |
| **Wrong icon**      | Glyph identity mismatch                                  |
| **Wrong copy**      | Any string mismatch                                      |
| **Wrong spacing**   | Layout band >4px off Figma y/x                           |
| **Wrong animation** | Static audit: implied motion absent                      |
| **Wrong structure** | DOM hierarchy / step count / layout mode                 |

Side-by-side: `docs/audit-screenshots/compare/<slug>.png`

---

## 01 · Loading · `928:2252` · **8%**

| Field               | Detail                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| Route               | `/pwa/scan/loading`                                                         |
| Compare             | [compare/01-loading.png](audit-screenshots/compare/01-loading.png)          |
| **Major**           | Live shows QR scanner screen; Figma shows opening spinner — **wrong frame** |
| **Wrong copy**      | Title, subtitle entirely different                                          |
| **Wrong structure** | Camera viewport + corner brackets vs centered spinner stack                 |
| **Missing asset**   | Green 60px spinner ring                                                     |
| **Wrong spacing**   | Content at y≈180 vs scanner block upper third                               |

---

## 02 · Vehicle found · `843:2080` · **86%**

| Field           | Detail                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| Route           | `/pwa/scan/vehicle`                                                            |
| Compare         | [compare/02-vehicle-found.png](audit-screenshots/compare/02-vehicle-found.png) |
| **Major**       | —                                                                              |
| **Minor**       | Header wordmark; shield suffix "· Safe"                                        |
| **Wrong copy**  | Shield row includes plan label not in Figma                                    |
| **Wrong asset** | Logo instance `158:25` wordmark → minimal mark                                 |

---

## 03 · Verify mobile · `978:2294` · **74%**

| Field               | Detail                                                                         |
| ------------------- | ------------------------------------------------------------------------------ |
| Route               | `/pwa/scan/verify/mobile`                                                      |
| Compare             | [compare/03-verify-mobile.png](audit-screenshots/compare/03-verify-mobile.png) |
| **Major**           | Language pill `English` + chevron missing (`978:2294`)                         |
| **Minor**           | Auth shell footer helper text extra                                            |
| **Wrong copy**      | Footer helper not in Figma                                                     |
| **Wrong structure** | Progress/meta layout differs from Figma logo-top                               |

---

## 04 · Verify OTP · `978:2319` · **78%**

| Field             | Detail                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| Route             | `/pwa/scan/verify/otp`                                                   |
| Compare           | [compare/04-verify-otp.png](audit-screenshots/compare/04-verify-otp.png) |
| **Major**         | —                                                                        |
| **Minor**         | OTP box spacing, reused A2 shell                                         |
| **Wrong spacing** | Vertical rhythm vs Figma logo anchor                                     |

---

## 05 · Verify name · `978:2334` · **80%**

| Field             | Detail                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Route             | `/pwa/scan/verify/name`                                                    |
| Compare           | [compare/05-verify-name.png](audit-screenshots/compare/05-verify-name.png) |
| **Minor**         | A3 shell vs Figma single-field layout                                      |
| **Wrong spacing** | Input vertical position                                                    |

---

## 06 · Park Me vehicle number · `991:2328` · **83%**

| Field          | Detail                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Route          | `/pwa/scan/park-me/vehicle-number`                                                               |
| Compare        | [compare/06-park-me-vehicle-number.png](audit-screenshots/compare/06-park-me-vehicle-number.png) |
| **Minor**      | R03 reuse layout bands                                                                           |
| **Wrong copy** | None on title/description                                                                        |

---

## 07 · Looking up · `1038:2370` · **88%**

| Field               | Detail                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Route               | `/pwa/scan/park-me/looking-up`                                                           |
| Compare             | [compare/07-park-me-looking-up.png](audit-screenshots/compare/07-park-me-looking-up.png) |
| **Minor**           | Spinner style arc vs filled dot                                                          |
| **Wrong animation** | Spinner rotation segment vs Figma static fill                                            |

---

## 08 · Confirm · `1034:2351` · **82%**

| Field     | Detail                                                                             |
| --------- | ---------------------------------------------------------------------------------- |
| Route     | `/pwa/scan/park-me/confirm`                                                        |
| Compare   | [compare/08-park-me-confirm.png](audit-screenshots/compare/08-park-me-confirm.png) |
| **Minor** | R05 RC layout vs Figma confirm card                                                |

---

## 08b · Confirm protected · `1040:2374` · **80%**

| Field             | Detail                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Route             | `/pwa/scan/park-me/confirm-protected`                                                                    |
| Compare           | [compare/08b-park-me-confirm-protected.png](audit-screenshots/compare/08b-park-me-confirm-protected.png) |
| **Minor**         | Green glow approximation                                                                                 |
| **Wrong spacing** | Plan chip placement                                                                                      |

---

## 09a · Permissions · `1049:2422` · **81%**

| Field          | Detail                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------- |
| Route          | `/pwa/scan/park-me/permissions`                                                              |
| Compare        | [compare/09a-park-me-permissions.png](audit-screenshots/compare/09a-park-me-permissions.png) |
| **Minor**      | Backdrop photo grid uses stacked layout (OK) vs Figma dimmed 09                              |
| **Wrong copy** | Sheet body may differ by line break                                                          |

---

## 09 · Photos · `847:278` · **79%**

| Field             | Detail                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| Route             | `/pwa/scan/park-me/photos`                                                       |
| Compare           | [compare/09-park-me-photos.png](audit-screenshots/compare/09-park-me-photos.png) |
| **Major**         | CTA not full-width 361px                                                         |
| **Minor**         | Location box fill state vs dashed empty                                          |
| **Wrong spacing** | Footer button left-aligned                                                       |
| **Wrong icon**    | — (`camera` correct)                                                             |

---

## 09b · Review · `1044:2406` · **31%**

| Field               | Detail                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| Route               | `/pwa/scan/park-me/review`                                                         |
| Compare             | [compare/09b-park-me-review.png](audit-screenshots/compare/09b-park-me-review.png) |
| **Major**           | No photo preview tiles; no map tile                                                |
| **Wrong copy**      | Title "Photos & location captured" vs "Check and send"; subtitle wrong             |
| **Wrong structure** | Single location pill vs 2 photo cards + map                                        |
| **Missing asset**   | Map preview `1044:2406` location card imagery                                      |
| **Wrong spacing**   | Vast empty middle                                                                  |

---

## 10 · Status checking · `982:2339` · **57%**

| Field               | Detail                                                                               |
| ------------------- | ------------------------------------------------------------------------------------ |
| Route               | `/pwa/scan/park-me/status/checking`                                                  |
| Compare             | [compare/10-park-me-checking.png](audit-screenshots/compare/10-park-me-checking.png) |
| **Major**           | Active glyph color system wrong (no amber)                                           |
| **Wrong icon**      | `shield-check` on white vs amber disc                                                |
| **Wrong structure** | Rail color segments                                                                  |
| **Wrong animation** | Amber halo blur absent                                                               |

---

## 11 · Status calling · `983:2349` · **58%**

| Field                                                                       | Detail                                                                             |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Route                                                                       | `/pwa/scan/park-me/status/calling`                                                 |
| Compare                                                                     | [compare/11-park-me-calling.png](audit-screenshots/compare/11-park-me-calling.png) |
| Same timeline token failures as 10; active step 4 should be amber + `phone` |

---

## 12 · Status resolved · `983:2410` · **61%**

| Field     | Detail                                                                               |
| --------- | ------------------------------------------------------------------------------------ |
| Route     | `/pwa/scan/park-me/status/resolved`                                                  |
| Compare   | [compare/12-park-me-resolved.png](audit-screenshots/compare/12-park-me-resolved.png) |
| **Major** | All-complete rails should be green                                                   |
| **Minor** | Done button not full-width centered                                                  |

---

## 13 · Photo not clear · `984:2380` · **55%**

| Field           | Detail                                                                             |
| --------------- | ---------------------------------------------------------------------------------- |
| Route           | `/pwa/scan/park-me/photo-not-clear`                                                |
| Compare         | [compare/13-photo-not-clear.png](audit-screenshots/compare/13-photo-not-clear.png) |
| **Major**       | Error step not amber; title not `#F5A623`                                          |
| **Wrong icon**  | `triangle-alert` white vs amber disc                                               |
| **Wrong asset** | Missing amber glow `993:2341`                                                      |

---

## 14 · Emergency SOS · `848:278` · **44%**

| Field             | Detail                                                     |
| ----------------- | ---------------------------------------------------------- |
| Route             | `/pwa/scan/sos`                                            |
| Compare           | [compare/14-sos.png](audit-screenshots/compare/14-sos.png) |
| **Major**         | Red SOS disc `#FF4A3D` not visible (`1078:2458`)           |
| **Missing asset** | Red aura `1078:2456`, ring track `1078:2457`               |
| **Wrong spacing** | Title stack left-aligned vs Figma                          |
| **Minor**         | Back arrow present in Figma, low contrast live             |

---

## 14b · SOS holding · `1092:2499` · **68%**

| Field          | Detail                                                                       |
| -------------- | ---------------------------------------------------------------------------- |
| Route          | `/pwa/scan/sos/holding`                                                      |
| Compare        | [compare/14b-sos-holding.png](audit-screenshots/compare/14b-sos-holding.png) |
| **Major**      | Red disc / progress ring color                                               |
| **Wrong copy** | "Keep holding" vs in-disc two-line copy placement                            |

---

## 14c · Allow location · `1110:2471` · **84%**

| Field     | Detail                                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| Route     | `/pwa/scan/sos/allow-location`                                                             |
| Compare   | [compare/14c-sos-allow-location.png](audit-screenshots/compare/14c-sos-allow-location.png) |
| **Minor** | Sheet handle + SOS backdrop parity                                                         |

---

## 14d · Leave confirm · `1113:2486` · **87%**

| Field     | Detail                                                                                   |
| --------- | ---------------------------------------------------------------------------------------- |
| Route     | `/pwa/scan/sos/leave-confirm`                                                            |
| Compare   | [compare/14d-sos-leave-confirm.png](audit-screenshots/compare/14d-sos-leave-confirm.png) |
| **Minor** | Sheet button order/spacing                                                               |

---

## 15 · Scene photos · `928:2267` · **73%**

| Field          | Detail                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| Route          | `/pwa/scan/sos/scene-photos`                                                         |
| Compare        | [compare/15-sos-scene-photos.png](audit-screenshots/compare/15-sos-scene-photos.png) |
| **Major**      | Cell aspect 174.5×140 vs square                                                      |
| **Wrong copy** | Title wording                                                                        |
| **Wrong icon** | `camera` vs scan-line — live uses camera ✅                                          |

---

## 15b · Scene captured · `1148:2509` · **76%**

| Field     | Detail                                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| Route     | `/pwa/scan/sos/scene-photos/captured`                                                      |
| Compare   | [compare/15b-sos-scene-captured.png](audit-screenshots/compare/15b-sos-scene-captured.png) |
| **Minor** | Filled grid proportions                                                                    |

---

## 16 · Location unavailable · `875:2189` · **66%**

| Field           | Detail                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| Route           | `/pwa/scan/sos/location-unavailable`                                                         |
| Compare         | [compare/16-location-unavailable.png](audit-screenshots/compare/16-location-unavailable.png) |
| **Wrong asset** | Fetch-failed halo vs Figma SOS attention art                                                 |
| **Wrong copy**  | Body lines differ                                                                            |

---

## 17 · Sending alert · `1177:2545` · **71%**

| Field     | Detail                                                                         |
| --------- | ------------------------------------------------------------------------------ |
| Route     | `/pwa/scan/sos/sending`                                                        |
| Compare   | [compare/17-sending-alert.png](audit-screenshots/compare/17-sending-alert.png) |
| **Minor** | Status shell vs Figma centered spinner block                                   |

---

## 18 · Couldn't send · `875:2215` · **41%**

| Field           | Detail                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Route           | `/pwa/scan/sos/couldnt-send`                                                 |
| Compare         | [compare/18-couldnt-send.png](audit-screenshots/compare/18-couldnt-send.png) |
| **Major**       | Wrong hero illustration                                                      |
| **Wrong copy**  | Title + subtitle both wrong                                                  |
| **Wrong asset** | Missing `889:2251` triangle alert hero                                       |

---

## 19 · Help received · `849:321` · **62%**

| Field             | Detail                                                                         |
| ----------------- | ------------------------------------------------------------------------------ |
| Route             | `/pwa/scan/sos/help-received`                                                  |
| Compare           | [compare/19-help-received.png](audit-screenshots/compare/19-help-received.png) |
| **Major**         | Timeline colors; footer CTA not matching                                       |
| **Wrong icon**    | `activity` without amber on step 2                                             |
| **Wrong spacing** | 10-step height pushes footer                                                   |

---

## 20 · Help dispatched · `870:2145` · **63%**

| Field                                 | Detail                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Route                                 | `/pwa/scan/sos/help-dispatched`                                                    |
| Compare                               | [compare/20-help-dispatched.png](audit-screenshots/compare/20-help-dispatched.png) |
| Same as 19 for steps 1–7 glyph colors |

---

## 21 · Incident resolved · `871:2151` · **58%**

| Field             | Detail                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------- |
| Route             | `/pwa/scan/sos/resolved`                                                               |
| Compare           | [compare/21-incident-resolved.png](audit-screenshots/compare/21-incident-resolved.png) |
| **Major**         | Green completion styling missing; Done CTA not visible                                 |
| **Missing asset** | Green ambient tint `544:256` glow                                                      |

---

## 22 · Alert cancelled · `876:2208` · **47%**

| Field          | Detail                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Route          | `/pwa/scan/sos/alert-cancelled`                                                    |
| Compare        | [compare/22-alert-cancelled.png](audit-screenshots/compare/22-alert-cancelled.png) |
| **Major**      | Wrong hero (X vs check)                                                            |
| **Wrong copy** | Subtitle completely different                                                      |

---

## 23 · Contacts only · `1150:2527` · **69%**

| Field          | Detail                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Route          | `/pwa/scan/sos/contacts-only`                                                  |
| Compare        | [compare/23-contacts-only.png](audit-screenshots/compare/23-contacts-only.png) |
| **Wrong copy** | Title "Alerting their contacts" vs live header                                 |
| **Wrong icon** | Active phone should be amber disc                                              |
| **Minor**      | 3-step timeline copy mostly aligned                                            |

---

## Summary table

| Journey        | Frames | Mean parity |
| -------------- | ------ | ----------- |
| Entry + verify | 01–05  | **65%**     |
| Park Me        | 06–13  | **67%**     |
| SOS            | 14–23  | **66%**     |
| **All 30**     |        | **67%**     |

---

## Screenshot index

| Slug             | Figma                                                 | Live                                                | Compare                                                   |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| 01-loading       | [figma](audit-screenshots/figma/01-loading.png)       | [live](audit-screenshots/live/01-loading.png)       | [compare](audit-screenshots/compare/01-loading.png)       |
| 02-vehicle-found | [figma](audit-screenshots/figma/02-vehicle-found.png) | [live](audit-screenshots/live/02-vehicle-found.png) | [compare](audit-screenshots/compare/02-vehicle-found.png) |
| …                | …                                                     | …                                                   | …                                                         |

Full set: 30 files in each of `figma/`, `live/`, `compare/` directories.
