# Mobile Keyboard Audit

**Sprint:** P0 Input + Interaction Fix  
**Date:** 2026-06-17

---

## Issue 3 — Numeric keyboard on mobile / OTP fields

### Expected attributes

| Field type    | `inputMode`   | `pattern` | `autoComplete`           |
| ------------- | ------------- | --------- | ------------------------ |
| Mobile number | `numeric`     | `[0-9]*`  | `tel`                    |
| OTP           | `numeric`     | `[0-9]*`  | `one-time-code` (cell 0) |
| Plate         | _(unchanged)_ | _(none)_  | _(none)_                 |

### Before

| Location                 | `inputMode` | `pattern`   | `autoComplete`  | Issue                                   |
| ------------------------ | ----------- | ----------- | --------------- | --------------------------------------- |
| `AlOtpInput`             | `numeric`   | **missing** | `one-time-code` | Full keyboard possible on some devices  |
| `A1MobileScreen`         | `numeric`   | **missing** | `tel`           | Full keyboard possible                  |
| `E02RiderMobileScreen`   | `numeric`   | **missing** | `tel`           | Full keyboard possible                  |
| `E06ContactMobileScreen` | `numeric`   | **missing** | `tel`           | Full keyboard possible                  |
| `AlPlateInput`           | _(none)_    | _(none)_    | _(none)_        | ✓ Correct — plate uses default keyboard |

### After

**Component-level defaults (covers all consumers):**

1. **`AlTextField`** — when `inputMode="numeric"` is passed, automatically applies `pattern="[0-9]*"` unless an explicit `pattern` prop is provided.
2. **`AlOtpInput`** — every cell has `inputMode="numeric"` + `pattern="[0-9]*"` + `autoComplete="one-time-code"` on first cell.

**Screen-level (unchanged props, now complete via component defaults):**

| Screen               | File                                            | Mobile attrs                                               |
| -------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| A1 · Mobile          | `a1-mobile/A1MobileScreen.tsx`                  | `inputMode="numeric"`, `autoComplete="tel"` → pattern auto |
| R1 · Rider mobile    | `e02-rider-mobile/E02RiderMobileScreen.tsx`     | same                                                       |
| E1 · Contact mobile  | `e06-contact-mobile/E06ContactMobileScreen.tsx` | same                                                       |
| PWA bystander mobile | `pwa-shared-routes.tsx` → `A1MobileScreen`      | same                                                       |
| Auth journey         | `AuthRoutes.tsx` → `A1MobileScreen`             | same                                                       |
| Emergency journey    | `EmergencyRoutes.tsx` → E02/E06 screens         | same                                                       |

**OTP (all via `AlOtpInput`):**

| Screen     | File                                         |
| ---------- | -------------------------------------------- |
| A2         | `a2-otp/A2OtpScreen.tsx`                     |
| R2         | `e03-rider-otp` → `EmergencyOtpScreen.tsx`   |
| E2         | `e07-contact-otp` → `EmergencyOtpScreen.tsx` |
| PWA verify | `pwa-shared-routes.tsx`                      |

**Plate — NOT modified:**

| Screen             | File                         | Keyboard                                |
| ------------------ | ---------------------------- | --------------------------------------- |
| R03 vehicle number | `R03VehicleNumberScreen.tsx` | Default (alphanumeric plate formatting) |
| Form compositions  | `FormSectionComposition.tsx` | `AlPlateInput` unchanged                |

### Repo-wide search: `type="text"`

| File                 | Purpose            | Action                          |
| -------------------- | ------------------ | ------------------------------- |
| `OtpInput.tsx`       | OTP digits         | ✓ `inputMode` + `pattern` added |
| `PromoCodeField.tsx` | Alphanumeric promo | ✓ Left as text (correct)        |

No other raw `type="text"` inputs found in app code.

### Files changed

| File                                                       | Change                                             |
| ---------------------------------------------------------- | -------------------------------------------------- |
| `packages/ui/src/components/forms/TextField/TextField.tsx` | Auto `pattern="[0-9]*"` when `inputMode="numeric"` |
| `packages/ui/src/components/forms/OtpInput/OtpInput.tsx`   | Added `pattern="[0-9]*"`                           |

### Platform verification matrix

| Field  | Screen          | iOS Safari              | Android Chrome          |
| ------ | --------------- | ----------------------- | ----------------------- |
| Mobile | A1, R1, E1, PWA | Numeric keypad expected | Numeric keypad expected |
| OTP    | A2, R2, E2, PWA | Numeric + OTP autofill  | Numeric + OTP autofill  |
| Plate  | R03             | Full/default keyboard   | Full/default keyboard   |

_Device keyboard behavior cannot be fully verified in CI; attributes match Figma / HTML spec for numeric entry._

---

## Build status

```
npm run build — 12/12 packages successful (exit 0)
```

---

## Final verdict

**FIXED**
