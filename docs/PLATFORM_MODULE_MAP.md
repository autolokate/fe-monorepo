# Platform Module Map

**Product:** Autolokate PWA  
**Date:** 2026-06-17  
**Scope:** Code organization and ownership — **no implementation changes**

This document classifies every major platform area, its ownership, entry points, and dependencies. All four consumer journeys are modules of one product.

---

## Platform overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Autolokate PWA (single app)                  │
│                   apps/qr (deployable)                   │
├─────────────────────────────────────────────────────────────────┤
│  Journey Orchestrator                                            │
│  ├── /journey/*          Activation journeys (JourneyProvider)   │
│  └── /pwa/scan/*         Post-activation scanner (PwaScanProvider)│
├─────────────────────────────────────────────────────────────────┤
│  Shared packages (monorepo)                                       │
│  design-system · ui · icons · brand · auth · api-client · utils  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module classification

### 1. Shared Auth

**Purpose:** Mobile capture, OTP verification, vehicle owner name, legal links. Used by all activation journeys and partially reused by post-activation PWA (bystander verify).

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/shared-auth/` |
| **Screens** | A1 Mobile, A2 OTP, A3 Vehicle owner |
| **Legal** | `features/shared-legal/` (L1 Privacy, L2 Terms) |
| **Routes** | `/journey/auth/mobile`, `/journey/auth/otp`, `/journey/auth/vehicle-owner`, `/journey/auth/legal/*` |
| **PWA reuse** | `/pwa/scan/verify/mobile`, `/pwa/scan/verify/otp`, `/pwa/scan/verify/name` — UI components only, separate session |
| **Validation** | `features/shared-auth/auth-flow/auth-flow.validation.ts` |
| **Registry step IDs** | `shared.mobile`, `shared.otp`, `shared.account` |
| **Depends on** | `@autolokate/ui` (AlTextField, AlOtpInput, AuthStepShell), journey progress |
| **Session fields** | `session.auth.{ mobile, mobileDisplay, consentAccepted, otpVerified, ownerName }` |

**Does not own:** Journey routing, flow selection, payment, emergency.

---

### 2. Activation

Activation is three journey variants sharing auth and emergency suffix. Grouped under **Activation** product area but implemented as separate feature folders.

#### 2a. Purchase (Consumer QR Activation + Purchase)

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/qr-purchase/` |
| **Routes** | `/journey/purchase/r03-vehicle` through `/journey/purchase/r10c-payment-unconfirmed` |
| **Route file** | `journey/routes/PurchaseRoutes.tsx` |
| **Guards** | `RequireAuthCompleted` + `RequireSelectedFlowMatch('purchase')` |
| **Registry flow ID** | `purchase` |
| **Entry** | `/journey` card → auth → R03 |
| **Terminal** | R10 payment success → emergency |
| **Session fields** | `session.purchase.*`, `session.vehicle.*` |
| **Depends on** | Shared Auth, `@autolokate/ui`, purchase pricing helpers |

#### 2b. Pre-Paid B2B

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/qr-prepaid/` |
| **Routes** | `/journey/prepaid/welcome` (+ legacy PR01–PR03 screens in folder) |
| **Route file** | `journey/routes/PrepaidRoutes.tsx` |
| **Registry flow ID** | `prepaid` |
| **Entry** | `/journey` card → welcome → auth → emergency handoff |
| **Session fields** | `session.prepaid.entitlement`, seeded `session.purchase` + `session.vehicle` |
| **Depends on** | `features/b2b-shared/` (landing entitlement), Shared Auth, activation-routing |

#### 2c. B2B2C

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/qr-b2b2c/` |
| **Routes** | `/journey/b2b2c/welcome`, `/journey/b2b2c/welcome/plan-rider` |
| **Route file** | `journey/routes/B2b2cRoutes.tsx` |
| **Registry flow ID** | `b2b2c` |
| **Entry** | `/journey` card → partner welcome → auth → emergency handoff |
| **Session fields** | `session.b2b2c.{ entitlement, variant }`, seeded purchase/vehicle |
| **Depends on** | `features/b2b-shared/`, Shared Auth, activation-routing |

#### Activation cross-cutting

| Concern | Owner path |
|---------|------------|
| Flow entry screen | `journey/screens/FlowEntryScreen.tsx` |
| Flow selection logic | `journey/navigation/select-activation-flow.ts` |
| Post-auth routing | `journey/activation-routing.ts` |
| B2B landing seed | `features/b2b-shared/apply-landing-entitlement.ts` |
| Legacy purchase screens | `features/purchase-activation/` (deprecated, not routed) |
| Fleet B2B (future) | `features/qr-b2b/` (registry only, no active routes) |

---

### 3. Emergency Setup

**Purpose:** Rider cover setup (R0–R4) and emergency contact capture (E0–E5). Shared suffix appended to all activation journeys.

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/emergency/` |
| **Routes** | `/journey/emergency/rider-prompt` through `/journey/emergency/contacts-summary` |
| **Route file** | `journey/routes/EmergencyRoutes.tsx` |
| **Guards** | `RequireAuthCompleted` + `RequireSelectedFlow` |
| **Registry flow ID** | `emergency` |
| **Handoff logic** | `journey/activation-routing.ts` → `getEmergencyHandoffPath()`, `getPurchasePostPaymentEmergencyPath()` |
| **Entitlement rules** | `features/emergency/emergency-limits.ts` |
| **Session fields** | `session.emergency.{ riderSkipped, rider, riders, contactDraft, contacts }` |
| **Terminal** | `/journey/completed` |
| **Depends on** | Shared Auth (complete), purchase plan/rider from session, `@autolokate/ui` |

**Screen suffix convention:** R* = rider, E* = emergency contacts.

---

### 4. Post-Activation Scanner

**Purpose:** Bystander QR scan experience — vehicle hub, Park Me, SOS. Fully activated vehicle, no purchase flow.

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/post-activation-pwa/` |
| **Routes** | `/pwa/scan/*` (30 frames) |
| **Route files** | `PwaScanRoutes.tsx`, `pwa-shared-routes.tsx`, `pwa-park-me-routes.tsx`, `pwa-sos-routes.tsx` |
| **Provider** | `PwaScanProvider` — **not** `JourneyProvider` |
| **Entry** | `/journey` card 4 → `/pwa/scan/loading` |
| **Sub-flows** | Verify (bystander auth), Park Me, SOS |
| **Session** | `al-pwa-scan-v1` (isolated) |
| **Depends on** | Shared Auth **UI only**, `@autolokate/ui`, `@autolokate/design-system` |

**Does not own:** Journey session, activation, payment, owner emergency setup.

---

### 5. Shared UI

**Purpose:** Design-system-aligned React components used across all modules.

| Attribute | Value |
|-----------|-------|
| **Owner** | `packages/ui/` (`@autolokate/ui`) |
| **Preview app** | `apps/ui-preview/` |
| **Key primitives** | AlButton, AlIconButton, AlTextField, AlOtpInput, AlPlateInput, AlChip, plan/vehicle cards, SOS hold button |
| **Shells** | AuthStepShell, FlowStepShell (onboarding compositions) |
| **Depends on** | `@autolokate/design-system`, `@autolokate/icons` |

Onboarding-specific compositions live in `apps/qr/src/components/compositions/` — not exported from `@autolokate/ui`.

---

### 6. Shared Session

**Purpose:** Client-side state persistence. Two stores in Phase 1.

#### Journey session

| Attribute | Value |
|-----------|-------|
| **Owner** | `journey/JourneyContext.tsx`, `journey/persistence.ts` |
| **Schema** | `journey/types.ts` |
| **Storage** | `sessionStorage` → `al-journey-v1` |
| **Flow key** | `localStorage` → `al-selected-flow` |
| **Used by** | All `/journey/*` modules except post-activation card exit |

#### PWA scan session

| Attribute | Value |
|-----------|-------|
| **Owner** | `features/post-activation-pwa/context/PwaScanContext.tsx` |
| **Schema** | `features/post-activation-pwa/context/pwa-scan-types.ts` |
| **Storage** | `sessionStorage` → `al-pwa-scan-v1` |
| **Used by** | `/pwa/scan/*` only |

**Platform note:** Shared Session is a **conceptual layer** with two implementations today. Phase 2 may introduce a unified provider with namespaced slices — see `SINGLE_PWA_ARCHITECTURE.md`.

---

### 7. Shared Design System

**Purpose:** Tokens, theme, typography, color roles, global interaction reset.

| Attribute | Value |
|-----------|-------|
| **Owner** | `packages/design-system/` (`@autolokate/design-system`) |
| **Entry CSS** | `packages/design-system/src/theme.css` |
| **Sub-modules** | `input-reset.css`, `interaction-reset.css` |
| **Theme switch** | `data-theme="light" \| "dark"` on `<html>` |
| **Consumed by** | All apps via `import '@autolokate/design-system/theme.css'` |

Figma file `FtHCUnE0HH586PtG5yJyG0` is the visual source of truth.

---

## Journey orchestration layer

Cross-cutting infrastructure — not a user-facing module but owns routing glue.

| Concern | Path | Owns |
|---------|------|------|
| Top router | `journey/JourneyOrchestrator.tsx` | `/journey/*` vs `/pwa/scan/*` split |
| Journey context | `journey/JourneyContext.tsx` | Session read/write, phase, selectedFlow |
| Route tree | `journey/routes/JourneyRoutes.tsx` | All journey mounts |
| Route guards | `journey/guards/JourneyRouteGuards.tsx` | Auth + flow match |
| Flow registry | `flow/registry/` | Declarative catalog (metadata) |
| Guard catalog | `flow/guards/catalog.ts` | Guard IDs + labels |
| Route schema | `router/routes.schema.ts` | Canonical screen catalog |
| Feature registry | `features/registry.ts` | Feature metadata index |

---

## Module → journey mapping

| Dev entry card | Module(s) | Auth | Activation body | Emergency | Complete |
|----------------|-----------|------|-----------------|-----------|----------|
| Consumer QR Activation + Purchase | qr-purchase | ✓ | R03–R10 | ✓ | `/journey/completed` |
| B2B Pre-Paid | qr-prepaid + b2b-shared | ✓ | Welcome only | ✓ | `/journey/completed` |
| B2B2C | qr-b2b2c + b2b-shared | ✓ | Welcome only | ✓ | `/journey/completed` |
| QR Scan (Post-Activation) | post-activation-pwa | Bystander verify | — | SOS contacts | SOS terminal states |

---

## Dependency matrix

| Module | Shared Auth | Activation | Emergency | PWA Scanner | Shared UI | Journey Session | PWA Session | Design System |
|--------|:-----------:|:----------:|:---------:|:-------------:|:---------:|:---------------:|:-----------:|:-------------:|
| Shared Auth | — | → | → | UI reuse | ← | writes | — | ← |
| Purchase | ← | — | → | — | ← | writes | — | ← |
| Pre-Paid | ← | → | → | — | ← | writes | — | ← |
| B2B2C | ← | → | → | — | ← | writes | — | ← |
| Emergency | ← | ← | — | — | ← | writes | — | ← |
| PWA Scanner | UI only | — | — | — | ← | — | writes | ← |
| Shared UI | — | — | — | — | — | — | — | ← |
| Design System | — | — | — | — | → | — | — | — |

**Legend:** ← consumes · → consumed by · writes = mutates session

---

## Ownership rules (for contributors)

1. **Screen logic** lives in `features/<module>/screens/`.
2. **Route wiring** lives in `journey/routes/` — feature folders do not self-mount routes.
3. **Cross-journey routing decisions** live in `journey/activation-routing.ts` — not in individual screens.
4. **Reusable UI** goes to `packages/ui/`; onboarding-only compositions stay in `apps/qr/src/components/`.
5. **Session mutations** go through `JourneyContext.updateSession()` or `PwaScanContext` — not ad-hoc storage.
6. **New flows** register in `flow/registry/config/flows.config.ts` (catalog) and `features/registry.ts` (index).

---

## Related documents

- [SINGLE_PWA_ARCHITECTURE.md](./SINGLE_PWA_ARCHITECTURE.md) — platform architecture, Phase 1/2, migration
- [QR_ENTRY_STRATEGY.md](./QR_ENTRY_STRATEGY.md) — future QR-primary entry
