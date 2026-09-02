# Phase 10 — Purchase Flow Alignment

**App:** `@autolokate/qr`  
**Date:** 2026-06-17  
**Scope:** Orchestration integration only — reuse existing P01–P06 screens, no redesign, no new UI components, no design-system changes  
**Baseline:** [PHASE_9_JOURNEY_ORCHESTRATOR.md](./PHASE_9_JOURNEY_ORCHESTRATOR.md)

---

## Executive summary

The **Purchase flow is connected to the Journey Orchestrator**. The Phase 9 placeholder at `/journey/purchase/*` is replaced with route-driven navigation through existing P01–P06 screens. After P06, the journey continues to the **Emergency segment entry** (placeholder acceptable).

**Flow:**

```
purchase.qr-scan (bootstrap redirect)
  → P01 Plan Selection
  → P02 Plan Details
  → P03 Rider Selection
  → P04 Checkout Summary
  → P05 Payment Processing (auto-advance)
  → P06 Payment Success
  → Emergency (/journey/emergency/rider-setup)
```

---

## 1. Route map

| Path                                       | Step ID                       | Screen   | Guard chain                                                           |
| ------------------------------------------ | ----------------------------- | -------- | --------------------------------------------------------------------- |
| `/journey/purchase`                        | —                             | Redirect | → `/journey/purchase/qr-scan`                                         |
| `/journey/purchase/qr-scan`                | `purchase.qr-scan`            | Redirect | `RequireAuthCompleted` + `RequireSelectedFlowMatch('purchase')` → P01 |
| `/journey/purchase/p01-plan-selection`     | `purchase.plan-select`        | P01      | same                                                                  |
| `/journey/purchase/p02-plan-details`       | `purchase.plan-details`       | P02      | same                                                                  |
| `/journey/purchase/p03-rider-selection`    | `purchase.rider-select`       | P03      | same                                                                  |
| `/journey/purchase/p04-checkout-summary`   | `purchase.checkout-summary`   | P04      | same                                                                  |
| `/journey/purchase/p05-payment-processing` | `purchase.payment-processing` | P05      | same                                                                  |
| `/journey/purchase/p06-payment-success`    | `purchase.payment-success`    | P06      | same                                                                  |
| `/journey/purchase/*` (unknown)            | —                             | Redirect | → `/journey/purchase/qr-scan`                                         |

### Auth handoff (unchanged entry)

After R06, `JourneySharedAuthRoute` navigates to `/journey/purchase/qr-scan`, which immediately redirects to P01.

### Post-purchase handoff (new)

P06 **Continue** → `setPhase('emergency')` → `/journey/emergency/rider-setup`

---

## 2. Navigation graph

```mermaid
flowchart TD
  AUTH[R06 Legal Consent<br/>AUTH_COMPLETED] --> QR[/journey/purchase/qr-scan]
  QR -->|redirect| P01[P01 Plan Selection]
  P01 -->|Continue| P02[P02 Plan Details]
  P02 -->|Continue| P03[P03 Rider Selection]
  P03 -->|Continue| P04[P04 Checkout Summary]
  P04 -->|Continue| P05[P05 Payment Processing]
  P05 -->|auto 1.8s| P06[P06 Payment Success]
  P06 -->|Continue| EM[/journey/emergency/rider-setup]

  P01 -->|Back| AUTH
  P02 -->|Back| P01
  P03 -->|Back| P02
  P04 -->|Back| P03
  P05 -->|Back| P04
  P06 -->|Back| P05
```

### Back navigation rules

| Step    | Back target                       | Notes                                                          |
| ------- | --------------------------------- | -------------------------------------------------------------- |
| P01     | `/journey/auth/r06-legal-consent` | Re-enters auth segment at last step                            |
| P02–P06 | Previous purchase step            | Deterministic path map — no `navigate(-1)`                     |
| P05     | P04                               | Timer cancelled on unmount if user backs out during processing |

### P05 auto-advance

Payment processing auto-navigates to P06 after **1.8s** (orchestration-only simulation; screen UI unchanged). Footer remains in processing state per existing P05 design.

---

## 3. Refresh recovery

| Scenario                                | URL after refresh                          | Recovery behavior                                                         |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| Mid-purchase (e.g. P03)                 | `/journey/purchase/p03-rider-selection`    | **Stays on P03** if `selectedFlow=purchase` + `authStatus=AUTH_COMPLETED` |
| Purchase URL, auth incomplete           | Any `/journey/purchase/*`                  | Redirect → `/journey/auth/r01-vehicle-number`                             |
| Purchase URL, no flow selected          | Any `/journey/purchase/*`                  | Redirect → `/journey`                                                     |
| Purchase URL, wrong flow (e.g. prepaid) | Any `/journey/purchase/*`                  | Redirect → `/journey/prepaid/entry`                                       |
| Home refresh                            | `/journey`                                 | Home; `selectedFlow` restored from `localStorage` if present              |
| P05 refresh during timer                | `/journey/purchase/p05-payment-processing` | Timer restarts → auto-advances to P06 again                               |

**Source of truth:** URL path for step position; `sessionStorage` (`al-journey-v1`) for auth + flow; `localStorage` (`al-selected-flow`) for flow persistence across sessions.

**Not persisted in Phase 10:** Plan/rider/checkout selections (screens remain presentational). Form/session field persistence is deferred.

---

## 4. Persistence audit

| Key                | Storage          | Field                        | Purchase impact                                            |
| ------------------ | ---------------- | ---------------------------- | ---------------------------------------------------------- |
| `al-selected-flow` | `localStorage`   | `purchase`                   | Survives browser close; required for purchase route access |
| `al-journey-v1`    | `sessionStorage` | `authStatus: AUTH_COMPLETED` | Required for activation segment; cleared on tab close      |
| `al-journey-v1`    | `sessionStorage` | `selectedFlow`               | Mirrors localStorage on save                               |
| `al-qr-theme`      | `localStorage`   | `light` \| `dark`            | Applies to purchase screens via DS tokens                  |

### Write points

| Event                  | Persistence action                               |
| ---------------------- | ------------------------------------------------ |
| Home flow select       | `setSelectedFlow('purchase')` → both storages    |
| R06 complete           | `completeAuth()` → `authStatus = AUTH_COMPLETED` |
| P06 → Emergency        | `setPhase('emergency')` — in-memory only         |
| Start over (completed) | `clearJourney()` — clears both storages          |

---

## 5. Route protection audit

| Guard                                  | Applies to                | Condition                       | Redirect                                             |
| -------------------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------- |
| `RequireAuthCompleted`                 | All `/journey/purchase/*` | `authStatus !== AUTH_COMPLETED` | `/journey/auth/r01-vehicle-number`                   |
| `RequireAuthCompleted`                 | All `/journey/purchase/*` | `selectedFlow == null`          | `/journey`                                           |
| `RequireSelectedFlowMatch('purchase')` | All `/journey/purchase/*` | `selectedFlow !== 'purchase'`   | `getActivationEntryPath(selectedFlow)` or `/journey` |
| `RequireSelectedFlow`                  | Auth segment              | No flow                         | `/journey`                                           |

### Direct route access matrix

| Direct URL                               | `selectedFlow` | `authStatus` | Result                      |
| ---------------------------------------- | -------------- | ------------ | --------------------------- |
| `/journey/purchase/p04-checkout-summary` | `purchase`     | completed    | **P04 renders**             |
| `/journey/purchase/p04-checkout-summary` | `purchase`     | pending      | Auth R01                    |
| `/journey/purchase/p04-checkout-summary` | `prepaid`      | completed    | `/journey/prepaid/entry`    |
| `/journey/purchase/p04-checkout-summary` | null           | any          | `/journey`                  |
| `/journey/purchase/unknown-step`         | `purchase`     | completed    | `/journey/purchase/qr-scan` |

---

## 6. Implementation summary

### New orchestration files

| File                                    | Role                                       |
| --------------------------------------- | ------------------------------------------ |
| `journey/purchase/purchase-routing.ts`  | Path constants + step sequence helpers     |
| `journey/routes/PurchaseRoutes.tsx`     | Route table + per-step navigation handlers |
| `journey/guards/JourneyRouteGuards.tsx` | Added `RequireSelectedFlowMatch`           |

### Modified files

| File                                   | Change                                                          |
| -------------------------------------- | --------------------------------------------------------------- |
| `journey/routes/JourneyRoutes.tsx`     | Purchase segment → `PurchaseRoutes` (not placeholder)           |
| `features/qr-purchase/screens/p01–p06` | Optional `onContinue` / `onBack` / `showBack` → `FlowStepShell` |
| `features/qr-purchase/types.ts`        | `PurchaseScreenNavigationProps`                                 |
| `flow/registry/config/flows.config.ts` | Insert `purchase.qr-scan` before P01 steps                      |
| `router/routes.schema.ts`              | Journey purchase P01–P06 paths                                  |

### Screen changes (orchestration-only)

Each P01–P06 screen accepts optional navigation props and passes them to `FlowStepShell`. **No layout, copy, or visual changes.**

---

## 7. Responsive QA

Purchase screens render inside `.journey-frame` (`min(100%, 24.5625rem)`) with existing `FlowStepShell` + `AlScreenBg` layout. No responsive changes were made in Phase 10.

| Viewport  | Expected behavior                                                      |
| --------- | ---------------------------------------------------------------------- |
| **320px** | Single-column shell; plan carousel scrolls horizontally; footer pinned |
| **360px** | Same; step progress readable                                           |
| **375px** | Same; primary reference width                                          |
| **390px** | Same                                                                   |
| **414px** | Same; max-width cap at 393px logical frame                             |

**Verify manually:** Run `pnpm --filter @autolokate/qr dev`, complete auth → purchase path, resize devtools at each width.

---

## 8. Theme QA

| Theme     | Mechanism                                      | Purchase impact                             |
| --------- | ---------------------------------------------- | ------------------------------------------- |
| **Light** | `data-theme="light"` + `setThemeMode('light')` | DS surface/on-surface tokens on all P01–P06 |
| **Dark**  | `data-theme="dark"` + `setThemeMode('dark')`   | Same components, dark token set             |

Theme is set on Home before purchase entry and persists via `al-qr-theme`. Purchase segment inherits without additional wiring.

---

## 9. Remaining placeholders

| Segment                | Status                                     | Route                             |
| ---------------------- | ------------------------------------------ | --------------------------------- |
| **purchase.qr-scan**   | Redirect bootstrap only — no QrScan screen | `/journey/purchase/qr-scan` → P01 |
| **prepaid activation** | Placeholder                                | `/journey/prepaid/entry`          |
| **b2b2c activation**   | Placeholder                                | `/journey/b2b2c/partner-bridge`   |
| **emergency suffix**   | Placeholder                                | `/journey/emergency/rider-setup`  |
| **completed**          | Implemented                                | `/journey/completed`              |

---

## 10. Verification

```bash
pnpm --filter @autolokate/qr lint
pnpm --filter @autolokate/qr build
pnpm --filter @autolokate/qr dev
```

### Smoke path

1. `/journey` → select **Consumer QR Activation + Purchase**
2. Complete R01–R06 → lands on P01 (via qr-scan redirect)
3. Continue P01 → P02 → P03 → P04 → P05 (auto) → P06
4. P06 Continue → `/journey/emergency/rider-setup`
5. Refresh on P03 → stays on P03
6. Open `/journey/purchase/p04-checkout-summary` without auth → redirected to R01
7. Select prepaid, then manually open purchase URL → redirected to prepaid entry
8. Toggle light/dark on Home → purchase screens respect theme

---

## 11. Alignment impact

| Dimension                | Phase 9                    | Phase 10                                 |
| ------------------------ | -------------------------- | ---------------------------------------- |
| Purchase journey wiring  | Placeholder                | **P01–P06 live**                         |
| Purchase order vs target | Config + placeholder       | **Config + runtime aligned**             |
| Post-activation handoff  | Simulated from placeholder | **P06 → Emergency automatic**            |
| `purchase.qr-scan`       | Entry URL only             | **Bootstrap redirect (screen deferred)** |

**Overall journey alignment (purchase dimension): 85 → 95 / 100**

---

## Related documents

| Document                                                             | Relationship             |
| -------------------------------------------------------------------- | ------------------------ |
| [PHASE_9_JOURNEY_ORCHESTRATOR.md](./PHASE_9_JOURNEY_ORCHESTRATOR.md) | Orchestrator baseline    |
| [FLOW_ALIGNMENT_REPORT.md](./FLOW_ALIGNMENT_REPORT.md)               | Architecture target      |
| [PURCHASE_FLOW_IMPLEMENTATION.md](./PURCHASE_FLOW_IMPLEMENTATION.md) | P01–P06 screen inventory |

---

## Verdict

Phase 10 connects the **existing Purchase screens** to the **Journey Orchestrator** with route-driven navigation, guards, refresh-safe URLs, and P06 → Emergency handoff — without rebuilding screens or modifying the design system.
