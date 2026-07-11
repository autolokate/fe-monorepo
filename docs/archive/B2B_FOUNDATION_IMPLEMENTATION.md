# B2B Foundation Implementation

Phase B2B foundation for **Consumer · QR Activation — B2B (Pre-Paid)** and **Consumer · QR Activation — B2B2C**.

**Figma file:** `FtHCUnE0HH586PtG5yJyG0`  
**Build verified:** `pnpm --filter @autolokate/qr build`

---

## Route graph

```
/journey/flow-hub                    [QA only]
  ├─ Purchase  → /journey/auth/mobile → … → /journey/purchase/*  (unchanged)
  ├─ Prepaid   → /journey/prepaid/welcome
  └─ B2B2C     → /journey/b2b2c/welcome

/journey/home
  ├─ Purchase  → /journey/auth/mobile
  ├─ Prepaid   → /journey/prepaid/welcome
  ├─ B2B2C     → /journey/b2b2c/welcome
  └─ Flow Hub (QA) → /journey/flow-hub

Prepaid journey
  /journey/prepaid/welcome
    → Activate my cover
    → /journey/auth/mobile (A1)
    → /journey/auth/otp (A2)
    → /journey/auth/vehicle-owner (A3)
    → /journey/emergency/* (R0 or E0 via handoff)
    → /journey/completed

B2B2C journey
  /journey/b2b2c/welcome            [plan only · Figma 386:889]
  /journey/b2b2c/welcome/plan-rider [plan + rider · Figma 443:37]
    → Activate my cover
    → /journey/auth/* (shared)
    → /journey/emergency/*
    → /journey/completed
```

**Removed from both B2B journeys (not routed):**

- Vehicle capture (R03–R05)
- Plan selection (R06–R07)
- Checkout / payment (R08–R10)

**Not built (per scope):**

- APIs
- QR scanning
- Payment

---

## Reuse matrix

| Step | Component / module | Reused? | Notes |
|------|-------------------|---------|-------|
| Auth A1 Mobile | `AuthRoutes` → `A1MobileScreen` | Yes | No duplication |
| Auth A2 OTP | `A2OtpScreen` | Yes | |
| Auth A3 Name | `A3VehicleOwnerScreen` | Yes | |
| Emergency | `EmergencyRoutes` + existing screens | Yes | Unmodified UI |
| Plan limits | `emergency-limits.ts` | Yes | `getEmergencyPlanLimits`, `shouldEnterRiderPrompt` |
| Purchase flow | `PurchaseRoutes` | Untouched | No changes |
| Welcome shell | `WelcomeActivationShell` | New | Figma welcome layout (scroll body + pinned CTA) |
| Partner card | `PartnerActivationCard` | New | Figma `AlPartnerCard` (608:271) |
| Plan card | `PlanActivationCard` | New | Figma `AlPlanCardW/Activation` (615:297) |
| Entitlement seed | `applyLandingEntitlementToSession` | New | Writes `session.purchase` + `session.vehicle` |
| Post-auth routing | `getPostAuthActivationPath` + `getEmergencyHandoffPath` | Extended | Prepaid/B2B2C skip purchase activation |

---

## Figma mapping

### Pre-paid welcome (`411:38`)

| Element | Figma copy | Implementation |
|---------|-----------|----------------|
| Title | Your cover is pre-paid | `PrepaidWelcomeScreen` |
| Body | Sharma Fleet has set up and paid for your Autolokate protection. Nothing to pay. | |
| Section | Covered by | |
| Partner | Sharma Fleet · SF · Pre-paid by your company | `PartnerActivationCard` |
| Plan label | YOUR PLAN · For MH 12 AB 1234 | `PlanActivationCard` |
| Plan | Shield · Active · Included | Demo config `shield`, `riderCount: 0` |
| CTA | Activate my cover | Primary footer button |

**Loading / error (parity with Partner welcome — no separate Figma frames):**

| State | Title | Body / panel | CTA |
|-------|-------|--------------|-----|
| Loading | Your cover is pre-paid | Skeleton partner + plan cards | Loading your plan… |
| Error | Your cover is pre-paid | We couldn't reach the server just now. + error panel | Retry |

QA: `?demo=loading` · `?demo=error` on `/journey/prepaid/welcome`

### Partner welcome · plan only (`386:889`)

| Element | Figma copy | Implementation |
|---------|-----------|----------------|
| Title | Welcome to Autolokate | `PartnerWelcomeScreen` |
| Body | Sharma Motors set up and paid for your cover — just activate it. | |
| Section | You got this from | |
| Partner | Sharma Motors · SM · Authorised partner | |
| Plan | Secure · Paid · ₹999/yr | `plan-only` variant |
| CTA | Activate my cover | |

### Partner welcome · plan + rider (`443:37`)

| Body | Sharma Motors set up and paid for your cover and rider — just activate. |
| Addon | Rider cover row when `riderCount > 0` |

Route: `/journey/b2b2c/welcome/plan-rider`

### Partner welcome · Loading (`588:1798`)

| CTA | Loading your plan… |
| Content | Skeleton partner + plan cards |

### Partner welcome · Error (`588:1850`)

| Body | We couldn't reach the server just now. |
| Panel title | Couldn't load your plan |
| Panel body | Check your connection and tap retry. Your cover is safe — it's already paid for. |
| CTA | Retry |

QA: `?demo=loading` · `?demo=error` on B2B2C welcome routes

---

## Entitlement sources

| Journey | Source | Session key | Emergency input |
|---------|--------|-------------|-----------------|
| Prepaid | `prepaid-landing-config.ts` (demo) | `session.prepaid.entitlement` | Seeded into `session.purchase` on Activate |
| B2B2C | `partner-landing-config.ts` (demo) | `session.b2b2c.entitlement` | Seeded into `session.purchase` on Activate |

On **Activate my cover**, `applyLandingEntitlementToSession()` sets:

- `purchase.selectedPlanId`
- `purchase.riderCount`
- `purchase.paymentStatus: 'success'`
- `vehicle.plate` + `vehicle.confirmed: true`

`getEmergencyHandoffPath(session)` then routes:

- Rider entitlement → `/journey/emergency/rider-prompt` (R0)
- No rider entitlement → `/journey/emergency/contacts-empty` (E0)

---

## Responsive QA

Target widths (Figma device frames): **320 · 360 · 375 · 390 · 414**

| Check | Expected |
|-------|----------|
| Frame max-width | `24.5625rem` (393px) via `journey-frame` + step chrome |
| Horizontal padding | 16px (`ob-step-chrome__frame`) |
| Section gap | 20px (`ob-welcome-shell__content`) |
| Heading gap | 8px |
| Pinned CTA | Footer fixed at bottom with safe-area inset |
| Scroll | Partner + plan cards scroll; header + CTA pinned |
| Long plan features | Wrap inside card; no horizontal overflow |

**Manual QA paths:**

1. `/journey/flow-hub` → Prepaid → welcome → auth → emergency
2. `/journey/flow-hub` → B2B2C → welcome → auth → emergency
3. `/journey/b2b2c/welcome/plan-rider` → confirm R0 handoff (1 rider slot)
4. Toggle theme on `/journey/home` → re-open welcome screens

---

## Theme QA

| Surface | Dark | Light |
|---------|------|-------|
| Screen background | `AlScreenBg` protected variant | Same token swap via `data-theme` |
| Partner card | `--al-color-surface` + outline | |
| Plan card | Surface + success status pill | |
| Skeleton | `--al-color-surface-variant` | |
| Error icon | `--al-color-warning` | |
| Muted copy | `--al-color-on-surface-muted` | |
| Primary CTA | `--al-color-on-primary` on primary fill | |

Toggle: Home screen Dark / Light buttons (`THEME_KEY` persistence).

---

## Parity checklist

### Prepaid welcome

- [x] Default frame copy + layout (`411:38`)
- [x] Loading state (skeleton + disabled CTA)
- [x] Error state (panel + Retry)
- [x] CTA label: Activate my cover
- [x] Dark + light theme tokens
- [x] No vehicle / plan / checkout / payment routes

### Partner welcome

- [x] Default plan-only (`386:889`)
- [x] Default plan+rider (`443:37`)
- [x] Loading (`588:1798`)
- [x] Error (`588:1850`)
- [x] CTA labels per Figma
- [x] Dark + light theme tokens

### Journey wiring

- [x] Flow Hub (QA) with Purchase / Prepaid / B2B2C cards
- [x] Shared auth reuse (A1 → A2 → A3)
- [x] Post-auth → emergency (not purchase activation)
- [x] `emergency-limits.ts` drives rider/contact caps
- [x] Purchase flow unchanged
- [x] No API / QR / payment implementation

---

## Key files

| Area | Path |
|------|------|
| Flow Hub | `apps/qr/src/journey/screens/FlowHubScreen.tsx` |
| Journey routes | `apps/qr/src/journey/routes/JourneyRoutes.tsx` |
| Prepaid routes | `apps/qr/src/journey/routes/PrepaidRoutes.tsx` |
| B2B2C routes | `apps/qr/src/journey/routes/B2b2cRoutes.tsx` |
| Auth handoff | `apps/qr/src/journey/routes/JourneySharedAuthRoute.tsx` |
| Post-auth routing | `apps/qr/src/journey/activation-routing.ts` |
| Prepaid welcome | `apps/qr/src/features/qr-prepaid/screens/prepaid-welcome/` |
| Partner welcome | `apps/qr/src/features/qr-b2b2c/screens/partner-welcome/` |
| Welcome compositions | `apps/qr/src/components/compositions/welcome-activation/` |
| Shared B2B helpers | `apps/qr/src/features/b2b-shared/` |
| Prepaid config | `apps/qr/src/features/qr-prepaid/data/prepaid-landing-config.ts` |
| Partner config | `apps/qr/src/features/qr-b2b2c/data/partner-landing-config.ts` |

---

## QA entry points

```
/journey/flow-hub
/journey/prepaid/welcome
/journey/prepaid/welcome?demo=loading
/journey/prepaid/welcome?demo=error
/journey/b2b2c/welcome
/journey/b2b2c/welcome/plan-rider
/journey/b2b2c/welcome?demo=loading
/journey/b2b2c/welcome?demo=error
```
