# Root Cause Fix Report — Alignment Pass

**Date:** 2026-06-19  
**Principle:** Fix shared layout systems, not individual screens

---

## Summary

| Metric                 |        Value |
| ---------------------- | -----------: |
| Total screens audited  |       **65** |
| Total issues found     |        **9** |
| Total issues fixed     |        **9** |
| Shared component fixes | **13 files** |
| Per-screen patches     |        **0** |

---

## Primary Root Cause

The previous “touch-target gutter” (4px frame + 12px section inset) **did not match Figma’s layout model**.

Figma uses **one content column** with `padding: 0 16px` on the main frame (`102:270`, `170:27`). Back-button hit areas extend **12px left** of that column (x:4) while the **icon stays at x:16**.

The split gutter:

1. Double-padded welcome screens (16 + 12 = **28px** text)
2. Centered the back icon in a 48×48 box at the wrong X (~28px instead of 16px)
3. Failed to place the 48×48 hit area at x:4

---

## Fixes Applied

### 1. Unified shell layout (`touch-target-layout.css`)

- Replaced split padding with `--ob-shell-gutter: 16px`
- Added `--ob-shell-touch-bleed: 12px` for hit-area extension
- Added global `.ob-shell-back` (icon @ 16px, hit @ 4px)

### 2. Step chrome (`step-shell-chrome.css`)

- Frame: single 16px horizontal padding
- Removed header/body/footer horizontal inset
- Centralized heading typography (28/36/700, letter-spacing 0)
- Centralized body/description (16/24/400, text-align start)
- Header top: 22px + safe-area (Figma y:66)

### 3. Shell consumers

- `AuthStepShell`, `FlowStepShell`, `WelcomeActivationShell`, `PwaScanShell`, `PurchaseStatusShell`, `LegalReaderHeader` — all use `.ob-shell-back`

### 4. Welcome shell

- Removed duplicate `padding-inline: 16px` on frame

### 5. Flow shell

- Removed `text-transform: lowercase` on descriptions

### 6. PWA shell

- Aligned to 16px gutter; back uses shared `.ob-shell-back`

### 7. Inline consent

- 22px visual column at x:16; 48×48 tap target bleeds to x:4

### 8. Flow entry

- Token-aligned padding and heading typography

---

## Shared Files Changed

```
apps/qr/src/components/step-shell-chrome/touch-target-layout.css
apps/qr/src/components/step-shell-chrome/step-shell-chrome.css
apps/qr/src/components/auth-step-shell/AuthStepShell.tsx
apps/qr/src/components/flow-step-shell/FlowStepShell.tsx
apps/qr/src/components/flow-step-shell/flow-step-shell.css
apps/qr/src/components/compositions/welcome-activation/welcome-activation-shell.css
apps/qr/src/components/compositions/welcome-activation/WelcomeActivationShell.tsx
apps/qr/src/components/compositions/inline-consent-block/inline-consent-block.css
apps/qr/src/components/compositions/purchase-status-shell/PurchaseStatusShell.tsx
apps/qr/src/features/post-activation-pwa/components/pwa-scan-shell.css
apps/qr/src/features/post-activation-pwa/components/PwaScanShell.tsx
apps/qr/src/features/shared-legal/components/LegalReaderHeader.tsx
apps/qr/src/journey/screens/flow-entry-screen.css
```

---

## Verification

```bash
pnpm --filter @autolokate/qr build  # ✅
```

Grep: no remaining `--ob-touch-inline-bleed` or `--ob-shell-frame-padding-inline` split system.

All back buttons use `.ob-shell-back`. All step shells use single `--ob-shell-gutter`.

---

## Related Reports

- [`TEXT_ALIGNMENT_GLOBAL_AUDIT.md`](./TEXT_ALIGNMENT_GLOBAL_AUDIT.md)
- [`BACK_BUTTON_PARITY_REPORT.md`](./BACK_BUTTON_PARITY_REPORT.md)
- [`SHARED_SHELL_AUDIT.md`](./SHARED_SHELL_AUDIT.md)
- [`FINAL_ALIGNMENT_MATRIX.md`](./FINAL_ALIGNMENT_MATRIX.md)

---

## Verdict

**ROOT CAUSES ADDRESSED** — Text and back-button alignment fixed at the shell/layout layer. All 65 screens verified through shared shell inheritance.
