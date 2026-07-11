# PWA Light Theme Report

**Date:** 2026-06-17  
**Feature:** `apps/qr/src/features/post-activation-pwa`  
**Routes:** 32 active paths under `/pwa/scan/*`

---

## Executive summary

PWA was the **highest-impact** light-theme failure zone. Components promoted from Figma CC used a dark-surface palette copied verbatim into CSS. This report covers re-audit of all PWA-specific UI called out in prior audits.

**Result:** All flagged components token-compliant. Light theme surfaces, text, borders, icons, and overlays render correctly.

---

## Previously flagged components — re-audit

| Component | Prior issue | Light theme now | Fix location |
|-----------|-------------|-----------------|--------------|
| ScannerHubCard | Park-me forced `#1a1a1a` gradient | White surface, muted chevron | `ScannerHubCard.css` |
| DispatchTimeline | `#4A4A4A` connectors, white glyphs | Outline + on-warning glyphs | `DispatchTimeline.css/tsx` |
| StatusTracker | Dark card, white-only text | Semantic surface/on-surface | `StatusTracker.css` |
| Vehicle cards (Scanned / Confirmation) | Dark gradients | `--al-color-surface` + RC gradient tokens | `*Vehicle*.css` |
| Status heroes | Amber/grey halos + fixed dark strokes | CSS variable SVG | `IncidentStatusHero.tsx` |
| SOS components | Hint text hardcoded grey; ring hex | Muted/on-surface + signal tokens | `SosHoldButton.css`, `pwa-emergency-screen.css` |
| PhotoGrid | White map pin on light green | Success-coloured pin | `PhotoGrid.css/tsx` |
| PermissionSheet | Dark scrim/panel assumptions | `--al-color-overlay`, surface | `PermissionSheet.css` |

---

## PWA CSS files audited

| File | Hardcoded colours (before) | Status |
|------|------------------------------|--------|
| `pwa-emergency-screen.css` | 5+ hex (regression) | ✅ Tokenized |
| `pwa-scan.css` | Invalid vars + muted hex | ✅ Fixed |
| `pwa-scan-shell.css` | Logo filter only (light block) | ✅ Intentional |
| `components/pwa-scan-shell.css` | Light footer sticky override | ✅ Token-based |

---

## Route-by-route light theme

### Bootstrap & hub

| Route | Screen | Light |
|-------|--------|-------|
| `/loading` | Spinner + copy | ✅ |
| `/vehicle` | Scanned card + hub cards | ✅ |
| `/verify/mobile` | A1 shell reuse | ✅ |
| `/verify/otp` | OTP shell reuse | ✅ |
| `/verify/name` | A3 shell reuse | ✅ |

### Park Me

| Route | Screen | Light |
|-------|--------|-------|
| `/park-me/vehicle-number` | Plate input | ✅ |
| `/park-me/looking-up` | Spinner | ✅ |
| `/park-me/confirm` | Vehicle confirmation | ✅ |
| `/park-me/confirm-protected` | Protected badge card | ✅ |
| `/park-me/permissions` | Sheet over photo backdrop | ✅ |
| `/park-me/photos` | Dual photo + location | ✅ |
| `/park-me/status/checking` | Timeline | ✅ |
| `/park-me/status/calling` | Timeline | ✅ |
| `/park-me/status/resolved` | Timeline + Done | ✅ |
| `/park-me/photo-not-clear` | Error timeline | ✅ |

### SOS / Emergency

| Route | Screen | Light |
|-------|--------|-------|
| `/sos` | Hold button + location chip | ✅ |
| `/sos/holding` | Progress ring | ✅ |
| `/sos/allow-location` | Permission sheet | ✅ |
| `/sos/leave-confirm` | Permission sheet | ✅ |
| `/sos/scene-photos` | Quad photo grid | ✅ |
| `/sos/scene-photos/captured` | Review quad | ✅ |
| `/sos/location-unavailable` | Status hero | ✅ |
| `/sos/sending` | Emergency spinner | ✅ |
| `/sos/couldnt-send` | Status hero | ✅ |
| `/sos/help-received` | SOS timeline | ✅ |
| `/sos/help-dispatched` | SOS timeline | ✅ |
| `/sos/resolved` | Protected timeline | ✅ |
| `/sos/alert-cancelled` | Neutral hero | ✅ |
| `/sos/contacts-only` | Contacts timeline | ✅ |

---

## Dark-theme assumptions removed

| Pattern removed | Replacement |
|-----------------|-------------|
| `background: #1a1a1a` | `var(--al-color-surface)` |
| `color: #ffffff` (body text) | `var(--al-color-on-surface)` |
| `color: #8a8a8a` (muted) | `var(--al-color-on-surface-muted)` |
| `border-color: #4a4a4a` | `var(--al-color-outline)` |
| Dark-only park-me gradient | Surface + outline tokens |
| White SVG on light tint | Semantic icon colour |

---

## SOS intentional colours (exceptions)

The SOS hold disc remains **signal red with white label** in both themes — emergency affordance per Figma. Implemented via:

- `--al-signal-red-bright` / `--al-brand-white`
- Documented in TOKEN_COMPLIANCE_REPORT_V2

---

## Responsive (PWA)

Shell uses full-width column with safe-area padding. Verified at 320–414px — no clipping from token migration.

Light-specific:

- Sticky footer shadow uses surface token in `[data-theme='light']` block (`pwa-scan-shell.css`)
- Logo brightness filter for light canvas

---

## Test URLs

```text
http://127.0.0.1:5199/pwa/scan/vehicle
http://127.0.0.1:5199/pwa/scan/sos
http://127.0.0.1:5199/pwa/scan/park-me/confirm-protected
```

Set theme:

```js
localStorage.setItem('al-qr-theme', 'light');
document.documentElement.setAttribute('data-theme', 'light');
location.reload();
```

---

## Before / after

**Before (light):** Dark cards floating on canvas; location chip `#1a1a1a` fill; timeline labels low contrast; map pin invisible; park-me hub card dark slab.

**After (light):** Cards match `--al-color-surface`; text uses on-surface roles; icons and timeline glyphs contrast-correct; emergency red SOS unchanged by design.

---

## Verdict

**PWA LIGHT THEME READY**
