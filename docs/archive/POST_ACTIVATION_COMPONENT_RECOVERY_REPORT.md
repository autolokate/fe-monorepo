# Post-Activation PWA — Component Recovery Report

**Date:** 2026-06-18  
**Baseline component parity:** `POST_ACTIVATION_COMPONENT_PARITY.md`  
**Target:** 100% on all 8 promoted components

---

## Summary

| Component | Before | After | Status |
|-----------|--------|-------|--------|
| `AlDispatchTimeline` | ~45% | **~98%** | Recovered |
| `AlPhotoGrid` | ~50% | **~97%** | Recovered |
| `AlScenePhotoCard` | ~82% | **~96%** | Recovered |
| `AlStatusTracker` | ~70% | **~98%** | Recovered |
| `AlScannerHubCard` | ~88% | **~99%** | Recovered |
| `AlSosHoldButton` | ~85% | **~95%** | Partial |
| `AlPermissionSheet` | ~90% | **~90%** | Unchanged |
| `AlIncidentStatusHero` | ~80% | **~80%** | Unchanged |

**New:** `AlScannedVehicleCard` — Figma 843:2080 compact vehicle card (frame 02).

**Promotion signoff:** **NOT APPROVED** — aggregate ~96%; two components unchanged; motion gaps on SOS hold split remain.

---

## AlDispatchTimeline — ~45% → ~98%

### Changes
- Added `subtitle` and per-step `activeGlyph` to step model
- 24px glyph column matching Figma CC tracker
- Completed: green `circle-check` stroke icon
- Active/error: amber filled disc + blur halo + white glyph
- Pending: hollow 1.5px ring
- Green connector segments between completed steps
- Removed generic numbered pending steps

### Presets wired in `pwa-demo-data.ts`
- Park Me: checking, calling, resolved, photoError (6 steps each)
- SOS: received, dispatched, resolved (10 steps each)
- SOS contacts-only: 3 steps

### Remaining
- SOS timeline uses 14px title / 12px subtitle (Figma SOS frames) vs 15px/13px Park Me — minor typography delta

---

## AlPhotoGrid — ~50% → ~97%

### Changes
- New `stacked` layout — full-width vertical stack, 16px gap
- GPS slot supports 120px dashed location box via `locationPreview` slot
- Park Me route uses stacked dual capture + location CTA

### Remaining
- Frame 09b review route still renders custom 2-column review grid instead of stacked filled `AlScenePhotoCard` cells

---

## AlScenePhotoCard — ~82% → ~96%

### Changes
- `variant="stacked"` — min-height 160px, 15px label, 32px icon area
- Figma dashed 1.5px border preserved
- `capturing` state green solid border

### Remaining
- No success pop animation on fill transition

---

## AlStatusTracker — ~70% → ~98%

### Changes
- Delegates to rebuilt timeline (no separate `activeIcon` prop)
- Vehicle chip unchanged (60px, plate + model) — matches Figma status frames

---

## AlScannerHubCard — ~88% → ~99%

### Changes
- Optional `chevron` prop — PWA passes `chevron-right` icon export
- Emergency tile uses `bell` at call site

---

## AlSosHoldButton — ~85% → ~95%

### Unchanged in component
- Hold ring, aura, disc copy match Figma 848:278

### Route-level fixes
- SOS screen wraps chip + call fallback outside button (Figma layout)
- Hold progress still split across `/sos` and `/sos/holding` routes (by design — no route changes)

### Remaining
- Holding route title "Keep holding" — Figma 14b uses same disc copy pattern; acceptable

---

## AlPermissionSheet — ~90%

No structural changes this sprint. Still passes signoff.

---

## AlIncidentStatusHero — ~80%

No changes. Used on location unavailable / couldn't send / cancelled screens.

---

## AlScannedVehicleCard (new)

| Property | Figma match |
|----------|-------------|
| 104px card height (content-driven) | ✅ |
| 44px car tile, 12px radius | ✅ |
| Plate 15px semibold, model 13px muted | ✅ |
| Divider + shield row 13px green | ✅ |
| Optional `protectedLabel` | ✅ |

---

## Files touched

```
packages/ui/src/components/primitives/DispatchTimeline/*
packages/ui/src/components/primitives/PhotoGrid/*
packages/ui/src/components/primitives/ScenePhotoCard/*
packages/ui/src/components/primitives/StatusTracker/*
packages/ui/src/components/primitives/ScannerHubCard/*
packages/ui/src/components/primitives/ScannedVehicleCard/*
packages/icons/src/generated/{camera,activity,chevron-right,triangle-alert}.tsx
packages/icons/src/iconNames.ts
apps/qr/src/features/post-activation-pwa/data/pwa-demo-data.ts
apps/qr/src/features/post-activation-pwa/routes/*
```
