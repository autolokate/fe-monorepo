# Completed Screen Reconstruction

**Date:** 2026-06-20  
**Figma:** [171:59 · R15 Activation complete](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0?node-id=171-59)  
**Route:** `/journey/completed` · dev `/?dev=1&screen=completed&state=default`

---

## Objective

Replace legacy completion UI (checklist cards, dashboard CTA, Finish link) with Figma 171:59 structure exactly.

---

## Changes

| Area       | Before                              | After                                                         |
| ---------- | ----------------------------------- | ------------------------------------------------------------- |
| Hero       | Halo + pulse ring + float animation | Figma halo only (`activation-complete-halo` 240px)            |
| Title      | `{Plan} is active`                  | Same — `getActivationCompleteTitle`                           |
| Subtitle   | Generic protection copy             | `{plate} is now protected by {plan}. Crash detection is live` |
| Status     | 3 checklist cards                   | `AlChip` green — `{plan} · active`                            |
| CTA        | Go to dashboard + Finish link       | **Go to home** (single primary button)                        |
| Confetti   | CSS confetti burst                  | Removed                                                       |
| Animations | Enter/float/stagger                 | Removed (static Figma layout)                                 |

---

## Files modified

| File                                                              | Action                                      |
| ----------------------------------------------------------------- | ------------------------------------------- |
| `journey/screens/JourneyCompletedScreen.tsx`                      | Rebuilt to Figma 171:59                     |
| `journey/screens/completion-experience/completion-experience.css` | Rebuilt layout tokens                       |
| `features/qr-purchase/data/purchase-pricing.ts`                   | Added subtitle + chip copy helpers          |
| `dev/DevCompletedPreview.tsx`                                     | Dev seed: plate `MH12AB3456`, plan `secure` |
| `dev/ScreenDevApp.tsx`                                            | Completed dev entry → `DevCompletedPreview` |
| `scripts/recapture-completed-screens.mjs`                         | Completed-only capture (12 PNG)             |

---

## Layout anchors (393×852, dark)

| Element        | Figma           | Runtime measured |
| -------------- | --------------- | ---------------- |
| Title font     | 36/44 bold      | 36px / 44px      |
| Subtitle font  | 16/24 body      | 16px / 24px      |
| Subtitle width | 330px           | 330px            |
| Chip label     | Secure · active | Secure · active  |
| CTA x          | 16              | 16               |
| CTA y          | 762             | **762**          |
| CTA size       | 361×58          | 361×58           |
| Checklist      | none            | 0 nodes          |
| Finish link    | none            | absent           |

---

## Evidence

|                   | Path                                                                |
| ----------------- | ------------------------------------------------------------------- |
| Before (393 dark) | `docs/visual-truth/completed/before/dark__393.png`                  |
| After (393 dark)  | `docs/visual-truth/completed/after/dark__393.png`                   |
| After (393 light) | `docs/visual-truth/completed/after/light__393.png`                  |
| Figma export      | `docs/visual-truth/completed/figma/figma-171-59.png`                |
| Full capture set  | `docs/visual-truth/screens/dev__Completed__completed__*` (12 files) |

---

## Unchanged (per scope)

- Journey routes and phase transitions
- Session model and `clearJourney` / `setPhase('completed')`
- Purchase, Emergency, PWA flows
- `build-completion-summary.ts` (retained; no longer used by screen)

---

## Final verdict

# PIXEL PERFECT
