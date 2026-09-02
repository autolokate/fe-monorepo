# Post-Activation PWA — UI Breakage Report

**Date:** 2026-06-18  
**Method:** Live DOM layout inspection (Playwright `getBoundingClientRect`, scroll metrics, overflow detection) — **not** screenshot parity scoring  
**Matrix:** 30 screens × 6 widths (320–414) × 2 themes (dark/light) = **360 configurations**  
**Dev server:** `http://127.0.0.1:5175`  
**Raw data:** `docs/audit-screenshots/layout-audit-results.json`

---

## Executive summary

The UI feels broken because of **one structural shell failure** repeated on tall screens: **`PwaScanShell` does not pin the footer**. When main content exceeds the viewport, primary CTAs slide below the fold with no sticky footer and no scroll affordance inside `main`. This hits SOS timeline screens hardest.

| Category                                                                          | Count          |
| --------------------------------------------------------------------------------- | -------------- |
| **Visually broken** (layout failure blocks primary action without obvious scroll) | **5 screens**  |
| **Layout degraded** (overflow / tight squeeze; action still reachable)            | **4 screens**  |
| **Layout functional** (non-identical to Figma but not broken)                     | **21 screens** |

**Ignore parity percentages.** Many screens look “wrong” vs Figma but **behave correctly**. Broken ≠ non-identical.

---

## Root structural cause

```text
PwaScanShell
├── header (fixed band ~68px)
├── main (flex: 1, min-height: 0, NO overflow-y: auto)
│   └── tall content (timelines, photo grids)
└── footer (NOT position: sticky)
```

When `main` content height + header + footer > 852px, the shell **grows** (`scrollHeight` > viewport). Footer CTAs render **below the visible viewport**. User must discover page-level scroll — there is no in-panel scroll, no fade, no “scroll for CTA” cue.

**Component:** `PwaScanShell` (`pwa-scan-shell.css`)  
**Fix (P0):** Sticky footer band + `main { overflow-y: auto; flex: 1 }`, or cap timeline height with internal scroll.

---

## P0 — Visually broken

### BUG-001 · SOS timeline screens — footer CTAs off-screen

| Field          | Value                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Screens**    | 19 Help received · 20 Help dispatched · 21 Incident resolved                                                           |
| **Viewport**   | **All tested:** 320, 360, 375, 390, 393, 414 · dark + light                                                            |
| **Root cause** | 10-step `AlDispatchTimeline` (sos variant) + vehicle chip + headings exceed viewport; footer not sticky                |
| **Component**  | `PwaScanShell` + `AlStatusTracker` + `AlDispatchTimeline`                                                              |
| **Evidence**   | @393 dark: `scrollHeight=930`, footer CTA `top=856 bottom=914` (viewport 852). Timeline bottom = footer top (0px gap). |
| **Fix**        | Sticky footer; or collapsible timeline; or scrollable `main` with max-height `calc(100dvh - header - footer)`          |
| **Severity**   | **P0**                                                                                                                 |

**User impact:** On frame 19–20, **“I'm safe, cancel alert”** is not visible on first paint. On frame 21, **“Done”** is not visible. Emergency flows feel broken, not merely off-brand.

Side-by-side is not required — DOM proves CTA `bottom > innerHeight` on every configuration.

---

### BUG-002 · Park Me photos (filled state) — Send CTA off-screen

| Field          | Value                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Screen**     | 09 Photos (`/pwa/scan/park-me/photos`)                                                                              |
| **Viewport**   | 320, 393, 414 (all widths when photos + location filled)                                                            |
| **Root cause** | Stacked `AlPhotoGrid` (2×160 + 120 location + gaps + helper) taller than remaining viewport; footer follows content |
| **Component**  | `PwaScanShell` + `AlPhotoGrid`                                                                                      |
| **Evidence**   | @393 filled session: `scrollHeight=1055`, CTA `top=981 bottom=1039`. Grid bottom 937px.                             |
| **Fix**        | Sticky footer; or reduce stacked cell heights on short viewports; or scrollable main                                |
| **Severity**   | **P0**                                                                                                              |

**Note:** Empty-state 09 (audit seed with no photos) **fits** in viewport — CTA visible. Breakage appears on the **real user path** after capture. This is why screenshot-only audits miss it.

---

### BUG-003 · Review map decorative lines — horizontal overflow

| Field          | Value                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Screen**     | 09b Review (`1044:2406`)                                                                                                        |
| **Viewport**   | **All** 320–414 · dark + light                                                                                                  |
| **Root cause** | `.al-photo-grid__review-map-lines` uses **fixed pixel** background positions sized for 361px card; extends 16px past right edge |
| **Component**  | `AlPhotoGrid` (review layout)                                                                                                   |
| **Evidence**   | `review-map` `right = viewport + 16` on every width                                                                             |
| **Fix**        | Percent-based line positions; `overflow: hidden` on parent already set but child painting bleeds document width                 |
| **Severity**   | **P0** on 320–414 (subtle horizontal jank / scroll)                                                                             |

---

## P1 — Layout degraded (reachable but wrong)

### BUG-004 · Page scroll without main scroll region

| Field          | Value                                                |
| -------------- | ---------------------------------------------------- |
| **Screens**    | 19, 20, 21, 09 (filled)                              |
| **Viewport**   | All widths                                           |
| **Root cause** | Whole-page scroll instead of constrained main scroll |
| **Component**  | `PwaScanShell`                                       |
| **Fix**        | Same as BUG-001 — architectural                      |
| **Severity**   | **P1**                                               |

CTAs are reachable via page scroll, but **wrong scroll behavior** for a fixed mobile shell.

---

### BUG-005 · SOS hold aura horizontal bleed (narrow only)

| Field          | Value                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| **Screens**    | 14, 14b, 14c, 14d                                                                      |
| **Viewport**   | **320 only**                                                                           |
| **Root cause** | `.al-sos-hold__stage` 320px wide centered; blur aura extends ~6px past viewport        |
| **Component**  | `AlSosHoldButton`                                                                      |
| **Evidence**   | @320: `al-sos-hold__aura` extends 6px past right edge                                  |
| **Fix**        | `overflow-x: clip` on `.pwa-scan-sos-screen` or reduce stage width on narrow viewports |
| **Severity**   | **P1**                                                                                 |

@393: no overflow. Not a primary “feels broken” issue at design width.

---

### BUG-006 · Confirm vehicle card watermark bleed

| Field          | Value                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| **Screens**    | 08, 08b                                                                                |
| **Viewport**   | 320–414                                                                                |
| **Root cause** | `.al-vehicle-rc-card__watermark` extends past card edge                                |
| **Component**  | `AlVehicleRcCard` (R05 shell)                                                          |
| **Evidence**   | Detected as overflow-x offender; at 393 `scrollWidth === viewport` (clipped by parent) |
| **Fix**        | `overflow: hidden` on RC card container                                                |
| **Severity**   | **P1**                                                                                 |

---

## P2 — Minor / tight (not “broken UI”)

### BUG-007 · Photo-not-clear timeline/footer squeeze

| Field          | Value                                                         |
| -------------- | ------------------------------------------------------------- |
| **Screen**     | 13                                                            |
| **Viewport**   | 320 only                                                      |
| **Root cause** | 6-step timeline + error hero leaves **4px** gap before footer |
| **Component**  | `AlDispatchTimeline`                                          |
| **Evidence**   | `gapFooterTimeline=4`, CTA still fully in viewport            |
| **Fix**        | Reduce step min-height on narrow widths                       |
| **Severity**   | **P2**                                                        |

---

### BUG-008 · Timeline halo pulse scale

| Field          | Value                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Screens**    | 10–13, 19–21, 23                                                     |
| **Viewport**   | All                                                                  |
| **Root cause** | `@keyframes al-dispatch-timeline-halo` scale 1.04 on blur ellipse    |
| **Component**  | `AlDispatchTimeline`                                                 |
| **Fix**        | Reduce scale or contain halos with `overflow: visible` on glyph only |
| **Severity**   | **P2**                                                               |

No measured layout jump >4px at rest; animation-only risk.

---

## Special-focus screen verdicts

| Frame   | Layout broken?        | Primary issue                 |
| ------- | --------------------- | ----------------------------- |
| **09**  | **Yes (filled path)** | CTA below fold after capture  |
| **09b** | **Yes**               | Map lines horizontal overflow |
| **10**  | No                    | Timeline fits; footer N/A     |
| **11**  | No                    | Same                          |
| **12**  | No                    | Done CTA visible @320–414     |
| **13**  | No (tight @320)       | 4px gap only                  |
| **14**  | No @393 / minor @320  | Aura bleed                    |
| **15**  | No                    | Quad grid + footer OK         |
| **19**  | **Yes**               | Cancel CTA off-screen         |
| **20**  | **Yes**               | Cancel CTA off-screen         |
| **21**  | **Yes**               | Done CTA off-screen           |
| **23**  | No                    | 3-step timeline fits          |

Frames 10–12 and 23 **had Figma parity problems** but **layout is not broken** — timelines fit, no footer overlap, no clipping.

---

## What is NOT reported here

- Wordmark vs icon-only header (visual, no layout break)
- Missing StatusBar (visual, no collision)
- Color / icon identity drift (non-layout)
- Copy differences (unless causing wrap break — none found)

---

## Validation method

Script: `docs/audit-screenshots/layout-audit.mjs`

Checks per configuration:

- `document.scrollWidth > viewport` (horizontal overflow)
- `document.scrollHeight > viewport` (unexpected page scroll)
- Footer CTA bounding rect vs viewport
- Timeline bottom vs footer top overlap
- SOS hold stage vs viewport
- Review map edge bleed

Deep metrics pass on focus screens: inline Node inspection with element-level rects (see audit session logs).

---

## Final counts

|                                            | Screens                                                     |
| ------------------------------------------ | ----------------------------------------------------------- |
| **Visually broken**                        | **5** (09 filled, 09b, 19, 20, 21)                          |
| **Layout degraded**                        | **4** (08, 08b, 14-family @320, page-scroll class on 19–21) |
| **Layout functional, Figma-non-identical** | **21**                                                      |

**Why it still feels broken:** 3 consecutive SOS status screens hide emergency/cancel actions; Park Me send path hides CTA after photos; review map causes horizontal jitter. These are **layout engineering failures**, not asset swaps.
