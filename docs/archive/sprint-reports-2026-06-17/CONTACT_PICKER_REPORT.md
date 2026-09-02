# Contact Picker Report

**Date:** 2026-06-17  
**Sprint:** P0 Device + UX Fix  
**Status:** FIXED

---

## Problem

**Add from contacts** on E0 used a demo stub (`demoPickerContact`) instead of opening the device contact picker.

---

## Solution

### Utility

`apps/qr/src/utils/device-contact-picker.ts`

| Export                       | Behavior                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `isContactPickerSupported()` | Checks `navigator.contacts.select`                                             |
| `pickDeviceContact()`        | Opens Contact Picker API; returns `{ name, mobile }` or `null` on cancel/error |

Mobile normalization accepts 10-digit Indian numbers, `+91` prefix, and leading `0`.

### Wiring — Emergency E0

`apps/qr/src/journey/routes/EmergencyRoutes.tsx` → `E0Route`

| User action                               | Result                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Tap **Add from contacts** (API supported) | Native picker → populate name + mobile → navigate to E3 (`contact-name`) |
| Picker cancelled                          | Stay on E0                                                               |
| API unsupported                           | Fallback to manual entry (E1 `contact-mobile`)                           |
| Tap **Enter a number instead**            | Manual entry flow (unchanged)                                            |

### Relation handling (E3)

```ts
draft?.relation ?? (draft?.fromPicker ? undefined : 'spouse');
```

Picker path leaves relation **user-selected** — no auto-prefill from contact data.

OTP is skipped for picker contacts (`otpVerified: true`, `fromPicker: true`).

---

## Flow coverage audit

| Flow               | Contact-add entry           | Picker wired                   |
| ------------------ | --------------------------- | ------------------------------ |
| Emergency E0       | Add from contacts           | ✅                             |
| Emergency E1→E2→E3 | Manual mobile + OTP         | ✅ (unchanged)                 |
| Emergency riders   | Mobile/name/relation fields | N/A — no device picker in spec |
| Family member      | Rider name/mobile screens   | N/A — manual entry only        |

Emergency is the sole **Add from contacts** surface in the onboarding app.

---

## Fallback behavior

Contact Picker API is supported on Android Chrome and some Chromium builds. iOS Safari does **not** expose the API — E0 correctly falls back to manual mobile entry when unsupported.

---

## Verdict

**FIXED** — Real Contact Picker API integrated with graceful fallback; relation remains user-selected.
