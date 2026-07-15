# Flow Dispatcher Report

**Date:** 2026-06-17  
**Phase:** Safe Unified PWA Phase 1

---

## Purpose

Single abstraction for entering any platform flow — today from home cards, tomorrow from QR payload — without duplicating navigation logic.

---

## Architecture

```
FlowEntryScreen / FlowHubScreen / (future QR route)
        │
        ▼
dispatchPlatformFlow({ flowId, source }, deps)
        │
        ├── postActivation ──► navigate(/pwa/scan/loading)
        │
        └── purchase | prepaid | b2b2c
                │
                ▼
        selectActivationFlow(flow, deps)   [unchanged]
                │
                ├── purchase → /journey/auth/mobile
                ├── prepaid  → /journey/prepaid/welcome
                └── b2b2c    → /journey/b2b2c/welcome
```

---

## Modules

| File                                           | Role                                         |
| ---------------------------------------------- | -------------------------------------------- |
| `platform/entry/flow-entry-registry.ts`        | Canonical flow definitions                   |
| `platform/entry/flow-dispatcher.ts`            | Dispatch implementation                      |
| `platform/entry/types.ts`                      | `PlatformFlowId`, `FlowDispatchSource`       |
| `platform/qr/qr-dispatch-contract.ts`          | QR types + mapping helpers                   |
| `journey/navigation/select-activation-flow.ts` | Activation navigation (delegated, unchanged) |

---

## Entry registry

| ID               | Label                                   | Kind       | First navigation           |
| ---------------- | --------------------------------------- | ---------- | -------------------------- |
| `purchase`       | Consumer QR Activation + Purchase       | activation | `/journey/auth/mobile`     |
| `prepaid`        | Consumer QR Activation — B2B (Pre-Paid) | activation | `/journey/prepaid/welcome` |
| `b2b2c`          | Consumer QR Activation — B2B2C          | activation | `/journey/b2b2c/welcome`   |
| `postActivation` | QR Scan (Post-Activation)               | scanner    | `/pwa/scan/loading`        |

---

## Dispatch sources

| Source      | Used by              | Status           |
| ----------- | -------------------- | ---------------- |
| `homeCard`  | `FlowEntryScreen`    | ✅ Live          |
| `flowHub`   | `FlowHubScreen` (QA) | ✅ Live          |
| `qrPayload` | Future QR route      | 📋 Contract only |

`source` is recorded on the request type for future telemetry and branching; **no behavior differs by source in Phase 1**.

---

## QR contract (interfaces only)

```typescript
// mapQrPayloadToPlatformFlow — implemented, pure
'purchase'  → 'purchase'
'prepaid'   → 'prepaid'
'b2b2c'     → 'b2b2c'
'activated' → 'postActivation'

// createQrDispatchRequest — implemented, pure
{ flowId, source: 'qrPayload' }

// QrDecoder — interface only, no implementation
decode(qrId: string): Promise<QrDecodeResult>
```

**Future wiring (not implemented):**

```typescript
const result = await qrDecoder.decode(qrId);
if (result.ok) {
  dispatchPlatformFlow(createQrDispatchRequest(result.payload), deps);
}
```

---

## Behavior preservation matrix

| Flow                 | Before Phase 1                     | After Phase 1                                                             |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| Purchase card        | `selectActivationFlow('purchase')` | `dispatchPlatformFlow({ flowId: 'purchase', source: 'homeCard' })` → same |
| Prepaid card         | `selectActivationFlow('prepaid')`  | Same via dispatcher                                                       |
| B2B2C card           | `selectActivationFlow('b2b2c')`    | Same via dispatcher                                                       |
| Post-activation card | `navigate(pwaScanPaths.loading)`   | `dispatchPlatformFlow({ flowId: 'postActivation', ... })` → same          |
| Flow hub buttons     | `selectActivationFlow`             | `dispatchPlatformFlow` with `source: 'flowHub'` → same                    |

---

## Unchanged

- `setSelectedFlow` / `selectedFlow` writes
- `setPhase` calls inside `selectActivationFlow`
- `resetPurchaseCheckoutSession` on purchase
- No journey session mutation on postActivation dispatch
- Route paths
- Guard behavior

---

## Verification

| Check                                            | Result |
| ------------------------------------------------ | ------ |
| Registry exports 4 flows                         | ✅     |
| Dispatcher delegates to `selectActivationFlow`   | ✅     |
| Post-activation navigates to `/pwa/scan/loading` | ✅     |
| QR mapping pure functions compile                | ✅     |
| No `QrDecoder` implementation                    | ✅     |
| Build passes                                     | ✅     |

---

## Verdict

**SAFE UNIFIED PWA READY** — Dispatcher and registry complete; QR route implementation deferred.
