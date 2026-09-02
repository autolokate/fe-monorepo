# Shared Shell Audit

**Date:** 2026-06-19  
**Scope:** All multi-screen layout wrappers

---

## Summary

| Shell                                 | Consumer screens | Issues | Fixed |
| ------------------------------------- | ---------------: | -----: | ----: |
| Step chrome (`step-shell-chrome.css`) |              ~36 |      3 |    ✅ |
| AuthStepShell                         |        3 + legal |      1 |    ✅ |
| FlowStepShell                         |              ~25 |      2 |    ✅ |
| WelcomeActivationShell                |                3 |      2 |    ✅ |
| PwaScanShell                          |               29 |      2 |    ✅ |
| PurchaseStatusShell                   |               ~6 |      0 |    ✅ |
| Flow Entry                            |                1 |      1 |    ✅ |
| Completion                            |                1 |      0 |    ✅ |

---

## Layout Token Contract

| Token                      |     Value | Figma source                   |
| -------------------------- | --------: | ------------------------------ |
| `--ob-shell-gutter`        |      16px | Frame `102:270` padding        |
| `--ob-shell-touch-bleed`   |      12px | Tap target x:4 vs content x:16 |
| `--ob-shell-section-gap`   |      20px | Frame column gap               |
| `--ob-shell-heading-gap`   |       8px | Heading block gap              |
| `--ob-shell-header-top`    |      22px | y:66 − status 44               |
| `--ob-shell-content-width` | 393px max | Frame width                    |

---

## Shell-by-Shell

### 1. Step Chrome (base)

**Role:** Frame, header, body, footer, heading typography, CTA width.

**Before:** Split 4px+12px padding; body/header/footer triple-inset; heading styles duplicated downstream.

**After:** Single 16px frame gutter; zero horizontal inset on sections; centralized heading/body typography.

**Consumers:** AuthStepShell, FlowStepShell, WelcomeActivationShell, PurchaseStatusShell, LegalReaderHeader.

---

### 2. AuthStepShell

**Extends:** Step chrome + OTP/mobile field overrides.

**Audit:** No horizontal padding overrides. Purchase/plan variants keep vertical/carousel rules only.

**Screens:** A1 Mobile, A2 OTP, A3 Vehicle owner.

---

### 3. FlowStepShell

**Extends:** Step chrome + phase modifiers (purchase, emergency, capture).

**Fix:** Removed global subtitle `text-transform: lowercase`.

**Screens:** All `/journey/purchase/*`, `/journey/emergency/*`, legacy R01–R06 components.

---

### 4. WelcomeActivationShell

**Fix:** Removed duplicate `padding-inline: 16px` on frame (was stacking with step chrome → 28px body).

**Screens:** Prepaid welcome, B2B2C welcome (×2 variants).

---

### 5. PwaScanShell

**Before:** Split gutter (4+12); back centered in 48px grid column.

**After:** 16px frame gutter; `.ob-shell-back` in column 1; main/footer align to 16px.

**Screens:** All `/pwa/scan/*` (29 routes).

---

### 6. PurchaseStatusShell

**Layout:** Centered hero body (max-width 330) — **Figma-intentional**, not step-column.

**Audit:** Footer CTA uses step chrome footer → 16px gutter. Back uses `.ob-shell-back` when shown.

**Screens:** R04 fetching, R04b, R09/R09b, R10/R10b/R10c, R15 component.

---

### 7. Flow Entry

**Fix:** Imports shell tokens; top padding `22px + safe-area`; heading 28/36/700.

**Note:** No back button (entry screen).

---

### 8. Completion Experience

**Layout:** Centered celebration — correct per design. Uses `padding-inline: 16px` (matches gutter).

---

## Checklist (all shells)

| Check                                | Status |
| ------------------------------------ | :----: |
| Content width 361 @ 393 viewport     |   ✅   |
| Horizontal padding 16px (step flows) |   ✅   |
| Top spacing 22px + safe-area         |   ✅   |
| Back spacing 20px to next header row |   ✅   |
| Title placement x:16                 |   ✅   |
| Footer CTA full width in gutter      |   ✅   |
| Safe area bottom on footer           |   ✅   |
| No double horizontal padding         |   ✅   |

---

## Files Changed

```
touch-target-layout.css      — tokens + .ob-shell-back
step-shell-chrome.css        — frame/section layout + typography
welcome-activation-shell.css — remove duplicate gutter
flow-step-shell.css          — subtitle case
flow-entry-screen.css        — token alignment
pwa-scan-shell.css           — unified gutter
inline-consent-block.css     — 22px visual + touch bleed
AuthStepShell.tsx            — ob-shell-back class
FlowStepShell.tsx            — ob-shell-back class
WelcomeActivationShell.tsx   — ob-shell-back class
PwaScanShell.tsx             — ob-shell-back class
PurchaseStatusShell.tsx      — ob-shell-back class
LegalReaderHeader.tsx        — 24px icon + ob-shell-back
```

---

## Verdict

**PASS** — Shell layer is the single source of horizontal alignment. Screen files unchanged.
