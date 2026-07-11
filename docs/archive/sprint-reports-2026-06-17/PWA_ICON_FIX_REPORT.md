# PWA Icon Fix Report

**Date:** 2026-06-17  
**Scope:** Regenerate PWA icons from approved brand asset — canvas/safe-area only  
**Constraint:** No logo redesign, redraw, recolor, or proportion change

---

## Problem

The original PWA icon generator (`scripts/generate-pwa-icons.mjs`) used the wrong source asset:

| | Before (incorrect) | After (correct) |
|---|-------------------|-----------------|
| **Source file** | `packages/brand/src/assets/al-mark-light.svg` | `packages/brand/src/assets/autolokate_dark.png` |
| **Dimensions** | 96×96 SVG | 164×146 PNG |
| **Used in app** | No — not referenced by `AlLogo` / `AlBrandMark` | Yes — same asset as in-app logo |
| **Method** | SVG rasterized + square `.resize(markSize, markSize)` | PNG `fit: 'contain'` — proportional only |

The SVG mark is a separate 96×96 asset with inverted fills (`al-mark-light.svg`). It is **not** the approved mark rendered in the app. Rasterizing it produced a visually different glyph (shape weight, pin proportions, spacing) from the production logo.

---

## Source Asset (Source of Truth)

| Property | Value |
|----------|-------|
| **File** | `packages/brand/src/assets/autolokate_dark.png` |
| **Dimensions** | 164×146 px |
| **View box** | `0 0 164 146` (`packages/brand/src/types.ts`) |
| **In-app usage** | `AlLogo`, `AlBrandMark` (`AutolokateLogo.tsx`, `AutolokateMark.tsx`) |
| **Splash** | `S0SplashScreen` — `AlLogo size={244}` |
| **Aspect ratio** | 164 ÷ 146 = **1.1233** |
| **Visible glyph bounds** | ~155×146 px (includes PNG internal padding) |
| **Color treatment** | Used as-is — no filter, no recolor, no SVG conversion |

---

## Generated Assets

| Output | Canvas | Safe ratio | Fit box | Mark render | Offset (L,T) |
|--------|--------|------------|---------|-------------|--------------|
| `public/icons/icon-192.png` | 192×192 | 87.5% | 168×168 | 168×150* | 12, 12 |
| `public/icons/icon-512.png` | 512×512 | 87.5% | 448×448 | 448×399* | 32, 32 |
| `public/icons/icon-192-maskable.png` | 192×192 | **80%** | 154×154 | 154×137* | 19, 19 |
| `public/icons/icon-512-maskable.png` | 512×512 | **80%** | 410×410 | 410×365* | 51, 51 |
| `public/apple-touch-icon.png` | 180×180 | 87.5% | 158×158 | 158×141* | 11, 11 |
| `public/favicon-32.png` | 32×32 | contain | 32×32 | proportional | centered |
| `public/favicon-16.png` | 16×16 | contain | 16×16 | proportional | centered |
| `public/favicon.ico` | — | from favicon-32 | — | — | — |

\*Mark layer is square with transparent letterboxing; visible glyph preserves **~1.06 aspect** (matches source — no stretch).

**Background:** `#0A0A0A` (manifest `theme_color` / `background_color`)

---

## Safe-Area Calculations

### Standard icons (`purpose: any`) — 87.5% fit box

12.5% total inset → 6.25% per edge.

```
boxSize = round(canvasSize × 0.875)

icon-192:  192 × 0.875 = 168 px box → 12 px side padding
icon-512:  512 × 0.875 = 448 px box → 32 px side padding
apple-180: 180 × 0.875 = 158 px box → 11 px side padding
```

### Maskable icons (`purpose: maskable`) — 80% safe zone

Android adaptive icon spec: minimum inner safe circle = **80%** of icon diameter.

```
boxSize = round(canvasSize × 0.80)

icon-192-maskable: 192 × 0.80 = 154 px box → 19 px side padding
icon-512-maskable: 512 × 0.80 = 410 px box → 51 px side padding
```

### Proportional fit (no distortion)

```
scale = min(boxSize / 164, boxSize / 146)
renderedWidth  = 164 × scale
renderedHeight = 146 × scale
offsetLeft = round((canvasSize - layerWidth) / 2)
offsetTop  = round((canvasSize - layerHeight) / 2)
```

Sharp: `.resize(boxSize, boxSize, { fit: 'contain' })` — **uniform scale only**, no stretch.

---

## Before / After Comparison

| Check | Before | After |
|-------|--------|-------|
| Source asset | `al-mark-light.svg` | `autolokate_dark.png` |
| Matches in-app logo | **No** | **Yes** |
| Glyph geometry | 96×96 SVG paths | 164×146 approved PNG |
| Scaling | Square forced resize | `fit: 'contain'` |
| Aspect ratio preserved | N/A (wrong asset) | **Yes** (~1.06 visible) |
| Color changes | SVG re-rasterized (white/dark fills) | **None** — PNG pixels unchanged |
| Maskable padding | 52% scale ( ad hoc ) | **80%** safe zone (platform spec) |
| Standard padding | 62% scale ( ad hoc ) | **87.5%** fit box |

### Visual delta (summary)

- **Before:** Teardrop/pin mark from SVG — tighter 96×96 geometry, different inner pin circle and base proportions vs app splash logo.
- **After:** Identical mark to `AlLogo` on S0 splash — same PNG, scaled and centered on `#0A0A0A` canvas only.

---

## Verification

Build-time glyph aspect check (non-background pixels):

| Asset | Visible aspect |
|-------|----------------|
| `autolokate_dark.png` (source) | 1.0616 |
| Generated `icon-192.png` mark | 1.0667 |

Delta < 0.01 — **no visual distortion**.

Regenerate:

```bash
pnpm --filter @autolokate/qr generate:pwa-icons
```

---

## Files Changed

| File | Change |
|------|--------|
| `apps/qr/scripts/generate-pwa-icons.mjs` | Source → `autolokate_dark.png`; proportional fit; safe-zone math |
| `apps/qr/public/icons/*.png` | Regenerated |
| `apps/qr/public/apple-touch-icon.png` | Regenerated |
| `apps/qr/public/favicon-*` | Regenerated |

**Not changed:** SVG brand files, logo components, manifest fields, app UI, Figma screens.

---

## Verdict

**FIXED** — PWA icons now use the exact approved Autolokate mark from `autolokate_dark.png`. Only canvas size, centering, and maskable safe-area padding were adjusted.
