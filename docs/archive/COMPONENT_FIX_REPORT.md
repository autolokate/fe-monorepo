# Component Fix Report — Phase 2.6

**Trigger:** Composition validation blockers — AlPlanCard + Vehicle Info  
**Method:** Direct Figma re-scan (no prior implementation used as reference)  
**Date:** 2026-06-17  
**Build:** 11/11 · **Lint:** 11/11

---

## Summary

| Component       | Status | Action                             |
| --------------- | ------ | ---------------------------------- |
| AlPlanCard      | Fixed  | Full rewrite for Figma AlPlanCardW |
| AlVehicleRcCard | Added  | New core component for R05 RC card |
| AlField         | Fixed  | Value typography line-height       |
| AlChip          | Fixed  | Icon-only mode for verified chip   |

Preview compositions updated to consume fixed core APIs only — no preview CSS patches.

---

## AlPlanCard

**Figma:** `231:80` · screen `232:102`

### Root causes

1. Implemented as minimal DS placeholder (name/price/features only)
2. Missing screen-level variants: badge, includes pill, addon, selected tick
3. Wrong typography tokens (22px title, 500-weight features)
4. No interactive states (hover, selected)

### Changes

```
packages/ui/src/components/primitives/PlanCard/
  PlanCard.tsx    — badge, includesLabel, addon, selected, onSelect
  PlanCard.css    — Figma dimensions, states, addon section
  PlanCard.types.ts — expanded props

packages/design-system/src/tokens/spacing.ts — plan card tokens
packages/design-system/src/tokens/colors.ts   — plan badge gradient
packages/design-system/src/theme.css          — runtime CSS vars
```

### Before → After

- Before: 270px card, 3 text blocks, generic border
- After: Figma Secure tier with MOST POPULAR badge, includes pill, 5 features, rider addon, selected tick, hover/selected borders

---

## AlVehicleRcCard (new)

**Figma:** `170:79` inside `170:71` R05 · Confirm vehicle

### Root causes

1. Vehicle info composition invented wrong pattern (not in Figma)
2. No core component for RC card shell
3. Dependent AlField + AlChip issues (see below)

### Changes

```
packages/ui/src/components/primitives/VehicleRcCard/
  VehicleRcCard.tsx
  VehicleRcCard.css
  VehicleRcCard.types.ts
  index.ts
```

Exported from `@autolokate/ui` as `AlVehicleRcCard`.

### API

```tsx
<AlVehicleRcCard
  registrationNumber="MH 12 AB 3456"
  verifiedLabel="Verified"
  verifiedIcon={<AlIcon name="circle-check" size={14} />}
  fields={[{ label: 'Owner', value: '...' }, ...]}
/>
```

---

## AlField

**Figma:** `83:38`

### Root cause

Value used `--al-comp-button-line-height` (20px) instead of Figma `style_LEJAR2` (24px).

### Change

`Field.css` — value now uses `--al-text-body-size` + `--al-text-body-line-height` (16px / 24px).

---

## AlChip

**Figma:** Verified chip in RC card header (`331:39`)

### Root causes

1. Always rendered status dot even when icon provided
2. Icon container 20px vs Figma 14px

### Changes

- `Chip.tsx` — dot OR icon, not both
- `Chip.css` — icon container 14×14

---

## Composition updates (data only)

| File                         | Change                                  |
| ---------------------------- | --------------------------------------- |
| `PlanCardComposition.tsx`    | Secure tier Figma data + selected state |
| `VehicleInfoComposition.tsx` | Uses `AlVehicleRcCard` + R05 field data |
| `metadata.ts`                | Updated Figma references                |

---

## Visual QA checklist

| Test            | AlPlanCard         | Vehicle RC    |
| --------------- | ------------------ | ------------- |
| Overflow        | Pass               | Pass          |
| Wrapping        | Pass               | Pass          |
| Clipping        | Pass               | Pass          |
| Icon alignment  | Pass               | Pass          |
| Touch targets   | Pass (card button) | N/A (display) |
| Theme switching | Pass               | Pass          |
| 320–414px       | Pass               | Pass          |

---

## Reports

- [PLAN_CARD_AUDIT.md](./PLAN_CARD_AUDIT.md)
- [VEHICLE_INFO_AUDIT.md](./VEHICLE_INFO_AUDIT.md)
