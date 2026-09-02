# Post-Activation PWA — Parity Recovery Report

**Date:** 2026-06-18  
**Sprint:** Parity recovery (signoff backlog only)  
**Baseline:** `POST_ACTIVATION_FINAL_SIGNOFF.md` (~71% verified parity)  
**Figma section:** `843:2079`

---

## Summary

| Metric               | Before   | After    |
| -------------------- | -------- | -------- |
| Overall Figma parity | **~71%** | **~98%** |
| P0 blockers open     | 5        | 0        |
| Dead routes          | 2        | 0        |
| Build                | PASS     | PASS     |

### Verdict: **NOT READY** (below 100% rule)

All signoff P0 blockers were closed in code. Residual gaps are frame 09b review layout polish, full responsive QA matrix, and two motion intents not yet component-scoped.

---

## P0 fixes delivered

| #   | Blocker                      | Resolution                                                                                                                                                                                          |
| --- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Generic 4-step CC tracker    | Rebuilt `AlDispatchTimeline` — 6-step Park Me / 10-step SOS, titles + subtitles, amber active halos, per-step glyphs (`shield-check`, `phone`, `activity`, `triangle-alert`), green completed rails |
| 2   | Park Me photos 2-column grid | `AlPhotoGrid` `stacked` layout + `AlScenePhotoCard` 160px boxes; Figma copy; `camera` icons; CTA **Send to owner**; helper **Add photos and location to continue**                                  |
| 3   | Dead branches                | Demo name **Photo Fail** → `/park-me/photo-not-clear`; **Network Fail** or offline → `/sos/couldnt-send`                                                                                            |
| 4   | Full RC card on vehicle hub  | New `AlScannedVehicleCard` (Figma 843:2080 compact card) replaces `AlVehicleRcCard` on frame 02                                                                                                     |
| 5   | Loading-only entry           | Loading route now: live camera viewport → scan overlay → opening spinner with Figma subtitle                                                                                                        |

---

## Screens fixed (by frame)

| Frame | Route                      | Fix                                                      |
| ----- | -------------------------- | -------------------------------------------------------- |
| 01    | `/pwa/scan/loading`        | QR scanner viewport + opening copy                       |
| 02    | `/pwa/scan/vehicle`        | Compact vehicle card; `bell` + `chevron-right` hub icons |
| 07    | `/park-me/looking-up`      | Park Me lookup copy                                      |
| 09    | `/park-me/photos`          | Stacked capture layout + Send to owner                   |
| 10–12 | Park Me status             | Figma titles, subtitles, 6-step timelines                |
| 13    | `/park-me/photo-not-clear` | Reachable; Figma copy + error timeline                   |
| 14    | `/sos`                     | Emergency title, location chip, call 112 fallback        |
| 17–18 | Sending / couldn't send    | Network fail demo path                                   |
| 19–21 | SOS status                 | 10-step timelines, Help is on the way copy, cancel CTA   |
| 23    | `/sos/contacts-only`       | 3-step contacts timeline + Figma copy                    |

---

## Icon recovery

| Area            | Before               | After                                                 |
| --------------- | -------------------- | ----------------------------------------------------- |
| Emergency hub   | `heart`              | `bell`                                                |
| Photo capture   | `scan-line`          | `camera`                                              |
| Hub chevron     | inline SVG           | `chevron-right` export                                |
| Timeline active | generic / phone only | `shield-check`, `phone`, `activity`, `triangle-alert` |

Added to `@autolokate/icons`: `camera`, `activity`, `chevron-right`, `triangle-alert`.

---

## Animations

| Intent                    | Status                                        |
| ------------------------- | --------------------------------------------- |
| Timeline amber halo pulse | CSS component animation on active/error steps |
| SOS hold ring             | Existing `AlSosHoldButton` progress arc       |
| Photo capture success     | Pending — no fill-state motion yet            |
| Vehicle lookup success    | Pending — R04/R05 unchanged shell             |
| Dispatch step transitions | Halo + rail color transitions only            |

---

## Remaining gaps (~2%)

1. **Frame 09b** review still uses 2-column photo preview grid (Figma 1044:2406 uses stacked filled cards).
2. **Full QA matrix** — breakpoints 320–414, light/dark, all branches not re-run in this session.
3. **Photo capture success / vehicle lookup** component-level motion not implemented.

---

## Demo paths (deterministic)

| Branch                 | Trigger                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| Photo not clear (13)   | Enter name **Photo Fail** on verify screen 05, complete Park Me through send |
| Couldn't send (18)     | Enter name **Network Fail** on verify screen 05, complete SOS hold → send    |
| Couldn't send (18) alt | Toggle offline (`navigator.onLine === false`) before send                    |

Happy path unchanged: mobile `9999999999`, OTP `123456`, reporter plate `MH 12 AB 3456`.

---

## Build

```
pnpm --filter @autolokate/icons build   ✅
pnpm --filter @autolokate/ui build      ✅
pnpm --filter @autolokate/qr build ✅
```
