# Scanner Component Promotion Report

**Date:** 2026-06-17  
**Sprint:** Post-Activation PWA — Final UI Polish  
**Package:** `@autolokate/ui`

---

## Summary

Promoted **`AlVehicleConfirmationCard`** (`variant="scanner"`) as a new core primitive for Post-Activation PWA vehicle verification. This component replaces purchase/onboarding RC confirmation patterns on Park Me confirm screens **08** and **08b** only.

**Rule followed:** Promote once in `@autolokate/ui`; do not duplicate scanner confirmation UI in the app layer.

---

## Component

| Property    | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| **Name**    | `AlVehicleConfirmationCard`                                      |
| **Path**    | `packages/ui/src/components/primitives/VehicleConfirmationCard/` |
| **Variant** | `scanner` (sole variant today)                                   |
| **Figma**   | `1034:2351` (unprotected) · `1040:2374` (protected)              |
| **Export**  | `packages/ui/src/components/primitives/index.ts`                 |

### Props

| Prop         | Type        | Notes                                             |
| ------------ | ----------- | ------------------------------------------------- |
| `plate`      | `string`    | Primary hierarchy — 15px semibold                 |
| `model`      | `string`    | Secondary — 13px muted                            |
| `badgeLabel` | `string`    | Footer badge copy (RC source or protection plan)  |
| `protected`  | `boolean`   | Green border + glow when true                     |
| `variant`    | `'scanner'` | Default; reserved for future non-scanner variants |
| `className`  | `string`    | Optional                                          |

### Visual spec (scanner variant)

- Card: `#1a1a1a` fill, 16px radius, 14/16/12px padding
- Icon well: 40×40, 10px radius, `#4a4a4a` background, 18px car glyph
- Divider: 1px `#4a4a4a`, 12px top / 10px bottom margin
- Badge: 13px semibold `#1fa24a`, 16px shield glyph, 8px gap
- Protected: 1.5px `#1fa24a` border + soft green halo

---

## Usage boundaries

| Screen                               | Route                                 | Component                                                  |
| ------------------------------------ | ------------------------------------- | ---------------------------------------------------------- |
| **08** Park Me confirm (unprotected) | `/pwa/scan/park-me/confirm`           | `AlVehicleConfirmationCard variant="scanner"`              |
| **08b** Park Me confirm (protected)  | `/pwa/scan/park-me/confirm-protected` | `AlVehicleConfirmationCard variant="scanner" protected`    |
| **02** Vehicle found hub             | `/pwa/scan/vehicle`                   | `AlScannedVehicleCard` (unchanged — hub, not verification) |
| Onboarding / purchase RC confirm     | —                                     | **Not used** — no cross-flow reuse                         |

**Wired in:** `apps/qr/src/features/post-activation-pwa/routes/pwa-park-me-routes.tsx`

---

## Related promotion (same sprint)

| Addition                           | Path         | Used on                                   |
| ---------------------------------- | ------------ | ----------------------------------------- |
| `AlPhotoGrid` layout `review-quad` | `PhotoGrid/` | **15b** SOS scene review (4 retake tiles) |

Not a separate component — layout branch on existing `AlPhotoGrid`.

---

## Before / after

| Screen | Before                                                                                                               | After                                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 08     | [polish/before/08-park-me-confirm.png](audit-screenshots/polish/before/08-park-me-confirm.png)                       | [polish/after/08-park-me-confirm.png](audit-screenshots/polish/after/08-park-me-confirm.png)                       |
| 08b    | [polish/before/08b-park-me-confirm-protected.png](audit-screenshots/polish/before/08b-park-me-confirm-protected.png) | [polish/after/08b-park-me-confirm-protected.png](audit-screenshots/polish/after/08b-park-me-confirm-protected.png) |

---

## QA

Responsive capture (320–414 × dark/light) for **08**: `docs/audit-screenshots/polish/responsive/` — **no horizontal overflow** observed.

---

## Documentation updated

- `docs/POST_ACTIVATION_COMPONENT_PROMOTIONS.md` — add `AlVehicleConfirmationCard` row (see companion polish report)
