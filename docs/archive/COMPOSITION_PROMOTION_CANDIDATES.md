# Composition Promotion Candidates

**App:** `@autolokate/qr`  
**Updated:** Phase 5 purchase flow  
**Rule:** Implement in `apps/qr/src/components/compositions/` first. Promote to `@autolokate/ui` only after stable reuse across 2+ flows.

---

## Flagged for core promotion (`promoteToCore: true`)

| ID                          | Description            | DS building blocks                         | Used in flows              | Figma reference           |
| --------------------------- | ---------------------- | ------------------------------------------ | -------------------------- | ------------------------- |
| **VehicleSummary**          | RC card + confirm CTA  | AlVehicleRcCard, AlField, AlChip, AlButton | All QR flows               | 170:79 · RC card          |
| **PlanSummary**             | Selected plan recap    | AlPlanCard, AlStack, AlText, AlButton      | purchase, b2b2c, emergency | 231:80 · AlPlanCardW      |
| **EmergencyContactSummary** | Contact rows + edit    | AlAvatar, AlField, AlQuickAction, AlStack  | emergency                  | Emergency contact pattern |
| **LegalConsentBlock**       | Checkbox + legal links | AlCheckbox, AlText, AlButton               | All flows                  | R06 · Legal consent       |

---

## Phase 4 observations (screen shell)

| ID                      | Description                                      | Observed in  | Promote?                           |
| ----------------------- | ------------------------------------------------ | ------------ | ---------------------------------- |
| **OnboardingStepShell** | Status bar + header + step progress + footer CTA | R01–R06      | Review after 2+ flow families      |
| **FormFieldStack**      | Vertical input stack                             | R01, R03–R05 | No — ui-preview composition exists |
| **FlowProgressHeader**  | Back + AlStepProgress + title                    | R01–R06      | No — screen shell covers this      |

---

## Phase 5 observations (purchase)

| ID                    | Description                               | Observed in | Promote?              |
| --------------------- | ----------------------------------------- | ----------- | --------------------- |
| **PlanCarousel**      | Horizontal AlPlanCard scroll + screen CTA | P01         | Yes                   |
| **CheckoutSummary**   | AlField lines + divider + total           | P04         | Yes                   |
| **RiderSelectorRow**  | AlToggle + AlChip count                   | P03         | Yes                   |
| **PurchaseStepShell** | Purchase-phase chrome (6-step progress)   | P01–P06     | Review after 2+ flows |
| **PaymentStatusHero** | Centered status / success hero            | P05, P06    | No                    |

---

## Not promoted (single-flow or screen-specific)

| ID                | Reason                              |
| ----------------- | ----------------------------------- |
| PaymentSummary    | Purchase flow only                  |
| OwnerContactCard  | Display pattern, not yet multi-flow |
| ActivationSuccess | Confirmation screens vary by flow   |

---

## Promotion checklist

Before moving to `@autolokate/ui`:

1. Used in **2 or more** product flows with identical API
2. Contains **only** `@autolokate/ui` / `@autolokate/icons` / tokens — no app CSS leaks
3. Documented in ui-preview with variants and states
4. Figma parity verified in light + dark
5. Accessibility review pass (focus, labels, touch targets)

---

## Source of truth

Machine-readable inventory: `apps/qr/src/components/compositions/inventory.ts`  
Promotion filter: `corePromotionCandidates` export
