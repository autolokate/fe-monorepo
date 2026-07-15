# Post-Activation PWA — Rebuild Phase 1

**Date:** 2026-06-18  
**Scope:** Frames 06, 08, 08b, 09, 09b (Grade D → rebuilt from Figma)  
**Method:** Side-by-side Figma PNG vs live PNG after rebuild

---

## Summary

| Screen                  | Node        | Route                                 | Before grade | After grade | Status  |
| ----------------------- | ----------- | ------------------------------------- | ------------ | ----------- | ------- |
| 06 Vehicle number       | `991:2328`  | `/pwa/scan/park-me/vehicle-number`    | D            | **B**       | Rebuilt |
| 08 Confirm (plain)      | `1034:2351` | `/pwa/scan/park-me/confirm`           | D            | **B**       | Rebuilt |
| 08b Confirm (protected) | `1040:2374` | `/pwa/scan/park-me/confirm-protected` | D            | **B**       | Rebuilt |
| 09 Add photos           | `847:278`   | `/pwa/scan/park-me/photos`            | D            | **B**       | Rebuilt |
| 09b Check and send      | `1044:2406` | `/pwa/scan/park-me/review`            | D            | **B**       | Rebuilt |

**Phase 1 result:** 0 Grade D screens remain in scope. Purchase-flow shells (`R03`, `R05`) removed.

---

## What was rebuilt

### Shared infrastructure

- **`PwaScanShell`** — Autolokate wordmark SVG header (replaces icon-only mark)
- **`AlScannedVehicleCard`** — `footerLabel`, `protected` green border variant
- **`AlScenePhotoCard`** — stacked variant: label above icon (Figma 847:278)
- **`AlPhotoGrid`** — `locationCapture` third dashed tile; review cards always show gradient base

### 06 · Vehicle number

- **Removed:** Vahan chip grid, “Fetch from Vahan”, wrong headlines
- **Added:** Figma copy, single `AlPlateInput`, helper + Continue footer in `PwaScanShell`

### 08 / 08b · Confirm vehicle

- **Removed:** `AlVehicleRcCard` / `R05ConfirmVehicleScreen`
- **Added:** Compact `AlScannedVehicleCard` with “From your RC records” or protected footer
- **Copy:** “Is this your vehicle?”, “Yes, that’s mine” CTA

### 09 · Add photos and location

- **Removed:** Inverted icon/text tiles, separate location button styling
- **Added:** Three equal dashed stacked tiles (2× camera, 1× location pin)

### 09b · Check and send

- **Removed:** Empty photo void, map-only layout
- **Added:** Two 160px review cards with retake icons + green location card

---

## Screen evidence

### 06 · Vehicle number · `991:2328`

| Asset  | Path                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| Before | [rebuild/before/06-park-me-vehicle-number.png](audit-screenshots/rebuild/before/06-park-me-vehicle-number.png) |
| After  | [rebuild/after/06-park-me-vehicle-number.png](audit-screenshots/rebuild/after/06-park-me-vehicle-number.png)   |
| Figma  | [rebuild/figma/06-park-me-vehicle-number.png](audit-screenshots/rebuild/figma/06-park-me-vehicle-number.png)   |

**Structural differences removed:** Vahan lookup UI, wrong headlines, wrong CTA  
**Remaining drift:** Continue enabled when plate filled (Figma capture shows disabled empty state); status bar excluded by design

---

### 08 · Confirm (plain) · `1034:2351`

| Asset  | Path                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| Before | [rebuild/before/08-park-me-confirm.png](audit-screenshots/rebuild/before/08-park-me-confirm.png) |
| After  | [rebuild/after/08-park-me-confirm.png](audit-screenshots/rebuild/after/08-park-me-confirm.png)   |
| Figma  | [rebuild/figma/08-park-me-confirm.png](audit-screenshots/rebuild/figma/08-park-me-confirm.png)   |

**Structural differences removed:** RC certificate card, wrong titles, “Confirm” CTA  
**Remaining drift:** Demo plate/model differs from Figma frame sample data

---

### 08b · Confirm (protected) · `1040:2374`

| Asset  | Path                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Before | [rebuild/before/08b-park-me-confirm-protected.png](audit-screenshots/rebuild/before/08b-park-me-confirm-protected.png) |
| After  | [rebuild/after/08b-park-me-confirm-protected.png](audit-screenshots/rebuild/after/08b-park-me-confirm-protected.png)   |
| Figma  | [rebuild/figma/08b-park-me-confirm-protected.png](audit-screenshots/rebuild/figma/08b-park-me-confirm-protected.png)   |

**Structural differences removed:** External protection callout, RC card paradigm  
**Remaining drift:** Green glow intensity slightly softer than Figma

---

### 09 · Add photos · `847:278`

| Asset  | Path                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| Before | [rebuild/before/09-park-me-photos.png](audit-screenshots/rebuild/before/09-park-me-photos.png) |
| After  | [rebuild/after/09-park-me-photos.png](audit-screenshots/rebuild/after/09-park-me-photos.png)   |
| Figma  | [rebuild/figma/09-park-me-photos.png](audit-screenshots/rebuild/figma/09-park-me-photos.png)   |

**Structural differences removed:** Icon-above-label inversion, solid location tile  
**Remaining drift:** Tile corner radius / internal spacing ±2px

---

### 09b · Check and send · `1044:2406`

| Asset  | Path                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| Before | [rebuild/before/09b-park-me-review.png](audit-screenshots/rebuild/before/09b-park-me-review.png) |
| After  | [rebuild/after/09b-park-me-review.png](audit-screenshots/rebuild/after/09b-park-me-review.png)   |
| Figma  | [rebuild/figma/09b-park-me-review.png](audit-screenshots/rebuild/figma/09b-park-me-review.png)   |

**Structural differences removed:** Missing photo cards, map-only composition  
**Remaining drift:** Map uses stylized lines vs Figma map tile; retake icons not yet wired to navigation

---

## Files changed (Phase 1)

- `apps/qr/src/features/post-activation-pwa/routes/pwa-park-me-routes.tsx`
- `apps/qr/src/features/post-activation-pwa/components/PwaScanShell.tsx`
- `apps/qr/src/features/post-activation-pwa/utils/pwa-vehicle-utils.ts`
- `packages/ui/src/components/primitives/ScannedVehicleCard/*`
- `packages/ui/src/components/primitives/ScenePhotoCard/*`
- `packages/ui/src/components/primitives/PhotoGrid/*`
