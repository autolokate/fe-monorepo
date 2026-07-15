# Form Autofill Report

**Date:** 2026-06-17  
**Status:** FIXED

---

## Scope

Contact picker autofill behavior across the emergency contact-add flow. Routes and business rules unchanged.

---

## Autofill rules

| Step | Screen | Field    | Source                | User editable | Advance trigger           |
| ---- | ------ | -------- | --------------------- | :-----------: | ------------------------- |
| 1    | E0     | —        | Contact Picker API    |       —       | Tap "Add from contacts"   |
| 2    | E1     | Mobile   | `contactDraft.mobile` |      ✅       | Tap "Get OTP"             |
| 3    | E2     | OTP      | —                     |      ✅       | Enter 6 digits / Continue |
| 4    | E3     | Name     | `contactDraft.name`   |      ✅       | Tap "Save contact"        |
| 4    | E3     | Relation | — (user selects)      |      ✅       | Required before save      |

Picker must **not** auto-submit, auto-verify, or skip steps.

---

## State shape

```ts
contactDraft: {
  mobile?: string;   // set by picker → E1
  name?: string;     // set by picker → E3
  fromPicker?: true; // metadata only (relation default, back nav)
  otpVerified?: boolean; // set only after E2 success
}
```

---

## Before

| Step        | Behavior                                  |
| ----------- | ----------------------------------------- |
| Picker      | Filled mobile + name, `otpVerified: true` |
| Navigation  | Jumped to E3 (name)                       |
| E1          | Never shown for picker path               |
| E2          | Skipped                                   |
| E3 name     | Prefilled but reached without OTP         |
| E3 relation | Unselected when `fromPicker` (correct)    |

---

## After

| Step        | Behavior                                                             |
| ----------- | -------------------------------------------------------------------- |
| Picker      | Fills `mobile` + `name` in draft, `otpVerified: false`               |
| E1          | `useState(emergency.contactDraft?.mobile)` prefills mobile field     |
| E1 continue | Updates mobile if edited; preserves `name` + `fromPicker` via spread |
| E2          | Standard OTP; sets `otpVerified: true` on success                    |
| E3          | `useState(draft?.name ?? '')` prefills name field                    |
| E3 relation | `undefined` when `fromPicker` — user must select                     |
| Save        | `verified` requires `otpVerified === true`                           |

---

## Manual entry path (unchanged)

**Enter a number instead** → E1 empty mobile → E2 OTP → E3 empty name, default relation `spouse`.

---

## Files changed

- `apps/qr/src/journey/routes/EmergencyRoutes.tsx` — E0, E1, E3 draft handling

No screen-level autofill hacks. E06/E08 screens already accept controlled `mobileValue` / `nameValue` from route state.

---

## Verdict

**FIXED** — Picker populates draft; each screen autofills from session; user confirms each step explicitly.
