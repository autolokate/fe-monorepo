# Back Button Parity Report

**Date:** 2026-06-19  
**Figma refs:** Auth A1 `102:268` · tap target `642:2071` · icon `102:271`

---

## Summary

| Metric                |             Value |
| --------------------- | ----------------: |
| Back button consumers | **6 shell types** |
| Issues found          |  **4** (systemic) |
| Issues fixed          |             **4** |
| Per-screen patches    |             **0** |

---

## Figma Spec (exact)

| Property      |                     Value |
| ------------- | ------------------------: |
| Icon          |              `arrow-left` |
| Icon size     |                 **24×24** |
| Icon visual X | **16px** (content gutter) |
| Hit area      |                 **48×48** |
| Hit area X    |                   **4px** |
| Hit area Y    |        **54px** (auth A1) |
| Hover / pill  |                      none |
| Icon color    |          `#FFFFFF` (dark) |

**Math:** hit area starts 12px left of icon → `margin-inline-start: -12px` + `padding-inline-start: 12px` + `justify-content: flex-start` on 48×48 control.

---

## Root Causes

### RC-B1 — Icon centered in 48×48 at wrong X

Back was `justify-content: center` (AlIconButton default). Icon landed at **x≈28px** (16 + 12), not **x=16**.

### RC-B2 — Header double inset

Header had `padding-inline: 12px` inside frame `padding: 4px`, pushing control start to 16px but centering icon at 28px.

### RC-B3 — AlIconButton default padding

Base `.al-icon-button { padding: var(--al-space-sm) }` offset icon when shell overrides were incomplete.

### RC-B4 — Legal reader wrong icon size

`LegalReaderHeader` used **20px** icon vs Figma **24px**.

---

## Shared Fix

**New class:** `.ob-shell-back` in `touch-target-layout.css`

Applied on every back consumer:

| Component              | Class                                |
| ---------------------- | ------------------------------------ |
| AuthStepShell          | `ob-step-chrome__back ob-shell-back` |
| FlowStepShell          | `ob-step-chrome__back ob-shell-back` |
| WelcomeActivationShell | `ob-step-chrome__back ob-shell-back` |
| PwaScanShell           | `pwa-scan-shell__back ob-shell-back` |
| PurchaseStatusShell    | `ob-step-chrome__back ob-shell-back` |
| LegalReaderHeader      | `ob-step-chrome__back ob-shell-back` |

**CSS (global):**

```css
.ob-shell-back.al-icon-button {
  width: 48px;
  height: 48px;
  margin-inline-start: calc(-1 * var(--ob-shell-touch-bleed)); /* 12px */
  padding-inline-start: var(--ob-shell-touch-bleed);
  justify-content: flex-start;
}
.ob-shell-back .al-icon-button__icon {
  width: 24px;
  height: 24px;
}
```

Header uses `overflow: visible` so bleed is not clipped.

---

## Responsive Verification

| Width | Icon X | Hit X | Hit size | Clipped |
| ----: | -----: | ----: | -------: | :-----: |
|   320 |     16 |     4 |    48×48 |   No    |
|   360 |     16 |     4 |    48×48 |   No    |
|   375 |     16 |     4 |    48×48 |   No    |
|   390 |     16 |     4 |    48×48 |   No    |
|   393 |     16 |     4 |    48×48 |   No    |
|   414 |     16 |     4 |    48×48 |   No    |

Dark + light: icon uses `var(--al-color-on-surface)` — no theme-specific offset.

---

## Distance to Title

Figma: back row → progress/heading gap **20px** (`--ob-shell-header-stack-gap`).

Back bottom to headline: 20px (header gap) + progress height + 20px (section gap) on auth A1 — matches frame structure.

---

## Before / After

|                     | Before                 | After                        |
| ------------------- | ---------------------- | ---------------------------- |
| Icon X (375px dark) | ~28px                  | 16px                         |
| Hit area X          | ~16px                  | 4px                          |
| Legal icon          | 20px                   | 24px                         |
| PWA back            | centered in grid col   | flex-start + bleed           |
| Hover               | gray pill (DS default) | transparent (shell override) |

---

## Verdict

**PASS** — One shared back-button implementation; all shells consume `.ob-shell-back`.
