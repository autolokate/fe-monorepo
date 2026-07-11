# Flow Entry Implementation

Production landing screen for choosing a consumer QR activation journey.

**Figma file:** `FtHCUnE0HH586PtG5yJyG0`  
**Build verified:** `pnpm --filter @autolokate/qr build`

---

## Route graph

```
/  →  /journey                         [production default]

/journey                              FlowEntryScreen
  ├─ Purchase option
  │    → /journey/auth/mobile (A1)
  │    → /journey/auth/otp (A2)
  │    → /journey/auth/vehicle-owner (A3)
  │    → /journey/purchase/* (vehicle → plan → checkout → payment)
  │    → /journey/emergency/*
  │    → /journey/completed
  │
  ├─ Pre-Paid option
  │    → /journey/prepaid/welcome
  │    → Activate my cover
  │    → /journey/auth/* (shared)
  │    → /journey/emergency/*
  │    → /journey/completed
  │
  └─ B2B2C option
       → /journey/b2b2c/welcome
       → Activate my cover
       → /journey/auth/* (shared)
       → /journey/emergency/*
       → /journey/completed

/journey/flow-hub                     [QA only — unchanged layout]
/journey/home                         → redirects to /journey
```

**This screen only selects the journey.** Auth, purchase, prepaid welcome, partner welcome, and emergency routes are reused without duplication.

---

## Journey selection mapping

| Option label | `ActivationFlowId` | First route | Phase set |
|--------------|-------------------|-------------|-----------|
| Consumer QR Activation + Purchase | `purchase` | `/journey/auth/mobile` | `shared-auth` |
| Consumer QR Activation — B2B (Pre-Paid) | `prepaid` | `/journey/prepaid/welcome` | `flow-select` |
| Consumer QR Activation — B2B2C | `b2b2c` | `/journey/b2b2c/welcome` | `flow-select` |

Navigation is centralized in `selectActivationFlow()` (`journey/navigation/select-activation-flow.ts`) and shared by `FlowEntryScreen` and `FlowHubScreen`.

---

## Screen copy

| Element | Copy |
|---------|------|
| Title | Activate your protection |
| Description | Choose your activation type |
| Option 1 | Consumer QR Activation + Purchase |
| Option 2 | Consumer QR Activation — B2B (Pre-Paid) |
| Option 3 | Consumer QR Activation — B2B2C |

Labels come from `flowLabels` in `journey/constants.ts`.

---

## Figma parity notes

Flow Entry follows the same consumer screen system as welcome and auth shells:

| Token / pattern | Value | Figma reference |
|-----------------|-------|-----------------|
| Background | `AlScreenBg` · `variant="protected"` | `AlScreenBg` (544:262) |
| Frame max-width | `24.5625rem` (393px) | Standard device frame |
| Horizontal padding | 16px | Step chrome / welcome shells |
| Title | `AlHeading` h2 · Headline | Welcome / auth headings |
| Description | `AlText` muted · Body | 8px below title |
| Section gap | 20px | Body rhythm |
| Option cards | 16px padding · 16px radius · 1px outline | AlPartnerCard / activation cards (608:271) |
| Option label | Inter 16px / 600 | Partner card name style |
| Option min-height | 64px | Touch target |
| Chevron | `chevron-down` rotated −90° | List affordance |
| Option stack gap | 12px | Between cards |

**Not used on production entry:** QA Flow Hub layout (`journey-home` + plain `AlButton` stack).

---

## Responsive QA

Target widths: **320 · 360 · 375 · 390 · 414**

| Check | Expected |
|-------|----------|
| Frame | Centered, `min(100%, 24.5625rem)` |
| Option labels | Wrap across 2 lines on 320px without overflow |
| Touch targets | Each option ≥ 64px tall |
| Safe areas | Top/bottom padding includes `env(safe-area-inset-*)` |
| Scroll | Not required on default content; body grows if text wraps |

**Manual path:** `/` → `/journey` → tap each option → confirm correct first route.

---

## Dark / Light parity

| Surface | Token |
|---------|-------|
| Screen canvas | `--al-color-background` via `AlScreenBg` |
| Option card fill | `--al-color-surface` |
| Option border | `--al-color-outline` / `--al-color-outline-strong` on hover |
| Title | `--al-color-on-surface` |
| Description + chevron | `--al-color-on-surface-muted` |
| Focus ring | `--al-color-focus` |

Toggle theme via `data-theme` on `document.documentElement` (same mechanism as other onboarding screens). Verify both themes on `/journey`.

---

## Key files

| File | Role |
|------|------|
| `journey/screens/FlowEntryScreen.tsx` | Production landing UI |
| `journey/screens/flow-entry-screen.css` | Layout spacing |
| `components/compositions/flow-entry/FlowOptionCard.tsx` | Figma-styled option row |
| `journey/navigation/select-activation-flow.ts` | Shared journey selection logic |
| `journey/routes/JourneyRoutes.tsx` | `/journey` → `FlowEntryScreen` |
| `journey/screens/FlowHubScreen.tsx` | QA-only hub (unchanged layout) |

---

## QA entry points

```
/journey
/journey/flow-hub          (QA hub — not production styling)
/journey/home              (redirects to /journey)
```

Prepaid and B2B2C welcome back buttons return to `/journey` (flow entry), not the QA hub.
