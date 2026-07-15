# Input State Report

**Date:** 2026-06-17  
**Sprint:** P0 Device + UX Fix  
**Status:** FIXED

---

## Problem

Fields with values did not always show the Figma **active** visual state (2px on-surface border + active label) immediately after typing — especially when unfocused.

---

## Root cause

1. **Auth shell overrides** reset mobile/name fields to 1px outline when filled but unfocused (removed).
2. **`AlInput`** relied only on `:placeholder-shown` — fields without placeholders never entered filled state.
3. **`AlTextField`** had correct `--filled` class logic; auth overrides were fighting it.

---

## Component-level fixes

### `@autolokate/ui` — `AlTextField`

`TextField.css` — label transitions to on-surface on `:focus-within` and `.al-text-field--filled`.  
`TextField.tsx` — `isFilled` from controlled/uncontrolled value.

### `@autolokate/ui` — `AlInput`

`Input.tsx` — added `al-field--filled` class when value length > 0.  
`Input.css` — filled label color + 2px border via `.al-field--filled`.

### `@autolokate/ui` — `AlOtpInput`

Per-cell `--has-value` class + 2px border on digits (already present; confirmed no flex regression).

### `@autolokate/ui` — `AlPlateInput`

`PlateInput.tsx` — `al-plate-input--filled` when value non-empty.  
`PlateInput.css` — active outline on filled state.

### Onboarding — Auth shell

`auth-step-shell.css` — mobile and name fields now keep 2px on-surface border when filled (matches `--filled` and `:not(:placeholder-shown)`).

### Onboarding — Promo code wrapper

`PromoCodeField.tsx` + `promo-code-field.css` — `--filled` + `:focus-within` active border for editable variant.

---

## Audit scope

| Component        | Filled class  | Active border       | Active label |
| ---------------- | ------------- | ------------------- | ------------ |
| `AlTextField`    | ✅            | ✅                  | ✅           |
| `AlInput`        | ✅ (added)    | ✅                  | ✅ (added)   |
| `AlOtpInput`     | ✅ per-cell   | ✅                  | N/A          |
| `AlPlateInput`   | ✅            | ✅                  | N/A          |
| Auth mobile/name | via TextField | ✅ (override fixed) | ✅           |
| Promo code field | ✅ (added)    | ✅                  | N/A          |

Screen-specific hacks were not added. Changes propagate via shared UI package.

---

## Verdict

**FIXED** — Global filled/active state enforced at component ownership layer.
