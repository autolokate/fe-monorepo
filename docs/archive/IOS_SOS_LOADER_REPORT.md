# iOS SOS Loader Report

**Date:** 2026-06-17  
**Component:** `AlSosHoldButton` (`packages/ui/src/components/primitives/SosHoldButton/`)  
**Routes:** `/pwa/scan/sos`, `/pwa/scan/sos/holding`

---

## Issue

Inside the SOS hold button, the circular progress loader did not render on iOS Safari / iOS PWA. Android Chrome and desktop browsers worked.

---

## Root Cause Analysis

| Factor                              | Finding                                                                                                                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SVG stroke-dashoffset animation** | Primary progress was a `<circle>` with `stroke-dashoffset` driven by React state. iOS WebKit has known inconsistencies animating dashed SVG strokes inside transformed containers (`rotate(-90deg)` + `translateZ(0)` stacking). |
| **Opacity gating**                  | Progress SVG was fully hidden (`strokeDashoffset = circumference`) when not holding; on iOS the first painted frame after `pointerdown` could miss the arc before compositor caught up.                                          |
| **Z-index / masking**               | 200px disc (`z-index: 1`) sat below progress (`z-index: 2`) — layout correct, but WebKit sometimes fails to composite SVG strokes above rounded buttons during active touch.                                                     |
| **Pointer events**                  | Not the blocker — `pointer-events: none` on progress layer is intentional; disc handles capture correctly.                                                                                                                       |

---

## Fix Implemented

Dual-layer progress rendering:

1. **Primary (WebKit-safe):** CSS `conic-gradient` ring with radial `mask` / `-webkit-mask` donut cutout.
   - Custom property `--sos-hold-progress: Ndeg` updated from React progress (0–360°).
   - Visible when `.al-sos-hold--holding` or `.al-sos-hold--complete`.
   - `translateZ(0)` promotes to own compositor layer.

2. **Secondary (enhancement):** SVG arc retained for browsers with reliable stroke-dashoffset; hidden until hold starts; `fill="none"` explicitly set.

### Key Code

```tsx
// SosHoldButton.tsx
<div
  className="al-sos-hold__progress-ring"
  style={{ '--sos-hold-progress': `${clampedProgress * 360}deg` }}
/>
```

```css
/* SosHoldButton.css */
.al-sos-hold__progress-ring {
  background: conic-gradient(from 0deg, #ff6b5f var(--sos-hold-progress, 0deg), transparent var(--sos-hold-progress, 0deg));
  (mask omitted)
}
```

---

## Screens Affected

- SOS idle hold (`PwaSosRoute`)
- SOS holding progress (`PwaSosHoldingRoute`)
- Any consumer of `AlSosHoldButton`

---

## Screenshots

| State                            | Path                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| After (desktop WebKit emulation) | `docs/audit-screenshots/live/14-sos.png`                                              |
| Before                           | Pre-fix captures — loader absent on iOS only (not reproducible in desktop Playwright) |

---

## Verification Matrix

| Platform                 | Loader visible        | Notes                            |
| ------------------------ | --------------------- | -------------------------------- |
| Desktop Chrome           | ✓                     | SVG + CSS ring                   |
| Desktop Safari           | ✓ (Playwright WebKit) | CSS ring primary                 |
| Android Chrome           | ✓                     | Pre-fix already worked           |
| **iOS Safari**           | **Unverified**        | Requires physical device         |
| **iOS PWA (standalone)** | **Unverified**        | Requires Add to Home Screen test |

---

## Remaining Drift

- No automated iOS device farm in CI.
- Hold animation at 60ms linear steps may still flicker on low-end devices if main thread busy — consider `requestAnimationFrame` batching in follow-up (out of P0 scope).

---

## Final Verdict: **MORE FIXES REQUIRED**

Fix is implemented and architecturally correct for WebKit. **Do not mark READY** until validated on:

- iPhone Safari (iOS 17+)
- iPhone PWA standalone mode
- Hold gesture with `-webkit-touch-callout` disabled (already set on disc)

### Recommended Manual Test

1. Open `/pwa/scan/sos` on iPhone.
2. Press and hold SOS disc for full 3s hold duration.
3. Confirm coral progress ring animates smoothly around disc edge.
4. Repeat in standalone PWA after Add to Home Screen.
