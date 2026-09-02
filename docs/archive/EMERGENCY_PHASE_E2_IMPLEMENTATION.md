# Emergency + Rider — Phase E2 Implementation

**App:** `@autolokate/qr`  
**Date:** 2026-06-18  
**Figma:** Section `371:1275` · Consumer · Emergency + Rider · READY FOR DEV  
**Inputs:** [EMERGENCY_IMPLEMENTATION_BLUEPRINT.md](./EMERGENCY_IMPLEMENTATION_BLUEPRINT.md) · [EMERGENCY_FOUNDATION_ALIGNMENT_REPORT.md](./EMERGENCY_FOUNDATION_ALIGNMENT_REPORT.md)

---

## Executive summary

Phase E2 delivers **10 Figma-aligned screens** (R0–R4, E0–E3, E5) with **required state variants**, **plan-aware limits**, **DS component promotions**, and **full journey orchestration** from emergency entry through Completed.

| Area                                    | Status                                  |
| --------------------------------------- | --------------------------------------- |
| Screens R0–R4, E0–E3, E5                | ✅                                      |
| State variants (R0, R3, E3, E5, R4 max) | ✅                                      |
| `AlRelationGrid` in `@autolokate/ui`    | ✅                                      |
| `AlContactCard` in `@autolokate/ui`     | ✅                                      |
| Plan limits from `selectedPlanId`       | ✅                                      |
| OTP / mobile validation (shared auth)   | ✅                                      |
| Build                                   | ✅ `pnpm --filter @autolokate/qr build` |

---

## 1. Screen inventory

| Dev ID | Figma             | Route                                 | Screen component           | Figma node |
| ------ | ----------------- | ------------------------------------- | -------------------------- | ---------- |
| E01    | R0 Rider prompt   | `/journey/emergency/rider-prompt`     | `E01RiderPromptScreen`     | `375:37`   |
| E02    | R1 Rider mobile   | `/journey/emergency/rider-mobile`     | `E02RiderMobileScreen`     | `789:2064` |
| E03    | R2 Rider OTP      | `/journey/emergency/rider-otp`        | `E03RiderOtpScreen`        | `789:2109` |
| E04    | R3 Rider name     | `/journey/emergency/rider-name`       | `E04RiderNameScreen`       | `374:71`   |
| E10    | R4 Riders added   | `/journey/emergency/riders-summary`   | `E10RidersSummaryScreen`   | `822:1980` |
| E05    | E0 No contacts    | `/journey/emergency/contacts-empty`   | `E05ContactsEmptyScreen`   | `373:37`   |
| E06    | E1 Contact mobile | `/journey/emergency/contact-mobile`   | `E06ContactMobileScreen`   | `789:1982` |
| E07    | E2 Contact OTP    | `/journey/emergency/contact-otp`      | `E07ContactOtpScreen`      | `789:2027` |
| E08    | E3 Contact name   | `/journey/emergency/contact-name`     | `E08ContactNameScreen`     | `371:1276` |
| E09    | E5 Contacts added | `/journey/emergency/contacts-summary` | `E09ContactsSummaryScreen` | `373:64`   |

**Shared:** `EmergencyOtpScreen` — R2 + E2 OTP block.

---

## 2. State inventory

| Screen | Figma variants                              | Implementation                                                                 |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------ |
| **R0** | default · loading · error · offline         | `viewState` prop + route orchestration (`navigator.onLine`, load timer, retry) |
| **R1** | default · error · offline                   | `mobileState` + `isValidMobile`                                                |
| **R2** | default · error · verifying · network-error | `otpState` + shared auth OTP helpers                                           |
| **R3** | default · disabled · submitting · error     | `formState` + footer helper / warning copy                                     |
| **R4** | 1-of-2 · max 2                              | Dynamic via `getRidersSummaryDescription` + `canAddRider`                      |
| **E0** | default                                     | Plan-aware description                                                         |
| **E1** | default · error · offline                   | Same as R1                                                                     |
| **E2** | default · error · verifying · network-error | Same as R2                                                                     |
| **E3** | default · disabled                          | Invalid form → disabled CTA + _"Add a name to continue"_                       |
| **E5** | under max · max reached                     | `getContactsSummaryDescription` + `getContactsMaxReachedMessage`               |

### State → UI signals

| Signal          | Component                                                |
| --------------- | -------------------------------------------------------- |
| Loading CTA     | `AlButton` `loading` via `FlowStepShell` `footerLoading` |
| Disabled CTA    | `footerDisabled`                                         |
| Disabled helper | `footerHelperText` (muted)                               |
| Save error      | `footerHelperText` (warning)                             |
| Offline (R0)    | `AlOfflineChip` in `headerAccessory`                     |
| Offline (R1/E1) | `AlTextField` helper + disabled field                    |
| OTP error       | `AlOtpInput` error + inline message                      |
| Max reached     | Hidden add row + centered max message                    |

---

## 3. Promotion decisions

| Figma component          | Package export                    | Decision       | Rationale                                                |
| ------------------------ | --------------------------------- | -------------- | -------------------------------------------------------- |
| **AlRelationGrid**       | `@autolokate/ui` `AlRelationGrid` | **Promoted**   | Used on R3 + E3 (2 screens)                              |
| **AlContactCard**        | `@autolokate/ui` `AlContactCard`  | **Promoted**   | Used on E5 + R4 (2 screens); Figma parity                |
| **AlOfflineChip**        | Onboarding composition            | **Kept local** | Auth A1 + R0; not promoted in E2                         |
| **RelationshipSelector** | Onboarding wrapper                | **Retained**   | Maps emergency `RELATIONSHIP_OPTIONS` → `AlRelationGrid` |
| **EmergencyContactRow**  | Onboarding wrapper                | **Retained**   | Maps contact/rider → `AlContactCard` + `AlAvatar`        |
| **AddContactRow**        | Onboarding                        | **Kept local** | Emergency-only dashed CTA row                            |

### New `@autolokate/ui` files

```
packages/ui/src/components/forms/RelationGrid/
packages/ui/src/components/primitives/ContactCard/
```

---

## 4. Route graph

```mermaid
flowchart TD
  ENTRY[Emergency entry] --> R0{Rider entitlement?}

  R0 -->|No · Safe / riderCount 0| E0
  R0 -->|Add rider| R1 --> R2 --> R3 --> R4
  R0 -->|Skip| E0

  R4 -->|Add another| R1
  R4 -->|Continue| E0

  E0 -->|Picker| E3
  E0 -->|Manual| E1 --> E2 --> E3 --> E5

  E5 -->|Add another · under plan max| E1
  E5 -->|Continue ≥ 1 contact| DONE[/journey/completed]
```

### Entry / exit

| Transition                  | Path                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| Purchase activation handoff | `getEmergencyHandoffPath()` → `/journey/emergency/rider-prompt` (via P06 today) |
| Safe plan                   | R0 redirect → E0                                                                |
| Emergency complete          | E5 Continue → `/journey/completed`                                              |
| R0 back                     | → `/purchase/r10-payment-success`                                               |

---

## 5. Plan limit verification

**Source:** `features/emergency/emergency-limits.ts` · `session.purchase.selectedPlanId`

| Plan    | Max contacts | Min contacts | Rider addon         |
| ------- | ------------ | ------------ | ------------------- |
| Safe    | 1            | 1            | 0 (skip R0–R4)      |
| Secure  | 2            | 1            | 0–2 purchased slots |
| Shield  | 3            | 1            | 0–2 purchased slots |
| Shield+ | 3            | 1            | 0–2 purchased slots |

### Enforcement points

| Surface     | Enforcement                                                |
| ----------- | ---------------------------------------------------------- |
| R0          | `shouldEnterRiderPrompt(planId, riderCount)` → redirect E0 |
| E0 copy     | `getContactsEmptyDescription(planId)`                      |
| E5 subtitle | `getContactsSummaryDescription(count, planId)`             |
| E5 add row  | `canAddEmergencyContact(count, planId)` in screen + route  |
| E5 Continue | Disabled when `count < minEmergencyContacts`               |
| E5 max      | `getContactsMaxReachedMessage(planId)`                     |
| R4 subtitle | `getRidersSummaryDescription(count, planId, riderCount)`   |
| R4 add row  | `canAddRider(count, planId, riderCount)`                   |
| R4 max      | `getRidersMaxReachedMessage(planId, riderCount)`           |

**No hardcoded `3`** remains in screen or route logic.

---

## 6. Responsive QA

All screens use `FlowStepShell` + `step-shell-chrome` (viewport-locked, pinned CTA).

| Width     | Checks                                                                |
| --------- | --------------------------------------------------------------------- |
| **320px** | `AlRelationGrid` tiles wrap (3×2); contact cards stack; OTP cells fit |
| **360px** | Primary Android reference                                             |
| **375px** | Figma reference width                                                 |
| **390px** | No horizontal overflow on OTP                                         |
| **414px** | Frame capped at `24.5625rem`, centered                                |

### Theme QA

| Theme     | Approach                                                                              |
| --------- | ------------------------------------------------------------------------------------- |
| **Dark**  | Figma-authored; semantic tokens via `AlScreenBg protected`                            |
| **Light** | Token swap via `data-theme="light"`; emergency descriptions no longer force lowercase |

**CSS fixes in E2:**

- `.ob-shell--emergency .ob-shell__description { text-transform: none }`
- Contact card / relation grid use `--al-color-*` tokens

---

## 7. Interaction parity

| Interaction                 | Status                                                 |
| --------------------------- | ------------------------------------------------------ |
| All primary CTAs navigate   | ✅                                                     |
| Skip for now (R0)           | ✅ → E0                                                |
| Add another contact / rider | ✅ loops when under max                                |
| OTP resend cooldown         | ✅ `RESEND_COOLDOWN_SECONDS`                           |
| Change number (OTP)         | ✅                                                     |
| Back navigation             | ✅ context-aware per route                             |
| Picker simulation (E0)      | ✅ demo contact → E3                                   |
| Mobile validation           | ✅ `isValidMobile` + `normalizeMobile`                 |
| OTP validation              | ✅ `isValidOtp`, `isExpiredOtp`, wrong/expired/network |
| R0 Try again                | ✅ clears `riderPromptLoadFailed`                      |
| R3 save failure             | ✅ offline → error state                               |

---

## 8. Known gaps

| Gap                         | Severity     | Notes                                                                                                                                                                       |
| --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R10 → Emergency**         | Medium       | `R10PaymentSuccessScreen` has no `onContinue` wired to emergency (purchase flow untouched per scope). Handoff works via **P06** `onContinue` → `getEmergencyHandoffPath()`. |
| **Native contact picker**   | Medium       | E0 uses `demoPickerContact` stub                                                                                                                                            |
| **R0 error trigger**        | Low          | Error state via `session.emergency.riderPromptLoadFailed` — no automatic API failure simulation                                                                             |
| **Figma language switcher** | Low          | Intentionally omitted (product-wide auth decision)                                                                                                                          |
| **Sub-flow step labels**    | Low          | Figma shows 1/3 capture progress; journey bar hidden on hero/summary screens                                                                                                |
| **Completed screen**        | Out of scope | E5 → `/journey/completed` only                                                                                                                                              |

---

## 9. Files changed (summary)

### Added

- `packages/ui/.../RelationGrid/*`
- `packages/ui/.../ContactCard/*`
- `features/emergency/screens/e10-riders-summary/E10RidersSummaryScreen.tsx`

### Updated

- All `e01`–`e09` emergency screens
- `EmergencyRoutes.tsx` — full state orchestration
- `FlowStepShell.tsx` — capture progress, footer helper, offline chip slot
- `emergency-limits.ts` — copy helpers
- `emergency/types.ts` — state types, `riderPromptLoadFailed`
- `RelationshipSelector.tsx` → `AlRelationGrid` wrapper
- `EmergencyContactRow.tsx` → `AlContactCard` wrapper
- `ScreenDevApp.tsx` — E10 + state previews

### Removed

- `journey/emergency/EmergencyRidersSummaryFoundationRoute.tsx` (replaced by E10)

---

## 10. Dev preview

Screen dev app includes emergency screens **E01–E10** with state toggles:

- R0: default / loading / error / offline
- R3: default / submitting / error
- E3: default / disabled (empty name)
- E5: 1 contact vs 3-of-3 max (shield)
- R4: 1 rider vs 2-of-2 max

```bash
pnpm --filter @autolokate/qr dev
```

---

## Verdict

Phase E2 implements Consumer · Emergency + Rider per Figma READY FOR DEV with plan-aware limits, promoted DS primitives, and working journey orchestration. Purchase flow was not modified; wire R10 Continue to emergency in a follow-up if product requires R10 as the sole activation exit.
