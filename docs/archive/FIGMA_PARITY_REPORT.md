# Figma Visual Parity Report

**Source:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/Autolokate-%C2%B7-Consumer-App?node-id=0-1)  
**Date:** 2026-06-17  
**Scope:** Foundations tokens + 21 core components + 19 icons + ui-preview v3.1.0

---

## Summary

Fresh re-scan of Figma Foundations & Components (node `0:1`) drove a full token and component CSS pass. Font Awesome approximations were replaced with Figma-exported Lucide SVGs. Build: **11/11 pass**. Lint: **11/11 pass**.

---

## Components Fixed

| Component          | Changes                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| **AlChip**         | Neutral-700 pill bg, white label, 8px semantic dot, 4×12 padding, 8px gap |
| **AlStatusPill**   | Neutral-50 bg, black text, colored 8px dot (no tinted backgrounds)        |
| **AlToggle**       | 46×28 track, 22px knob, green on / gray off, 3px inset                    |
| **AlBottomNav**    | 353×64, 16px radius, nav shadow + 30px blur, active tab shows label       |
| **AlButton**       | 58px height, 16px radius, 0×24 padding, 16px/600 label                    |
| **AlInput**        | 62px height, 16px radius, 1px border, muted label                         |
| **AlTextField**    | 62px height, 12px radius, 2px border, 12px gap, +91 prefix                |
| **AlOtpInput**     | 60px cells, 10px gap, 12px radius, 22px/500 digits                        |
| **AlQuickAction**  | 110px width, 16×0 padding, 10px gap, 16px radius, 24px icon               |
| **AlField**        | 2px gap, neutral-500 label, 16px/600 value                                |
| **AlStepProgress** | 6px track, 4px segments, 6px gap, 2px radius, white/gray fill             |
| **AlAvatar**       | 46×46 md, neutral-700 bg, 22px icon                                       |

---

## Components Updated (non-breaking)

- **AlCheckbox** — inherits updated radius/motion tokens
- **AlStatusBar** — inherits material/shadow tokens
- **Layout primitives** (AlText, AlHeading, AlStack, AlGrid, AlContainer, AlDivider, AlIconButton) — dedicated ui-preview pages added

---

## Theme Updates Detected

| Token                   | Before                | After (Figma)                           |
| ----------------------- | --------------------- | --------------------------------------- |
| `--al-radius-sm`        | 6px                   | **8px**                                 |
| `--al-radius-md`        | 10px                  | **12px**                                |
| `--al-radius-lg`        | 14px                  | **16px**                                |
| `--al-elevation-raised` | `rgba(10,10,10,0.12)` | **`rgba(0,0,0,0.35)`**                  |
| `--al-shadow-nav`       | (missing)             | **`0 10px 28px -4px rgba(0,0,0,0.45)`** |
| `--al-glow-protected`   | (missing)             | **`0 0 26px rgba(31,162,74,0.55)`**     |
| `--al-glow-attention`   | (missing)             | **`0 0 26px rgba(245,166,35,0.55)`**    |
| `--al-glow-emergency`   | (missing)             | **`0 0 26px rgba(229,52,42,0.6)`**      |
| `--al-motion-standard`  | 220ms                 | **250ms**                               |
| Component vars          | (missing)             | **`--al-comp-*` dimension tokens**      |

New component dimension tokens live in `packages/design-system/src/tokens/spacing.ts` and `theme.css`.

---

## Icon Updates

- **Removed:** Font Awesome (`@fortawesome/*`) from `@autolokate/icons`
- **Added:** 19 Figma-exported SVG icons in `packages/icons/src/svg/`
- **Generated:** React components in `packages/icons/src/generated/`
- **Stroke:** 2px at 24×24, `currentColor` inheritance
- **AlIcon:** routes through `iconComponentMap` to generated SVG components

Icons: `house`, `store`, `users`, `circle-user`, `scan-line`, `square-parking`, `receipt-text`, `shield-check`, `chevron-down`, `bell`, `car`, `phone`, `arrow-left`, `plus`, `user`, `map-pin`, `circle-check`, `circle-x`, `credit-card`

---

## Pixel Parity Checklist

| Check                                       | Status                             |
| ------------------------------------------- | ---------------------------------- |
| Spacing / padding                           | ✅ Component `--al-comp-*` tokens  |
| Radius                                      | ✅ sm/md/lg aligned                |
| Typography (component-level)                | ✅ Button, Field, OTP, labels      |
| Icon size / stroke                          | ✅ 2px SVG, 24px default           |
| Borders                                     | ✅ 1px Input, 2px TextField        |
| Shadows / elevation                         | ✅ raised, nav, glow tokens        |
| States (hover/press/focus/disabled/loading) | ✅ Preserved in CSS                |
| BottomNav active/inactive                   | ✅ Label hidden when inactive      |
| StepProgress segment fill                   | ✅ `segment <= step` → white       |
| Responsive 320–1024                         | ✅ ui-preview viewports            |
| Theme light/dark preview                    | ✅ Dedicated section per component |
| Build / lint                                | ✅ 11/11                           |
| Font Awesome removed                        | ✅                                 |

---

## ui-preview Updates (v3.1.0)

Each component page includes:

- Overview
- Variants
- States
- **Theme preview** (light/dark side-by-side + focused theme)
- **Responsive preview** (320, 360, 375, 390, 414, 768, 1024)
- Accessibility preview
- Usage examples
- Props documentation

Added **Core · Layout** section with 7 dedicated pages.

---

## Remaining Mismatches

| Item                     | Notes                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Typography family**    | Figma component library uses **Inter**; code uses **Manrope** globally. Pixel sizes match; glyph shapes may differ slightly. |
| **AlPlanCardW**          | Published in Figma; not yet implemented in code (pre-audit gap).                                                             |
| **AlCheckbox**           | Not re-measured cell-by-cell in this pass; inherits tokens only.                                                             |
| **AlStatusBar**          | Device chrome mock; not in Figma component set as interactive DS component.                                                  |
| **Visual QA in browser** | Automated build passes; manual screenshot diff against Figma frames recommended for final sign-off.                          |
| **Glow tokens**          | Defined but not yet applied to live component variants (reserved for signal surfaces).                                       |

---

## QA Pass

- ✅ TypeScript build — no errors
- ✅ ESLint — no errors across 11 packages
- ✅ No Font Awesome runtime imports in source
- ✅ React `exactOptionalPropertyTypes` satisfied in AlIcon
- ⚠️ Runtime console — not exercised in CI; verify via `pnpm --filter @autolokate/ui-preview dev`

---

## Files Changed (key paths)

```
packages/design-system/src/tokens/spacing.ts
packages/design-system/src/tokens/motion.ts
packages/design-system/src/theme.css
packages/icons/src/AlIcon.tsx
packages/icons/src/generated/*
packages/ui/src/components/**/**.css
packages/ui/src/components/navigation/BottomNav/BottomNav.tsx
packages/ui/src/components/primitives/StepProgress/*
apps/ui-preview/src/docs/components/CoreComponentShowcase.tsx
apps/ui-preview/src/docs/pages/core/LayoutComponentPage.tsx
```

---

## Next Steps (if pursuing 100% sign-off)

1. Side-by-side screenshot diff at 390px dark theme against Figma component frames
2. Switch component-library preview font to Inter if glyph parity is required
3. Implement `AlPlanCardW` from Figma
4. Wire glow elevation tokens to signal component variants
