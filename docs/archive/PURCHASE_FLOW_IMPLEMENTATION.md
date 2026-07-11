# Purchase Flow Implementation — Phase 5

**App:** `@autolokate/qr`  
**Product area:** Consumer · QR Activation + Purchase  
**Status:** Awaiting review before B2B  
**Figma:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/Autolokate-%C2%B7-Consumer-App?node-id=5-2)

---

## Summary

Phase 5 adds **six purchase-specific screens** (P01–P06) under `features/qr-purchase/screens/`. Shared screens R01–R06 are **imported, not duplicated**. All UI uses `@autolokate/ui`, `@autolokate/icons`, and `@autolokate/design-system` — no local buttons, inputs, chips, or duplicate plan components.

**Preview:** `pnpm --filter @autolokate/qr dev` → **Purchase (Phase 5)** section

---

## Full purchase flow (config)

```
R01 Vehicle Number      → shared.vehicle-number   (reuse)
R02 Vehicle Details     → shared.vehicle-details  (reuse)
R03 Mobile Number       → shared.mobile           (reuse)
R04 OTP Verification    → shared.otp              (reuse)
R05 Account Creation    → shared.account          (reuse)
R06 Legal Consent       → shared.legal            (reuse)
P01 Plan Selection      → purchase.plan-select
P02 Plan Details        → purchase.plan-details
P03 Rider Selection     → purchase.rider-select
P04 Checkout Summary    → purchase.checkout-summary
P05 Payment Processing  → purchase.payment-processing
P06 Payment Success     → purchase.payment-success
```

Config: `flow/registry/config/flows.config.ts` · Routes: `router/routes.schema.ts` (`purchaseFlowRoutes`)

---

## Screen inventory

| Screen | Step ID | Route | Folder | Figma |
|--------|---------|-------|--------|-------|
| **P01 · Plan Selection** | `purchase.plan-select` | `/purchase/p01-plan-selection` | `p01-plan-selection` | `232:102` · Choose plan · `231:80` AlPlanCardW |
| **P02 · Plan Details** | `purchase.plan-details` | `/purchase/p02-plan-details` | `p02-plan-details` | Secure tier detail |
| **P03 · Rider Selection** | `purchase.rider-select` | `/purchase/p03-rider-selection` | `p03-rider-selection` | Rider addon |
| **P04 · Checkout Summary** | `purchase.checkout-summary` | `/purchase/p04-checkout-summary` | `p04-checkout-summary` | Order summary |
| **P05 · Payment Processing** | `purchase.payment-processing` | `/purchase/p05-payment-processing` | `p05-payment-processing` | Payment in progress |
| **P06 · Payment Success** | `purchase.payment-success` | `/purchase/p06-payment-success` | `p06-payment-success` | Activation success |

### View states

| Screen | default | loading | error | success |
|--------|---------|---------|-------|---------|
| P01 Plan Selection | ✓ | ✓ | ✓ | ✓ |
| P02 Plan Details | ✓ | ✓ | ✓ | ✓ |
| P03 Rider Selection | ✓ | ✓ | ✓ | ✓ |
| P04 Checkout Summary | ✓ | ✓ | ✓ | ✓ |
| P05 Payment Processing | ✓ | ✓ | ✓ | ✓ |
| P06 Payment Success | ✓ | ✓ | ✓ | ✓ |

---

## Component usage

| `@autolokate/ui` | Screens |
|------------------|---------|
| AlPlanCard | P01, P02 (core — not duplicated) |
| AlToggle | P03 |
| AlChip | P03 |
| AlField | P04 |
| AlDivider | P04 |
| AlHeading | P04, P05, P06 |
| AlText | All purchase |
| AlButton | All (via PurchaseStepShell footer) |
| AlIconButton | All (via shell) |
| AlStatusBar | All (via shell) |
| AlStepProgress | All (via shell, 6-step purchase phase) |

| `@autolokate/icons` | Screens |
|---------------------|---------|
| AlIcon `circle-check` | P01, P02, P06 |
| AlIcon `arrow-left` | All (shell) |

**Shell:** `PurchaseStepShell` — app-level layout only; composes AL primitives (not a DS component).

---

## Shared screen reuse

| Shared screen | Import path | Duplicated? |
|---------------|-------------|-------------|
| R01–R06 | `features/shared-auth` · `features/shared-legal` | **No** |

Purchase dev preview imports the same exported screen components used in Phase 4.

---

## Composition promotion candidates (new / updated)

| ID | Description | Promote? | Observed in |
|----|-------------|----------|-------------|
| **PlanCarousel** | Horizontal AlPlanCard scroll + screen CTA | Yes | P01 |
| **CheckoutSummary** | AlField lines + divider + total | Yes | P04 |
| **RiderSelectorRow** | AlToggle + AlChip count | Yes | P03 |
| **PurchaseStepShell** | Purchase-phase chrome (6-step progress) | Review | P01–P06 |
| **PaymentStatusHero** | Centered status / success hero | No | P05, P06 |
| **PlanSummary** | Single AlPlanCard recap | Yes (existing) | P02 |

Documented in `components/compositions/inventory.ts` and [`COMPOSITION_PROMOTION_CANDIDATES.md`](COMPOSITION_PROMOTION_CANDIDATES.md).

**Not promoted:** No new `@autolokate/ui` components added in Phase 5.

---

## Responsive QA

Dev preview viewport controls: **320 · 360 · 375 · 390 · 414**

| Check | Result |
|-------|--------|
| Plan carousel horizontal scroll | ✓ P01 — snap scroll, 270px card width |
| Plan card at 320px | ✓ Full card visible with edge peek |
| Checkout fields wrap | ✓ AlField full width |
| Footer CTA full width | ✓ All purchase screens |
| Shell max-width 393px | ✓ Matches Figma frame |

---

## Figma references

| Reference | Used for |
|-----------|----------|
| `231:80` AlPlanCardW | P01 carousel, P02 detail |
| `232:102` Choose plan | P01 layout, screen-level CTA |
| `504:185` Light DS instance | Theme parity |
| `487:36` INPUTS (shared) | Not rebuilt — R01–R06 reused |
| PLAN_CARD_AUDIT.md | Typography, spacing, selected state |

---

## Known issues / limitations

1. **Plan carousel peek** — Horizontal scroll is screen-level CSS; carousel component not extracted (promotion candidate).
2. **Payment gateway UI** — P05 shows processing copy only; no UPI/card selector (out of scope).
3. **No routing** — Screens previewed via dev panel; flow engine wiring deferred.
4. **Static demo data** — Plan prices, checkout lines in `features/qr-purchase/data/plan-data.ts`.
5. **P05 default state** — Shows loading-style processing (intentional for processing screen).
6. **QR scan step** — `purchase.qr-scan` remains in step config for future; not in active flow graph.

---

## Explicitly out of scope

- B2B, B2B2C, Pre-paid, Emergency screens
- API / payment integration
- Business logic and validation
- Flow engine runtime
- react-router wiring

---

## Build verification

```bash
pnpm --filter @autolokate/qr build   # ✓
pnpm --filter @autolokate/qr lint    # ✓
pnpm --filter @autolokate/qr dev     # Preview shared + purchase
```

---

## Awaiting review

Phase 5 purchase screens complete. **Do not proceed to B2B** until approved.
