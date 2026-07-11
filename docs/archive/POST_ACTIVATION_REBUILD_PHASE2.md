# Post-Activation PWA — Rebuild Phase 2

**Date:** 2026-06-18  
**Scope:** SOS frames 14, 14b, 14c, 14d, 17 (Grade D → rebuilt from Figma)  
**Method:** Side-by-side Figma PNG vs live PNG after rebuild  

---

## Summary

| Screen | Node | Route | Before grade | After grade | Status |
|--------|------|-------|--------------|-------------|--------|
| 14 Emergency | `848:278` | `/pwa/scan/sos` | D | **B** | Rebuilt |
| 14b Keep holding | `1092:2499` | `/pwa/scan/sos/holding` | D | **B** | Rebuilt |
| 14c Share location | `1110:2471` | `/pwa/scan/sos/allow-location` | D | **B** | Rebuilt |
| 14d Leave confirm | `1113:2486` | `/pwa/scan/sos/leave-confirm` | D | **B** | Rebuilt |
| 17 Sending alert | `1177:2545` | `/pwa/scan/sos/sending` | D | **B** | Rebuilt |

**Phase 2 result:** Modal-first SOS fragment replaced with Figma emergency page frame on all 14-variant routes.

---

## What was rebuilt

### New: `PwaEmergencyScreen`
Shared Figma 848:278 composition:
- Back + wordmark header (via `PwaScanShell`)
- “Emergency” title + subtitle
- Concentric `AlSosHoldButton` (ring alignment fixed)
- Inline “Turn on location” chip + “Or call 112 directly”
- Optional dimmed overlay for sheets (14c/14d)

### `AlSosHoldButton` — full replacement of layout
- **Bug fixed:** Progress ring was offset below disc (user-reported broken UI)
- Disc, ring, aura, and arc now share one centered 228×228 stage

### 14 · Emergency
- **Removed:** Auto location prompt on mount (modal hijacked screen)
- **Added:** Full emergency page; location only on chip tap

### 14b · Keep holding
- **Removed:** Stripped skeleton (title-only, no footer actions)
- **Added:** Same emergency frame; disc label “Keep holding”

### 14c / 14d · Sheets
- **Removed:** Modal-only layout, wrong copy
- **Added:** Emergency page visible behind dimmed sheet; Figma titles/copy

### 17 · Sending alert
- **Removed:** Green spinner + text-link cancel (`PurchaseStatusShell`)
- **Added:** Red `AlScreenSpinner tone="emergency"`, Figma copy, bordered “I'm safe, cancel alert” footer

### Bonus fix: Frame 15 scene photos (user broken UI)
- Figma title/subtitle restored; back navigation added

---

## Screen evidence

### 14 · Emergency · `848:278`

| Asset | Path |
|-------|------|
| Before | [rebuild/before/14-sos.png](audit-screenshots/rebuild/before/14-sos.png) |
| After | [rebuild/after/14-sos.png](audit-screenshots/rebuild/after/14-sos.png) |
| Figma | [rebuild/figma/14-sos.png](audit-screenshots/rebuild/figma/14-sos.png) |

**Structural differences removed:** Modal-first capture, missing title/subtitle, misaligned hold disc  
**Remaining drift:** Red aura intensity ±5%; status bar excluded

---

### 14b · Keep holding · `1092:2499`

| Asset | Path |
|-------|------|
| Before | [rebuild/before/14b-sos-holding.png](audit-screenshots/rebuild/before/14b-sos-holding.png) |
| After | [rebuild/after/14b-sos-holding.png](audit-screenshots/rebuild/after/14b-sos-holding.png) |
| Figma | [rebuild/figma/14b-sos-holding.png](audit-screenshots/rebuild/figma/14b-sos-holding.png) |

**Structural differences removed:** Missing emergency page chrome and footer row  
**Remaining drift:** Hold state is separate route (Figma shows in-place variant) — acceptable for routing

---

### 14c · Share location · `1110:2471`

| Asset | Path |
|-------|------|
| Before | [rebuild/before/14c-sos-allow-location.png](audit-screenshots/rebuild/before/14c-sos-allow-location.png) |
| After | [rebuild/after/14c-sos-allow-location.png](audit-screenshots/rebuild/after/14c-sos-allow-location.png) |
| Figma | [rebuild/figma/14c-sos-allow-location.png](audit-screenshots/rebuild/figma/14c-sos-allow-location.png) |

**Structural differences removed:** Sheet-only layout, missing emergency hero  
**Remaining drift:** Sheet pin icon not yet rendered (copy matches)

---

### 14d · Leave confirm · `1113:2486`

| Asset | Path |
|-------|------|
| Before | [rebuild/before/14d-sos-leave-confirm.png](audit-screenshots/rebuild/before/14d-sos-leave-confirm.png) |
| After | [rebuild/after/14d-sos-leave-confirm.png](audit-screenshots/rebuild/after/14d-sos-leave-confirm.png) |
| Figma | [rebuild/figma/14d-sos-leave-confirm.png](audit-screenshots/rebuild/figma/14d-sos-leave-confirm.png) |

**Structural differences removed:** Missing back/title behind sheet, truncated copy  
**Remaining drift:** None structural

---

### 17 · Sending alert · `1177:2545`

| Asset | Path |
|-------|------|
| Before | [rebuild/before/17-sending-alert.png](audit-screenshots/rebuild/before/17-sending-alert.png) |
| After | [rebuild/after/17-sending-alert.png](audit-screenshots/rebuild/after/17-sending-alert.png) |
| Figma | [rebuild/figma/17-sending-alert.png](audit-screenshots/rebuild/figma/17-sending-alert.png) |

**Structural differences removed:** Green spinner, text-link cancel, generic status shell  
**Remaining drift:** Red background wash slightly subtler than Figma radial

---

## Files changed (Phase 2)

- `apps/qr/src/features/post-activation-pwa/components/PwaEmergencyScreen.tsx`
- `apps/qr/src/features/post-activation-pwa/routes/pwa-sos-routes.tsx`
- `packages/ui/src/components/primitives/SosHoldButton/*`
- `packages/ui/src/components/primitives/ScreenSpinner/*`
