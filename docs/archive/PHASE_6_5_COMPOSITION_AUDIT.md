# Phase 6.5 — Shared Composition Audit

**App:** `@autolokate/qr`  
**Scope:** R01–R06 (shared) + P01–P06 (purchase)  
**Objective:** Audit reusable compositions before Prepaid implementation  
**Mode:** Audit only — no new components, no screen modifications  
**Date:** 2026-06-17  
**Prior art:** [Phase 5 Review](./PHASE_5_REVIEW.md) · [Phase 6 Shell Integration](./PHASE_6_SHELL_INTEGRATION.md) · `apps/qr/src/components/compositions/inventory.ts`

---

## Executive summary

All 12 onboarding screens are **DS-compliant**: UI primitives come from `@autolokate/ui` and icons from `@autolokate/icons`. No local button or input components exist in screen features. CSS is token-driven with no hardcoded colors in source stylesheets.

**Shell-level patterns are already extracted** (`OnboardingStepShell`, `PurchaseStepShell`, shared `onboarding-step-shell.css`). Phase 6 wrapped both shells in `AlScreenBg variant="protected"`. Headers, sticky footers, and step progress are centralized.

**Screen-level JSX duplication remains** in four high-impact areas:

1. **Error/success banners** — identical markup in all 6 purchase screens (7 banner instances)
2. **State hero panels** — icon + heading + muted text in 5 screens (8 JSX blocks)
3. **Form field stacks** — repeated wrapper + input + caption pattern in 4 shared-auth screens
4. **View-state boolean blocks** — `loading` / `isError` / `isEmpty` / `isSuccess` in all 12 screens

A composition inventory (`inventory.ts`) already maps 13 candidates; **none are implemented yet**. Before Prepaid, extract the top 4 onboarding compositions (banner, state hero, field stack, unified shell) to avoid a third copy of purchase/shared patterns.

**Onboarding health score: 86 / 100 (B+)** — architecturally sound, composition extraction recommended before Prepaid scales screen count.

---

## Methodology

| Check | Method |
|-------|--------|
| Repeated JSX | Manual review of all 12 `*Screen.tsx` files + shell components |
| Repeated CSS | Grep across `apps/qr/src/**/*.css` |
| Layout / state / footer / header patterns | Cross-reference shells + screen children |
| DS compliance | Import analysis, grep for local `Button`/`Input`, inline styles, hex/rgb colors |
| Classification | A = onboarding composition · B = keep local · C = future `@autolokate/ui` core |
| Reuse estimate | Count current instances + projected Prepaid / shared-flow usage |

---

## Screen inventory

| ID | Screen | Shell | Primary content patterns |
|----|--------|-------|--------------------------|
| R01 | `R01VehicleNumberScreen` | `OnboardingStepShell` | State hero (empty) · field stack · plate input |
| R02 | `R02VehicleDetailsScreen` | `OnboardingStepShell` | State heroes ×3 (loading, empty, error) · `AlVehicleRcCard` |
| R03 | `R03MobileNumberScreen` | `OnboardingStepShell` | Field stack · `AlTextField` |
| R04 | `R04OtpVerificationScreen` | `OnboardingStepShell` | Field stack · `AlOtpInput` |
| R05 | `R05AccountCreationScreen` | `OnboardingStepShell` | Field stack · `AlInput` |
| R06 | `R06LegalConsentScreen` | `OnboardingStepShell` | State hero (empty) · legal copy · checkbox |
| P01 | `P01PlanSelectionScreen` | `PurchaseStepShell` | Banner ×2 · plan carousel · `AlPlanCard` ×2 |
| P02 | `P02PlanDetailsScreen` | `PurchaseStepShell` | Banner · `AlPlanCard` · success caption |
| P03 | `P03RiderSelectionScreen` | `PurchaseStepShell` | Banner · toggle + chip row |
| P04 | `P04CheckoutSummaryScreen` | `PurchaseStepShell` | Banner · checkout rows · total |
| P05 | `P05PaymentProcessingScreen` | `PurchaseStepShell` | Banner · state hero · amount copy |
| P06 | `P06PaymentSuccessScreen` | `PurchaseStepShell` | Banner · state hero · secondary `AlButton` |

---

## Duplication matrix

| # | Pattern | Type | CSS location | Screens | Instances | Est. Prepaid reuse | Class |
|---|---------|------|--------------|---------|-----------|-------------------|-------|
| 1 | **Flow step shell** (StatusBar + header + content + sticky footer) | Layout + JSX | `onboarding-step-shell.css` | R01–R06, P01–P06 | 12 | 12+ | **A** — merge dual shells |
| 2 | **Sticky footer CTA** (`AlButton` via shell props) | JSX | Shell | All 12 | 12 | 12+ | ✓ Extracted |
| 3 | **Flow header** (back + title + description + progress) | JSX | Shell | All 12 | 12 | 12+ | ✓ Extracted |
| 4 | **`ob-state-panel`** (centered flex hero container) | CSS + JSX | `onboarding-step-shell.css` | R01, R02, R06, P05, P06 | 8 blocks | 5–7 | **A** — `EmptyStateHero` |
| 5 | **State hero content** (icon + `AlHeading` + muted `AlText`) | JSX | — | R01, R02×3, R06, P05, P06 | 8 | 5–7 | **A** — pairs with #4 |
| 6 | **`ob-purchase-banner`** (error/success alert) | CSS + JSX | `purchase-step-shell.css` | P01–P06 | 7 (6 error + 1 success) | 4–5 | **A** — `InlineStatusBanner` |
| 7 | **`ob-field-stack`** (vertical input column) | CSS + JSX | `onboarding-step-shell.css` | R01, R03, R04, R05 | 4 | 6–8 | **A** — `FormFieldStack` |
| 8 | **Caption footnote** (`{!isError && !isSuccess ? <AlText variant="caption">…`) | JSX | — | R03–R05, P01–P04, R06 | 10+ | 8+ | **B** — screen copy |
| 9 | **View-state flags** (`loading`, `isError`, `isEmpty`, `isSuccess`) | JSX | — | All 12 | 12 | 12+ | **B** — thin per screen |
| 10 | **`ob-purchase-plan-carousel`** | CSS + JSX | `purchase-step-shell.css` | P01 | 1 | 2 | **A** — `PlanCarousel` |
| 11 | **`ob-purchase-checkout`** + `AlField` info rows + total row | CSS + JSX | `purchase-step-shell.css` | P04 | 1 | 2–3 | **A** — `CheckoutSummary` |
| 12 | **`ob-purchase-rider-row`** (toggle + chips) | CSS + JSX | `purchase-step-shell.css` | P03 | 1 | 1–2 | **A** — `RiderSelectorRow` |
| 13 | **`ob-legal-copy`** (linked legal body text) | CSS + JSX | `onboarding-step-shell.css` | R06 | 1 | 6 | **A** — `LegalConsentBlock` |
| 14 | **`AlPlanCard` + feature icons** | JSX | — | P01, P02 | 3 cards | 2–3 | **B** — props vary |
| 15 | **`AlVehicleRcCard`** confirmation | JSX | — | R02 | 1 | 2–3 | **C** — `VehicleSummary` |
| 16 | **Dual shell duplication** (`OnboardingStepShell` ≈ `PurchaseStepShell`) | JSX | Both shell files | 2 shells | ~95% overlap | 3rd shell (Prepaid) | **A** — `FlowStepShell` |
| 17 | **P06 in-content secondary CTA** (`AlButton variant="secondary"`) | JSX | — | P06 | 1 | 0–1 | **B** — terminal screen |
| 18 | **`AlStack gap="lg"` + `ob-field-stack`** (redundant gap) | JSX + CSS | Both set `--al-space-lg` | R03–R05 | 3 | — | **B** — minor |

**Totals:** 12 screens audited · 18 distinct patterns · 8 classified **A** · 6 **B** · 1 **C** · 3 already extracted in shells

---

## Classification

### A — Promote to onboarding composition

| Candidate | Inventory ID | Current duplication | Prepaid impact | Priority |
|-----------|--------------|---------------------|----------------|----------|
| **InlineStatusBanner** | _(new — maps to banner CSS)_ | 7 JSX copies in P01–P06 | Prepaid payment/plan errors | **P0** |
| **EmptyStateHero** | overlaps `ActivationSuccess` | 8 hero blocks in 5 screens | Empty wallet, no plan, load failures | **P0** |
| **FormFieldStack** | `FormFieldStack` | 4 screens + redundant `AlStack` | Prepaid top-up, account fields | **P1** |
| **FlowStepShell** | overlaps `FlowProgressHeader` | 2 near-identical shell files | Third shell without merge = high debt | **P0** |
| **PlanCarousel** | `PlanCarousel` | P01 only; CSS ready | Prepaid plan tiers if applicable | **P1** |
| **CheckoutSummary** | `CheckoutSummary` | P04 flat rows | Prepaid order recap | **P1** |
| **RiderSelectorRow** | `RiderSelectorRow` | P03 only | Low for Prepaid; keep for emergency | **P2** |
| **LegalConsentBlock** | `LegalConsentBlock` | R06 only; all flows need legal | Prepaid T&C step | **P1** |

**Estimated reuse after Prepaid (conservative):**

| Composition | Current instances | + Prepaid est. | Total est. |
|-------------|-------------------|----------------|------------|
| FlowStepShell | 12 screens | +8–10 screens | 20–22 |
| InlineStatusBanner | 7 | +3–4 | 10–11 |
| EmptyStateHero | 8 | +3–5 | 11–13 |
| FormFieldStack | 4 | +2–4 | 6–8 |
| CheckoutSummary | 1 | +1–2 | 2–3 |
| LegalConsentBlock | 1 | +1 | 2 |

### B — Keep local

| Pattern | Reason |
|---------|--------|
| View-state boolean blocks | 4 lines per screen; a hook adds indirection without reducing markup meaningfully |
| Caption footnotes | Screen-specific copy; no shared structure beyond `AlText variant="caption"` |
| `AlPlanCard` icon prop wiring | Card is already DS; only demo `featureIcon`/`selectedIcon` differ per plan |
| P06 secondary “View receipt” button | Terminal-screen UX decision; Figma shows single CTA |
| Redundant `AlStack` + `ob-field-stack` | Fix when extracting `FormFieldStack`, not as standalone work |
| Screen-specific footer labels | Dynamic strings tied to view state (`Saving…`, `Pay ₹…`) — shell props are sufficient |

### C — Candidate for future `@autolokate/ui` core

| Candidate | Inventory ID | Gate for core promotion |
|-----------|--------------|-------------------------|
| **VehicleSummary** | `VehicleSummary` | Stable across purchase + B2B + Prepaid vehicle confirm |
| **CheckoutSummary** (card surface) | `CheckoutSummary` | Shared checkout API shape across purchase + Prepaid + B2B |
| **PlanCarousel** | `PlanCarousel` | Selection state + API stable in purchase + B2B2C |
| **LegalConsentBlock** | `LegalConsentBlock` | Same checkbox + link pattern in 3+ flows with identical props |
| **Generic status hero** | `ActivationSuccess` / `PaymentStatusHero` | Converge P05/P06/R01/R02 heroes to one prop-driven API |

**No immediate `@autolokate/ui` promotions recommended.** Onboarding compositions should stabilize in `apps/qr/src/components/compositions/` first.

---

## Repeated pattern detail

### 1. State panels (`ob-state-panel`)

**CSS:** Centralized in `onboarding-step-shell.css` (flex center, gap, padding, text max-width).

**Repeated JSX structure:**

```tsx
<div className="ob-state-panel">
  <AlIcon name="…" size={48|64} />
  <AlStack gap="sm" align="center">
    <AlHeading variant="h3|h2">…</AlHeading>
    <AlText tone="muted" align="center">…</AlText>
  </AlStack>
</div>
```

| Screen | States using panel |
|--------|-------------------|
| R01 | empty |
| R02 | loading, empty, error |
| R06 | empty |
| P05 | default/processing, success |
| P06 | success (with extra `AlButton`) |

### 2. Purchase banners (`ob-purchase-banner`)

**CSS:** Token-based `color-mix` on `--al-color-danger` / `--al-color-success` — no raw hex.

**Repeated JSX:**

```tsx
{isError ? (
  <div className="ob-purchase-banner" role="alert">
    <AlText variant="caption">…</AlText>
  </div>
) : null}
```

Present in **every purchase screen** (P01 also has success variant).

### 3. Field stacks (`ob-field-stack`)

| Screen | Input | Notes |
|--------|-------|-------|
| R01 | `AlPlateInput` | Uses `ob-field-stack` without `AlStack` wrapper |
| R03 | `AlTextField` | `AlStack gap="lg"` + `ob-field-stack` (duplicate gap) |
| R04 | `AlOtpInput` | Same redundant stack |
| R05 | `AlInput` | Same redundant stack |

### 4. Information rows

| Screen | Pattern | DS component |
|--------|---------|--------------|
| P04 | Line items + divider + total | `AlField` × N, `AlDivider`, `AlHeading` + `AlText` |
| R02 | Vehicle fields | `AlVehicleRcCard` (card, not row list) |

Only P04 uses repeated info rows today. Figma expects a bordered card wrapper — composition should add surface, not just rows.

### 5. Headers and sticky footers

| Element | Implementation | Status |
|---------|----------------|--------|
| `AlStatusBar` | Shell | ✓ Extracted |
| Back + title + description | Shell header | ✓ Extracted |
| `AlStepProgress` | Shell (shared=6, purchase=6) | ✓ Extracted |
| Primary CTA | Shell footer `AlButton` | ✓ Extracted |
| `hideFooter` | Purchase shell only (P06 could use) | ✓ Available |

---

## DS compliance verification

### No local buttons or inputs

| Check | Result | Evidence |
|-------|--------|----------|
| Local button components in `features/` | **PASS** | No `components/button` or relative button imports |
| Local input components in `features/` | **PASS** | No local input modules |
| Screen button usage | **PASS** | Primary CTAs via shell; P06 uses `AlButton` from `@autolokate/ui` |
| Screen input usage | **PASS** | `AlPlateInput`, `AlTextField`, `AlOtpInput`, `AlInput`, `AlCheckbox` — all from UI package |

### All UI from `@autolokate/ui`

| Screen | UI imports |
|--------|------------|
| R01 | `AlHeading`, `AlPlateInput`, `AlStack`, `AlText` |
| R02 | `AlHeading`, `AlStack`, `AlText`, `AlVehicleRcCard` |
| R03 | `AlStack`, `AlText`, `AlTextField` |
| R04 | `AlOtpInput`, `AlStack`, `AlText` |
| R05 | `AlInput`, `AlStack`, `AlText` |
| R06 | `AlCheckbox`, `AlHeading`, `AlStack`, `AlText` |
| P01 | `AlPlanCard`, `AlText` |
| P02 | `AlPlanCard`, `AlText` |
| P03 | `AlChip`, `AlStack`, `AlText`, `AlToggle` |
| P04 | `AlDivider`, `AlField`, `AlHeading`, `AlText` |
| P05 | `AlHeading`, `AlStack`, `AlText` |
| P06 | `AlButton`, `AlHeading`, `AlStack`, `AlText` |

Icons consistently from `@autolokate/icons`. Shells additionally use `AlScreenBg`, `AlStatusBar`, `AlIconButton`, `AlStepProgress`, `AlButton`.

### Design tokens and hardcoded values

| Check | Result | Notes |
|-------|--------|-------|
| Hardcoded colors (`#`, `rgb`, `rgba`) in source CSS | **PASS** | None in `apps/qr/src/**/*.css` |
| Hardcoded spacing (raw `px`) in screen/shell CSS | **PASS** | All spacing via `var(--al-space-*)` |
| Semantic color usage | **PASS** | Banners use `color-mix(in srgb, var(--al-color-danger|success) …)` |
| Typography tokens | **PASS** | `--al-text-*` for legal copy and banners |
| Layout constants (not tokens) | **MINOR** | `max-width: 24.5625rem` (393px viewport), `18rem` state-panel text cap, `0.15em` underline offset |
| Duplicated custom tokens | **PASS** | No `--ob-*` color/spacing tokens; only `--ob-dev-viewport-width` in dev preview |
| Inline styles in screens | **PASS** | None in feature screens (dev shell only) |
| Redundant gap declaration | **MINOR** | `AlStack gap="lg"` + `.ob-field-stack { gap: var(--al-space-lg) }` on R03–R05 |

---

## Shell consistency (post Phase 6)

```
┌─────────────────────────────────────┐
│ AlScreenBg variant="protected"      │
│  ┌───────────────────────────────┐  │
│  │ AlStatusBar                   │  │
│  ├───────────────────────────────┤  │
│  │ Header · back · title · prog  │  │
│  ├───────────────────────────────┤  │
│  │ Content (flex: 1)             │  │
│  │  · screen-specific blocks     │  │
│  ├───────────────────────────────┤  │
│  │ Footer · AlButton primary     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

All 12 screens comply. `PurchaseStepShell` adds `hideFooter` and imports purchase-specific CSS. Both shells share `onboarding-step-shell.css`.

---

## Mapping to existing inventory

| Inventory entry | Audit finding | Action before Prepaid |
|-----------------|---------------|----------------------|
| `FormFieldStack` | Confirmed in R01, R03–R05 | Implement composition |
| `FlowProgressHeader` | Lives in shell today | Merge shells first |
| `PlanCarousel` | P01 CSS ready | Implement when Prepaid has tiers |
| `CheckoutSummary` | P04 flat rows | Implement with card surface |
| `RiderSelectorRow` | P03 only | Defer unless Prepaid needs riders |
| `LegalConsentBlock` | R06 `ob-legal-copy` + checkbox | Implement before Prepaid legal step |
| `PaymentStatusHero` | P05/P06 differ from R01/R02 heroes | Keep local until shapes converge |
| `VehicleSummary` | R02 single use | Core candidate, not Prepaid blocker |
| `ActivationSuccess` | Partial overlap with state heroes | Do not merge prematurely |

---

## Recommendation before Prepaid

### Must do (blocks scalable Prepaid work)

1. **Merge `OnboardingStepShell` + `PurchaseStepShell` → `FlowStepShell`**  
   Prepaid would introduce a third ~95% duplicate without this. Parameterize `{ phase, stepTotal, progressLabel, hideFooter }`.

2. **Extract `InlineStatusBanner`**  
   Seven copy-paste banner blocks across purchase; Prepaid will add payment and balance errors.

3. **Extract `EmptyStateHero`**  
   Eight hero blocks across shared + purchase; Prepaid needs empty-wallet and load-failure states.

### Should do (quality / velocity)

4. **Extract `FormFieldStack`** — drop redundant `AlStack` wrapper; standardize R01–R05 input column.  
5. **Extract `LegalConsentBlock`** — R06 pattern repeats in every flow including Prepaid.  
6. **Extract `CheckoutSummary`** — before Prepaid order recap screens.  
7. **Align layout constants** — consider promoting `24.5625rem` viewport max to a shared layout token.

### Can defer

8. `PlanCarousel` — only if Prepaid includes multi-tier plan selection.  
9. `RiderSelectorRow` — not Prepaid-critical.  
10. Core promotion to `@autolokate/ui` — wait for 2+ flows on identical props.  
11. P06 Figma celebration layout / secondary CTA — terminal UX polish.

### Explicit non-actions (per audit scope)

- Do **not** create components in this phase  
- Do **not** modify existing screens  
- Prepaid implementation should **consume** compositions built in a follow-up extraction phase

---

## Onboarding health score

| Dimension | Weight | Score | Rationale |
|-----------|--------|-------|-----------|
| DS import compliance | 20% | **100** | All primitives from `@autolokate/ui` / `@autolokate/icons` |
| Token hygiene | 15% | **96** | No hardcoded colors; minor layout `rem` constants |
| Shell architecture | 15% | **88** | Strong extraction + `AlScreenBg`; dual shell debt remains |
| CSS centralization | 15% | **92** | Shared patterns in shell CSS files, not per-screen |
| JSX DRY | 20% | **68** | Banners, heroes, field stacks, state flags repeat |
| Composition readiness | 15% | **75** | Inventory documented; zero implementations |

### **Overall: 86 / 100 — B+ (Good)**

| Grade | Range | Meaning |
|-------|-------|---------|
| A | 90–100 | Prepaid-ready with minimal extraction |
| **B+** | **85–89** | **Sound architecture; extract P0 compositions first** |
| B | 80–84 | Proceed with caution; duplication will compound |
| C | <80 | Block Prepaid until shell/composition debt resolved |

**Verdict:** Onboarding is **fit to start Prepaid** after P0 composition extraction (unified shell, status banner, empty state hero). DS compliance is excellent; duplication is manageable and well-catalogued.

---

## Verification commands

```bash
pnpm --filter @autolokate/qr lint
pnpm --filter @autolokate/qr build
pnpm --filter @autolokate/qr dev   # Shared + Purchase state QA
```

---

## Decision

**Phase 6.5 audit complete.** No code changes made. Proceed to Prepaid **after** implementing P0 onboarding compositions (`FlowStepShell`, `InlineStatusBanner`, `EmptyStateHero`) in a dedicated extraction phase — not during this audit.
