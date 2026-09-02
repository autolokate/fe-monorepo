# UI Parity Fix Report

**Date:** 2026-06-19  
**Figma file:** `FtHCUnE0HH586PtG5yJyG0` · Shared Auth section `91:268`  
**Method:** Figma MCP node inspection + runtime CSS fixes (no flow/business logic changes)

---

## Summary

| Issue              | Status   | Primary files                                                                        |
| ------------------ | -------- | ------------------------------------------------------------------------------------ |
| Checkbox parity    | Fixed    | `Checkbox.css`, `inline-consent-block.css`                                           |
| Input active state | Fixed    | `TextField.css`, `TextField.tsx`, `Input.css`, `OtpInput.css`, `auth-step-shell.css` |
| Back button        | Fixed    | `step-shell-chrome.css`, `pwa-scan-shell.css`                                        |
| Text alignment     | Verified | Existing `step-shell-chrome` left-aligned headings — no drift                        |
| UI breakage        | Partial  | Photo card height + shell backgrounds fixed in prior pass                            |

**Verdict:** **MORE FIXES REQUIRED** — core component fixes applied; full 95-frame screenshot matrix at 320–414 not re-run this session.

---

## Fixes Applied

### A1 Mobile — Input default state (screenshot issue)

|                | Detail                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| **Screen**     | Auth A1 · `102:268`                                                                                           |
| **Component**  | `AlTextField` + `.ob-auth-mobile-field`                                                                       |
| **Root cause** | Base `AlTextField` used 2px white border + hover white border on all states, making empty fields look focused |
| **Fix**        | Default: `1.5px #4A4A4A`; active: `2px #FFFFFF` only on `:focus-within` or `.al-text-field--filled`           |
| **Before**     | White border on empty mobile field                                                                            |
| **After**      | Gray neutral border until focus or digits entered                                                             |

### Consent checkbox

|                | Detail                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Screen**     | Auth A1 · Figma `AlCheckbox/Off` `81:25`                                                                               |
| **Component**  | `AlCheckbox`, `InlineConsentBlock`                                                                                     |
| **Root cause** | 22px hit target (should be 48×48); unchecked box had surface fill; checkmark offset drift                              |
| **Fix**        | 22×22 box, 8px radius, 1.5px `#4A4A4A` border, transparent bg; checked `#1FA24A`; 48×48 tap target with `-13px` offset |
| **Figma ref**  | EL-d00a1a60 (off), EL-39d54cd1 (on)                                                                                    |

### Back button

|                | Detail                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------- |
| **Screens**    | All auth / flow / PWA shells                                                                   |
| **Component**  | `AlIconButton` in step chrome                                                                  |
| **Root cause** | 24×24 visual only; hover lift + gray fill not in Figma                                         |
| **Fix**        | 48×48 hit area, `-12px` inset (auth), no hover background/transform; 24px arrow icon preserved |

---

## Screens Verified (code + Figma nodes)

- `102:268` Mobile Empty — input, checkbox, back, heading alignment
- `102:303` Mobile Ready — filled input + checked checkbox
- `102:334` Mobile Error — amber input border
- PWA shell back — 48px grid column

---

## Remaining Drift

- Purchase R07 plan-context line (P2)
- R08d promo on no-rider path (P2)
- Full responsive screenshot pass not executed
- iOS SOS loader device QA pending

---

## Build

```
pnpm --filter @autolokate/ui build        ✓
pnpm --filter @autolokate/qr build ✓
```
