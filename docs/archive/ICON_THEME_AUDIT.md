# Icon Theme Audit

**Date:** 2026-06-17  
**Packages:** `@autolokate/icons`, `@autolokate/ui` (inline SVG glyphs)

---

## Summary

| Check                | Dark     | Light                                    | Action                                      |
| -------------------- | -------- | ---------------------------------------- | ------------------------------------------- |
| Icons visible        | ✅       | ✅                                       | Fixed 10 generated icons + 4 UI inline SVGs |
| Contrast             | ✅       | ✅                                       | `currentColor` + semantic parent `color`    |
| Opacity              | ✅       | ✅                                       | No theme-specific opacity hacks             |
| Container background | ✅       | ✅                                       | Icon tiles use `--al-color-surface-variant` |
| Hover/focus          | ✅       | ✅                                       | Inherited from button/card focus tokens     |
| White-on-white       | ✅ Fixed | Was broken on PhotoGrid map, timeline    | Token classes                               |
| Dark-on-dark         | ✅ Fixed | IncidentStatusHero used `#0A0A0C` always | `--al-color-on-surface`                     |
| Invisible icons      | ✅ Fixed | See below                                |                                             |

---

## Architecture

`IconSvg` (`packages/icons/src/IconSvg.tsx`) sets `strokeWidth` on root SVG.  
**Convention:** UI icons use `stroke="currentColor"` and inherit `color` from parent.

Halo / status icons are multi-colour SVGs — use **CSS variables** in stroke/fill attributes so they track theme without regeneration.

---

## Icons fixed (hardcoded hex → tokens)

| Icon file                       | Before              | After                                        |
| ------------------------------- | ------------------- | -------------------------------------------- |
| `activation-complete-halo.tsx`  | `#1FA24A` stroke    | `var(--al-color-success)`                    |
| `location-unavailable-halo.tsx` | Amber + `#0A0A0C`   | `--al-signal-amber`, `--al-color-on-surface` |
| `couldnt-send-halo.tsx`         | Amber + `#0A0A0C`   | Tokenized                                    |
| `alert-cancelled-halo.tsx`      | Grey + `#0A0A0C`    | `--al-neutral-500`, `--al-color-on-surface`  |
| `timeline-complete-check.tsx`   | `#1FA24A`           | `--al-color-success`                         |
| `payment-success-halo.tsx`      | Green fills/strokes | Signal/success tokens                        |
| `payment-unconfirmed-halo.tsx`  | `#F5A623`           | `--al-color-warning`                         |
| `fetch-failed-halo.tsx`         | `#F5A623`           | `--al-color-warning`                         |
| `credit-card.tsx`               | `#C9CDD2`           | `currentColor` (parent muted)                |
| `circle-x.tsx`                  | `#E5342A`           | `--al-color-danger`                          |

---

## UI inline SVG fixes

| Component                        | Issue (light)                        | Fix                                                                 |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------- |
| `PhotoGrid` map pin              | White stroke on light-green map tile | `.al-photo-grid__review-map-pin { color: var(--al-color-success) }` |
| `DispatchTimeline` active glyphs | White on amber (wrong vs Figma)      | `--al-color-on-warning` via `currentColor`                          |
| `CircleCheckIconGlyph`           | Hardcoded green                      | `.al-circle-check-glyph path { stroke: var(--al-color-success) }`   |
| `IncidentStatusHero`             | Fixed dark strokes                   | `var(--al-color-on-surface)`                                        |

---

## Usage audit (onboarding)

Icons consumed via `<AlIcon name="…" />` across:

- Flow shells (back, close)
- Plan carousel (check, tier icons)
- Trust rows (shield-check)
- Vahan preview chips
- Emergency rows
- PWA scanner hub (square-parking, bell, chevron)
- Purchase status halos
- Legal reader header

**Pattern:** Parent sets `color: var(--al-color-on-surface-muted)` or component-specific token. Icons without hardcoded stroke inherit correctly in both themes.

---

## PWA icon containers

| Location                      | Dark                                   | Light                |
| ----------------------------- | -------------------------------------- | -------------------- |
| ScannerHubCard icon tile      | `surface-variant` / red emergency tile | ✅ Same tokens       |
| PhotoGrid retake button       | `--al-color-overlay` + on-emergency    | ✅                   |
| Emergency location chip       | `--al-color-surface` + on-surface      | ✅ F (was dark fill) |
| Status tracker complete check | Success token                          | ✅                   |

---

## Light-theme logo

`pwa-scan-shell.css`:

```css
[data-theme='light'] .pwa-scan-shell__logo-figma {
  filter: brightness(0);
}
```

Inverts dark wordmark asset for light canvas — **intentional**, not a token violation.

---

## Verification checklist

- [x] All generated TSX icons: no `stroke="#` / `fill="#`
- [x] Halo inner glyphs use `--al-color-on-surface`
- [x] Signal halos use primitive `--al-signal-*` or semantic `--al-color-warning|success`
- [x] UI icons on tinted backgrounds tested (map, timeline, SOS tile)
- [x] Lint / build pass after icon changes

---

## Remaining drift

None blocking. Source SVG assets under `packages/icons/src/svg/` and `figma-export/` retain hex for regeneration reference only — runtime components are tokenized.

---

## Verdict

**ICON THEME READY** — visible, contrast-correct icons in dark and light.
