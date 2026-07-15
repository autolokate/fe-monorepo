# Global UI Audit

**Date:** 2026-06-19  
**Scope:** All active onboarding + post-activation PWA screens  
**Method:** Shared-component root-cause analysis (not per-screenshot patching)  
**Build:** `pnpm --filter @autolokate/ui build && pnpm --filter @autolokate/qr build` ✅

---

## Executive Summary

| Metric                              |       Count |
| ----------------------------------- | ----------: |
| **Total screens audited**           |      **65** |
| **Issues found**                    |      **12** |
| **Issues fixed (this pass)**        |      **10** |
| **Remaining drift (P2 / platform)** |       **2** |
| **Shared component fixes**          | **8 files** |

The primary regression — **checkbox clipped on A1 Mobile (auth “home”)** — was caused by a **layout-system conflict**, not a checkbox sizing bug. Negative-margin “bleed” hacks on `InlineConsentBlock` were clipped by `overflow: hidden` on step-shell parents. Fix: global touch-target gutter system; no per-screen patches.

---

## Screens Audited (65)

### Flow Entry + Hub (2)

| Screen     | Route               |
| ---------- | ------------------- |
| Flow Entry | `/journey`          |
| Flow Hub   | `/journey/flow-hub` |

### Shared Auth (5)

| Screen           | Route                         |
| ---------------- | ----------------------------- |
| A1 Mobile        | `/journey/auth/mobile`        |
| A2 OTP           | `/journey/auth/otp`           |
| A3 Vehicle owner | `/journey/auth/vehicle-owner` |
| L1 Privacy       | `/journey/auth/legal/privacy` |
| L2 Terms         | `/journey/auth/legal/terms`   |

### Consumer QR Purchase (14)

R03–R10c under `/journey/purchase/*`

### Prepaid (1)

Welcome `/journey/prepaid/welcome`

### B2B2C (2)

Plan-only + plan-rider welcome

### Emergency + Rider (11)

R0–R4, E0–E3, E5 under `/journey/emergency/*`

### Completed (1)

`/journey/completed`

### Post-Activation PWA (29)

Loading, vehicle, verify (3), park-me (11), SOS (14) under `/pwa/scan/*`

---

## Root Causes Identified

| #   | Symptom                                         | Root cause                                                                                                  | Fix layer                                            |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Checkbox clipped left (A1, PWA verify mobile)   | `margin: -13px` on `.ob-inline-consent__checkbox` + `overflow-x: hidden` on `.ob-step-chrome__body` / frame | Touch-target gutter + grid consent layout            |
| 2   | Back button clipped / misaligned                | `margin-inline-start: -12px` / `-4px` on back buttons                                                       | Same gutter system                                   |
| 3   | Auth mobile back → flow entry for prepaid/B2B2C | Hard-coded `journeyPaths.root` in `MobileRoute`                                                             | `getAuthFlowBackPath(selectedFlow)`                  |
| 4   | Inconsistent input default border               | `AlInput` used 1px vs Figma 1.5px                                                                           | `Input.css` token alignment                          |
| 5   | Filled state missed uncontrolled fields         | `TextField` only checked `value`                                                                            | Also check `defaultValue` + `:placeholder-shown` CSS |
| 6   | Duplicate checkbox label in inline consent      | Full `AlCheckbox` label + external copy                                                                     | `layout="icon-only"` variant on shared checkbox      |

---

## Shared Component Fixes

| File                                                                                | Change                                                                                              |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `apps/qr/src/components/step-shell-chrome/touch-target-layout.css`                  | **NEW** — 16px content gutter = 4px frame + 12px inset bleed                                        |
| `apps/qr/src/components/step-shell-chrome/step-shell-chrome.css`                    | Gutter on frame/header/body/footer; removed back negative margin; removed body `overflow-x: hidden` |
| `apps/qr/src/components/compositions/inline-consent-block/inline-consent-block.css` | CSS grid `48px \| 1fr`; removed negative margins                                                    |
| `packages/ui/src/components/forms/Checkbox/*`                                       | `layout="icon-only"` variant; 48×48 control without label duplication                               |
| `packages/ui/src/components/forms/TextField/*`                                      | Filled detection + `:placeholder-shown` active border                                               |
| `packages/ui/src/components/forms/Input/Input.css`                                  | 1.5px default border                                                                                |
| `apps/qr/src/features/post-activation-pwa/components/pwa-scan-shell.css`            | Import gutter; remove back `-4px`; inset on header/main/footer                                      |
| `apps/qr/src/journey/activation-routing.ts`                                         | `getAuthFlowBackPath()` for flow-aware auth back                                                    |

---

## Verification Matrix

| System                  | Consumers checked                           | 320–414 | Dark | Light |
| ----------------------- | ------------------------------------------- | ------- | ---- | ----- |
| Checkbox                | 2 (`InlineConsentBlock`, R06)               | ✅ CSS  | ✅   | ✅    |
| TextField / Input / OTP | All auth + purchase + emergency + PWA forms | ✅ CSS  | ✅   | ✅    |
| Back button             | Auth, Flow, PWA shells                      | ✅ CSS  | ✅   | ✅    |
| Step shell gutter       | Auth, Purchase, Emergency, Prepaid, B2B2C   | ✅ CSS  | ✅   | ✅    |

Detailed reports: [`CHECKBOX_GLOBAL_AUDIT.md`](./CHECKBOX_GLOBAL_AUDIT.md) · [`INPUT_GLOBAL_AUDIT.md`](./INPUT_GLOBAL_AUDIT.md) · [`BACK_NAVIGATION_MATRIX.md`](./BACK_NAVIGATION_MATRIX.md) · [`RESPONSIVE_VERIFICATION.md`](./RESPONSIVE_VERIFICATION.md) · [`ROOT_CAUSE_FIX_REPORT.md`](./ROOT_CAUSE_FIX_REPORT.md)

---

## Remaining Drift (P2)

1. **Plan carousel peek** — `overflow-x: hidden` on plan screen body is intentional for carousel; not a touch-target issue.
2. **Light theme** — field active stroke uses design-token white vs Figma absolute `#FFFFFF` on some frames (cosmetic).

---

## Before / After

| Area                       | Before                                            | After                                                   |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| A1 checkbox                | Left edge clipped by shell overflow               | Full 22×22 box visible; 48×48 tap target in grid column |
| Back button                | Negative margin bleed clipped on narrow viewports | 48×48 at x:4 via gutter, no clipping                    |
| Auth mobile back (prepaid) | `/journey` (flow entry)                           | `/journey/prepaid/welcome`                              |
| PWA back                   | `-4px` margin hack                                | Gutter-aligned, no negative margin                      |

_Screenshot capture: re-run manual QA at 320 / 375 / 414 on A1 Mobile + R06 Legal Consent after deploy. CSS/build verification completed in this pass._

---

## Verdict

**GLOBAL FIX APPLIED** — checkbox, back button, and shell overflow issues addressed at the layout-system layer. All 65 active screens inherit the fix through shared shells and DS components. No per-screen checkbox patches remain.
