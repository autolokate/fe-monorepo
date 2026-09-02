# Back Button Audit

**Date:** 2026-06-19  
**Figma ref:** `icon/arrow-left` `19:5` · tap target `EL-089b1a1c` (48×48 @ x:4)

---

## Figma Spec

| Property  | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| Icon      | `arrow-left`                                                        |
| Icon size | 24×24                                                               |
| Hit area  | 48×48                                                               |
| Position  | 4px from screen left (within 16px content padding → `-12px` offset) |
| Hover     | No background pill                                                  |
| Opacity   | Full white icon                                                     |

---

## Implementations Audited

| Shell                                  | File                                      | Status          |
| -------------------------------------- | ----------------------------------------- | --------------- |
| Auth                                   | `AuthStepShell` → `step-shell-chrome.css` | **Fixed**       |
| Purchase / Emergency / Prepaid / B2B2C | `FlowStepShell` → shared chrome           | **Fixed**       |
| PWA                                    | `PwaScanShell` → `pwa-scan-shell.css`     | **Fixed**       |
| Purchase status                        | `PurchaseStatusShell`                     | Inherits chrome |
| Welcome activation                     | `WelcomeActivationShell`                  | Inherits chrome |

---

## Root Causes

1. **Hit area** — back was 24×24 (below 48×48 Figma tap target)
2. **Hover behavior** — `AlIconButton` added gray background + translateY lift not in Figma
3. **Alignment** — icon not offset to match Figma x:4 hotspot

---

## Fixes

### `step-shell-chrome.css`

```css
.ob-step-chrome__back.al-icon-button {
  width: 48px;
  height: 48px;
  margin-inline-start: -12px;
  /* no hover background / transform */
}
```

### `pwa-scan-shell.css`

- Grid columns already 48px
- Back button: 48×48, transparent hover, `-4px` margin for alignment

---

## Navigation Behavior

**Not changed** (per constraints):

- Auth back → previous auth step or flow entry
- Purchase back → previous purchase step (with payment guards)
- PWA back → previous PWA route via `onBack` handlers
- Browser/hardware back → React Router history (unchanged)

---

## Verdict

**READY** for back button visual + hit area. Navigation destinations unchanged.
