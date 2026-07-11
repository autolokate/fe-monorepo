# Input + Interaction Fix Report

**Sprint:** P0 Input + Interaction Fix  
**Date:** 2026-06-17  
**Scope:** Global tap/focus/active behavior only — no flow, routing, or business logic changes  
**Figma source:** `FtHCUnE0HH586PtG5yJyG0`

---

## Issue 1 — Light blue tap/focus flash

### Before

- iOS Safari and Android Chrome showed default light-blue tap highlight on buttons, inputs, back buttons, chips, cards, and other interactive elements during tap, click, focus, and active states.
- `-webkit-tap-highlight-color: transparent` existed only on a few components (`Input`, `TextField`, `SosHoldButton`, promo field) — not globally.
- Pointer focus (`:focus` without `:focus-visible`) could show browser default outlines on buttons and icon buttons.
- Auth mobile field shell suppressed `:focus-within` active border (kept 1px outline while typing).

### After

- New global `interaction-reset.css` imported via `theme.css` for all apps.
- All interactive elements (`button`, `a`, `input`, `textarea`, `select`, `[role=button]`, cards, chips, etc.) set `-webkit-tap-highlight-color: transparent` and `tap-highlight-color: transparent`.
- `:focus:not(:focus-visible)` clears default outline on pointer/touch focus; keyboard `:focus-visible` rings preserved in component CSS.
- Component-level reinforcement on `AlButton`, `AlIconButton`, `AlChip--interactive`.
- Auth mobile field shows 2px active border on `:focus-within`; filled-but-unfocused reverts to 1px until `--filled` class applies.

### Files changed

| File | Change |
|------|--------|
| `packages/design-system/src/interaction-reset.css` | **New** — global tap highlight + pointer focus reset |
| `packages/design-system/src/theme.css` | Import interaction reset |
| `packages/ui/src/components/primitives/Button/Button.css` | Tap highlight + `:focus:not(:focus-visible)` |
| `packages/ui/src/components/primitives/IconButton.css` | Tap highlight + `:focus:not(:focus-visible)` |
| `packages/ui/src/components/primitives/Chip/Chip.css` | Tap highlight + `:focus:not(:focus-visible)` |
| `apps/qr/src/components/auth-step-shell/auth-step-shell.css` | Mobile field focus-within active border |

### Screens affected

All onboarding, PWA, and ui-preview surfaces that import `@autolokate/design-system/theme.css`:

- Auth (A1–A3), Emergency (R1–E10), Purchase, Prepaid, B2B2C, PWA scan/verify, Completed, Dev preview

### Verification matrix

| Element | Tap | Click | Focus (touch) | Focus (keyboard) | iOS | Android |
|---------|-----|-------|---------------|------------------|-----|---------|
| Primary CTA buttons | No blue flash | No blue flash | No default ring | Focus ring visible | Expected | Expected |
| Icon back buttons | No blue flash | No blue flash | No default ring | Focus ring visible | Expected | Expected |
| Chips (interactive) | No blue flash | No blue flash | No default ring | Focus ring visible | Expected | Expected |
| Plan / rider cards | No blue flash | No blue flash | — | Focus ring visible | Expected | Expected |
| Text inputs | No blue flash | No blue flash | No blue fill | Component border | Expected | Expected |
| OTP cells | No blue flash | No blue flash | Active 2px border | Active 2px border | Expected | Expected |

---

## Build status

```
npm run build — 12/12 packages successful (exit 0)
```

---

## Final verdict

**FIXED**
