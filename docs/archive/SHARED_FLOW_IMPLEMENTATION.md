# Shared Flow Implementation — Phase 4

**App:** `@autolokate/qr`  
**Scope:** Shared · Auth + Legal (R01–R06)  
**Status:** Awaiting review  
**Figma:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/Autolokate-%C2%B7-Consumer-App?node-id=5-2)

---

## Summary

Phase 4 delivers **six presentational screens** for the shared onboarding pipeline. Each screen supports view states (`default`, `loading`, `error`, `empty`, `success`) with **no business logic**, **no API integration**, and **no routing**. All UI uses `@autolokate/ui`, `@autolokate/icons`, and `@autolokate/design-system` only.

**Preview:** `pnpm --filter @autolokate/qr dev`

---

## Architecture updates (pre-Phase 4)

| Change | Detail |
|--------|--------|
| Screens under features | `features/shared-auth/screens/r01–r05`, `features/shared-legal/screens/r06` |
| Config-driven registry | `flow/registry/config/*.config.ts` + `build-registry.ts` |
| Routes + StepId | Every route in `sharedFlowRoutes` has required `stepId` |
| Composition promotion doc | `docs/COMPOSITION_PROMOTION_CANDIDATES.md` |
| `apps/qr-flow` | Placeholder retained |

---

## Screen inventory

| Screen | Step ID | Route | Feature folder | Figma reference |
|--------|---------|-------|----------------|-----------------|
| **R01 · Vehicle Number** | `shared.vehicle-number` | `/shared/r01-vehicle-number` | `features/shared-auth/screens/r01-vehicle-number` | INPUTS · Plate · DS `487:36` |
| **R02 · Vehicle Details** | `shared.vehicle-details` | `/shared/r02-vehicle-details` | `features/shared-auth/screens/r02-vehicle-details` | `170:71` Confirm vehicle · RC `170:79` |
| **R03 · Mobile Number** | `shared.mobile` | `/shared/r03-mobile-number` | `features/shared-auth/screens/r03-mobile-number` | INPUTS · Mobile · DS `487:36` |
| **R04 · OTP Verification** | `shared.otp` | `/shared/r04-otp-verification` | `features/shared-auth/screens/r04-otp-verification` | INPUTS · OTP · DS `487:36` |
| **R05 · Account Creation** | `shared.account` | `/shared/r05-account-creation` | `features/shared-auth/screens/r05-account-creation` | INPUTS · Full name · DS `487:36` |
| **R06 · Legal Consent** | `shared.legal` | `/shared/r06-legal-consent` | `features/shared-legal/screens/r06-legal-consent` | Legal · Terms & privacy |

### View states per screen

| Screen | default | loading | error | empty | success |
|--------|---------|---------|-------|-------|---------|
| R01 | ✓ | ✓ | ✓ | ✓ | ✓ |
| R02 | ✓ | ✓ | ✓ | ✓ | ✓ |
| R03 | ✓ | ✓ | ✓ | ✓ | ✓ |
| R04 | ✓ | ✓ | ✓ | ✓ | ✓ |
| R05 | ✓ | ✓ | ✓ | ✓ | ✓ |
| R06 | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Reused components (`@autolokate/ui` / `@autolokate/icons`)

| Component | Screens |
|-----------|---------|
| AlStatusBar | All (via shell) |
| AlIconButton | All (via shell) |
| AlHeading | All |
| AlText | All |
| AlStepProgress | All (6-step pipeline) |
| AlButton | All (footer CTA) |
| AlPlateInput | R01 |
| AlVehicleRcCard | R02 |
| AlTextField | R03 |
| AlOtpInput | R04 |
| AlInput | R05 |
| AlCheckbox | R06 |
| AlIcon | R01, R02, R06 |
| AlStack | All |

**No local Button, Input, Chip, or TextField implementations.**

---

## App-level building blocks

| Block | Location | Notes |
|-------|----------|-------|
| OnboardingStepShell | `components/onboarding-step-shell/` | Status bar, header, 6-step progress, footer — AL components only |
| Demo data | `features/shared-auth/data/demo-data.ts` | Static display values only |

---

## New composition candidates

| Candidate | Observed in | Promote to `@autolokate/ui`? |
|-----------|-------------|------------------------------|
| **OnboardingStepShell** | R01–R06 | Review after second flow family |
| **LegalConsentBlock** | R06 | Yes — already flagged in promotion doc |
| **VehicleSummary** | R02 | Yes — AlVehicleRcCard + confirm pattern |
| **FormFieldStack** | R01, R03–R05 | No — covered by ui-preview composition |

See [`COMPOSITION_PROMOTION_CANDIDATES.md`](COMPOSITION_PROMOTION_CANDIDATES.md).

---

## Responsive QA

Verified via dev preview viewport controls at:

| Width | Device class |
|-------|--------------|
| 320px | Small phone |
| 360px | Android baseline |
| 375px | iPhone SE / mini |
| 390px | iPhone 14 |
| 414px | iPhone Plus |

**Layout constraints:**
- Shell max-width 393px (24.5625rem) — Figma frame width
- 16px horizontal padding (`--al-space-lg`)
- Full-width primary CTA in footer
- RC card and inputs stretch to container width
- Safe-area inset on footer

**Manual QA:** Run dev server → select each screen → toggle states → cycle viewport widths.

---

## Figma references used

| Node / section | Used for |
|----------------|----------|
| `5:2` | Flow index · Consumer App |
| `487:36` · INPUTS row | R01 plate, R03 mobile, R04 OTP, R05 name |
| `170:71` · Confirm vehicle | R02 screen structure |
| `170:79` · RC card | R02 AlVehicleRcCard layout |
| `83:38` · AlField | R02 field grid typography |
| DS dark `483:37` / light `501:37` | Semantic tokens via theme.css |

Typography and dimensions follow RC1 audits: [`VEHICLE_INFO_AUDIT.md`](VEHICLE_INFO_AUDIT.md), ui-preview form section composition.

---

## Explicitly out of scope

- Flow engine runtime
- react-router wiring
- API / auth integration
- Payment, B2B, B2B2C, Emergency screens
- Business logic and form validation

---

## Build verification

```bash
pnpm --filter @autolokate/qr build   # ✓
pnpm --filter @autolokate/qr lint    # ✓
pnpm --filter @autolokate/qr dev     # Screen preview
```

---

## Awaiting review

Phase 4 is complete for shared screens. Next phase (after approval): flow engine implementation, router wiring, and API integration.
