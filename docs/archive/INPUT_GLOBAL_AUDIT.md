# Input Global Audit

**Date:** 2026-06-19  
**Scope:** All form inputs across active screens  
**Method:** Design-system state model + consumer grep

---

## Summary

| Metric                |                                                    Value |
| --------------------- | -------------------------------------------------------: |
| Input component types | **5** (TextField, Input, OtpInput, PlateInput, Toggle\*) |
| Primary form screens  |          **~28** (auth, purchase, emergency, PWA verify) |
| Issues found          |                                                    **4** |
| Issues fixed          |                                                    **4** |
| Shared fixes          |                                              **3 files** |

\*Toggle excluded from border-state audit (separate component).

---

## State Model (global)

| State        | Border             | When                                        |
| ------------ | ------------------ | ------------------------------------------- |
| **Default**  | 1.5px `outline`    | Empty, not focused                          |
| **Focus**    | 2px `on-surface`   | `:focus` / `:focus-within`                  |
| **Filled**   | 2px `on-surface`   | Value present OR `:not(:placeholder-shown)` |
| **Error**    | 2px `warning`      | `errorText` / `--error` class               |
| **Disabled** | 1.5px + muted fill | `disabled`                                  |
| **Success**  | 2px `success`      | OTP verify success override                 |

**Rule enforced:** No “active” (2px white) border on empty, unfocused fields.

---

## Components

### AlTextField (`packages/ui/.../TextField/`)

**Consumers:** A1 mobile, A3 name, emergency mobile/name, purchase vehicle, PWA verify mobile/name, plate fields via composition.

**Fixes:**

- `isFilled` now checks `value ?? defaultValue`
- CSS: `:has(.al-text-field__input:not(:placeholder-shown))` for uncontrolled fill detection
- Default remains 1.5px until focus or content

**Auth overrides** (`auth-step-shell.css`): mobile/name field min-height 62px, radius 12/16px — inherit DS state rules; no pre-interaction active border.

### AlInput (`packages/ui/.../Input/`)

**Fix:** Default border `1px` → **1.5px** to match TextField + Figma.

**States:** `:not(:placeholder-shown)` and `:focus` → 2px active.

### AlOtpInput

**States:** Empty cells 1px outline; filled/focus 2px; error/success via onboarding overrides (`ob-auth-otp-input`).

**Consumers:** A2 OTP, emergency OTP screens, PWA verify OTP.

### AlPlateInput

Wraps TextField patterns — inherits TextField CSS state model.

---

## Consumer Matrix

| Flow              | Screens with inputs | Components                      |
| ----------------- | ------------------- | ------------------------------- |
| Shared Auth       | A1, A2, A3          | TextField, OtpInput             |
| Purchase          | R03, R07, R08, R08c | TextField, Input                |
| Emergency         | R1–R3, E1–E3        | TextField, OtpInput             |
| PWA Verify        | mobile, otp, name   | TextField, OtpInput             |
| PWA Park Me       | vehicle number      | TextField / plate               |
| Legacy activation | R01, R05, R06       | TextField, Checkbox (not input) |

---

## Checks Performed

| Check                        | Status                                         |
| ---------------------------- | ---------------------------------------------- |
| Default (empty, no focus)    | ✅ 1.5px neutral                               |
| Focus                        | ✅ 2px on interaction                          |
| Filled                       | ✅ value + placeholder-shown                   |
| Error                        | ✅ warning border                              |
| Disabled                     | ✅ muted, no false active                      |
| Selection / cursor           | ✅ `caret-color: on-surface`                   |
| Paste / autofill             | ✅ OTP webkit-autofill overrides in auth shell |
| OTP per-cell                 | ✅ independent focus/fill                      |
| Plate input                  | ✅ inherits TextField                          |
| Mobile +91 prefix            | ✅ prefix divider, no false filled             |
| No active before interaction | ✅ verified CSS cascade                        |

---

## Shared Files Changed

- `packages/ui/src/components/forms/TextField/TextField.tsx`
- `packages/ui/src/components/forms/TextField/TextField.css`
- `packages/ui/src/components/forms/Input/Input.css`

---

## Remaining Drift

| Item                      | Severity | Notes                                                     |
| ------------------------- | -------- | --------------------------------------------------------- |
| Light theme active border | P2       | Token `on-surface` vs absolute white on some Figma frames |
| R08d promo field          | P2       | Not in active purchase route graph                        |

---

## Verdict

**PASS** — Input state model is consistent at the design-system layer. Screen-specific overrides only adjust dimensions/spacing, not pre-interaction border activation.
