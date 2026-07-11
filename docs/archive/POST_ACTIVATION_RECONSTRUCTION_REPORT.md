# Post-Activation PWA — Reconstruction Report

**Date:** 2026-06-18  
**Baseline:** [POST_ACTIVATION_VISUAL_TRUTH_REPORT.md](POST_ACTIVATION_VISUAL_TRUTH_REPORT.md) · **67%** screen parity  
**Method:** Full component discard-and-rebuild + screen reconstruction from Figma nodes (no incremental patching)  
**Validation:** Figma PNG vs live PNG @393×852 dark · side-by-side in `docs/audit-screenshots/compare/`

---

## Executive summary

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| **Screen parity (strict checklist mean)** | **67%** | **85%** | **+18 pts** |
| **Component parity (strict mean)** | **60%** | **90%** | **+30 pts** |
| **Pixel match vs Figma (automated, 30 frames)** | — | **77.4%** | — |
| **Verdict** | NOT READY | **NOT READY** | — |

**Do not declare READY.** Target was 100%. Remaining drift is documented below with evidence.

---

## Root cause fixed (systemic)

| Issue | Cause | Fix |
|-------|-------|-----|
| Timeline checks white, no amber halos | CSS vars `--al-color-signal-*` undefined in theme | Added Figma signal aliases in `packages/design-system/src/theme.css` |
| SOS red disc invisible | Same undefined `--al-color-signal-red-bright` | Rebuilt `AlSosHoldButton` with hardcoded `#FF4A3D` + layered aura/ring/disc |
| Status heroes reused | Single `FetchFailedHaloIcon` on 3 frames | Rebuilt `AlIncidentStatusHero` with per-frame Figma SVG scenes |
| Frame 01 wrong screen | Scanner viewport before spinner | Reconstructed route — spinner-only Figma 928:2252 |
| Frame 09b wrong structure | Custom review layout | Rebuilt with `AlPhotoGrid layout="review"` from 1044:2406 |

---

## Components rebuilt (discard → recreate)

| Component | Old | New | Figma anchors |
|-----------|-----|-----|---------------|
| `AlDispatchTimeline` | 41% | **93%** | 982:2387 · 931:2270 · 1153:2542 |
| `AlSosHoldButton` | 38% | **85%** | 1078:2456–2459 · 848:278 |
| `AlIncidentStatusHero` | 39% | **94%** | 875:2219 · 876:2212 · 875:2193 |
| `AlStatusTracker` | 52% | **90%** | 1063:2427 + timeline child |
| `AlPhotoGrid` | 68% | **86%** | 847:278 · 928:2267 · 1044:2406 |

---

## Screens reconstructed

| Frame | Node | Old | New | Evidence |
|-------|------|-----|-----|----------|
| 01 Loading | 928:2252 | 8% | **88%** | [compare/01-loading.png](audit-screenshots/compare/01-loading.png) |
| 09b Review | 1044:2406 | 31% | **85%** | [compare/09b-park-me-review.png](audit-screenshots/compare/09b-park-me-review.png) |
| 10 Checking | 982:2339 | 57% | **91%** | [compare/10-park-me-checking.png](audit-screenshots/compare/10-park-me-checking.png) |
| 11 Calling | 983:2349 | 58% | **91%** | [compare/11-park-me-calling.png](audit-screenshots/compare/11-park-me-calling.png) |
| 12 Resolved | 983:2410 | 61% | **87%** | [compare/12-park-me-resolved.png](audit-screenshots/compare/12-park-me-resolved.png) |
| 13 Photo not clear | 984:2380 | 55% | **83%** | [compare/13-photo-not-clear.png](audit-screenshots/compare/13-photo-not-clear.png) |
| 14 SOS | 848:278 | 44% | **78%** | [compare/14-sos.png](audit-screenshots/compare/14-sos.png) |
| 15 Scene photos | 928:2267 | 73% | **90%** | [compare/15-sos-scene-photos.png](audit-screenshots/compare/15-sos-scene-photos.png) |
| 19 Help received | 849:321 | 62% | **87%** | [compare/19-help-received.png](audit-screenshots/compare/19-help-received.png) |
| 20 Help dispatched | 870:2145 | 63% | **86%** | [compare/20-help-dispatched.png](audit-screenshots/compare/20-help-dispatched.png) |
| 21 Incident resolved | 871:2151 | 58% | **84%** | [compare/21-incident-resolved.png](audit-screenshots/compare/21-incident-resolved.png) |
| 23 Contacts only | 1150:2527 | 69% | **85%** | [compare/23-contacts-only.png](audit-screenshots/compare/23-contacts-only.png) |

Status hero screens (component-driven):

| Frame | Old | New | Evidence |
|-------|-----|-----|----------|
| 16 Location | 66% | **88%** | [compare/16-location-unavailable.png](audit-screenshots/compare/16-location-unavailable.png) |
| 18 Couldn't send | 41% | **92%** | [compare/18-couldnt-send.png](audit-screenshots/compare/18-couldnt-send.png) |
| 22 Alert cancelled | 47% | **89%** | [compare/22-alert-cancelled.png](audit-screenshots/compare/22-alert-cancelled.png) |

---

## Remaining drift (blocks 100%)

| Drift | Frames affected | Evidence |
|-------|-----------------|----------|
| Figma StatusBar (9:2) not rendered in live shell | All 30 | Systemic ~2-check fail per screen |
| Header wordmark 158:25 vs icon-only `AlLogo` | Most PWA screens | [compare/02-vehicle-found.png](audit-screenshots/compare/02-vehicle-found.png) |
| SOS screen vertical rhythm / back affordance vs Figma y-bands | 14, 14b | [compare/14-sos.png](audit-screenshots/compare/14-sos.png) |
| 10-step SOS timelines push footer CTA below fold at 852px | 19, 20 | [compare/19-help-received.png](audit-screenshots/compare/19-help-received.png) |
| Park Me photos auto-location fetch fills GPS box on empty capture | 09 | [compare/09-park-me-photos.png](audit-screenshots/compare/09-park-me-photos.png) |
| Verify/auth shells (A1–A3, R03–R05) not in reconstruction scope | 03–08 | Unchanged 74–88% |

---

## Files changed

**Design system:** `packages/design-system/src/theme.css` — signal color aliases  

**UI primitives (rebuilt):**
- `packages/ui/src/components/primitives/DispatchTimeline/*`
- `packages/ui/src/components/primitives/SosHoldButton/*`
- `packages/ui/src/components/primitives/IncidentStatusHero/*`
- `packages/ui/src/components/primitives/StatusTracker/*`
- `packages/ui/src/components/primitives/PhotoGrid/*`
- `packages/ui/src/components/primitives/ScenePhotoCard/*` (wide variant)

**Icons (Figma-recovered):**
- `packages/icons/src/generated/couldnt-send-halo.tsx` (875:2219)
- `packages/icons/src/generated/alert-cancelled-halo.tsx` (876:2212)
- `packages/icons/src/generated/location-unavailable-halo.tsx` (875:2193)
- `packages/icons/src/generated/timeline-complete-check.tsx` (181:28)
- `packages/icons/src/assets/pwa-reconstruction/*.svg`

**Routes:**
- `apps/qr/src/features/post-activation-pwa/routes/pwa-shared-routes.tsx` (Frame 01)
- `apps/qr/src/features/post-activation-pwa/routes/pwa-park-me-routes.tsx` (09b, timelines)
- `apps/qr/src/features/post-activation-pwa/routes/pwa-sos-routes.tsx` (heroes, timelines, resolved tint)

---

## Validation artifacts

| Set | Path | Count |
|-----|------|-------|
| Figma exports | `docs/audit-screenshots/figma/` | 30 |
| Live captures (post-reconstruction) | `docs/audit-screenshots/live/` | 30 |
| Side-by-side | `docs/audit-screenshots/compare/` | 30 |

Capture command: `node docs/audit-screenshots/capture-live.mjs` @ `http://127.0.0.1:5175`

---

## Final score

**Post-reconstruction strict screen parity: 85%**  
**Post-reconstruction strict component parity: 90%**

**Status: NOT READY** — 15% screen gap and 10% component gap remain against 100% exact-match target.
