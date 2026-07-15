# Post-Activation PWA — Final Signoff

**Date:** 2026-06-18  
**Auditor:** Independent verification (code + live UI + Figma MCP)  
**Figma section:** `843:2079` · Scanner · QR Scan (Post-Activation) · Web PWA · READY FOR DEV  
**Method:** Did **not** trust implementation reports. Inspected routes, source, rendered UI at `http://localhost:5175`, and Figma node data.

---

## Executive summary

| Metric                              | Claimed (impl docs) | Verified                  |
| ----------------------------------- | ------------------- | ------------------------- |
| Frame route coverage                | 30/30               | **30/30 routes exist** ✅ |
| Overall Figma parity                | 94%                 | **~71%** ❌               |
| Build                               | PASS                | **PASS** ✅               |
| Console errors (runtime spot-check) | None                | **None observed** ✅      |
| Dead-end branches                   | Not disclosed       | **2 critical** ❌         |

### Final verdict: **NOT READY**

Per signoff rule: _Do not approve if parity is below 100%._ Verified parity is **~71%** with **blocker gaps** on CC tracker fidelity, Park Me photo capture layout, unreachable error branches, and missing QR scanner entry.

---

## What passed

| Check                                    | Result                                       |
| ---------------------------------------- | -------------------------------------------- |
| Isolated `/pwa/scan/*` tree              | ✅ Separate from `/journey/*` session        |
| `/journey` 4th entry card                | ✅ "QR Scan (Post-Activation)" + description |
| No fake StatusBar                        | ✅ Confirmed in live UI                      |
| No language selector on verify           | ✅ Confirmed on `/pwa/scan/verify/mobile`    |
| All 30 routes mount                      | ✅ Deep-linkable without blank screen        |
| No route loops observed                  | ✅ Catch-all → loading only                  |
| Onboarding A1/A2/A3/R03/R04/R05 defaults | ✅ Optional props; auth routes unchanged     |
| Real camera hook                         | ✅ File input + `capture="environment"`      |
| Real geolocation hook                    | ✅ `navigator.geolocation`                   |
| Permission sheet component               | ✅ Renders on permission routes              |
| TypeScript / Vite build                  | ✅ Pass                                      |

---

## Blockers (must fix before READY)

### 1. CC tracker not Figma-faithful (frames 10–12, 19–21, 23)

Figma CC tracker (`982:2339`, `849:321`) uses **6–10 steps** each with **title + subtitle**, amber active glyph with blur halo, `icon/circle-check` completed states, and `icon/shield-check` / `icon/activity` active glyphs.

Implementation uses **4 generic labels**, no subtitles, numbered pending steps, simplified green/amber styling. **AlDispatchTimeline** and **AlStatusTracker** do not match Figma structure.

**Impact:** Park Me status + SOS help-on-the-way screens are materially wrong.

### 2. Park Me photo capture layout wrong (frame 09 · `847:278`)

Figma: **two full-width stacked capture boxes** (361×160) — "The vehicle blocking you" / "Your car, blocked" — plus GPS box "Share your location", CTA **"Send to owner"** (disabled until ready), helper **"Add photos and location to continue"**.

Implementation: **2-column Front/Rear grid**, title **"Take two photos"**, CTA **"Continue"**, wrong copy. **AlPhotoGrid** layout does not match Figma.

**Impact:** ~55% parity on a core Park Me screen.

### 3. Unreachable branches

| Frame              | Route                               | Issue                                                             |
| ------------------ | ----------------------------------- | ----------------------------------------------------------------- |
| 13 Photo not clear | `/pwa/scan/park-me/photo-not-clear` | **No navigation path** from status checking — dead branch         |
| 18 Couldn't send   | `/pwa/scan/sos/couldnt-send`        | `simulateNetworkFail` **never set true** in UI flow — dead branch |

Audit graph requires these transitions; they are not exercisable in the happy path or any demo path.

### 4. Vehicle Found card wrong component (frame 02 · `843:2080`)

Figma: compact chip card (plate + model + car tile + shield row).

Implementation: full **`AlVehicleRcCard`** RC certificate with owner/VAHAN fields — major layout drift.

### 5. No QR scanner viewport

Figma implies sticker scan entry. Implementation: loading spinner only; no live QR/camera decode screen.

---

## High-severity gaps (non-blocker but parity impact)

| Area                                | Figma                                          | Implementation                       |
| ----------------------------------- | ---------------------------------------------- | ------------------------------------ |
| Loading subtitle (`928:2252`)       | "No app needed. Loading the scanner securely." | "Getting this vehicle ready for you" |
| SOS title (`848:278`)               | "Emergency"                                    | "Emergency SOS"                      |
| SOS location chip                   | "Turn on location" pill + chevron              | Status chip "Getting location…"      |
| Call 112                            | "Or call 112 directly" + phone icon            | "Call 112" text link                 |
| SOS Help received title (`849:321`) | "Help is on the way"                           | "Help on the way"                    |
| Cancel CTA on SOS status            | "I'm safe, cancel alert" (secondary outline)   | "Cancel alert"                       |
| Emergency hub icon                  | `icon/bell`                                    | `icon/heart`                         |
| Photo icons                         | `icon/camera`                                  | `icon/scan-line`                     |
| GPS preview                         | Map-style capture area                         | Text pin label only                  |
| R04 loading copy                    | Park Me specific                               | Purchase R04 copy reused             |

---

## Runtime QA (spot-check)

| Test                    | Result                                                    |
| ----------------------- | --------------------------------------------------------- |
| Console errors          | None on sampled routes                                    |
| Console warnings        | None on sampled routes                                    |
| `/journey` → PWA card   | Navigates to loading → vehicle                            |
| Verify gate             | Works when unverified                                     |
| SOS hold → scene photos | Route chain exists                                        |
| Park Me full happy path | Reachable with demo plate `MH 12 AB 3456`                 |
| Light theme             | Works via `/journey` theme toggle (inherits to PWA)       |
| 320px viewport          | Vehicle hub renders; RC card height risk on small screens |
| Refresh persistence     | `sessionStorage` restores session                         |

---

## Onboarding reuse regression

| Screen | Regression | Notes                                              |
| ------ | ---------- | -------------------------------------------------- |
| A1     | **None**   | Defaults preserved; PWA passes optional props only |
| A2     | **None**   | Optional title only                                |
| A3     | **None**   | Optional copy only                                 |
| R03    | **None**   | Optional title/description                         |
| R04    | **None**   | Unchanged                                          |
| R05    | **None**   | Optional protected variant additive                |

---

## Promoted components — signoff

| Component            | Promoted | Figma parity                                          | Verdict     |
| -------------------- | -------- | ----------------------------------------------------- | ----------- |
| AlScannerHubCard     | ✅       | ~88% — structure good; emergency icon wrong           | **PARTIAL** |
| AlDispatchTimeline   | ✅       | ~45% — missing subtitles, step count, amber halo      | **FAIL**    |
| AlStatusTracker      | ✅       | ~70% — chip OK; timeline child fails                  | **PARTIAL** |
| AlScenePhotoCard     | ✅       | ~82% — cell chrome OK; wrong icon in usage            | **PARTIAL** |
| AlPhotoGrid          | ✅       | ~50% — wrong layout mode for Park Me 09               | **FAIL**    |
| AlSosHoldButton      | ✅       | ~85% — disc/ring present; hold UX split across routes | **PARTIAL** |
| AlPermissionSheet    | ✅       | ~90% — sheet pattern matches                          | **PASS**    |
| AlIncidentStatusHero | ✅       | ~80% — wrapper OK; reuses payment halo SVG            | **PARTIAL** |

**Component promotion signoff:** **NOT APPROVED** — 2/8 fail Figma parity; none at 100%.

---

## Comparison to implementation reports

The prior `POST_ACTIVATION_PARITY_REPORT.md` claimed **94% parity** and **READY**. Independent verification found:

- CC tracker simplification not documented accurately
- Frame 09 layout misimplemented vs Figma
- Dead branches omitted from QA matrix
- "Pixel parity required" standard not met

**Implementation reports are not accepted as signoff evidence.**

---

## Required actions for READY

1. Rebuild **AlDispatchTimeline** to match Figma CC tracker (step count, subtitles, glyphs, amber active state).
2. Rebuild **frame 09** as stacked full-width capture boxes + correct CTA/copy.
3. Wire **photo-not-clear** transition from status checking (demo QC fail path).
4. Wire **couldn't send** transition (offline / network fail demo path).
5. Replace Vehicle Found RC card with compact Figma chip card.
6. Align SOS copy, chip, and cancel CTA to Figma.
7. Add QR scanner viewport or document explicit product waiver.
8. Re-run signoff targeting **100%** per-screen parity.

---

## Signoff authority

| Role                 | Status           |
| -------------------- | ---------------- |
| Route completeness   | ✅ Approved      |
| Figma visual parity  | ❌ **Rejected**  |
| Branch completeness  | ❌ **Rejected**  |
| Production readiness | ❌ **NOT READY** |

**Overall: NOT READY**
