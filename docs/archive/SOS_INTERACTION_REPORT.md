# SOS Interaction Report

**Date:** 2026-06-17  
**Scope:** Hold-to-send correctness — frames 14, 14b

---

## Problem

Users could enter the SOS holding flow with a simple tap. Navigation to `/sos/holding` fired on `pointerdown`, and progress reset on route change caused inconsistent ring fill.

---

## Required behavior (Figma intent)

1. User **must hold** — tap alone does nothing
2. Progress ring fills over **2200ms** (`PWA_SOS_HOLD_MS`)
3. Release before complete → **cancel** (return to idle)
4. Complete hold → scene photos (route 15)

Route graph unchanged: **14 → 14b → 15**

---

## Implementation

### Engage gate (`PWA_SOS_HOLD_ENGAGE_MS = 200`)

| Phase                 | Route    | Behavior                                          |
| --------------------- | -------- | ------------------------------------------------- |
| Press                 | 14       | Record `holdStartAt`, start progress locally      |
| < 200ms release       | 14       | Reset — **no navigation**                         |
| ≥ 200ms still holding | 14 → 14b | Navigate with `{ holdStartAt }` in location state |
| Release before 100%   | 14b → 14 | Cancel                                            |
| Progress ≥ 100%       | 14b → 15 | Complete                                          |

### Progress continuity

`useHoldProgressFrom(holdStartAt, active, durationMs)` computes progress from absolute timestamp — no reset on 14→14b handoff.

### Button hardening (`AlSosHoldButton`)

- `setPointerCapture` on pointer down
- `onClick` → `preventDefault()` (blocks synthetic click)
- Haptic on start + completion (where supported)
- Visual: ring brightens, disc scales 0.98 while holding, completion glow at 100%

---

## Verification

| Test                               | Result                      |
| ---------------------------------- | --------------------------- |
| Quick tap on 14                    | No route change ✅          |
| Hold < 200ms                       | No route change ✅          |
| Hold ≥ 200ms, release early on 14b | Returns to 14 ✅            |
| Full 2200ms hold                   | Advances to scene photos ✅ |
| Progress arc visible during hold   | ✅                          |

Evidence: [14-sos after](audit-screenshots/bugfix/after/14-sos.png) · [14b after](audit-screenshots/bugfix/after/14b-sos-holding.png)

---

## Files

- `constants/pwa-sos-hold.ts`
- `hooks/use-hold-progress-from.ts`
- `routes/pwa-sos-routes.tsx`
- `packages/ui/.../SosHoldButton/*`
