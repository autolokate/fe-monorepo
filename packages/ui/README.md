# @autolokate/ui

Production-ready Autolokate component framework for all web apps.

## Setup

```tsx
import '@autolokate/design-system/theme.css';
```

Use only token-driven values from `@autolokate/design-system`.

## Core Principles

- All reusable components use the `Al` prefix (`AlButton`, `AlCard`, `AlText`, ...).
- Components support light and dark themes via semantic tokens.
- Accessibility is first class: keyboard focus, labels, roles, and touch targets.
- Motion uses design-system motion tokens (`--al-motion-*`).

## Component Inventory

- Typography: `AlText`, `AlHeading`
- Buttons: `AlButton`, `AlIconButton`
- Layout: `AlContainer`, `AlGrid`, `AlStack`, `AlSection`, `AlCard`, `AlPageHeader`
- Forms: `AlInput`, `AlSearchInput`, `AlSelect`, `AlOTPInput`, `AlCheckbox`, `AlSwitch`, `AlRadio`
- Feedback: `AlAlert`, `AlToastProvider` + `useToast`, `AlSnackbar`, `AlSkeleton`, `AlEmptyState`, `AlErrorState`
- Navigation: `AlNavbar`, `AlSidebar`, `AlTabs`, `AlBottomNav`
- Overlay: `AlModal`, `AlDrawer`, `AlSheet`, `AlPopover`, `AlTooltip`
- Data display: `AlBadge`, `AlChip`, `AlAvatar`, `AlStatusPill`, `AlProgress`, `AlDivider`
- Domain: `AlVehicleCard`, `AlPlanCard`, `AlEmergencyCard`, `AlStatCard`, `AlQRCard`

## Usage Examples

```tsx
import { AlButton, AlCard, AlHeading, AlInput, AlText } from '@autolokate/ui';

export function Example() {
  return (
    <AlCard variant="elevated" title="Activate protection">
      <AlHeading variant="h3">Vehicle onboarding</AlHeading>
      <AlText tone="muted">All UI styles come from design-system tokens.</AlText>
      <AlInput
        label="Vehicle registration"
        placeholder="MH 12 AB 1234"
        helperText="Used for Vahan lookup"
      />
      <AlButton variant="primary" size="lg">
        Continue
      </AlButton>
    </AlCard>
  );
}
```

## Theme Rules

- Do not use hardcoded colors inside app code.
- Prefer semantic tokens (`--al-color-*`) over primitive values.
- Use component variants and sizes instead of custom one-off CSS.
- Keep custom animations aligned with `--al-motion-*` durations/easing.
