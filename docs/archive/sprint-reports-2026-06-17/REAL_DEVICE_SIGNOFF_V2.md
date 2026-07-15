# Real Device Sign-Off V2

**Date:** 2026-06-17  
**Sprint:** P0 iOS Contact Picker + Rider Loop + iOS Install  
**Build:** `@autolokate/qr` — production build verified  
**References:** `FINAL_PWA_READINESS.md`, `REAL_DEVICE_SIGNOFF.md`, `VISUAL_TRUTH_MATRIX_V2.md`

---

## Final Verdict

# FIXED

All three P0 issues are resolved in code. Production build passes. Physical device confirmation recommended on deploy (HTTPS).

---

## Issue summary

| #   | Issue              | Code status | Device QA             |
| --- | ------------------ | ----------- | --------------------- |
| 1   | iOS Contact Picker | ✅ FIXED    | ☐ Pending on hardware |
| 2   | Rider skip loop    | ✅ FIXED    | ☐ Pending on hardware |
| 3   | iOS install UX     | ✅ FIXED    | ☐ Pending on hardware |

---

## Build evidence

```
✓ tsc -p tsconfig.json
✓ vite build
✓ PWA precache 26 entries
✓ dist/sw.js + manifest present
```

---

## Manual QA checklist

Execute on **https://qr-staging.autolokate.com** (or staging) after deploy.

### Install

| Test                          | Android Chrome | iPhone Safari | iPhone Chrome |
| ----------------------------- | -------------- | ------------- | ------------- |
| Correct install UX shown      | ☐              | ☐             | ☐             |
| No Android banner on iOS      | ☐              | ☐             | ☐             |
| Safari: Share → A2HS guidance | N/A            | ☐             | N/A           |
| Chrome iOS: Open Safari steps | N/A            | N/A           | ☐             |
| Dismiss hides for 7 days      | ☐              | ☐             | ☐             |

### Contact picker (E0)

| Test                                    | Android Chrome | iPhone Safari |
| --------------------------------------- | -------------- | ------------- |
| Native picker opens (Android)           | ☐              | N/A           |
| No custom modal before native (Android) | ☐              | N/A           |
| iOS fallback sheet (not native claim)   | N/A            | ☐             |
| Prefilled mobile on E1, editable        | ☐              | ☐             |
| Prefilled name on E3, editable          | ☐              | ☐             |
| Cancel picker stays on E0               | ☐              | ☐             |

### Rider skip loop

| Test                                    | Purchase | Prepaid | B2B2C |
| --------------------------------------- | -------- | ------- | ----- |
| Skip rider on R0                        | ☐        | ☐       | ☐     |
| Add contact → E5 Continue → completed   | ☐        | ☐       | ☐     |
| No return to R0 after skip              | ☐        | ☐       | ☐     |
| E0 Back after skip → flow back (not R0) | ☐        | ☐       | ☐     |

---

## Constraints preserved

| Area                                | Changed?       |
| ----------------------------------- | -------------- |
| Route tree                          | ❌ No          |
| Session keys (existing)             | ❌ No new keys |
| Flow dispatcher                     | ❌ No          |
| Business rules (limits, OTP, plans) | ❌ No          |
| Figma screen layouts                | ❌ No          |

---

## Deliverables

| Report                         | Verdict                               |
| ------------------------------ | ------------------------------------- |
| `IOS_CONTACT_PICKER_REPORT.md` | FIXED (documented iOS API limitation) |
| `RIDER_LOOP_FIX_REPORT.md`     | FIXED                                 |
| `IOS_INSTALL_REPORT.md`        | FIXED                                 |
| `REAL_DEVICE_SIGNOFF_V2.md`    | FIXED (code) / QA pending             |

---

## Regression scope

- Android Chrome install banner
- Emergency E1 manual entry path
- Rider add (non-skip) from E5
- PWA scan / SOS / Park Me (unchanged)
