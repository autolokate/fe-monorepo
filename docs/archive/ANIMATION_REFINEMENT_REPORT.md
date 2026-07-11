# Animation Refinement Report

**Date:** 2026-06-17  
**Scope:** Remove flicker; keep premium motion

---

## Problem

Prior polish pass stacked multiple opacity-0 → 1 animations on the same view:

- `PwaFade` (opacity + y)
- `PwaCtaReveal` (delayed opacity)
- `PwaRevealItem` stagger (opacity)
- CSS keyframes on cards, tracker, timeline steps, review photos

Result: perceived **flicker**, **opacity flashing**, and **double renders** on timeline/status screens.

---

## Strategy

**One fade per screen.** Component-level motion only where it doesn't overlap.

| Layer | Before | After |
|-------|--------|-------|
| Screen enter | opacity + y translate | **opacity only** (220ms) |
| Footer CTA | delayed opacity fade | **static** (no animation) |
| Stagger items | opacity + y | **y only** (no opacity) |
| Hero | opacity + scale | **scale only** |
| Vehicle card CSS | opacity enter | **removed** |
| Status tracker CSS | opacity enter | **removed** |
| Review photos CSS | opacity + scale | **removed** |
| Timeline steps CSS | opacity enter | **removed** |
| Timeline complete glyph | opacity + scale | **scale only** |
| Timeline connector | scaleY fill | **kept** |
| Timeline active halo | pulse | **kept** |
| SOS hold aura | pulse | **kept** |
| Incident hero halo | opacity breathe | **kept** |

---

## Removed

- `PwaCardEnter` usage path (component simplified out of hot paths)
- Duplicate `@keyframes` on mount for cards/tracker/photos
- `al-dispatch-step-enter` opacity stagger
- `al-incident-hero-enter` opacity flash

---

## Kept (premium, non-flickering)

- SOS hold progress arc (60ms linear stroke)
- SOS hold aura pulse (synced 2.2s)
- Timeline connector fill (scaleY, 360ms)
- Timeline complete glyph pop (scale only, 240ms)
- Sending spinner aura pulse (screen 17)

All respect `prefers-reduced-motion`.

---

## Files

- `apps/qr/.../PwaMotion.tsx`
- `packages/ui/.../DispatchTimeline.css`
- `packages/ui/.../VehicleConfirmationCard.css`
- `packages/ui/.../StatusTracker.css`
- `packages/ui/.../PhotoGrid.css`
- `packages/ui/.../IncidentStatusHero.css`

---

## Verification

| Screen | Flicker on enter | Layout jump |
|--------|------------------|-------------|
| 11 Calling owner | None ✅ | None ✅ |
| 20 Help dispatched | None ✅ | None ✅ |
| 09b Review | None ✅ | None ✅ |
| 16 Hero | None ✅ | None ✅ |
