# UI Regression Fix Report

**Sprint:** Consumer UI Regression + Figma Parity  
**Date:** 2026-06-18  
**Parity score:** ~92% (estimated across audited surfaces)

## Summary

Fixed dark viewport treatment, payment navigation, emergency handoff determinism, relation grid layout, text selection styling, and mobile input digit limits. Journey architecture, flow order, and business rules outside explicit sprint scope were preserved.

---

## 1. Dark background parity

### Root cause
Dark mode used a **circular** ambient tint (`border-radius: 50%` on `.al-screen-bg__tint`) that created a visible rounded shell boundary against the flat `#0a0a0c` canvas — unlike Figma’s full-bleed dark frames.

### Fix
- Added `apps/qr/src/styles/screen-viewport.css`
- Dark theme: rectangular full-viewport ambient gradient (ellipse at top), `border-radius: 0`
- `html`, `body`, `#root` share flat `--al-color-background` edge-to-edge
- Step chrome frames use transparent background in dark mode (no nested “card” surface)

### Files changed
| File | Change |
|------|--------|
| `apps/qr/src/styles/screen-viewport.css` | New — dark viewport + selection styles |
| `apps/qr/src/main.tsx` | Import viewport styles |

### Before / after
| Before | After |
|--------|-------|
| Circular green glow with curved bottom edge visible on dark screens | Full-bleed flat dark canvas with subtle top radial ambient |
| Possible mismatch between outer body and inner shell | Single continuous background |

### Remaining drift
- Light mode ambient tint unchanged (Figma-aligned)
- Per-screen tint overrides (auth purchase, status shells) still apply on top of base ambient

---

## 2. R06 plan carousel UX

See dedicated [R06_CAROUSEL_FINAL_REPORT.md](./R06_CAROUSEL_FINAL_REPORT.md).

---

## 3. Payment failed back navigation (R10b)

### Root cause
- `PurchaseStatusShell` had **no back affordance**
- R09 → R10b used `replace: true`, breaking predictable browser history
- No `onBack` wired from route

### Fix
- Optional header back on `PurchaseStatusShell` (`showBack`, `onBack`)
- R10b: back navigates to order summary (R08/R08b/R08c)
- R09 → R10b now **pushes** history (no replace) so browser back works

### Files changed
| File | Change |
|------|--------|
| `PurchaseStatusShell.tsx` | Back header support |
| `purchase-status-shell.css` | Header safe-area spacing |
| `R10bPaymentFailedScreen.tsx` | `onBack` prop |
| `PurchaseRoutes.tsx` | Wire back + history push |

---

## 4. Payment success → emergency handoff

See [PAYMENT_HANDOFF_VERIFICATION.md](./PAYMENT_HANDOFF_VERIFICATION.md).

---

## 5. Relation grid (3-column)

### Root cause
`RelationGrid` used `flex-wrap` with fixed `113px` tile width → **2 columns** on typical phone widths.

### Fix
CSS Grid: `grid-template-columns: repeat(3, minmax(0, 1fr))`, tiles `width: 100%`.

### Files changed
| File | Change |
|------|--------|
| `packages/ui/src/components/forms/RelationGrid/RelationGrid.css` | 3-column grid |

### Remaining drift
- Tile min-height unchanged (80px); verify icon+label fit at 320px in device QA

---

## 6. Text selection highlight

### Root cause
No global `::selection` rules — browser default blue/gray blocks on dark inputs.

### Fix
Design-system-aware `::selection` / `::-moz-selection` in `screen-viewport.css` for inputs and global text.

---

## 7. Mobile number validation

See [INPUT_VALIDATION_AUDIT.md](./INPUT_VALIDATION_AUDIT.md).

---

## QA checklist

| Area | Status |
|------|--------|
| Auth | ✅ clamp + maxLength |
| Purchase | ✅ R06, R10, R10b |
| Emergency | ✅ grid, mobile, E0 back |
| Prepaid / B2B2C | ✅ no route changes |
| Dark / Light | ✅ dark viewport fix |
| Build / lint / typecheck | ✅ pass |

## Remaining drift (global)

- S0 splash still uses centered logo (intentional splash, not status screen)
- R14/R15 archived routes not in live journey
- Demo mobile validation still hardcoded to `9999999999`
