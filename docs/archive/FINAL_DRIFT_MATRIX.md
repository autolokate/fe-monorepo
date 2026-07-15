# Final Drift Matrix

**Date:** 2026-06-19  
**After:** UI parity fix pass (checkbox, input states, back button)

---

## Legend

| Symbol | Meaning                    |
| ------ | -------------------------- |
| ✅     | Fixed / verified this pass |
| ⚠️     | Known P2 drift             |
| 🔍     | Needs device screenshot QA |

---

## Shared Auth

| Screen           | Figma     | Checkbox | Input | Back | Text align | Overall |
| ---------------- | --------- | -------- | ----- | ---- | ---------- | ------- |
| A1 Mobile empty  | `102:268` | ✅       | ✅    | ✅   | ✅         | ✅      |
| A1 Mobile filled | `44:133`  | ✅       | ✅    | ✅   | ✅         | ✅      |
| A1 Mobile ready  | `102:303` | ✅       | ✅    | ✅   | ✅         | ✅      |
| A1 Mobile error  | `102:334` | ✅       | ✅    | ✅   | ✅         | ✅      |
| A2 OTP           | `103:324` | —        | ✅    | ✅   | ✅         | ✅      |
| A3 Name          | `103:456` | —        | ✅    | ✅   | ✅         | ✅      |

---

## Purchase

| Screen          | Checkbox | Input         | Back | Overall            |
| --------------- | -------- | ------------- | ---- | ------------------ |
| R03–R10         | —        | ✅ plate/text | ✅   | ✅                 |
| R06 Legal       | ✅       | —             | ✅   | ✅                 |
| R07 Choose plan | —        | —             | ✅   | ⚠️ extra plan line |
| R08d No rider   | —        | —             | ✅   | ⚠️ promo visible   |

---

## Emergency / Prepaid / B2B2C

| Area              | Checkbox | Input | Back | Overall |
| ----------------- | -------- | ----- | ---- | ------- |
| Emergency E01–E10 | —        | ✅    | ✅   | ✅      |
| Prepaid welcome   | —        | —     | ✅   | ✅      |
| B2B2C welcome     | —        | —     | ✅   | ✅      |

---

## Post-Activation PWA

| Area           | Checkbox       | Input | Back | Overall       |
| -------------- | -------------- | ----- | ---- | ------------- |
| Verify auth    | ✅ consent N/A | ✅    | ✅   | ✅            |
| Park Me photos | —              | —     | ✅   | ✅            |
| SOS hold       | —              | —     | ✅   | 🔍 iOS loader |

---

## Responsive (320–414)

| Width | Dark | Light | Status          |
| ----- | ---- | ----- | --------------- |
| 320   | 🔍   | 🔍    | Not re-captured |
| 360   | 🔍   | 🔍    | Not re-captured |
| 375   | 🔍   | 🔍    | Not re-captured |
| 390   | 🔍   | 🔍    | Not re-captured |
| 393   | 🔍   | 🔍    | Not re-captured |
| 414   | 🔍   | 🔍    | Not re-captured |

---

## Final Verdict

**MORE FIXES REQUIRED**

Core P0 UI issues from the screenshot (input active before interaction, checkbox, back button) are **fixed in code**.

Remaining before full **READY**:

1. Responsive screenshot matrix at all breakpoints
2. iOS SOS loader physical device check
3. P2 purchase cosmetic items (R07, R08d)
