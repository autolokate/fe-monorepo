# Post-Activation PWA — Asset Recovery Report

**Date:** 2026-06-18  
**Figma file:** `FtHCUnE0HH586PtG5yJyG0` · Section `843:2079`  
**Recovery method:** Figma MCP `download_figma_images` + inline SVG reconstruction in `@autolokate/ui`

---

## Summary

| Category                | Recovered | Placeholders removed            |
| ----------------------- | --------- | ------------------------------- |
| Status hero halos       | 3         | 3 (`FetchFailedHaloIcon` reuse) |
| Timeline complete glyph | 1         | 1 (white `currentColor` check)  |
| SOS hold aura           | 1         | 1 (invisible red disc)          |
| Review retake icon      | 1         | 0 (new)                         |
| Signal CSS tokens       | 4         | 4 (undefined vars)              |

---

## Recovered assets

### Status heroes (per-frame, no reuse)

| Frame                   | Node     | Asset                       | Implementation                                                             |
| ----------------------- | -------- | --------------------------- | -------------------------------------------------------------------------- |
| 18 Couldn't send        | 875:2219 | Amber halo + triangle alert | `AlIncidentStatusHero scene="couldnt-send"` · inline SVG from Figma export |
| 22 Alert cancelled      | 876:2212 | Neutral halo + check        | `scene="alert-cancelled"`                                                  |
| 16 Location unavailable | 875:2193 | Amber halo + map pin        | `scene="location-unavailable"`                                             |

**Source files:**

- `packages/icons/src/assets/pwa-reconstruction/couldnt-send-halo.svg`
- `packages/icons/src/assets/pwa-reconstruction/alert-cancelled-halo.svg`
- `packages/icons/src/assets/pwa-reconstruction/location-unavailable-halo.svg`
- `packages/icons/src/generated/couldnt-send-halo.tsx`
- `packages/icons/src/generated/alert-cancelled-halo.tsx`
- `packages/icons/src/generated/location-unavailable-halo.tsx`

### Timeline glyphs

| Node      | Asset                         | Implementation                                    |
| --------- | ----------------------------- | ------------------------------------------------- |
| 181:28    | Green stroke circle-check     | Hardcoded `#1FA24A` paths in `AlDispatchTimeline` |
| 18:11     | White shield-check on amber   | Active glyph SVG white on `#F5A623` disc          |
| 1070:2449 | White activity on amber       | SOS variant 11px glyph                            |
| 889:2251  | White triangle-alert on amber | Error step glyph                                  |

**Export:** `packages/icons/src/assets/pwa-reconstruction/timeline-circle-check.svg`

### SOS hold stack

| Node      | Asset        | Spec                                | Implementation                         |
| --------- | ------------ | ----------------------------------- | -------------------------------------- |
| 1078:2456 | Red aura     | 320px · blur 27.5px · 30% `#FF4A3D` | `.al-sos-hold__aura` + pulse animation |
| 1078:2457 | Ring track   | 228px · 4px · 55% `#FF4A3D`         | `.al-sos-hold__ring-track`             |
| 1078:2458 | Disc         | 200px `#FF4A3D`                     | `.al-sos-hold__disc`                   |
| —         | Progress arc | 4px red stroke                      | SVG circle dashoffset                  |

**Export:** `packages/icons/src/assets/pwa-reconstruction/sos-hold-aura.svg`

### Review screen

| Node                  | Asset                       | Implementation                                              |
| --------------------- | --------------------------- | ----------------------------------------------------------- |
| 1059:281              | icon/rotate-ccw             | Retake badge overlay on review photo tiles                  |
| 1044:2412 / 1044:2418 | Photo preview gradient fill | `.al-photo-grid__review-placeholder` linear-gradient 127deg |
| 1044:2422             | Map preview + road lines    | `.al-photo-grid__review-map` + CSS line overlays            |
| 1050:2436             | Map pin 26px                | Inline SVG in review map                                    |

**Export:** `packages/icons/src/assets/pwa-reconstruction/icon-rotate-ccw.svg`

---

## Design tokens recovered

Added to `packages/design-system/src/theme.css`:

```css
--al-color-signal-green: var(--al-signal-green); /* #1FA24A */
--al-color-signal-amber: var(--al-signal-amber); /* #F5A623 */
--al-color-signal-red: var(--al-signal-red);
--al-color-signal-red-bright: var(--al-signal-red-bright); /* #FF4A3D */
```

These tokens were referenced by promoted components but never defined — causing white checks, invisible SOS disc, and grey rails in the pre-reconstruction audit.

---

## Assets still missing (blocks 100%)

| Asset                                   | Figma node | Needed on  | Status                                                       |
| --------------------------------------- | ---------- | ---------- | ------------------------------------------------------------ |
| Full Autolokate wordmark in shell       | 158:25     | All frames | Live uses `AlLogo` icon mark only                            |
| iOS StatusBar component                 | 9:2        | All frames | Intentionally omitted from `PwaScanShell`                    |
| Demo photo bitmaps in review capture    | 1044:2412  | 09b        | Session uses minimal data URLs in audit seed                 |
| Green ambient resolved tint exact match | 544:256    | 21         | `variant="protected"` applied; subtle gradient delta remains |

---

## Wrong assets removed

| Removed               | Was used on | Replaced with                     |
| --------------------- | ----------- | --------------------------------- |
| `FetchFailedHaloIcon` | 16, 18, 22  | Per-frame Figma heroes            |
| QR scanner viewport   | 01          | `AlScreenSpinner` opening state   |
| Generic retry copy    | 18          | Figma 875:2223–2224 exact strings |
| Generic cancel copy   | 22          | Figma 876:2217 exact string       |

---

## Evidence

All Figma source PNGs: `docs/audit-screenshots/figma/`  
Post-recovery live PNGs: `docs/audit-screenshots/live/`  
Side-by-side: `docs/audit-screenshots/compare/`

Hero recovery validation:

- [18-couldnt-send.png](audit-screenshots/compare/18-couldnt-send.png)
- [22-alert-cancelled.png](audit-screenshots/compare/22-alert-cancelled.png)
- [16-location-unavailable.png](audit-screenshots/compare/16-location-unavailable.png)

Timeline recovery validation:

- [10-park-me-checking.png](audit-screenshots/compare/10-park-me-checking.png)
- [19-help-received.png](audit-screenshots/compare/19-help-received.png)

SOS hold recovery validation:

- [14-sos.png](audit-screenshots/compare/14-sos.png)
