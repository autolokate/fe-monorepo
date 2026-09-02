# Dialog Rendering Report

**Date:** 2026-06-17  
**Scope:** Permission / confirmation sheets — frames 09a, 14c, 14d

---

## Problem

Leave-emergency and permission sheets appeared **blurry** — soft text edges, fuzzy button corners. Screenshot review flagged transform-induced subpixel rendering.

---

## Root causes

1. **Ancestor opacity** — Sheet rendered inside shell frame while `dimmed` class applied `opacity: 0.45` to main content; stacking context interactions affected perceived sharpness when sheet was a DOM sibling
2. **Persistent transform** — Panel used `transform: translateY(0)` when open, keeping text on a compositor layer indefinitely
3. **No portal** — Sheet not isolated from PWA motion transforms on sibling content

---

## Fixes

| Change             | Detail                                                                            |
| ------------------ | --------------------------------------------------------------------------------- |
| **Portal**         | `createPortal(sheet, document.body)` — sheet escapes shell transform/opacity tree |
| **Settled state**  | After 320ms, class `al-permission-sheet--settled` sets `transform: none`          |
| **Font smoothing** | `-webkit-font-smoothing: antialiased` on panel                                    |
| **Z-index**        | Raised to `1000` for reliable top layer                                           |
| **Scrim**          | Solid `rgba(10,10,12,0.72)` — no backdrop-filter blur                             |

---

## What was NOT changed

- Sheet copy, button labels, or dismiss behavior
- Route flow (14d still confirms leave)
- Animation duration (~280ms slide-up)

---

## Verification

| Check                                  | Result |
| -------------------------------------- | ------ |
| Title text sharp at 390px              | ✅     |
| Primary CTA edges crisp                | ✅     |
| Secondary link readable                | ✅     |
| No blur after animation completes      | ✅     |
| Scrim does not blur underlying content | ✅     |

Evidence: [14d before](audit-screenshots/bugfix/before/14d-sos-leave-confirm.png) → [14d after](audit-screenshots/bugfix/after/14d-sos-leave-confirm.png)

---

## Files

- `packages/ui/src/components/primitives/PermissionSheet/PermissionSheet.tsx`
- `packages/ui/src/components/primitives/PermissionSheet/PermissionSheet.css`
