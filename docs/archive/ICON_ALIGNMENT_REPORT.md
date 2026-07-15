# Icon Alignment Report

**Date:** 2026-06-17  
**Scope:** Post-Activation PWA — icon parity audit (size, stroke, container, optical centering)

---

## Method

Visual comparison of icon wells, glyphs, and timeline markers against Figma CC tracker + scanner confirmation nodes. No route or logic changes.

---

## Changes applied

| Location                              | Issue                                                                  | Fix                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **`AlVehicleConfirmationCard`** (new) | Purchase RC card used 44px wells — wrong hierarchy for scanner confirm | 40×40 well, 10px radius, 18px car stroke 1.75; 16px shield badge                 |
| **`AlStatusTracker` vehicle chip**    | 44×12px well drifted from scanner card + timeline density              | **40×10px** well to match confirmation card                                      |
| **`AlDispatchTimeline` SOS**          | Active/completed glyph sat high vs label baseline; step too tall @320  | `padding-top: 0` on copy; SOS steps `align-items: center`; `stepMinHeight` 36→34 |
| **`AlPhotoGrid` review-quad retake**  | Missing retake affordance on 15b                                       | 32px circular retake well, 24px refresh glyph, top-right 12px inset              |
| **`PwaStatusHeroScreen`**             | Hero visual oversized vs Figma status frames                           | Visual container 188px (was 200px); tighter title/description gap                |

---

## Verified unchanged (already aligned)

| Component                        | Screen(s)    | Notes                                       |
| -------------------------------- | ------------ | ------------------------------------------- |
| `AlSosHoldButton`                | 14, 14b      | Ring/disc alignment fixed in rebuild sprint |
| `AlScannerHubCard` icons         | 02           | 24px `square-parking` / `bell` in hub rows  |
| `AlScenePhotoCard`               | 09, 15       | Stacked label-above-icon layout             |
| `AlScreenSpinner` emergency tone | 17           | Red spinner in SOS sending aura             |
| Timeline complete glyph          | 10–12, 19–21 | 24px park-me / 18px SOS concentric check    |

---

## Auth reuse screens (03–05)

Icons inherit **`A1` / `A2` / `A3`** onboarding screens (`ob-step-chrome`). No PWA-specific icon overrides applied — shell chrome differs from `PwaScanShell` wordmark header. **Residual drift:** header/back treatment, not glyph metrics.

**Grade impact:** B (acceptable reuse constraint; no navigation change)

---

## Icon inventory by screen

| Screen           | Primary icons            | Size            | Status      |
| ---------------- | ------------------------ | --------------- | ----------- |
| 01, 07, 17       | Spinner                  | lg              | ✅          |
| 02               | Parking, bell, chevron   | 24 / 22         | ✅          |
| 08, 08b          | Car, shield (inline SVG) | 18 / 16         | ✅ new card |
| 09, 15           | Camera                   | 24              | ✅          |
| 09b, 15b         | Retake refresh           | 24 in 32px well | ✅          |
| 10–13, 19–21, 23 | Timeline glyphs          | 18–24           | ✅ polished |
| 14–14d           | SOS hold, location       | 72dp / 24       | ✅          |
| 16, 18, 22       | Incident hero Lottie/SVG | 188px frame     | ✅          |

---

## Remaining icon drift

| Screen | Gap                                                         | Severity                       |
| ------ | ----------------------------------------------------------- | ------------------------------ |
| 03–05  | Onboarding chrome vs PWA wordmark shell                     | Low — out of sprint scope      |
| 02 hub | `AlScannedVehicleCard` 44px well (hub variant, intentional) | Low — different component role |

---

## Evidence

Before/after captures: `docs/audit-screenshots/polish/{before,after}/`  
Responsive: `docs/audit-screenshots/polish/responsive/` (08, 15b, 16)
