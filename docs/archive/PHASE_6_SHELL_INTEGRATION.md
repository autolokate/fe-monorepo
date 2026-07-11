# Phase 6 — Shell Integration

**Date:** 2026-06-17  
**Objective:** Integrate DS foundation (`AlScreenBg`) into onboarding shells before new flows  
**Scope:** Shared auth/legal (R01–R06) · Purchase (P01–P06) · shell layer only  
**Out of scope:** B2B · Prepaid · Emergency · new flows · screen content/layout changes

---

## Summary

Onboarding and purchase step shells now wrap all screen chrome in **`AlScreenBg variant="protected"`**, providing theme-aware canvas (`--al-color-background`) and green ambient tint (`--al-gradient-ambient-protected`).

**No individual screen files were modified.** R01–R06 and P01–P06 inherit the integration through `OnboardingStepShell` and `PurchaseStepShell`.

**QA:** `pnpm --filter @autolokate/qr build` ✓ · `lint` ✓

---

## 1. Screen inventory

| ID | Screen | Feature folder | Shell | `AlScreenBg` variant |
|----|--------|----------------|-------|----------------------|
| **R01** | Vehicle number | `features/shared-auth/screens/r01-vehicle-number` | `OnboardingStepShell` | `protected` |
| **R02** | Vehicle details | `features/shared-auth/screens/r02-vehicle-details` | `OnboardingStepShell` | `protected` |
| **R03** | Mobile number | `features/shared-auth/screens/r03-mobile-number` | `OnboardingStepShell` | `protected` |
| **R04** | OTP verification | `features/shared-auth/screens/r04-otp-verification` | `OnboardingStepShell` | `protected` |
| **R05** | Account creation | `features/shared-auth/screens/r05-account-creation` | `OnboardingStepShell` | `protected` |
| **R06** | Legal consent | `features/shared-legal/screens/r06-legal-consent` | `OnboardingStepShell` | `protected` |
| **P01** | Plan selection | `features/qr-purchase/screens/p01-plan-selection` | `PurchaseStepShell` | `protected` |
| **P02** | Plan details | `features/qr-purchase/screens/p02-plan-details` | `PurchaseStepShell` | `protected` |
| **P03** | Rider selection | `features/qr-purchase/screens/p03-rider-selection` | `PurchaseStepShell` | `protected` |
| **P04** | Checkout summary | `features/qr-purchase/screens/p04-checkout-summary` | `PurchaseStepShell` | `protected` |
| **P05** | Payment processing | `features/qr-purchase/screens/p05-payment-processing` | `PurchaseStepShell` | `protected` |
| **P06** | Payment success | `features/qr-purchase/screens/p06-payment-success` | `PurchaseStepShell` | `protected` |

**Total integrated:** 12 screens · **0 screen-level diffs**

---

## 2. Shell inventory

| Shell | Path | Used by | Before | After |
|-------|------|---------|--------|-------|
| **OnboardingStepShell** | `components/onboarding-step-shell/OnboardingStepShell.tsx` | R01–R06 | `<div class="ob-shell">` + flat `--al-color-background` | `<AlScreenBg variant="protected" class="ob-shell">` |
| **PurchaseStepShell** | `components/purchase-step-shell/PurchaseStepShell.tsx` | P01–P06 | `<div class="ob-shell ob-shell--purchase">` + flat background | `<AlScreenBg variant="protected" class="ob-shell ob-shell--purchase">` |

### CSS changes (`onboarding-step-shell.css`)

| Rule | Change |
|------|--------|
| `.ob-shell` flat background | **Removed** — canvas from `AlScreenBg` |
| `.ob-shell.al-screen-bg` | Full-width tint layer · `min-height: 100dvh` |
| `.ob-shell.al-screen-bg .al-screen-bg__content` | Preserves column flex · `max-width: 24.5625rem` · centered |

Header, content, footer spacing (`ob-shell__*`) **unchanged**.

### Theme behavior

| Theme | Canvas | Ambient tint |
|-------|--------|--------------|
| Light | `#F4F6F9` (`--al-neutral-canvas`) | Green radial @ 8% |
| Dark | `#0A0A0C` (`--al-neutral-950`) | Green radial @ 8% |

Toggle via `ScreenDevApp` theme controls or `data-theme` on `<html>`.

---

## 3. Screenshots matrix

Capture via onboarding dev shell:

```bash
pnpm --filter @autolokate/qr dev
```

Open `ScreenDevApp` → select screen → set viewport → toggle Light/Dark → hide panel for clean capture.

| Screen | Figma ref | Light 320 | Light 414 | Dark 320 | Dark 414 | Ambient tint visible |
|--------|-----------|-----------|-----------|----------|----------|----------------------|
| R01 | INPUTS · Plate | ✓ | ✓ | ✓ | ✓ | ✓ |
| R02 | 170:71 Confirm vehicle | ✓ | ✓ | ✓ | ✓ | ✓ |
| R03 | INPUTS · Mobile | ✓ | ✓ | ✓ | ✓ | ✓ |
| R04 | INPUTS · OTP | ✓ | ✓ | ✓ | ✓ | ✓ |
| R05 | INPUTS · Full name | ✓ | ✓ | ✓ | ✓ | ✓ |
| R06 | Legal · Terms | ✓ | ✓ | ✓ | ✓ | ✓ |
| P01 | 232:102 Choose plan | ✓ | ✓ | ✓ | ✓ | ✓ |
| P02 | Secure tier detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| P03 | Rider add-on | ✓ | ✓ | ✓ | ✓ | ✓ |
| P04 | Checkout summary | ✓ | ✓ | ✓ | ✓ | ✓ |
| P05 | Payment processing | ✓ | ✓ | ✓ | ✓ | ✓ |
| P06 | Payment success | ✓ | ✓ | ✓ | ✓ | ✓ |

### Responsive QA viewports

| Width | Dev control | Layout check |
|-------|-------------|--------------|
| **320** | Viewport button | Content column fills frame; tint scales with `min(110vw, 45rem)` |
| **360** | Viewport button | Same |
| **375** | Viewport button | Same |
| **390** | Viewport button (default) | Reference mobile width |
| **414** | Viewport button | Max common phone width |

**Structural verification (automated):** build + lint pass. **Visual verification:** manual via dev shell at listed widths.

### Figma alignment

| DS element | Figma node | Onboarding |
|------------|------------|------------|
| AlScreenBg tint=Green | [`544:262`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=544-262) | `variant="protected"` on all 12 screens |
| Light canvas | `483:107` · `#F4F6F9` | Via semantic background token |
| Dark canvas | `483:107` · `#0A0A0C` | Via semantic background token |

---

## 4. Files changed

```
apps/qr/src/components/onboarding-step-shell/OnboardingStepShell.tsx
apps/qr/src/components/onboarding-step-shell/onboarding-step-shell.css
apps/qr/src/components/purchase-step-shell/PurchaseStepShell.tsx

docs/PHASE_6_SHELL_INTEGRATION.md
```

**Not modified:** individual R*/P* screen TSX · flow registry · guards · routing · B2B/prepaid/emergency features

---

## 5. Remaining onboarding gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| **Production flow routing** | P1 | Screens live in dev shell; flow engine wiring to production app shell TBD |
| **AlScreenBg tint at 320–360** | P3 | DS minor drift — tint ellipse slightly narrower than Figma 393px reference ([FIGMA_RC2_PARITY_AUDIT](./FIGMA_RC2_PARITY_AUDIT.md)) |
| **Per-flow tint variants** | P2 | Emergency/attention flows would use `attention` / `emergency` — not built |
| **B2B / Prepaid / Emergency flows** | — | Explicitly out of scope |
| **Back navigation wiring** | P2 | `AlIconButton` back control present; no step navigation handler |
| **CTA / form submission** | P2 | Footer buttons presentational; no API or flow advance |
| **StatusBar** | P3 | Device chrome mock; not tied to real device |
| **Safe-area on full-bleed tint** | P3 | Footer safe-area preserved; tint is decorative only |
| **Pixel screenshots in CI** | P3 | Manual dev-shell capture; no visual regression pipeline |

---

## 6. Decision

Phase 6 completes **shell-level DS integration** for all existing shared and purchase onboarding screens. The green protected ambient background matches Figma screen composition (`544:262` back-most layer).

**Safe to proceed** to new flow work (B2B, Prepaid, etc.) on top of integrated shells — each new flow should reuse `OnboardingStepShell` / `PurchaseStepShell` or pass an explicit `AlScreenBg` variant at the shell layer only.
