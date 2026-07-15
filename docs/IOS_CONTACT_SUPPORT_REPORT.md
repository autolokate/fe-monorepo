# iOS Contact Support Report

**Date:** 2026-06-21  
**Sprint:** P0 iOS Contact Support + Rider Confirmation  
**Status:** FIXED

---

## Requirement

| Platform                            | Behaviour                                                 |
| ----------------------------------- | --------------------------------------------------------- |
| Android Chrome                      | Native Contact Picker API — **Add from contacts** visible |
| iOS (all browsers + PWA standalone) | If API unavailable → **hide Add from contacts** entirely  |
| iOS with API (experimental only)    | Native picker only — no custom modal                      |
| Unsupported                         | Manual **Enter mobile number** only on E0                 |

---

## Browser support verification

Runtime check: `isContactPickerSupported()` → secure context + `typeof navigator.contacts?.select === 'function'`.

| Environment           | Contact Picker API             | Add from contacts CTA |
| --------------------- | ------------------------------ | --------------------- |
| Android Chrome        | ✅ Supported                   | ✅ Shown              |
| iPhone Safari         | ❌ Not in production           | ❌ Hidden             |
| iPhone Chrome (CriOS) | ❌ Not in production           | ❌ Hidden             |
| iPhone Edge (EdgiOS)  | ❌ Not in production           | ❌ Hidden             |
| iOS PWA standalone    | ❌ Same WebKit — not available | ❌ Hidden             |
| iOS browser mode      | ❌ Not available               | ❌ Hidden             |

**We do not fake native support on iOS.** No manual fallback modal, fake picker, or unsupported CTA.

---

## Implementation

| File                             | Change                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `utils/device-contact-picker.ts` | `shouldShowAddFromContactsCTA()` = `isContactPickerSupported()`; removed fallback helpers |
| `E05ContactsEmptyScreen.tsx`     | `showAddFromContacts` prop — manual-only footer when false                                |
| `EmergencyRoutes.tsx` E0         | Native picker when supported; removed `IosContactPickSheet`                               |
| Deleted                          | `ios-contact-pick-sheet/` component                                                       |

### E0 UX when picker hidden (iOS)

- Primary CTA: **Enter mobile number**
- No **Add from contacts**
- No secondary link
- Navigates to E1 manual entry

### E0 UX when picker available (Android)

- Primary: **Add from contacts** → native OS picker
- Secondary: **Enter a number instead**
- Prefilled mobile/name on E1/E3 — editable

---

## Constraints preserved

- ❌ No routing tree changes
- ❌ No session architecture changes
- ❌ No business rule changes (OTP, limits unchanged)

---

## Verdict

**FIXED** — iOS hides unsupported contact CTA; Android keeps native picker; no fake UI.
