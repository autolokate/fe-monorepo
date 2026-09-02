# Post-Activation PWA — Component Diff Report

**Date:** 2026-06-18  
**Method:** Compare promoted `@autolokate/ui` components against **original Figma component nodes** — not implementation intent.  
**Evidence:** Live screenshots + Figma exports in `docs/audit-screenshots/`

---

## Scoring

Same strict rule as screen audit: **exact match only**.

```
Component parity % = passed_checks / total_checks × 100
```

---

## Summary

| Component              | Primary Figma anchor(s)             | Parity % | Verdict |
| ---------------------- | ----------------------------------- | -------- | ------- |
| `AlDispatchTimeline`   | `982:2387`, `931:2270`, `1153:2542` | **41%**  | FAIL    |
| `AlPhotoGrid`          | `847:295`, `992:2339`, `1042:2390`  | **68%**  | FAIL    |
| `AlScenePhotoCard`     | `847:295`, `992:2339`               | **76%**  | FAIL    |
| `AlStatusTracker`      | `1063:2427` + timeline child        | **52%**  | FAIL    |
| `AlScannerHubCard`     | `845:292`, `845:299`                | **85%**  | FAIL    |
| `AlSosHoldButton`      | `1078:2456`–`1078:2459`, `848:278`  | **38%**  | FAIL    |
| `AlPermissionSheet`    | `1049:2422`, `1110:2471`            | **83%**  | FAIL    |
| `AlIncidentStatusHero` | `875:2215`, `876:2208`, `875:2189`  | **39%**  | FAIL    |

**No promoted component reaches 100% exact Figma parity.**

Promoted component mean: **60%**

---

## AlDispatchTimeline

**Figma nodes:** `982:2387` (Park Me 6-step) · `931:2270` (SOS 10-step) · `1153:2542` (contacts 3-step)

**Live evidence:** [compare/10-park-me-checking.png](audit-screenshots/compare/10-park-me-checking.png) · [compare/19-help-received.png](audit-screenshots/compare/19-help-received.png)

| Check                       | Figma                            | Live           | Pass |
| --------------------------- | -------------------------------- | -------------- | ---- |
| Step count Park Me          | 6                                | 6              | ✅   |
| Step count SOS              | 10                               | 10             | ✅   |
| Subtitle per step           | 13px `#8A8A8A`                   | Present        | ✅   |
| Complete icon               | `181:28` green stroke check 24px | White check    | ❌   |
| Complete rail               | `#1FA24A` 2px                    | Grey/white     | ❌   |
| Active disc fill            | `#F5A623` 24px                   | No amber fill  | ❌   |
| Active halo blur            | 36px blur 3px `#F5A623`          | None           | ❌   |
| Active glyph white on amber | `18:11`, `18:27`, `1070:2449`    | Dark on white  | ❌   |
| Pending ring                | 1.5px `#4A4A4A` stroke           | ✅             | ✅   |
| Pending title color         | `#8A8A8A`                        | Partial        | ❌   |
| Error step title            | `#F5A623` (`984:2430`)           | White          | ❌   |
| Error glyph                 | `889:2251` on amber              | White triangle | ❌   |
| SOS title size active       | 14px semibold                    | 15px           | ❌   |
| SOS subtitle size           | 12px                             | 13px           | ❌   |
| Connector segment heights   | 32–40px per Figma y              | Uniform ~28px  | ❌   |

**Parity: 41%** (6/15 checks)

**Major diffs:** Color system for complete/active/error states is not Figma-exact.  
**Missing assets:** Amber halo ellipses (`982:2400`, `931:2277`, etc.)  
**Wrong icons:** All active glyphs missing amber container.

---

## AlPhotoGrid

**Figma nodes:** `847:295` (stacked cells) · `1042:2390` (GPS box)

**Live evidence:** [compare/09-park-me-photos.png](audit-screenshots/compare/09-park-me-photos.png)

| Check                      | Figma                  | Live              | Pass |
| -------------------------- | ---------------------- | ----------------- | ---- |
| Layout mode stacked        | Column 361px           | Column            | ✅   |
| Cell height                | 160px                  | ~160px            | ✅   |
| Cell gap                   | 16px between rows      | ~16px             | ✅   |
| Border                     | 1.5px dashed `#4A4A4A` | ✅                | ✅   |
| Radius                     | 16px                   | 16px              | ✅   |
| GPS box height             | 120px                  | 120px             | ✅   |
| GPS icon                   | `19:17` 28px           | 28px map-pin      | ✅   |
| Dual grid mode (SOS 15)    | 2×2 174.5×140          | Square aspect     | ❌   |
| Location empty state       | Dashed empty           | Can appear filled | ❌   |
| Footer helper outside grid | 13px centered          | Present           | ✅   |
| CTA relationship           | External 361px button  | External          | ✅   |

**Parity: 68%** (8/12 checks — dual layout weighted on frame 15)

**Major diffs:** Quad layout cell proportions wrong on SOS scene photos.  
**Wrong structure:** Review route `09b` bypasses grid for custom layout (not PhotoGrid).

---

## AlScenePhotoCard

**Figma nodes:** `847:295` · `992:2339`

**Live evidence:** [compare/09-park-me-photos.png](audit-screenshots/compare/09-park-me-photos.png)

| Check                      | Figma              | Live    | Pass |
| -------------------------- | ------------------ | ------- | ---- |
| Stacked min-height         | 160px              | ✅      | ✅   |
| Label 15px medium centered | ✅                 | ✅      | ✅   |
| Icon 32px camera `863:281` | ✅                 | ✅      | ✅   |
| Dashed border empty        | ✅                 | ✅      | ✅   |
| Filled state image cover   | N/A in empty frame | —       | —    |
| Square cell aspect (SOS)   | Not 1:1 in Figma   | 1:1     | ❌   |
| Capturing state border     | Solid green        | Present | ✅   |
| Background `#1A1A1A`       | ✅                 | Close   | ✅   |
| Icon label gap             | 10px               | ~10px   | ✅   |

**Parity: 76%** (7/9 applicable checks)

---

## AlStatusTracker

**Figma nodes:** Vehicle chip `1063:2427` · `1070:2461` · timeline blocks above

**Live evidence:** [compare/10-park-me-checking.png](audit-screenshots/compare/10-park-me-checking.png)

| Check                     | Figma                  | Live         | Pass |
| ------------------------- | ---------------------- | ------------ | ---- |
| Chip height               | 60px                   | ~60px        | ✅   |
| Chip radius               | 12px                   | 12px         | ✅   |
| Car tile 40×40 `#4A4A4A`  | ✅                     | ✅           | ✅   |
| Plate 15px semibold       | ✅                     | ✅           | ✅   |
| Model 13px `#8A8A8A`      | ✅                     | ✅           | ✅   |
| Chip border 1px `#4A4A4A` | ✅                     | ✅           | ✅   |
| Timeline child parity     | See AlDispatchTimeline | 41%          | ❌   |
| Chip icon                 | Car tile filled        | Line car SVG | ❌   |
| y-gap title→chip          | 186px Figma            | ~similar     | ✅   |
| y-gap chip→timeline       | 266px Figma            | ~similar     | ✅   |

**Parity: 52%** (weighted with timeline child failure)

---

## AlScannerHubCard

**Figma nodes:** `845:292` (Park Me) · `845:299` (Emergency)

**Live evidence:** [compare/02-vehicle-found.png](audit-screenshots/compare/02-vehicle-found.png)

| Check                               | Figma | Live  | Pass |
| ----------------------------------- | ----- | ----- | ---- |
| Card height                         | 92px  | ~92px | ✅   |
| Radius                              | 16px  | 16px  | ✅   |
| Icon tile 44×44 r12                 | ✅    | ✅    | ✅   |
| Park Me border `#4A4A4A`            | ✅    | ✅    | ✅   |
| Emergency fill rgba(255,74,61,0.12) | ✅    | ✅    | ✅   |
| Emergency border `#FF4A3D`          | ✅    | ✅    | ✅   |
| Emergency tile fill `#FF4A3D`       | ✅    | ✅    | ✅   |
| Chevron 22px `1002:280`             | ✅    | ✅    | ✅   |
| Title 17px semibold                 | ✅    | ~17px | ✅   |
| Subtitle 13px                       | ✅    | ✅    | ✅   |
| Emergency title color red           | ✅    | ✅    | ✅   |
| Copy exact                          | ✅    | ✅    | ✅   |

**Parity: 85%** (11/13 — title exact size/line not measured to px)

**Minor:** Press scale animation not verified in static audit.

---

## AlSosHoldButton

**Figma nodes:** `1078:2456` aura · `1078:2457` ring · `1078:2458` disc · `848:278`

**Live evidence:** [compare/14-sos.png](audit-screenshots/compare/14-sos.png) · [compare/14b-sos-holding.png](audit-screenshots/compare/14b-sos-holding.png)

| Check                            | Figma                     | Live                     | Pass |
| -------------------------------- | ------------------------- | ------------------------ | ---- |
| Disc fill `#FF4A3D` 200px        | ✅                        | Not visible / black      | ❌   |
| Aura 320px blur 27.5px 30%       | ✅                        | Absent                   | ❌   |
| Ring track 228px 4px 55% opacity | ✅                        | Wrong/missing            | ❌   |
| Label two-line 20px semibold     | ✅                        | Present but low contrast | ❌   |
| Hint 13px centered               | ✅                        | ✅                       | ✅   |
| Location chip below              | Separate node `1079:2457` | Present                  | ✅   |
| Hold progress arc color          | Red                       | Not visible              | ❌   |
| Hit target 216px                 | ✅                        | Unknown                  | ❌   |

**Parity: 38%** (3/8 checks)

**Major:** Core red SOS disc and aura are not visually identical in live render.

---

## AlPermissionSheet

**Figma nodes:** Sheet in `1049:2422` · `1110:2471` · `1113:2486`

**Live evidence:** [compare/09a-park-me-permissions.png](audit-screenshots/compare/09a-park-me-permissions.png) · [compare/14c-sos-allow-location.png](audit-screenshots/compare/14c-sos-allow-location.png)

| Check                     | Figma         | Live                    | Pass |
| ------------------------- | ------------- | ----------------------- | ---- |
| Bottom sheet overlay      | ✅            | ✅                      | ✅   |
| Primary CTA full width    | ✅            | ✅                      | ✅   |
| Secondary text action     | ✅            | ✅                      | ✅   |
| Title semibold            | ✅            | ✅                      | ✅   |
| Body 15px muted           | ✅            | ✅                      | ✅   |
| Grab handle               | Figma implied | CSS handle              | ✅   |
| Sheet radius top          | 16px+         | ✅                      | ✅   |
| Backdrop dim              | ✅            | ✅                      | ✅   |
| Copy exact allow location | ✅            | ✅                      | ✅   |
| Park Me allow copy        | Figma sheet   | Slightly different body | ❌   |

**Parity: 83%** (9/11)

---

## AlIncidentStatusHero

**Figma nodes:** `875:2215` (couldn't send) · `876:2208` (cancelled) · `875:2189` (location)

**Live evidence:** [compare/18-couldnt-send.png](audit-screenshots/compare/18-couldnt-send.png) · [compare/22-alert-cancelled.png](audit-screenshots/compare/22-alert-cancelled.png)

| Check                    | Figma                       | Live                     | Pass |
| ------------------------ | --------------------------- | ------------------------ | ---- |
| Couldn't send hero       | Triangle alert + amber glow | Fetch-failed halo + X    | ❌   |
| Couldn't send title      | "Couldn't send the alert"   | "Couldn't send"          | ❌   |
| Couldn't send subtitle   | Connection dropped copy     | Generic retry copy       | ❌   |
| Cancelled hero           | White check + neutral rings | Orange X halo            | ❌   |
| Cancelled subtitle       | False alarm copy            | "No help was dispatched" | ❌   |
| Location unavailable art | Figma SOS art               | Fetch-failed halo        | ❌   |
| Vertical centering       | Figma y bands               | PurchaseStatusShell      | ❌   |
| CTA "Retry now" / "Done" | ✅                          | ✅                       | ✅   |

**Parity: 39%** (2/8)

**Wrong assets:** Reused `fetch-failed-halo` across distinct Figma illustrations.

---

## Component ↔ frame mapping

| Component            | Screens using it  | Worst live frame |
| -------------------- | ----------------- | ---------------- |
| AlDispatchTimeline   | 10–13, 19–21, 23  | 10, 19           |
| AlPhotoGrid          | 09, 09a, 15       | 09b (bypass)     |
| AlScenePhotoCard     | 09, 15            | 15 (aspect)      |
| AlStatusTracker      | 10–13, 19–21, 23  | 10               |
| AlScannerHubCard     | 02                | —                |
| AlSosHoldButton      | 14, 14b, 14c, 14d | 14               |
| AlPermissionSheet    | 09a, 14c, 14d     | 09a              |
| AlIncidentStatusHero | 16, 18, 22        | 18, 22           |

---

## Evidence files

All comparisons: `docs/audit-screenshots/compare/`

Component-specific:

- Timeline: `10-park-me-checking.png`, `19-help-received.png`, `20-help-dispatched.png`, `13-photo-not-clear.png`
- Photo grid: `09-park-me-photos.png`, `15-sos-scene-photos.png`, `09b-park-me-review.png`
- Scanner hub: `02-vehicle-found.png`
- SOS hold: `14-sos.png`, `14b-sos-holding.png`
- Permission sheet: `09a-park-me-permissions.png`, `14c-sos-allow-location.png`
- Incident hero: `18-couldnt-send.png`, `22-alert-cancelled.png`, `16-location-unavailable.png`

---

## Final component score

**Promoted component pack parity (strict): 60%**

Dominant failure mode: **Figma signal color system** (`#1FA24A` complete, `#F5A623` active/error, `#FF4A3D` SOS) not reproduced exactly in live UI. Secondary failure mode: **status illustration reuse** instead of per-frame Figma heroes.
