# UI Stability Report

**Date:** 2026-06-20  
**QA Widths:** 320, 360, 375, 390, 393, 414 px  
**Themes:** Dark + Light

---

## 1. Overflow + Clipping ✅ PASS (with one cosmetic note)

All `overflow: hidden` uses are intentional and contain the correct elements:

- Scroll region bounds, carousel overflow, confetti layer, camera viewfinder, sticky footer containment, progress bar fill — all correct

**Cosmetic issue (320px only):**

- `SosHoldButton.css:25` — `.al-sos-hold__aura` is `width: 320px; position: absolute`. At 320px viewport the glow blur is partially clipped by the parent `overflow: hidden`. The SOS functionality is unaffected (pointer-events: none). Visually the aura glow is slightly cropped at exactly 320px. Acceptable for MVP.

---

## 2. Fixed-Width Elements ✅ PASS

All fixed-width layout elements use `max-width: 100%` or are icon/visual dimensions that don't participate in layout overflow. Plan carousel card (270px) has dynamic padding recentering. Vehicle confirmation card skeleton lines (140px, 96px) are inside `flex: 1; min-width: 0` containers.

---

## 3. Dark/Light Theme Support

### ✅ PASS — Core journey screens

All journey screens (Auth, Purchase, Emergency, Prepaid, B2B2C) use design tokens exclusively. Theme switch at FlowEntry applies consistently via `data-theme` attribute.

### ✅ PASS — Safe area insets

All sticky footers use `env(safe-area-inset-bottom, 0px)`:

- `step-shell-chrome.css`
- `pwa-scan-shell.css`
- `language-picker-sheet.css`
- `PermissionSheet.css`
- `journey.css`
- `welcome-activation-shell.css`

### ⚠️ REMAINING — PWA scanner components (dark-only)

The following `packages/ui` components are hardcoded to dark palette. The PWA is designed dark-first and these are only used in the PWA scan context. Light-mode support is a future sprint:

| Component                     | Issue                                                                    |
| ----------------------------- | ------------------------------------------------------------------------ |
| `ScannedVehicleCard.css`      | Background `#1a1a1a`, text `#ffffff`, `#4a4a4a`, `#8a8a8a` — dark-only   |
| `VehicleConfirmationCard.css` | Same dark-palette pattern                                                |
| `StatusTracker.css`           | Same dark-palette pattern                                                |
| `DispatchTimeline.css`        | Multiple hardcoded dark colors including `#f5a623`, `#4a4a4a`, `#1fa24a` |
| `SosHoldButton.css`           | `#ff4a3d`, `#ff6b5f`, `#ffffff` — brand reds hardcoded                   |
| `PhotoGrid.css`               | Dark overlay `rgba(10,10,10,0.55)`                                       |
| `ScannerHubCard.css`          | Emergency `rgba(255,74,61,0.12)` hardcoded                               |
| `ScreenSpinner.css`           | SVG stroke colors hardcoded                                              |

**Residual issues in app code:**

- `plan-carousel.css:126,132` — success green in keyframe mid-frame
- `rider-cover-options.css:159` — selected badge green tint
- `pwa-scan.css:52,57,58,93` — status alert backgrounds (warning/error rgba values)

---

## 4. Input/Form Stability ✅ PASS

| Input          | Width handling                                           | Status           |
| -------------- | -------------------------------------------------------- | ---------------- |
| `AlTextField`  | `width: 100%; min-width: 0`                              | ✅ Fluid         |
| `AlOtpInput`   | `flex: 1; min-width: 0` per cell — 6 cells divide evenly | ✅ Safe at 320px |
| `AlPlateInput` | `width: 100%; text-align: center`                        | ✅ Safe          |

**Fixed:** `PlateInput` placeholder color `#8c8f94` → `var(--al-color-on-surface-muted)` ✅

---

## 5. Typography Overflow ✅ PASS (with ContactCard fix)

**Fixed:** `ContactCard.css` — `.al-contact-card__name` and `.al-contact-card__subtitle` now have `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` for long unbroken user-supplied strings. ✅

All other user-data displays (`VehicleRcCard`, `pwa-emergency-screen`, `pwa-scan`) already have appropriate `word-break: break-word` or `overflow-wrap: anywhere`.

---

## 6. CTA Placement ✅ PASS

No feature CTA uses `position: fixed` inappropriately. All primary/secondary CTAs are inside the `step-shell-chrome__footer` flex layout or `pwa-scan-shell__footer`. Safe area insets applied universally.

---

## 7. Animation Safety ✅ PASS

All animations (19 checked) have `@media (prefers-reduced-motion: reduce)` overrides.

**Fixed this session:** TextField spinner, Toggle spinner, QuickAction spinner — all now have proper reduced-motion overrides. ✅

---

## 8. Screen-by-Screen Width Analysis

| Width | Issues                                | Status        |
| ----- | ------------------------------------- | ------------- |
| 320px | SOS aura glow clipped (cosmetic only) | ✅ Functional |
| 360px | None                                  | ✅            |
| 375px | None                                  | ✅            |
| 390px | None                                  | ✅            |
| 393px | None (design target)                  | ✅            |
| 414px | None                                  | ✅            |

---

## 9. Broken States Checklist

| State               | Status                               |
| ------------------- | ------------------------------------ |
| Broken cards        | ✅ None found                        |
| Broken inputs       | ✅ None found                        |
| Broken icons        | ✅ None found                        |
| Broken animations   | ✅ None found (reduced-motion fixed) |
| Broken CTA states   | ✅ None found                        |
| Broken loaders      | ✅ None found                        |
| Broken empty states | ✅ None found                        |
| Broken error states | ✅ None found                        |
| Overflow at 320px   | ⚠️ SOS aura glow only — cosmetic     |
