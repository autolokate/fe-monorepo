# iOS Contact Picker Report

**Date:** 2026-06-17  
**Sprint:** P0 iOS Contact Picker + Rider Loop + iOS Install  
**Status:** FIXED (with documented platform limitation)

---

## Problem

**Add from contacts** on E0 opened a custom modal on iOS even when the Contact Picker API was available, and claimed native behaviour on iOS Safari where the browser does not expose the API in production.

---

## Browser support (verified)

| Platform       | Contact Picker API          | Production behaviour       |
| -------------- | --------------------------- | -------------------------- |
| Android Chrome | ✅ Supported                | Native device picker opens |
| iPhone Safari  | ❌ Not supported by default | Manual fallback only       |
| iPhone Chrome  | ❌ Not supported (WebKit)   | Manual fallback only       |
| iPhone Edge    | ❌ Not supported (WebKit)   | Manual fallback only       |
| Desktop Chrome | ❌ Typically unavailable    | Manual entry (E1)          |

**Important:** iOS may expose the API only behind Safari **Experimental Features → Contact Picker API**. We do not rely on that flag for production UX.

Detection: `isContactPickerSupported()` — secure context + `navigator.contacts.select` is a function.

---

## Fix

### Native path (API supported — Android Chrome)

1. User taps **Add from contacts** on E0
2. `navigator.contacts.select(['name', 'tel'])` opens **device picker directly**
3. No custom modal
4. Selected name + mobile stored in `contactDraft`
5. Navigate to E1 (`contact-mobile`) — mobile prefilled, editable
6. Continue E1 → E2 OTP → E3 name — name prefilled, editable

### Fallback path (API unsupported — iOS production)

1. User taps **Add from contacts**
2. `shouldUseContactPickFallback()` → iOS + no API
3. **Manual fallback sheet** opens (clearly labelled — not native)
4. User enters / autofill-suggests contact from keyboard
5. Same E1 → E2 → E3 path with prefilled editable fields

### Non-iOS unsupported

Navigate to E1 manual entry (no sheet).

---

## Files

| File                                                    | Change                                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `utils/device-contact-picker.ts`                        | `isContactPickerSupported`, `shouldUseContactPickFallback`, `getContactPickerPlatformNote`, `pickDeviceContactWithStatus` |
| `journey/routes/EmergencyRoutes.tsx`                    | E0: native first; fallback only when API absent                                                                           |
| `features/emergency/components/ios-contact-pick-sheet/` | Fallback UI copy — does not claim native picker                                                                           |

---

## Verification matrix

| Device               | Tap Add from contacts | Expected                              |
| -------------------- | --------------------- | ------------------------------------- |
| Android Chrome       | Native picker         | ✅ Direct OS picker → E1 prefilled    |
| iPhone Safari        | Fallback sheet        | ✅ Manual sheet; no fake native claim |
| iPhone Chrome        | Fallback sheet        | ✅ Same as Safari                     |
| Cancel native picker | Stay on E0            | ✅ No navigation                      |

---

## Verdict

**FIXED** — Native picker used only when browser supports it. iOS limitation documented; fallback UI used honestly when API unavailable.
