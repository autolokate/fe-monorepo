# Component Parity Audit

**Date:** 2026-06-19  
**Source:** `@autolokate/ui`, `@autolokate/icons`, `@autolokate/design-system`  
**Figma reference:** `FtHCUnE0HH586PtG5yJyG0`

This audit maps Figma component instances to their code counterparts, flags any props used in code that are absent from Figma, and records known mismatches.

---

## Legend

- ✅ — Component maps correctly to Figma; props/states verified
- ◑ — Partial: component maps, but one or more prop states differ from Figma
- ⚠️ — Used in code but not present in Figma, or Figma instance has no code equivalent
- ❌ — Component absent from code; Figma instance not implemented

---

## Auth Shell Components

| Figma instance             | Code component               | File                                          | Status | Notes                                                                         |
| -------------------------- | ---------------------------- | --------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `AuthStepShell` (implicit) | `AuthStepShell`              | `auth-step-shell/AuthStepShell.tsx`           | ✅     | 3-segment progress bar; mobile/otp/name body variants                         |
| `InlineConsentBlock`       | `InlineConsentBlock`         | `inline-consent-block/InlineConsentBlock.tsx` | ✅     | Checkbox + two-line T&C/Privacy link text                                     |
| `TrustRow`                 | `TrustRow`                   | `trust-row/TrustRow.tsx`                      | ✅     | Shield-check icon + caption ✓                                                 |
| `AlOfflineChip`            | `AlOfflineChip`              | `@autolokate/ui`                              | ✅     | Positioned via `.ob-auth-shell__offline-chip` (absolute, top:52px, z-index:2) |
| `AlOtpInput`               | `AlOtpInput`                 | `@autolokate/ui`                              | ✅     | 6-cell OTP; `--error` class applies amber border                              |
| `AlSmsFallback`            | `AlSmsFallback`              | `@autolokate/ui`                              | ✅     | "Didn't get it on WhatsApp? Get it via SMS"                                   |
| `AlButton/Primary` (CTA)   | `AlButton variant="primary"` | `@autolokate/ui`                              | ✅     | Full-width fluid footer ✓                                                     |
| `AlInput` (mobile field)   | `AlInput`                    | `@autolokate/ui`                              | ✅     | `+91` prefix, numeric keyboard, maxLength=10                                  |
| `AlInput` (name field)     | `AlInput`                    | `@autolokate/ui`                              | ✅     | text keyboard, A3 screen                                                      |

---

## Purchase Shell Components

| Figma instance                            | Code component                            | File                                           | Status | Notes                                                                                        |
| ----------------------------------------- | ----------------------------------------- | ---------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `PurchaseStepShell` (implicit)            | `AuthStepShell`                           | `auth-step-shell/AuthStepShell.tsx`            | ✅     | Reused for purchase steps; separate progress config                                          |
| `AlVehicleRcCard`                         | `AlVehicleRcCard`                         | `@autolokate/ui`                               | ✅     | R05 confirm vehicle ✓                                                                        |
| `AlPlanCard`                              | `AlPlanCard`                              | `@autolokate/ui`                               | ✅     | R06 chooser; 4 plan variants ✓                                                               |
| `AlPlanCardW/Activation`                  | `PlanActivationCard`                      | `welcome-activation/PlanActivationCard.tsx`    | ✅     | B2B2C/Prepaid plan display ✓                                                                 |
| `AlPartnerCard`                           | `PartnerActivationCard`                   | `welcome-activation/PartnerActivationCard.tsx` | ✅     | Partner logo initials + name + subtitle ✓                                                    |
| `AlRiderCoverCard`                        | `AlRiderCoverCard`                        | `@autolokate/ui`                               | ✅     | R07 rider cards; enabled/disabled states ✓                                                   |
| `OrderSummaryCard`                        | `OrderSummaryCard`                        | `compositions/order-summary/`                  | ✅     | R08/R08b/R08c                                                                                |
| `PromoCodeField`                          | `PromoCodeField`                          | `compositions/promo-code-field/`               | ◑      | Present in R08/R08b/R08c; also shown in R08d (no-rider) where Figma `648:2053` hides it — P2 |
| `PromoCodeField variant="invalid"`        | `PromoCodeField variant="invalid"`        | `compositions/promo-code-field/`               | ✅     | R08c ✓                                                                                       |
| `PurchaseStatusShell`                     | `PurchaseStatusShell`                     | `compositions/purchase-status/`                | ✅     | R09/R09b/R10/R10b/R10c                                                                       |
| `PurchaseStatusShell ambient="attention"` | `PurchaseStatusShell ambient="attention"` | `compositions/purchase-status/`                | ✅     | R10b/R10c amber halo ✓                                                                       |
| `AlButton/Primary`                        | `AlButton variant="primary"`              | `@autolokate/ui`                               | ✅     | All screens                                                                                  |
| `AlButton/Secondary` (Skip)               | `AlButton variant="secondary"`            | `@autolokate/ui`                               | ✅     | R07 skip ✓                                                                                   |

---

## Emergency Shell Components

| Figma instance                    | Code component                        | File                                               | Status | Notes                                                                       |
| --------------------------------- | ------------------------------------- | -------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `FlowStepShell phase="emergency"` | `FlowStepShell`                       | `flow-step-shell/FlowStepShell.tsx`                | ✅     | `captureProgress` prop for E1/E2/E3 sub-flow; `ob-shell--emergency` class ✓ |
| `EmptyStateHero`                  | `EmptyStateHero`                      | `compositions/empty-state-hero/EmptyStateHero.tsx` | ✅     | `ob-state-panel` wrapper; flex:1 + justify-content:center; children slot ✓  |
| `AlIcon name="users"`             | `AlIcon name="users"`                 | `@autolokate/icons`                                | ✅     | E0 hero icon ✓                                                              |
| `AlIcon name="shield-check"`      | `AlIcon name="shield-check"`          | `@autolokate/icons`                                | ✅     | E0 trust row ✓                                                              |
| Trust row                         | `ob-emergency-trust-row`              | `emergency.css`                                    | ✅     | Now inside EmptyStateHero children (this session fix)                       |
| OTP description + Change link     | `.ob-emergency-otp-desc`              | `emergency.css`                                    | ✅     | flex space-between; Change underlined button ✓                              |
| Rider prompt offline desc         | `getRiderPromptOfflineDescription()`  | `emergency-limits.ts`                              | ✅     | "We'll set this up when you're back online" ✓                               |
| `AlOfflineChip` (R0)              | `AlOfflineChip` via `headerAccessory` | `@autolokate/ui`                                   | ✅     | Positioned top-center via `.ob-shell__header-accessory` ✓                   |
| Contact summary list              | `E09ContactsSummaryScreen`            | `screens/e09`                                      | ✅     | Max-reached state ✓                                                         |
| Rider summary list                | `E10RidersSummaryScreen`              | `screens/e10`                                      | ✅     | Max-reached state ✓                                                         |
| Relation grid                     | `AlRelationGrid`                      | `@autolokate/ui`                                   | ✅     | E3/R3 contact/rider name+relation ✓                                         |

---

## B2B2C / Prepaid Shell Components

| Figma instance                                  | Code component                              | File                                                         | Status | Notes                                                                               |
| ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------- |
| `WelcomeActivationShell`                        | `WelcomeActivationShell`                    | `compositions/welcome-activation/WelcomeActivationShell.tsx` | ✅     | Title, desc, footer, back; shared B2B2C + Prepaid                                   |
| `PartnerActivationCard`                         | `PartnerActivationCard`                     | `welcome-activation/PartnerActivationCard.tsx`               | ✅     | initials, name, subtitle ✓                                                          |
| `PartnerActivationCardSkeleton`                 | `PartnerActivationCardSkeleton`             | `welcome-activation/`                                        | ✅     | Loading state: rectangular skeletons ✓                                              |
| `PlanActivationCard`                            | `PlanActivationCard`                        | `welcome-activation/PlanActivationCard.tsx`                  | ✅     | planName, priceDisplay, features, riderRowLabel ✓                                   |
| `PlanActivationCardSkeleton`                    | `PlanActivationCardSkeleton`                | `welcome-activation/`                                        | ✅     | 5 skeleton rects ✓                                                                  |
| `WelcomeActivationErrorPanel`                   | `WelcomeActivationErrorPanel`               | `welcome-activation/`                                        | ✅     | Amber circle icon, "Couldn't load your plan", desc ✓                                |
| Section label "You got this from"               | `ob-welcome-shell__section-label`           | `welcome-activation.css`                                     | ✅     | B2B2C label ✓                                                                       |
| Section label "Covered by"                      | `ob-welcome-shell__section-label` (Prepaid) | `PrepaidWelcomeScreen.tsx`                                   | ✅     | Hardcoded "Covered by" in loading state; `config.sectionLabel` in default ✓         |
| `ob-welcome-shell__partner-section--top-offset` | Prepaid modifier                            | `PrepaidWelcomeScreen.tsx`                                   | ✅     | Figma `411:38` shows 8px extra top padding for partner section — modifier present ✓ |

---

## PWA Components

| Figma instance              | Code component                         | Status | Notes                                               |
| --------------------------- | -------------------------------------- | ------ | --------------------------------------------------- |
| `AlScannedVehicleCard`      | `AlScannedVehicleCard`                 | ✅     | Signed off V4                                       |
| `AlSosHoldButton`           | `AlSosHoldButton`                      | ✅     | Hold-to-send interaction; tokens fixed this session |
| `AlStatusTracker`           | `AlStatusTracker`                      | ✅     | Checking/calling/resolved states ✓                  |
| `AlDispatchTimeline`        | `AlDispatchTimeline`                   | ✅     | Signed off V4                                       |
| `AlIncidentStatusHero`      | `AlIncidentStatusHero`                 | ✅     | Received/dispatched/resolved variants ✓             |
| `AlPhotoGrid`               | `AlPhotoGrid`                          | ✅     | Two-photo capture grid ✓                            |
| `AlScenePhotoCard`          | `AlScenePhotoCard`                     | ✅     | Scene photo + status ✓                              |
| Location chip               | `.pwa-emergency-screen__location-chip` | ✅     | Now fully tokenised ✓                               |
| `PwaVerifyShell`            | `PwaVerifyShell`                       | ✅     | 3-step sub-shell (mobile/OTP/name) ✓                |
| `AlVehicleConfirmationCard` | `AlVehicleConfirmationCard`            | ✅     | Park Me confirm step ✓                              |

---

## Icon Usage Audit

All icons below were confirmed present in `@autolokate/icons`. None are custom SVGs.

| Screen             | Icon name                   | Verified |
| ------------------ | --------------------------- | -------- |
| E0 hero            | `users` 48px                | ✅       |
| E0 trust           | `shield-check` 16px         | ✅       |
| R0 offline chip    | `wifi-off` (internal)       | ✅       |
| A1 trust row       | `shield-check`              | ✅       |
| OTP error          | (border colour change only) | ✅       |
| Auth shell back    | `arrow-left` 24px           | ✅       |
| Purchase flow back | `arrow-left` 24px           | ✅       |

No invented or custom icons detected across any active screen.

---

## Duplicate Component Audit

All checked — no duplicate implementations found:

| Concern                     | Finding                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multiple Button components  | Only `AlButton` from `@autolokate/ui` used. No local `<button>` raw elements in flow UIs.                                                                   |
| Multiple Input components   | Only `AlInput` from `@autolokate/ui` used. OTP uses `AlOtpInput`.                                                                                           |
| Multiple card layouts       | `AlPlanCard` (chooser), `PlanActivationCard` (activation) are separate, non-overlapping.                                                                    |
| Multiple shell layouts      | `AuthStepShell` (auth/purchase), `FlowStepShell` (emergency), `WelcomeActivationShell` (B2B2C/Prepaid), `PwaVerifyShell` (PWA verify). No overlap in usage. |
| Multiple offline indicators | `AlOfflineChip` only. Confirmed one usage per screen at most.                                                                                               |
