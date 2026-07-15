# Input State Audit

**Date:** 2026-06-19  
**Components:** `AlTextField`, `AlInput`, `AlOtpInput`, `AlPlateInput`

---

## Expected State Model

| State    | Border                  | When               |
| -------- | ----------------------- | ------------------ |
| Default  | 1.5px `#4A4A4A`         | Empty, not focused |
| Active   | 2px `#FFFFFF`           | Focus or has value |
| Error    | 2px `#F5A623`           | `state="error"`    |
| Disabled | Muted fill, 55% opacity | `disabled`         |
| Success  | 2px `#1FA24A`           | OTP success cells  |

---

## AlTextField

### Root cause

- Default border was `2px solid var(--al-color-on-surface)` (always white/active)
- `:hover` forced white border even without focus

### Fix

- `TextField.css`: neutral default; active on `:focus-within` or `.al-text-field--filled`
- `TextField.tsx`: adds `--filled` class when `value` length > 0
- Removed hover border promotion

### Auth overrides (`auth-step-shell.css`)

- `.ob-auth-mobile-field`: removed hardcoded white default; inherits state model
- `.ob-auth-name-field`: neutral default, white when filled/focused
- Error: amber 2px on mobile field

### Screens affected

- A1 Mobile, A3 Name, PWA verify mobile, emergency contact mobile

---

## AlInput

### Root cause

Focus used `var(--al-color-focus)` instead of on-surface white active border.

### Fix

- Default: 1px `#4A4A4A`
- Active: 2px white on `:focus` or `:not(:placeholder-shown)`

---

## AlOtpInput

### Root cause

Empty cells used thin outline (correct) but focus used focus-token color; hover promoted border.

### Fix

- Empty cell: 1px `#4A4A4A`
- Filled/focused cell: 2px white
- Hover on empty: stays neutral (no promotion)
- Auth overrides (`ob-auth-otp-input`) for error amber + success green unchanged

### Screens affected

- A2 OTP, E2/R2 contact/rider OTP, PWA verify OTP

---

## AlPlateInput

### Status

Uses plate surface + shadow model (not standard text field). Error: 2px amber. **No change** — different Figma component (`AlPlateInput`).

---

## Verification

| Screen    | Figma frame | Default border | Active border          |
| --------- | ----------- | -------------- | ---------------------- |
| A1 empty  | `102:268`   | Gray 1.5px     | White 2px on focus     |
| A1 filled | `44:133`    | —              | White 2px              |
| A1 error  | `102:334`   | Amber 2px      | Amber 2px              |
| OTP empty | `103:324`   | Gray 1px/cell  | White 2px focused cell |

---

## Verdict

**READY** for input state model. Refresh `/journey/auth/mobile` to confirm empty field shows gray border.
