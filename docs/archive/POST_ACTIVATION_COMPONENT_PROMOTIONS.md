# Post-Activation PWA — Component Promotions

**Date:** 2026-06-17  
**Package:** `@autolokate/ui`  
**Rule:** Promoted once, used everywhere in PWA — no duplicate implementations.

---

## Promoted components (10)

| Component                   | Path                                                             | Figma frames     | Usage count             |
| --------------------------- | ---------------------------------------------------------------- | ---------------- | ----------------------- |
| `AlScannerHubCard`          | `packages/ui/src/components/primitives/ScannerHubCard/`          | 02               | 2 (Park Me + Emergency) |
| `AlDispatchTimeline`        | `packages/ui/src/components/primitives/DispatchTimeline/`        | 10–12, 19–21, 23 | 6+                      |
| `AlStatusTracker`           | `packages/ui/src/components/primitives/StatusTracker/`           | 10–12, 19–21, 23 | 6+                      |
| `AlScenePhotoCard`          | `packages/ui/src/components/primitives/ScenePhotoCard/`          | 09, 15, 15b      | 6+                      |
| `AlPhotoGrid`               | `packages/ui/src/components/primitives/PhotoGrid/`               | 09, 15, 15b      | 3                       |
| `AlSosHoldButton`           | `packages/ui/src/components/primitives/SosHoldButton/`           | 14, 14b          | 2                       |
| `AlPermissionSheet`         | `packages/ui/src/components/primitives/PermissionSheet/`         | 09a, 14c, 14d    | 3                       |
| `AlIncidentStatusHero`      | `packages/ui/src/components/primitives/IncidentStatusHero/`      | 16, 18, 22       | 3                       |
| `AlVehicleConfirmationCard` | `packages/ui/src/components/primitives/VehicleConfirmationCard/` | 08, 08b          | 2                       |
| `AlScannedVehicleCard`      | `packages/ui/src/components/primitives/ScannedVehicleCard/`      | 02               | 1                       |

**Export surface:** `packages/ui/src/components/primitives/index.ts`

---

## Per-component documentation

### AlScannerHubCard

- **Purpose:** Dual action rows on vehicle found hub (green Park Me / red Emergency)
- **Variants:** `park-me` | `emergency`
- **Props:** `title`, `subtitle`, `icon`, `onSelect`
- **Used in:** `PwaVehicleFoundRoute`

### AlDispatchTimeline

- **Purpose:** CC tracker vertical stepper
- **Step states:** `pending` | `active` | `complete` | `error`
- **Used in:** Park Me status routes, SOS help-on-the-way routes, contacts-only

### AlStatusTracker

- **Purpose:** Compact vehicle chip (plate + model) + `AlDispatchTimeline`
- **Composes:** `AlDispatchTimeline` (no duplicate timeline logic)
- **Used in:** All post-submit status screens

### AlScenePhotoCard

- **Purpose:** Single dashed/filled photo capture cell
- **States:** `empty` | `filled` | `capturing`
- **Used in:** Via `AlPhotoGrid` on Park Me photos + SOS scene photos

### AlPhotoGrid

- **Purpose:** 2-up (Park Me) or 4-up (SOS) photo layout + optional location preview slot
- **Composes:** `AlScenePhotoCard`
- **Used in:** `PwaParkMePhotosRoute`, `PwaParkMeReviewRoute`, `PwaSosScenePhotosRoute`, `PwaSosScenePhotosCapturedRoute`

### AlSosHoldButton

- **Purpose:** Hold-to-send SOS disc with aura, ring track, progress arc
- **Touch target:** Uses `--al-layout-touch-target-sos` (72dp)
- **Used in:** `PwaSosRoute`, `PwaSosHoldingRoute`

### AlPermissionSheet

- **Purpose:** Bottom sheet with scrim, handle, primary + optional secondary CTA
- **Used in:** Park Me permissions, SOS allow location, SOS leave confirm

### AlIncidentStatusHero

- **Purpose:** Centered halo hero wrapper for error/cancel/neutral states
- **Variants:** `attention` | `emergency` | `neutral` | `success`
- **Used in:** Location unavailable, couldn't send, alert cancelled (via `PwaStatusHeroScreen` in PWA)

### AlVehicleConfirmationCard

- **Purpose:** Scanner-specific vehicle confirmation chip (plate + model + RC/protection badge)
- **Variants:** `scanner` (Post-Activation PWA Park Me confirm only)
- **Figma:** `1034:2351` · `1040:2374`
- **Used in:** `PwaParkMeConfirmRoute`, `PwaParkMeConfirmProtectedRoute`
- **Not used for:** Hub (02), onboarding purchase RC confirm

### AlScannedVehicleCard

- **Purpose:** Hub summary card after QR scan (before flow selection)
- **Used in:** `PwaVehicleFoundRoute` (02)

---

## App-layer compositions (not promoted — reuse onboarding)

| Composition           | Source                                     | PWA usage                          |
| --------------------- | ------------------------------------------ | ---------------------------------- |
| `PwaScanShell`        | `features/post-activation-pwa/components/` | Logo header chrome (no status bar) |
| `PwaMotion`           | `features/post-activation-pwa/components/` | Framer Motion wrappers             |
| `PurchaseStatusShell` | onboarding compositions                    | Loading + error status screens     |

---

## Extended onboarding primitives (optional props only)

These were **not duplicated** — optional props added with unchanged defaults:

| Screen                    | New optional props                                                      |
| ------------------------- | ----------------------------------------------------------------------- |
| `A1MobileScreen`          | `title`, `description`, `footerLabel`, `hideProgress`, `consentVariant` |
| `A2OtpScreen`             | `title`                                                                 |
| `A3VehicleOwnerScreen`    | `title`, `description`, `footerLabel`                                   |
| `R03VehicleNumberScreen`  | `title`, `description`                                                  |
| `R05ConfirmVehicleScreen` | `title`, `description`, `protectedPlan`, `planLabel`                    |
| `InlineConsentBlock`      | `variant: 'owner' \| 'bystander'`                                       |

---

## Inventory update recommendation

Add to `apps/qr/src/components/compositions/inventory.ts` on next composition pass:

```typescript
ScannerHubCard: { promoteToCore: true, usedInFlows: ['pwa-scan'] }
DispatchTimeline: { promoteToCore: true, usedInFlows: ['pwa-scan'] }
// ... etc
```

(PWA flow ID not added to onboarding flow registry — intentional isolation.)
