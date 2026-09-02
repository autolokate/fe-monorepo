# Composition Validation Report — Phase 2.5

**Source:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/Autolokate-%C2%B7-Consumer-App)  
**Design system:** node `483:37` (dark) · `501:37` (light)  
**Preview:** ui-preview **v3.3.0** · section **Figma Composition Validation**  
**Date:** 2026-06-17

---

## Summary

Phase 2.5 validates **real-world component compositions** from the Figma design system — not isolated component states. Nine compositions are implemented in ui-preview using only `@autolokate/ui`, `@autolokate/icons`, and `@autolokate/brand`. No custom CSS overrides are applied to composition markup.

| Check                          | Result                        |
| ------------------------------ | ----------------------------- |
| Compositions built             | 9 (+ index)                   |
| Light theme frames             | ✅ per composition            |
| Dark theme frames              | ✅ per composition            |
| Spacing rhythm 4/8/12/16/24/32 | ✅ documented per composition |
| Typography hierarchy           | ✅ documented per composition |
| Icon alignment                 | ✅ documented per composition |
| Touch targets                  | ✅ documented per composition |
| TypeScript build               | ✅ 11/11                      |
| ESLint                         | ✅ 11/11                      |

---

## Compositions inventory

| Composition       | Figma section           | Components                                     | Light | Dark |
| ----------------- | ----------------------- | ---------------------------------------------- | ----- | ---- |
| Form section      | INPUTS                  | AlTextField, AlPlateInput, AlInput, AlOtpInput | ✅    | ✅   |
| Vehicle info      | CONTENT & CARDS         | AlHeading, AlStatusPill, AlField               | ✅    | ✅   |
| Contact card      | CONTENT & CARDS         | AlAvatar, AlField                              | ✅    | ✅   |
| Quick action row  | CONTENT & CARDS         | AlQuickAction × 4                              | ✅    | ✅   |
| Bottom navigation | NAVIGATION & STRUCTURAL | AlBottomNav × 4 states                         | ✅    | ✅   |
| Status card       | SELECTION & STATUS      | AlStatusPill, AlChip                           | ✅    | ✅   |
| Empty content     | CONTENT & CARDS pattern | AlIcon, AlHeading, AlText, AlButton            | ✅    | ✅   |
| Step progress     | CONTENT & CARDS         | AlStepProgress × 5                             | ✅    | ✅   |
| Plan card         | CONTENT & CARDS         | AlPlanCard (AlPlanCardW)                       | ✅    | ✅   |

---

## Composition mismatches

| Composition      | Mismatch                                                                                       | Severity                |
| ---------------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| Form section     | `AlPlateInput` was missing from core library — **implemented** in Phase 2.5                    | Fixed                   |
| Plan card        | `AlPlanCardW` was missing — **implemented as `AlPlanCard`**                                    | Fixed                   |
| Contact card     | `AlAvatar` is 46px; below 48dp when used as interactive control                                | Low (display-only here) |
| Quick action row | Figma DS shows single Scan tile; row extends pattern with 4 tiles for rhythm test              | Info                    |
| Empty content    | No dedicated `AlEmptyState` in trimmed core — built from primitives per constraint             | Info                    |
| Status card      | Chips in composition are display-only; Figma chips support interactive filter state separately | Info                    |

---

## Component fixes required (discovered via composition)

### Implemented in this pass

| Component        | Issue                                  | Fix                                                                                                                        |
| ---------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **AlPlateInput** | Missing Figma DS component (`74:23`)   | New core form component: 62px height, 12px radius, `#E4E4E8` plate surface, 24px/700 uppercase text, plate shadow, divider |
| **AlPlanCard**   | Missing Figma `AlPlanCardW` (`231:80`) | New core card: 270px width, 20px radius, title 20/600, price 30/700, feature rows with 15px check icon slot                |

### Tokens added

| Token                      | Value                              | Purpose                                  |
| -------------------------- | ---------------------------------- | ---------------------------------------- |
| `--al-neutral-plate`       | `#E4E4E8`                          | Indian plate surface (theme-independent) |
| `--al-color-plate-surface` | `var(--al-neutral-plate)`          | Plate input background                   |
| `--al-color-on-plate`      | `var(--al-neutral-1000)`           | Plate text                               |
| `--al-shadow-plate`        | `0 6px 18px -4px rgba(0,0,0,0.35)` | Plate elevation                          |
| `--al-comp-plate-*`        | see spacing.ts                     | Plate dimensions                         |
| `--al-comp-plan-card-*`    | see spacing.ts                     | Plan card dimensions                     |

### Remaining (not blocking compositions)

| Component        | Issue                                  | Recommendation                                                      |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------- |
| **AlAvatar**     | 46px < 48dp touch minimum              | Add `size="lg"` at 48px or bump `md` to 48px if used as button      |
| **AlEmptyState** | Removed in core trim                   | Re-add as optional feedback primitive if empty screens become flows |
| **AlChip**       | Status card uses non-interactive chips | Add `onClick` in composition only when testing filter flows         |

---

## Spacing rhythm validation

Figma 4px base rhythm mapped to design tokens:

| px  | Token            | Used in compositions                                            |
| --- | ---------------- | --------------------------------------------------------------- |
| 4   | `--al-space-xs`  | Field label gaps, plan feature list padding                     |
| 8   | `--al-space-sm`  | Quick action row, status chip row, header rhythm                |
| 12  | `--al-space-md`  | Contact card avatar gap, status pill row, empty icon-to-heading |
| 16  | `--al-space-lg`  | Form field stack, vehicle info rows, bottom nav previews        |
| 24  | `--al-space-xl`  | Empty content body-to-CTA                                       |
| 32  | `--al-space-xxl` | Not required in current DS compositions                         |

Non-token Figma gaps preserved as component tokens: plan card 14px/9px gaps, plate inner 6px, step segment 6px.

---

## Typography hierarchy validation

| Level          | Figma spec       | Composition usage                           |
| -------------- | ---------------- | ------------------------------------------- |
| Display / hero | Manrope          | Not used in DS compositions (UI uses Inter) |
| Title          | Inter 20px / 600 | Plan card name, section headings            |
| Price          | Inter 30px / 700 | Plan card price                             |
| Body           | Inter 16px / 400 | AlInput, empty helper text                  |
| Label          | Inter 13px / 500 | Fields, pills, chips, quick actions         |
| Plate          | Inter 24px / 700 | AlPlateInput                                |
| OTP digit      | Inter 22px / 500 | AlOtpInput                                  |

---

## Icon alignment validation

| Composition      | Icon                                          | Size | Alignment                              |
| ---------------- | --------------------------------------------- | ---- | -------------------------------------- |
| Quick action row | scan-line, plus, square-parking, receipt-text | 24px | Centered above label in tile           |
| Contact card     | user                                          | 22px | Centered in 46px avatar                |
| Bottom nav       | house, store, users, circle-user              | 20px | Centered; active tab label beside icon |
| Empty content    | car                                           | 48px | Centered above text stack              |
| Plan card        | circle-check                                  | 15px | Centered with 13px feature label       |

---

## Touch target validation

| Control          | Height / area     | 48dp pass       |
| ---------------- | ----------------- | --------------- |
| AlButton primary | 58px              | ✅              |
| AlTextField      | 62px              | ✅              |
| AlPlateInput     | 62px              | ✅              |
| AlInput          | 62px              | ✅              |
| AlOtpInput cell  | 60px              | ✅              |
| AlQuickAction    | 110×72px+         | ✅              |
| AlBottomNav item | 48px+ via padding | ✅              |
| AlAvatar md      | 46px              | ⚠️ display-only |

---

## Composition screenshots inventory

Manual screenshot capture recommended from ui-preview **Figma Composition Validation** section:

| #   | Composition       | Light screenshot                         | Dark screenshot                         | Viewport |
| --- | ----------------- | ---------------------------------------- | --------------------------------------- | -------- |
| 1   | Form section      | `composition-form-section-light.png`     | `composition-form-section-dark.png`     | 393px    |
| 2   | Vehicle info      | `composition-vehicle-info-light.png`     | `composition-vehicle-info-dark.png`     | 393px    |
| 3   | Contact card      | `composition-contact-card-light.png`     | `composition-contact-card-dark.png`     | 393px    |
| 4   | Quick action row  | `composition-quick-action-row-light.png` | `composition-quick-action-row-dark.png` | 393px    |
| 5   | Bottom navigation | `composition-bottom-nav-light.png`       | `composition-bottom-nav-dark.png`       | 393px    |
| 6   | Status card       | `composition-status-card-light.png`      | `composition-status-card-dark.png`      | 393px    |
| 7   | Empty content     | `composition-empty-content-light.png`    | `composition-empty-content-dark.png`    | 393px    |
| 8   | Step progress     | `composition-step-progress-light.png`    | `composition-step-progress-dark.png`    | 393px    |
| 9   | Plan card         | `composition-plan-card-light.png`        | `composition-plan-card-dark.png`        | 393px    |

> Screenshots are not committed to the repo in this pass. Capture from running `pnpm --filter @autolokate/ui-preview dev` at each composition page with app theme toggle and per-frame `data-theme` previews.

---

## Navigation

ui-preview sidebar → **Figma Composition Validation** (v3.3.0):

- Overview
- Form section
- Vehicle info
- Contact card
- Quick action row
- Bottom navigation
- Status card
- Empty content
- Step progress
- Plan card

---

## Out of scope (per Phase 2.5 brief)

- ❌ Full screen flows
- ❌ Consumer app shells
- ❌ Automated Figma screenshot diff CI

---

## Next steps

1. Capture and attach screenshot inventory for design sign-off
2. Bump `AlAvatar` md to 48px if avatar becomes tappable in flows
3. Phase 3: wire compositions into signature flow screens
