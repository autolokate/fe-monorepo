# Phase 5.5 Review — Cross-Flow Architecture Audit

**App:** `@autolokate/qr`  
**Scope:** Shared flow (R01–R06) + Purchase flow (P01–P06)  
**Status:** Review complete — **do not proceed to B2B** until recommended changes are triaged  
**Date:** 2026-06-17  
**Figma:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) · Section `167:434` Consumer · QR Activation + Purchase

---

## Executive summary

Shared and purchase screens follow a consistent **StatusBar → Header → Content → Sticky footer CTA** pattern via two shell components. No duplicate plan primitives or local buttons/inputs were found in production screens. The main gaps before B2B are:

1. **Two nearly identical shells** (`OnboardingStepShell`, `PurchaseStepShell`) — unify before adding B2B chrome.
2. **Figma parity gaps** on checkout (P04), payment success (P06), and plan selection scope (P01).
3. **Repeated inline patterns** (error banners, empty/state heroes) — extract as onboarding compositions, not `@autolokate/ui` yet.
4. **Step progress** is an architecture addition not present on Figma purchase frames.

Low-risk fixes applied in this review: Figma copy alignment (P01, P04, P06), CSS dedup (`ob-purchase-status` → `ob-state-panel`), dev preview theme toggle.

---

## Screen inventory audited

| ID | Component | Shell | Figma ref |
|----|-----------|-------|-----------|
| R01 | `R01VehicleNumberScreen` | `OnboardingStepShell` | Shared auth pipeline |
| R02 | `R02VehicleDetailsScreen` | `OnboardingStepShell` | `170:71` R05 · Confirm vehicle |
| R03 | `R03MobileNumberScreen` | `OnboardingStepShell` | Shared mobile |
| R04 | `R04OtpVerificationScreen` | `OnboardingStepShell` | Shared OTP |
| R05 | `R05AccountCreationScreen` | `OnboardingStepShell` | `174:25` R02 · Your name |
| R06 | `R06LegalConsentScreen` | `OnboardingStepShell` | Legal consent |
| P01 | `P01PlanSelectionScreen` | `PurchaseStepShell` | `183:25` R06 · Choose plan |
| P02 | `P02PlanDetailsScreen` | `PurchaseStepShell` | `232:102` AlPlanCardW (detail) |
| P03 | `P03RiderSelectionScreen` | `PurchaseStepShell` | `186:25` R07 · Add rider cover |
| P04 | `P04CheckoutSummaryScreen` | `PurchaseStepShell` | `190:25` R08 · Order summary |
| P05 | `P05PaymentProcessingScreen` | `PurchaseStepShell` | `192:25` R09 · Processing payment |
| P06 | `P06PaymentSuccessScreen` | `PurchaseStepShell` | `193:25` R10 · Payment success |

---

## Duplication findings

### Layout / shell

| Finding | Severity | Location | Recommendation |
|---------|----------|----------|----------------|
| **Dual step shells** — `OnboardingStepShell` and `PurchaseStepShell` share ~95% JSX (StatusBar, back, heading, progress, footer CTA). Purchase adds `hideFooter` and different step total/label. | Medium | `components/onboarding-step-shell/`, `components/purchase-step-shell/` | Unify into `FlowStepShell` with `{ phase: 'shared' \| 'purchase', step, total, progressLabel }` before B2B adds a third variant |
| **Step progress not in Figma** — Purchase Figma frames show back + headline only; no `AlStepProgress`. | Low | All P01–P06 | Keep for UX consistency; document as intentional architecture delta |
| **Header padding** — Shell uses `--al-space-lg` (20px); Figma content uses 16px horizontal (`padding: 0 16px`). | Low | `onboarding-step-shell.css` | Align to 16px in unified shell pass |

### Sections / blocks

| Finding | Severity | Location | Recommendation |
|---------|----------|----------|----------------|
| **State hero panel** — `.ob-state-panel` (shared) duplicated as `.ob-purchase-status` (purchase). Identical flex/center/text rules. | Low | R01, R02, R06, P05, P06 | **Fixed:** P05/P06 now use `ob-state-panel` |
| **Error banner** — Same `ob-purchase-banner` markup repeated in P01–P06 (6×). | Medium | All purchase screens | Extract `InlineStatusBanner` onboarding composition |
| **Empty/error hero** — Icon + `AlHeading h3` + muted `AlText` pattern in R01, R02, R06. | Low | Shared auth/legal | Candidate: `EmptyStateHero` composition (not core) |
| **Field stack wrapper** — `ob-field-stack` + `AlStack gap="lg"` used in R01, R03–R05. | Low | Shared auth | Already flagged as `FormFieldStack` — keep local until 2+ flows wire it |
| **Caption helper text** — `{!isError && !isSuccess ? <AlText variant="caption">…` repeated across R03–R05, P01–P04. | Low | Multiple | Acceptable screen-level copy; no extraction yet |

### Card structures

| Finding | Severity | Location | Recommendation |
|---------|----------|----------|----------------|
| **AlPlanCard** — Used in P01 (carousel) and P02 (detail). No duplicate plan component. | ✓ Pass | P01, P02 | Reuse `PlanSummary` composition when B2B2C/Emergency need recap |
| **AlVehicleRcCard** — Single use in R02. | ✓ Pass | R02 | Promote `VehicleSummary` when B2B confirms vehicle |
| **Checkout lines** — Flat `AlField` rows in P04 vs Figma bordered summary card (`190:43`). | Medium | P04 | `CheckoutSummary` composition should wrap card surface + rows |

### Footer / CTA

| Finding | Severity | Location | Recommendation |
|---------|----------|----------|----------------|
| **Primary CTA** — All screens route through shell footer `AlButton`. | ✓ Pass | All R + P | No local primary buttons in screens |
| **Secondary CTA in content** — P06 renders `AlButton variant="secondary"` “View receipt” inside content while shell also has primary footer. | Medium | P06 | Figma shows single footer CTA only; move receipt to link or defer to post-flow |
| **P05 default = loading** — Footer always shows “Processing…” on default state. | Low | P05 | Intentional for processing screen; document for QA |

### Payment blocks

| Finding | Severity | Location | Recommendation |
|---------|----------|----------|----------------|
| **Missing payment method row** — Figma `190:25` includes UPI/Cards/Netbanking + secure payment row. | High | P04 | Add in checkout composition before B2B (out of Phase 5 scope) |
| **Missing promo field** — Figma checkout includes “Add promo code”. | Medium | P04 | Defer or add when promo flow is in scope |
| **P05 processing UI** — Copy-only hero; no spinner/gateway UI. | Low | P05 | Acceptable for presentational phase |

### Summary blocks

| Finding | Severity | Location | Recommendation |
|---------|----------|----------|----------------|
| **CheckoutSummary** — Line items + divider + total duplicated as screen markup. | Medium | P04 | Promote to onboarding composition |
| **Plan carousel** — Horizontal scroll CSS + two cards inline in P01. | Medium | P01 | Promote `PlanCarousel` composition |

---

## Promotion review

Decision key: **Keep local** → screen markup only · **Onboarding composition** → `apps/qr/src/components/compositions/` · **@autolokate/ui** → core DS after 2+ flows

| Candidate | Decision | Reasoning |
|-----------|----------|-----------|
| **PlanCarousel** | **Onboarding composition** (not core yet) | Used only in P01 today. B2B2C partner welcome reuses plan carousel (`386:889`). Extract before B2B2C to avoid third copy of scroll CSS. Not core until API + selection state is stable across purchase + B2B2C. |
| **CheckoutSummary** | **Onboarding composition** (not core yet) | P04 only. B2B prepaid will need order recap with different line items. Card surface + rows + total + GST footnote belong in one composition. Core promotion blocked until checkout API shape is shared across purchase + B2B. |
| **RiderSelectorRow** | **Onboarding composition** (not core yet) | P03 today; Emergency flow (`EmergencyPlanAddon`) will reuse toggle + chip pattern per inventory. Extract when emergency screens start. Core only after emergency + purchase share identical props. |
| **PurchaseStepShell** | **Keep local → merge with OnboardingStepShell** | Not a composition — a layout primitive. Two shells duplicate chrome. Merge into parameterized `FlowStepShell` before B2B rather than promoting either to core. B2B may need org-branded header; one shell with slots scales better. |
| **PaymentStatusHero** | **Keep local** | P05 (amount + status copy) and P06 (icon + headline + secondary CTA) differ structurally. Figma success (`193:25`) uses Display headline, green halo, `AlChip` “Plan active” — current P06 does not match. `ActivationSuccess` varies per flow; do not promote a single hero to core. |

### Related candidates (from prior phases)

| Candidate | Decision | Notes |
|-----------|----------|-------|
| `OnboardingStepShell` | Merge with purchase shell | Same as PurchaseStepShell recommendation |
| `FormFieldStack` | Keep local | ui-preview already has form section |
| `PlanSummary` | Onboarding composition when P02 + B2B2C align | Single `AlPlanCard` recap |
| `InlineStatusBanner` (new) | Onboarding composition | Consolidate P01–P06 error/success banners |

**No new `@autolokate/ui` promotions** recommended in this review.

---

## Shell consistency report

### Expected structure

```
┌─────────────────────────┐
│ AlStatusBar             │
├─────────────────────────┤
│ Header                  │
│  · AlIconButton (back)  │
│  · AlHeading + AlText   │
│  · AlStepProgress       │
├─────────────────────────┤
│ Content (flex: 1)       │
│  · screen-specific      │
├─────────────────────────┤
│ Footer (sticky)         │
│  · AlButton primary     │
└─────────────────────────┘
```

### Compliance

| Screen | StatusBar | Header | Content | Sticky footer | Notes |
|--------|-----------|--------|---------|---------------|-------|
| R01–R06 | ✓ | ✓ | ✓ | ✓ | `OnboardingStepShell` |
| P01–P05 | ✓ | ✓ | ✓ | ✓ | `PurchaseStepShell` |
| P06 | ✓ | ✓ | ✓ | ✓ | Also has in-content secondary `AlButton` |

**Verdict:** All 12 screens use a shell. No screen invents a wholly different top-level structure.

**Deviations from Figma (not shell violations):**

- **P06** — Figma `193:25` is a **celebration layout** without back button, step progress, or page title in header. Code keeps full shell for flow continuity.
- **P01–P06** — Figma omits `AlStepProgress`; code includes 6-step purchase progress.

---

## Responsive review

Test matrix: **320 · 360 · 375 · 390 · 414** via dev preview (`pnpm --filter @autolokate/qr dev`).

| Check | R01–R06 | P01–P06 | Notes |
|-------|---------|---------|-------|
| Horizontal overflow | ✓ | ✓ | Shell `max-width: 24.5625rem` (393px); content `min-width: 0` |
| Plan carousel scroll | — | ✓ | P01: snap scroll, 270px card, edge peek at 320px |
| Text wrapping | ✓ | ✓ | Plan features, legal copy, captions wrap |
| Clipping | ✓ | ✓ | No observed clip at min width |
| Safe area (footer) | ✓ | ✓ | `env(safe-area-inset-bottom)` on `.ob-shell__footer` |
| Sticky CTA | ✓ | ✓ | Footer in column flex shell; stays at bottom on short content |
| Long checkout list | — | ✓ | P04 scrolls within shell content area |
| State panel centering | ✓ | ✓ | R02 loading/error, P05/P06 status |

**Gap:** Dev preview previously had no theme toggle — **fixed** with Dark/Light controls for light/dark QA.

---

## Figma parity findings

### P01 · Plan Selection (`183:25`)

| Element | Figma | Implementation | Match |
|---------|-------|----------------|-------|
| Title | “Choose your plan” | “Choose your plan” | ✓ (fixed in 5.5) |
| Subtitle | “From daily essentials…” | Same | ✓ (fixed) |
| CTA | “Choose Secure” | “Choose Secure” | ✓ (fixed) |
| Carousel gap | 14px | `--al-space-md` (16px) | ~Close |
| Tiers shown | Safe, Secure, Shield, Shield+ (4) | Safe, Secure (2) | ✗ Demo scope |
| Safe price | ₹99/yr | ₹499/yr | ✗ Demo data |
| Selection ring / glow | Green ring on selected card | `selected` border on Secure only | Partial |
| Ambient tint | Radial green gradient | Not implemented | ✗ Low priority |

### P02 · Plan Details

| Element | Figma | Implementation | Match |
|---------|-------|----------------|-------|
| Dedicated screen | No separate frame — detail is expanded card | Standalone step with full `AlPlanCard` | Architecture choice |
| Feature list | All 5 Secure features | All features shown | ✓ |
| CTA | N/A (selection on P01) | “Continue” | Acceptable for multi-step flow |

### P04 · Checkout Summary (`190:25`)

| Element | Figma | Implementation | Match |
|---------|-------|----------------|-------|
| Title | “Review & pay” | “Review & pay” | ✓ (fixed) |
| Subtitle | “Check your order…” | Same | ✓ (fixed) |
| Promo code field | Yes | No | ✗ |
| Summary container | Bordered card `#1A1A1A` / 16px radius | Flat `AlField` list | ✗ |
| Line items | Secure ₹999/yr, Rider ×1 +₹949 | Secure ₹999, Rider (2) ₹199, GST ₹216 | ✗ Demo data |
| Total | ₹1,948 | ₹1,414 | ✗ Demo data |
| GST note | “Inclusive of 18% GST (₹297)” | “Inclusive of GST. Billed annually.” | Partial |
| Payment method | UPI · Cards · Netbanking row | Missing | ✗ |
| Secure payment | Shield + encrypted copy | Missing | ✗ |
| CTA | “Pay ₹1,948” | “Pay ₹1,414” | Structure ✓, amount demo |

### P06 · Payment Success (`193:25`)

| Element | Figma | Implementation | Match |
|---------|-------|----------------|-------|
| Layout | Centered celebration, no back/progress | Full `PurchaseStepShell` with header | ✗ |
| Headline | Display 36px “Payment successful” | h2 “You're protected!” | ✗ |
| Body | “₹1,848 paid · your Secure plan is now active.” | Plate + activation copy | ✗ |
| Status chip | `AlChip` “Plan active” | None | ✗ |
| Hero | Green halo rings (240px) | 64px circle-check icon | ✗ |
| CTA | Single “Continue” | “Continue” footer + secondary “View receipt” | Partial (footer fixed) |
| Light theme | White text on `#0A0A0C` canvas | Semantic tokens | ✓ via DS |

### Shared flow (R01–R06)

Shared screens align with DS input patterns (`487:36`). R02 `AlVehicleRcCard` matches `170:79` audit. Description lowercase in shell is intentional (`text-transform: lowercase` on `.ob-shell__description`).

---

## Recommended changes before B2B

### Must address (blocking B2B UI parity)

1. **Unify step shells** — Single `FlowStepShell` with phase config; B2B adds org/fleet header slot.
2. **Rebuild P04 checkout** — `CheckoutSummary` composition with Figma card surface, promo placeholder, payment method + secure rows.
3. **Rebuild P06 success** — Match Figma celebration layout (Display headline, halo, `AlChip`); consider `hideHeader` / `hideProgress` shell props for terminal screens.

### Should address (quality)

4. **Extract `InlineStatusBanner`** — DRY error/success banners across P01–P06.
5. **Extract `PlanCarousel`** — Before B2B2C partner plan screens.
6. **Align demo data** — Plan prices, checkout lines, totals with Figma reference data or product source of truth.
7. **P01 tier scope** — Add Shield / Shield+ cards or document consumer MVP as 2-tier only.
8. **Header horizontal padding** — 16px to match Figma frames.

### Can defer

9. Ambient green radial tint on purchase screens.
10. P02 as separate step vs inline plan expansion.
11. Flow engine + react-router wiring.
12. Core promotion of any composition to `@autolokate/ui`.

---

## Low-risk fixes applied (Phase 5.5)

| Change | File(s) |
|--------|---------|
| P01 Figma copy (title, subtitle, CTA) | `P01PlanSelectionScreen.tsx` |
| P04 Figma copy (title, subtitle) | `P04CheckoutSummaryScreen.tsx` |
| P06 footer label “Continue” | `P06PaymentSuccessScreen.tsx` |
| Dedup state hero CSS (`ob-purchase-status` → `ob-state-panel`) | P05, P06, `purchase-step-shell.css` |
| Dev preview theme toggle (light/dark) | `ScreenDevApp.tsx` |

---

## Verification

```bash
pnpm --filter @autolokate/qr lint    # ✓
pnpm --filter @autolokate/qr build  # ✓
pnpm --filter @autolokate/qr dev      # Shared + Purchase + theme + viewport QA
```

---

## Decision

**Phase 5 purchase + shared flows are architecturally sound for preview.** Figma parity gaps on checkout and payment success, plus dual-shell duplication, should be resolved **before B2B implementation**.

**Do not build B2B, B2B2C, or Emergency until this review is approved and must-address items are triaged.**
