# Checkbox Alignment Fix Report

**Date:** 2026-06-17  
**Figma ref:** Auth A1 `102:277` / `102:312`  
**Status:** FIXED

---

## Problem

On A1 Mobile, the consent checkbox sat **too high** relative to the legal copy. The 22×22 control appeared vertically centered against the full multi-line paragraph instead of aligning with the **first line** of body copy (16px / 22px line-height).

---

## Root cause

`inline-consent-block.css` used:

- `display: flex` + `align-items: baseline` — baseline of the 22px slot did not match the first-line cap height of the paragraph
- `transform: translateY(0.2em)` — incorrect optical offset
- 22px-wide checkbox column with absolutely centered 48×48 control — visual box landed ~13px below the first line top

The Figma spec requires the **22×22 visual box top** to align with the **first line top** of the copy block. The 48×48 tap target bleeds above that line (`top: -13px`).

---

## Fix

**File:** `apps/qr/src/components/compositions/inline-consent-block/inline-consent-block.css`

| Before                            | After                                                             |
| --------------------------------- | ----------------------------------------------------------------- |
| Flex row, `align-items: baseline` | CSS grid: `48px \| 1fr`, `align-items: start`                     |
| 22px checkbox column              | 48px tap column (Figma hotspot)                                   |
| `translateY(0.2em)` offset        | `top: -13px` on 48×48 control (centers 22px box on line 1)        |
| Absolute center in 22px slot      | Slot height = 22px (one line); control positioned from first line |

Math: `(48 - 22) / 2 = 13px` — offset places the green 22×22 box flush with the first line while preserving the 48×48 touch target.

No changes to `InlineConsentBlock.tsx`, routes, or auth screens.

---

## Verification matrix

| Viewport | Dark | Light |               Clipping                |   Wrap stable   |
| -------- | :--: | :---: | :-----------------------------------: | :-------------: |
| 320      |  ✅  |  ✅   | ✅ `overflow: visible` on consent row | ✅ grid `start` |
| 360      |  ✅  |  ✅   |                  ✅                   |       ✅        |
| 375      |  ✅  |  ✅   |                  ✅                   |       ✅        |
| 390      |  ✅  |  ✅   |                  ✅                   |       ✅        |
| 393      |  ✅  |  ✅   |                  ✅                   |       ✅        |
| 414      |  ✅  |  ✅   |                  ✅                   |       ✅        |

**Screens:** A1 Mobile (owner), PWA verify mobile (bystander variant — same component).

---

## Verdict

**FIXED**
