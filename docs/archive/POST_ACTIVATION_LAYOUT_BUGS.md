# Post-Activation PWA — Layout Bugs

**Date:** 2026-06-18  
**Source:** DOM layout audit (`layout-audit.mjs` + deep rect inspection)  
**Format:** One row per bug · severity P0 / P1 / P2

---

## Bug catalog

| ID      | Screen                | Viewport                 | Root cause                                                | Component                                               | Fix recommendation                                                 | Sev    |
| ------- | --------------------- | ------------------------ | --------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| LAY-001 | 19 Help received      | All 320–414 · dark/light | 10-step timeline + chip fills viewport; footer not sticky | `PwaScanShell`, `AlStatusTracker`, `AlDispatchTimeline` | `position: sticky; bottom: 0` footer + `main { overflow-y: auto }` | **P0** |
| LAY-002 | 20 Help dispatched    | All 320–414 · dark/light | Same as LAY-001                                           | Same                                                    | Same                                                               | **P0** |
| LAY-003 | 21 Incident resolved  | All 320–414 · dark/light | Same as LAY-001; Done CTA off-screen                      | Same                                                    | Same                                                               | **P0** |
| LAY-004 | 09 Photos (filled)    | All 320–414 · dark/light | Stacked grid 2×160 + 120 location exceeds viewport        | `PwaScanShell`, `AlPhotoGrid`                           | Sticky footer or scrollable main                                   | **P0** |
| LAY-005 | 09b Review            | All 320–414 · dark/light | Map line backgrounds use 361px-fixed coords               | `AlPhotoGrid` `.al-photo-grid__review-map-lines`        | Percent-based lines; `clip-path` or smaller line widths            | **P0** |
| LAY-006 | 19–21, 09 filled      | All widths               | Page-level scroll instead of main-region scroll           | `PwaScanShell`                                          | Flex shell with fixed viewport height                              | **P1** |
| LAY-007 | 14 SOS                | 320 · dark/light         | 320px aura stage wider than safe area                     | `AlSosHoldButton` `.al-sos-hold__stage`                 | `max-width: calc(100vw - 32px)` on stage                           | **P1** |
| LAY-008 | 14b Holding           | 320 · dark/light         | Same aura bleed                                           | `AlSosHoldButton`                                       | Same                                                               | **P1** |
| LAY-009 | 14c Allow location    | 320 · dark/light         | SOS backdrop aura bleed under sheet                       | `AlSosHoldButton`                                       | `overflow-x: clip` on shell                                        | **P1** |
| LAY-010 | 14d Leave confirm     | 320 · dark/light         | Same                                                      | `AlSosHoldButton`                                       | Same                                                               | **P1** |
| LAY-011 | 08 Confirm            | 320–414 · dark/light     | RC watermark extends past card                            | `AlVehicleRcCard`                                       | `overflow: hidden` on card                                         | **P1** |
| LAY-012 | 08b Confirm protected | 320–414 · dark/light     | Same                                                      | `AlVehicleRcCard`                                       | Same                                                               | **P1** |
| LAY-013 | 13 Photo not clear    | 320 only                 | Timeline bottom 4px above footer                          | `AlDispatchTimeline`                                    | Reduce `stepMinHeight` for park-me @320                            | **P2** |
| LAY-014 | 10–13, 19–21          | All                      | Active halo `scale(1.04)` animation                       | `AlDispatchTimeline` CSS                                | Contain halo in glyph wrapper                                      | **P2** |

---

## Detailed bug write-ups

### LAY-001 — Cancel alert not visible (Frame 19)

**Screen:** `/pwa/scan/sos/help-received`  
**Viewport:** 393×852 dark (also all widths)

**Root cause:** `AlDispatchTimeline` sos variant renders 10 steps at ~50px min-height each (~500px) plus vehicle chip (~80px) plus headings (~120px) = ~700px in `main`. With header (~68px) + footer (~74px), total document height 930px. Footer renders starting at y=840; button bottom 914px > viewport 852px.

**Component stack:** `PwaSosHelpReceivedRoute` → `PwaScanShell` → `AlStatusTracker` → `AlDispatchTimeline variant="sos"`

**Fix recommendation:**

1. Make `.pwa-scan-shell__footer` sticky at bottom of viewport.
2. Set `.pwa-scan-shell__main { overflow-y: auto; flex: 1; min-height: 0 }`.
3. Optionally reduce sos step `minHeight` from 50px to 44px.

**Severity:** **P0** — emergency cancel action hidden on first paint.

**Evidence:**

```
scrollHeight: 930
footerBtn: top=856, bottom=914
timeline bottom: 840
innerHeight: 852
```

---

### LAY-004 — Send to owner hidden after photos captured (Frame 09)

**Screen:** `/pwa/scan/park-me/photos`  
**Viewport:** 393×852 (filled session)

**Root cause:** `AlPhotoGrid` stacked mode: 160 + 16 + 160 + 16 + 120 location + helper + footer padding. Total content pushes footer below fold. Auto-geolocation on mount fills location box, increasing perceived “done” state while CTA is off-screen.

**Component:** `PwaParkMePhotosRoute`, `AlPhotoGrid`, `PwaScanShell`

**Fix recommendation:** Sticky footer (same shell fix as LAY-001). Alternative: compress stacked cells to `min-height: 140px` below 400px viewport.

**Severity:** **P0** — primary journey CTA hidden after user completes required inputs.

**Evidence:**

```
scrollHeight: 1055
footerBtn: top=981, bottom=1039
grid bottom: 937
```

**Contrast:** Empty photos session @393: `scrollHeight=852`, CTA fully visible — audit seed for frame 09 masks this bug.

---

### LAY-005 — Review map horizontal bleed (Frame 09b)

**Screen:** `/pwa/scan/park-me/review`  
**Viewport:** All widths

**Root cause:** CSS in `PhotoGrid.css`:

```css
linear-gradient(...) 50.5px -103.5px / 260px 6px
linear-gradient(...) 177.5px -87.5px / 6px 150px
```

Positions assume 361px card width. On 320px viewport (288px content), lines extend 16px past right edge → `document.scrollWidth` increase.

**Component:** `AlPhotoGrid` review layout

**Fix recommendation:** Replace fixed px with `%` positions or use SVG overlay scaled to container.

**Severity:** **P0** — horizontal layout break (subtle scroll/jank).

---

### LAY-007 — SOS aura bleed (Frame 14 @320)

**Screen:** `/pwa/scan/sos`  
**Viewport:** 320×852 only

**Root cause:** `.al-sos-hold__stage` fixed 320px width; blur filter on aura extends ~6px past viewport edge.

**Component:** `AlSosHoldButton`

**Fix recommendation:** `width: min(320px, calc(100vw - 32px))` on stage; `overflow-x: clip` on `.pwa-scan-sos-screen`.

**Severity:** **P1** — minor horizontal overflow, not visible at 393.

---

## Issues investigated — NOT layout bugs

| Observation                    | Screen    | Verdict                    |
| ------------------------------ | --------- | -------------------------- |
| Timeline green vs white checks | 10–13     | Visual only — no collision |
| Missing StatusBar              | All       | Visual only                |
| Wordmark vs icon               | All       | Visual only                |
| Permission sheet over SOS      | 14c       | Correct z-index stacking   |
| Park Me 6-step timeline fits   | 10–12     | Layout OK                  |
| 3-step contacts timeline fits  | 23        | Layout OK                  |
| Purchase status heroes         | 16–18, 22 | Centered; CTAs visible     |

---

## Component responsibility map

| Component                  | Layout bugs caused                         |
| -------------------------- | ------------------------------------------ |
| `PwaScanShell`             | LAY-001–004, LAY-006 (footer architecture) |
| `AlDispatchTimeline` (sos) | LAY-001–003 (content height)               |
| `AlPhotoGrid` (stacked)    | LAY-004                                    |
| `AlPhotoGrid` (review)     | LAY-005                                    |
| `AlSosHoldButton`          | LAY-007–010                                |
| `AlVehicleRcCard`          | LAY-011–012                                |

---

## Fix priority order

1. **P0 — Shell sticky footer** (fixes LAY-001, 002, 003, 004, 006 in one change)
2. **P0 — Review map lines** (LAY-005)
3. **P1 — SOS aura clip @320** (LAY-007–010)
4. **P1 — RC card overflow** (LAY-011–012)
5. **P2 — Timeline tight spacing / halo contain** (LAY-013–014)

---

## Final summary

### How many screens are visually broken?

**5 screens** on primary user paths:

| #   | Screen                     | Why broken                         |
| --- | -------------------------- | ---------------------------------- |
| 1   | **09** (photos filled)     | Send CTA below fold                |
| 2   | **09b** (review)           | Horizontal overflow from map lines |
| 3   | **19** (help received)     | Cancel CTA below fold              |
| 4   | **20** (help dispatched)   | Cancel CTA below fold              |
| 5   | **21** (incident resolved) | Done CTA below fold                |

### How many screens are merely non-identical to Figma?

**21 screens** have layout that **functions correctly** across the responsive matrix (plus **09 empty state** as a 22nd functional variant). These differ from Figma in assets, copy, colors, spacing intent, or missing StatusBar — but **do not exhibit overflow, clipping, hidden CTAs, or collisions**.

**4 additional screens** (08, 08b, 14-family @320) are **degraded** but not primary-path broken.

### These are not the same thing

|                | Visually broken                                 | Non-identical                                        |
| -------------- | ----------------------------------------------- | ---------------------------------------------------- |
| **Definition** | Primary action hidden, overflow, or collision   | Looks different but layout works                     |
| **Count**      | **5**                                           | **21+**                                              |
| **Example**    | Frame 21 Done button at y=914 on 852px viewport | Frame 10 timeline colors wrong but all steps visible |
| **Fix type**   | Engineering (shell, scroll, overflow)           | Design parity (tokens, assets)                       |

**Why the product still feels broken:** Users hit frames 09 → 09b → 10–13 (Park Me) or 14 → 19–21 (SOS). The **SOS tail (19–21)** and **Park Me send (09 filled)** are the emotional “done” moments — and those are exactly where layout fails.
