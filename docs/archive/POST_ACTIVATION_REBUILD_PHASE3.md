# Post-Activation PWA — Rebuild Phase 3

**Date:** 2026-06-18  
**Scope:** SOS timeline frames 19, 20, 21 (Grade D → rebuilt from Figma)  
**Method:** Side-by-side Figma PNG vs live PNG after rebuild

---

## Summary

| Screen               | Node       | Route                           | Before grade | After grade | Status  |
| -------------------- | ---------- | ------------------------------- | ------------ | ----------- | ------- |
| 19 Help received     | `849:321`  | `/pwa/scan/sos/help-received`   | D            | **B**       | Rebuilt |
| 20 Help dispatched   | `870:2145` | `/pwa/scan/sos/help-dispatched` | D            | **B**       | Rebuilt |
| 21 Incident resolved | `871:2151` | `/pwa/scan/sos/resolved`        | D            | **B**       | Rebuilt |

**Phase 3 result:** Sticky footer + compact SOS timeline restores Figma terminal layout.

---

## What was rebuilt

### `PwaScanShell` sticky footer mode

- `stickyFooter` prop: scrollable main + pinned footer CTA
- Fixes off-screen “I'm safe, cancel alert” and “Done” buttons

### `AlDispatchTimeline` SOS variant

- Tighter connector heights (16–18px vs 27–32px)
- Reduced step min-height (36px vs 50px)
- Smaller active halo (24px vs 28px)

### Screen composition

Each route now uses:

```
[ wordmark header ]
[ title + subtitle ]
[ vehicle chip ]
[ 10-step SOS timeline — scrolls ]
[ pinned footer CTA ]
```

---

## Screen evidence

### 19 · Help on the way · `849:321`

| Asset  | Path                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| Before | [rebuild/before/19-help-received.png](audit-screenshots/rebuild/before/19-help-received.png) |
| After  | [rebuild/after/19-help-received.png](audit-screenshots/rebuild/after/19-help-received.png)   |
| Figma  | [rebuild/figma/19-help-received.png](audit-screenshots/rebuild/figma/19-help-received.png)   |

**Structural differences removed:** Footer CTA off-screen, timeline vertical bloat  
**Remaining drift:** Timeline line weight slightly heavier than Figma

---

### 20 · Help dispatched · `870:2145`

| Asset  | Path                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| Before | [rebuild/before/20-help-dispatched.png](audit-screenshots/rebuild/before/20-help-dispatched.png) |
| After  | [rebuild/after/20-help-dispatched.png](audit-screenshots/rebuild/after/20-help-dispatched.png)   |
| Figma  | [rebuild/figma/20-help-dispatched.png](audit-screenshots/rebuild/figma/20-help-dispatched.png)   |

**Structural differences removed:** Missing cancel CTA in viewport  
**Remaining drift:** Active-step glow slightly brighter than Figma

---

### 21 · Incident resolved · `871:2151`

| Asset  | Path                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- |
| Before | [rebuild/before/21-incident-resolved.png](audit-screenshots/rebuild/before/21-incident-resolved.png) |
| After  | [rebuild/after/21-incident-resolved.png](audit-screenshots/rebuild/after/21-incident-resolved.png)   |
| Figma  | [rebuild/figma/21-incident-resolved.png](audit-screenshots/rebuild/figma/21-incident-resolved.png)   |

**Structural differences removed:** “Done” button off-screen  
**Remaining drift:** Protected green screen tint not yet applied to `AlScreenBg` variant

---

## Files changed (Phase 3)

- `apps/qr/src/features/post-activation-pwa/components/PwaScanShell.tsx`
- `apps/qr/src/features/post-activation-pwa/components/pwa-scan-shell.css`
- `apps/qr/src/features/post-activation-pwa/routes/pwa-sos-routes.tsx`
- `packages/ui/src/components/primitives/DispatchTimeline/DispatchTimeline.tsx`
- `packages/ui/src/components/primitives/StatusTracker/StatusTracker.css`
