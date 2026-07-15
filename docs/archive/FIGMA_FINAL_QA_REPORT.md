# Figma Final QA Report

**Source:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/Autolokate-%C2%B7-Consumer-App)  
**Dark prototype:** node `483:37` · **Light prototype:** node `501:37` · **Design system:** node `6:4`  
**Date:** 2026-06-17 · **Preview:** ui-preview v3.2.0

---

## Phase 1 — Figma Revalidation (fresh scan)

Re-scanned dark/light prototype frames and component library. Prior parity report was **not** used as source of truth.

### Theme tokens (Figma LD pairs)

| Token                      | Light     | Dark      |
| -------------------------- | --------- | --------- |
| background                 | `#FFFFFF` | `#0A0A0C` |
| surface                    | `#FFFFFF` | `#1A1A1A` |
| surfaceVariant             | `#F5F5F5` | `#4A4A4A` |
| onSurface                  | `#0A0A0A` | `#FFFFFF` |
| onSurfaceMuted             | `#8A8A8A` | `#8A8A8A` |
| outline                    | `#C4C4C4` | `#4A4A4A` |
| pill surface (chip/status) | `#F5F5F5` | `#4A4A4A` |
| pill on-surface            | `#0A0A0A` | `#FFFFFF` |

### Typography (component library)

- UI components use **Inter** (not Manrope)
- Button label: 16px / 600 / 20px line-height
- Label: 13px / 500 / 18px line-height
- OTP digit: 22px / 500

---

## Phase 2 — Components Audited & Fixed

| Component          | Key mismatches fixed                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **AlButton**       | Inter 16/600/20px; secondary 1.5px `#4A4A4A` border; disabled `#4A4A4A` + muted text; spinner 20×20 @ 2.5px stroke @ 0.8s |
| **AlTextField**    | 2px border uses `onSurface` (black L / white D); prefix 19px medium; value 20px medium; Inter                             |
| **AlInput**        | 62px height, 16px radius, 16px padding, 1px outline border, muted labels                                                  |
| **AlOtpInput**     | 60px cells, 10px gap, 12px radius, focus 2px `onSurface` border, 22px digits                                              |
| **AlToggle**       | 46×28 track, 22px knob; off track uses `surface-variant` (theme-aware)                                                    |
| **AlCheckbox**     | 22×22 box, 8px radius, 1.5px off border, green on + 1.8px white checkmark                                                 |
| **AlChip**         | **Theme-aware pill:** L `#F5F5F5`/`#0A0A0A`, D `#4A4A4A`/`#FFFFFF` (was hardcoded dark-only)                              |
| **AlStatusPill**   | Same theme-aware pill tokens (was light-only hardcoded)                                                                   |
| **AlBottomNav**    | 353×64, padding `0 10px`, active pill `9×18×9×16` + 12px radius, icon-only inactive, `aria-label` on inactive             |
| **AlAvatar**       | 46×46, `surface-variant` bg (theme-aware)                                                                                 |
| **AlQuickAction**  | 110px, 16×0 padding, 10px gap, 24px icon, surface + outline                                                               |
| **AlField**        | 2px gap, muted label, 16/600/24 value Inter                                                                               |
| **AlStepProgress** | Complete = `onSurface`, incomplete = `pill-surface` (theme-aware; was white/gray hardcoded)                               |
| **AlStatusBar**    | Inherits updated tokens (display-only)                                                                                    |

---

## Phase 3 — State Parity

### Showcase states (ui-preview v3.2)

All component pages support: `default`, `hover`, `pressed`, `focus`, `selected`, `active`, `disabled`, `loading`, `success`, `error`.

### Figma-matched states in code

| Component                          | States implemented                                |
| ---------------------------------- | ------------------------------------------------- |
| AlButton                           | default, hover, pressed, focus, disabled, loading |
| AlTextField / AlInput / AlOtpInput | default, focus, disabled, error, success, loading |
| AlToggle                           | on, off, focus, disabled, loading                 |
| AlCheckbox                         | on, off, focus, disabled                          |
| AlChip                             | default, hover, pressed, focus, selected          |
| AlBottomNav                        | active tab (label+icon), inactive (icon-only)     |

### Loading spinners

Aligned to Figma `AlButton/Primary·Loading`: **20px** diameter, **2.5px** stroke, **0.8s** linear rotation (replaces generic 16px / 2px spinner).

---

## Phase 4 — Theme System

### App-wide theme (fixed)

- `data-theme` on `<html>` via `setThemeMode()` — affects **entire** preview app
- **Removed** component-only theme toggle from `CoreComponentShowcase`
- Theme persisted to `localStorage` (`al-ui-preview-theme`)
- Initial theme from storage → system preference → light
- Inline `index.html` script prevents flash of wrong theme
- Sidebar, header, cards, code blocks, docs pages all use semantic CSS tokens

### Per-component theme sections

Each component page has dedicated **Light theme** and **Dark theme** sections using scoped `data-theme` frames (for side-by-side comparison without conflicting with app theme).

---

## Phase 5 — Responsive QA

Viewport frames at **320, 360, 375, 390, 414, 768, 1024** on every component page.  
Build: **11/11 pass** · Lint: **11/11 pass**.

Manual screenshot diff against Figma frames still recommended for final sign-off.

---

## Phase 6 — Preview Documentation (v3.2)

Each of 21 component pages includes:

- Overview
- Variants
- States (10 states)
- Light theme
- Dark theme
- Responsive preview
- Accessibility notes
- Usage example
- Props table
- Code example

---

## Phase 7 — Screenshot Validation Checklist

| Component              | Figma vs Code                      | Status          |
| ---------------------- | ---------------------------------- | --------------- |
| AlButton Primary (D)   | white fill, black text, 58h, r16   | ✅ tokens + CSS |
| AlButton Secondary (D) | 1.5px #4A4A4A, white text          | ✅              |
| AlButton Loading       | 20px spinner, 2.5px stroke         | ✅              |
| AlChip (L)             | #F5F5F5 bg, #0A0A0A text           | ✅ fixed        |
| AlChip (D)             | #4A4A4A bg, white text             | ✅ fixed        |
| AlStatusPill (L/D)     | pill-surface tokens                | ✅ fixed        |
| AlTextField (L)        | 2px black border, white fill       | ✅              |
| AlTextField (D)        | 2px white border, #1A1A1A fill     | ✅              |
| AlBottomNav active     | pill + label + icon                | ✅              |
| AlStepProgress (L)     | black complete, #F5F5F5 incomplete | ✅ fixed        |
| AlStepProgress (D)     | white complete, #4A4A4A incomplete | ✅ fixed        |

---

## Phase 8 — Final QA

| Check                              | Result                  |
| ---------------------------------- | ----------------------- |
| TypeScript build                   | ✅ 11/11                |
| ESLint                             | ✅ 11/11                |
| Font Awesome removed               | ✅ SVG icons only       |
| Theme flash on load                | ✅ inline script        |
| Mixed theme in showcase            | ✅ removed local toggle |
| `aria-label` on icon-only nav tabs | ✅                      |
| Dead CSS in showcase               | ✅ cleaned              |

---

## Remaining Gaps

1. **Automated screenshot diff** — not run in CI; manual Figma overlay recommended per component at 390px.
2. **AlPlateInput** — in Figma, not in code scope.
3. **Button pressed state** — Figma shows same fill as default (scale only); CSS simulation in showcase.
4. **Display typography** — Manrope retained for marketing/display; Inter for UI components only.
5. **Per-page state renderers** — only AlButton fully wired for all 10 states; other pages use shared CSS simulation + variant props (extend as needed).
6. **Glow elevation tokens** — defined, not yet applied to signal hero surfaces.

---

## Files Changed (summary)

```
packages/design-system/src/tokens/colors.ts
packages/design-system/src/tokens/spacing.ts
packages/design-system/src/theme.css
packages/ui/src/components/**/*.css
packages/ui/src/components/navigation/BottomNav/BottomNav.tsx
apps/ui-preview/src/App.tsx
apps/ui-preview/index.html
apps/ui-preview/src/docs/components/CoreComponentShowcase.tsx
apps/ui-preview/src/docs/components/core-showcase.css
apps/ui-preview/src/preview.css
```

---

## Verify locally

```bash
pnpm --filter @autolokate/ui-preview dev
```

Toggle Light/Dark in the header — the entire app (sidebar, docs, cards, code) should switch themes together. Open any component page and compare Light/Dark theme sections against Figma prototypes.
