# Animation Audit Report

**Date:** 2026-06-17  
**Scope:** Post-Activation PWA — motion pass (subtle, premium, fast)

---

## Principles applied

1. Animate only where UX benefit is clear — no spring explosions, no bounce
2. Duration 260–420ms for enters; halos 1.8–2.4s ambient
3. `prefers-reduced-motion: reduce` disables all non-essential motion
4. No route/logic/session changes

---

## App-layer motion (`PwaMotion.tsx`)

| Export           | Trigger            | Properties            | Duration            |
| ---------------- | ------------------ | --------------------- | ------------------- |
| `PwaFade`        | Screen mount       | opacity, y ±6px       | 260ms               |
| `PwaCardEnter`   | Card mount         | opacity, y 8px        | 340ms + 80ms delay  |
| `PwaHeroReveal`  | Status hero        | opacity, scale 0.96→1 | 380ms               |
| `PwaCtaReveal`   | Footer mount       | opacity, y 10px       | 280ms + 120ms delay |
| `PwaRevealItem`  | Staggered sections | opacity, y 6px        | 260ms + index×60ms  |
| `PwaSpringPress` | Tap targets        | scale 0.98            | spring 420/28       |

**Wired in:**

- `PwaScanShell` — footer `PwaCtaReveal`
- `PwaStatusHeroScreen` — fade + hero + staggered title/description
- `PwaEmergencyScreen` — fade + stagger (intro, hold, chips)

---

## Component-layer motion (`@autolokate/ui`)

### `AlSosHoldButton`

| State          | Animation                                                                      |
| -------------- | ------------------------------------------------------------------------------ |
| Idle           | Aura pulse 2.4s                                                                |
| Holding        | Aura 2.2s (synced to hold), disc scale 0.98, ring opacity 0.9, arc brightens   |
| Complete       | Disc glow expand, arc white flash, aura complete keyframe, haptic `[12,40,12]` |
| Press          | `:active` scale 0.96                                                           |
| Reduced motion | Static disc, no aura/arc transition                                            |

### `AlDispatchTimeline`

| Element            | Animation                                              |
| ------------------ | ------------------------------------------------------ |
| Step row           | Enter fade+translateY, stagger 60ms via `--step-index` |
| Connector complete | `scaleY` fill 360ms                                    |
| Complete glyph     | Scale pop 0.88→1                                       |
| Active halo        | Existing 1.8s pulse (unchanged)                        |
| Label              | Color transition 240ms                                 |

### `AlStatusTracker`

- Container enter: fade + translateY 6px, 340ms delay 60ms

### `AlVehicleConfirmationCard`

- Card enter: fade + translateY 8px, 340ms delay 80ms

### `AlPhotoGrid` review tiles

- Per-tile scale enter, stagger 70ms via `--photo-index`

### `AlScenePhotoCard`

- Fill success: green border flash → outline, 420ms

### `AlIncidentStatusHero`

- Visual enter: scale 0.94→1, 380ms
- Attention halo: opacity breathe 2.4s

---

## Screen-specific motion map

| Flow            | Screens    | Motion                        |
| --------------- | ---------- | ----------------------------- |
| Park Me confirm | 08, 08b    | Card entrance                 |
| Park Me photos  | 09         | Photo fill flash              |
| Park Me review  | 09b        | Review tile stagger           |
| Park Me status  | 10–13      | Tracker + timeline stagger    |
| SOS idle/hold   | 14, 14b    | Hold interaction suite        |
| SOS scene       | 15, 15b    | Grid stagger on 15b           |
| SOS sending     | 17         | Aura pulse                    |
| SOS heroes      | 16, 18, 22 | Hero reveal + CTA reveal      |
| SOS timeline    | 19–21, 23  | Tracker + timeline animations |

---

## Not animated (intentional)

- Route exit transitions (would require router `AnimatePresence` refactor)
- Permission sheet enter/exit (static overlay)
- Auth screens 03–05 (shared onboarding compositions)
- Auto-advance timers (`PWA_STATUS_STEP_MS`) — timing unchanged

---

## QA

| Check                      | Result                                    |
| -------------------------- | ----------------------------------------- |
| No layout jumps on enter   | ✅                                        |
| No animation glitches @320 | ✅ Sampled                                |
| Reduced motion respected   | ✅ CSS + framer defaults                  |
| Performance                | CSS transforms/opacity only in UI package |

---

## Files changed

```
apps/qr/.../PwaMotion.tsx
apps/qr/.../PwaScanShell.tsx
apps/qr/.../PwaStatusHeroScreen.tsx
apps/qr/.../PwaEmergencyScreen.tsx
apps/qr/.../pwa-scan.css
packages/ui/.../SosHoldButton/*
packages/ui/.../DispatchTimeline/*
packages/ui/.../StatusTracker/StatusTracker.css
packages/ui/.../VehicleConfirmationCard/VehicleConfirmationCard.css
packages/ui/.../PhotoGrid/*
packages/ui/.../ScenePhotoCard/ScenePhotoCard.css
packages/ui/.../IncidentStatusHero/IncidentStatusHero.css
```
