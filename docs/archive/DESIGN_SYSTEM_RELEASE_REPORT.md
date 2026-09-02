# Design System Release Report — RC1

**Version:** v4.0.0-rc1  
**Date:** 2026-06-17  
**Scope:** `@autolokate/design-system`, `@autolokate/ui`, `@autolokate/icons`, `@autolokate/brand`, `apps/ui-preview`  
**Figma source:** Autolokate · Consumer App (`FtHCUnE0HH586PtG5yJyG0`) — DS dark `483:37`, light `501:37`

---

## Executive summary

Design System **RC1** completes a foundation freeze before QR Flow screen work. All 16 core components and 7 layout primitives are documented in ui-preview with overview, variants, states, light/dark previews, responsive viewports (320–1024px), accessibility notes, code samples, and props tables.

**Build status:** `pnpm clean && pnpm build && pnpm lint` — 11/11 packages pass.

**Cleanup performed:**

- Removed 6 re-export shim files (`Button.tsx`, `Chip.tsx`, `Avatar.tsx`, `Input.tsx`, `Checkbox.tsx`, `BottomNav.tsx`) — barrels now import from component folders directly
- Removed dead `.ds-vehicle-verify*` CSS from `apps/ui-preview/src/preview.css` (~60 lines)
- Rebuilt `@autolokate/ui` dist (stale domain components eliminated)
- Added `AlPlateInput` focus-visible ring and Figma-accurate green plate divider

---

## Component inventory

### Core components (16)

| Component       | Package path               | ui-preview page        |
| --------------- | -------------------------- | ---------------------- |
| AlButton        | `primitives/Button`        | `core-button`          |
| AlInput         | `forms/Input`              | `core-input`           |
| AlTextField     | `forms/TextField`          | `core-text-field`      |
| AlOtpInput      | `forms/OtpInput`           | `core-otp-input`       |
| AlToggle        | `forms/Toggle`             | `core-toggle`          |
| AlCheckbox      | `forms/Checkbox`           | `core-checkbox`        |
| AlChip          | `primitives/Chip`          | `core-chip`            |
| AlStatusPill    | `primitives/StatusPill`    | `core-status-pill`     |
| AlAvatar        | `primitives/Avatar`        | `core-avatar`          |
| AlField         | `primitives/Field`         | `core-field`           |
| AlQuickAction   | `primitives/QuickAction`   | `core-quick-action`    |
| AlBottomNav     | `navigation/BottomNav`     | `core-bottom-nav`      |
| AlStepProgress  | `primitives/StepProgress`  | `core-step-progress`   |
| AlPlateInput    | `forms/PlateInput`         | `core-plate-input`     |
| AlPlanCard      | `primitives/PlanCard`      | `core-plan-card`       |
| AlVehicleRcCard | `primitives/VehicleRcCard` | `core-vehicle-rc-card` |

### Layout primitives (7)

| Component    | Package path            | ui-preview page    |
| ------------ | ----------------------- | ------------------ |
| AlText       | `primitives/Text`       | `core-text`        |
| AlHeading    | `primitives/Heading`    | `core-heading`     |
| AlIconButton | `primitives/IconButton` | `core-icon-button` |
| AlStack      | `primitives/Stack`      | `core-stack`       |
| AlGrid       | `primitives/Grid`       | `core-grid`        |
| AlContainer  | `primitives/Container`  | `core-container`   |
| AlDivider    | `primitives/Divider`    | `core-divider`     |

### Additional (documented, outside RC inventory)

| Component   | Notes                                          |
| ----------- | ---------------------------------------------- |
| AlStatusBar | Mobile preview chrome only — `core-status-bar` |

---

## Token inventory

### Color primitives (`@autolokate/design-system/tokens/colors`)

| Category       | Count    | Examples                                                          |
| -------------- | -------- | ----------------------------------------------------------------- |
| Brand          | 2        | `--al-brand-black`, `--al-brand-white`                            |
| Signal         | 4        | red, red-bright, amber, green                                     |
| Neutral        | 11       | `--al-neutral-0` … `--al-neutral-1000`, `--al-neutral-plate`      |
| Gradients      | 6        | canvas, protected, emergency, vehicle-rc (light/dark), plan-badge |
| Semantic light | 28 roles | background, surface, on-surface, focus, success, plate-surface, … |
| Semantic dark  | 28 roles | mirrored dark theme roles                                         |

### Spacing & layout (`@autolokate/design-system/tokens/spacing`)

| Category           | Count | Notes                                          |
| ------------------ | ----- | ---------------------------------------------- |
| Space scale        | 7     | xs (4px) → xxxl (48px)                         |
| Radius             | 7     | sm, md, lg, xl, control, pill, segment         |
| Elevation / shadow | 10    | raised, nav, glow variants, plate shadow       |
| Material           | 8     | blur + opacity tiers                           |
| Border             | 2     | thin (1px), thick (2px)                        |
| Component dims     | 40+   | button, input, plate, plan card, vehicle RC, … |
| Layout             | 11    | touch targets, icon sizes, content margin      |

### Typography (`@autolokate/design-system/tokens/typography`)

- Font families: Manrope (display), Inter (UI/body)
- Text roles: display, headline, title, subtitle, bodyLarge, body, label, caption, mono

### Motion (`@autolokate/design-system/tokens/motion`)

- Durations: fast, normal, slow
- Easings: standard, emphasized, decelerate
- Scale: press (0.97)

### CSS delivery

- `packages/design-system/src/theme.css` — runtime CSS variables for light/dark via `[data-theme]`
- TypeScript token maps mirror CSS for programmatic access (single source in TS, emitted to CSS)

---

## Icon inventory

**Package:** `@autolokate/icons` — 19 Figma-aligned icons, sizes 16 | 20 | 24 | 32 | 48

| Icon           | Used in                             |
| -------------- | ----------------------------------- |
| house          | AlBottomNav, compositions           |
| store          | Foundations                         |
| users          | AlChip contexts                     |
| circle-user    | AlAvatar                            |
| scan-line      | OTP, nav                            |
| square-parking | Foundations                         |
| receipt-text   | AlField                             |
| shield-check   | Status, compositions                |
| chevron-down   | Dropdowns                           |
| bell           | AlIconButton, AlStatusBar           |
| car            | Plate, vehicle                      |
| phone          | AlTextField                         |
| arrow-left     | Navigation                          |
| plus           | AlQuickAction                       |
| user           | AlInput                             |
| map-pin        | Location contexts                   |
| circle-check   | AlPlanCard, AlChip, AlVehicleRcCard |
| circle-x       | Error states                        |
| credit-card    | AlPlanCard nav                      |

**No duplicate SVGs** — one source file per icon in `packages/icons/src/svg/`, generated React components in `generated/`.

---

## Brand inventory

**Package:** `@autolokate/brand`

| Asset                        | Formats             |
| ---------------------------- | ------------------- |
| AutolokateLogo               | React component     |
| AutolokateMark / AlBrandMark | React component     |
| Logo SVGs                    | light, dark         |
| Mark SVGs                    | light, dark         |
| PNG                          | autolokate_dark.png |

---

## Accessibility status

| Criterion            | Status       | Notes                                                                                                                  |
| -------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Keyboard navigation  | Pass         | Native controls (button, input, checkbox, toggle); plan card uses `button` + `aria-pressed`                            |
| Focus rings          | Pass         | `:focus-visible` on buttons, inputs, plate (`:focus-within`), plan card, checkbox, toggle                              |
| Screen reader labels | Pass         | `aria-label` on icon buttons, plate input, vehicle RC section; field label/value pairs                                 |
| Touch targets        | Partial      | Most controls ≥48dp (62px inputs, 58px button). **AlAvatar md = 46px** — document-only display, not primary tap target |
| RTL safety           | Not verified | Logical properties not audited; LTR-first consumer app                                                                 |
| Long text wrapping   | Pass         | Plan features, field values, body text wrap within containers                                                          |
| Light mode contrast  | Pass         | Monochrome + signal palette meets AA on surface backgrounds                                                            |
| Dark mode contrast   | Pass         | Inverted semantic roles maintain AA for primary text and signals                                                       |

---

## Responsive status

All component pages include viewport previews at:

| Width  | Device class     |
| ------ | ---------------- |
| 320px  | Small phone      |
| 360px  | Android baseline |
| 375px  | iPhone SE / mini |
| 390px  | iPhone 14        |
| 414px  | iPhone Plus      |
| 768px  | Tablet portrait  |
| 1024px | Tablet landscape |

Components use `min(100%, …)` or fluid widths where applicable (plan card 270px max, bottom nav 353px max). Grid and stack primitives adapt at container width.

---

## State coverage

| State            | Components supporting                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Default          | All                                                                    |
| Hover            | Interactive: Button, Chip, QuickAction, PlanCard, BottomNav items      |
| Active / Pressed | Button, Chip, QuickAction, PlanCard                                    |
| Focus            | All form controls, buttons, plan card                                  |
| Disabled         | Button, Input, TextField, OtpInput, Toggle, Checkbox, Chip, PlateInput |
| Loading          | Button                                                                 |
| Error            | TextField, OtpInput, Input (invalid)                                   |
| Selected         | Chip, PlanCard, BottomNav tab                                          |
| Empty            | Input placeholders, OtpInput empty cells, plate placeholder            |

---

## Figma composition validation

9 compositions remain in ui-preview under **Figma Composition Validation** — used for integration testing, not new RC scope:

1. Form section
2. Vehicle info (AlVehicleRcCard)
3. Contact card
4. Quick action row
5. Bottom navigation
6. Status card
7. Empty content
8. Step progress
9. Plan card

---

## Known limitations

1. **AlAvatar md (46px)** — below 48dp guideline; acceptable for display-only contexts
2. **RTL** — not tested; recommend logical properties audit before Arabic/Hebrew launch
3. **AlPlanCard disabled** — no native `disabled` prop; use non-interactive mode (omit `onSelect`)
4. **AlStatusBar** — preview chrome, not part of 16-component RC inventory
5. **Screen-level CTAs** — plan selection CTA lives outside AlPlanCard (Figma AlPlanCardW pattern)
6. **CSS minify warning** — esbuild reports syntax warning on `translateY(calc(...))` in bundled CSS; non-blocking, pre-existing

---

## RC1 gate checklist

- [x] Every RC component has full ui-preview documentation
- [x] Light and dark theme verified
- [x] Interaction states documented in showcase
- [x] Responsive viewports 320–1024
- [x] Dead code and shim files removed
- [x] Clean monorepo build + lint
- [x] `DESIGN_SYSTEM_RELEASE_REPORT.md` generated
- [x] `COMPONENT_STATUS_MATRIX.md` generated
- [x] No new components, flows, or app work

**Verdict: RC1 approved for QR Flow screen work.**
