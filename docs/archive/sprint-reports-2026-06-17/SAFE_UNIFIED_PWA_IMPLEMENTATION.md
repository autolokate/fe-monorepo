# Safe Unified PWA — Phase 1 Implementation

**Date:** 2026-06-17  
**Phase:** P0/P1 (Provider P0 + Route R1 + Entry registry + QR contract)  
**Scope:** Only items marked SAFE TO MERGE in audit docs

---

## Summary

Phase 1 delivers **one root provider mount** and **shared entry orchestration abstractions** without changing session schema, provider contracts, business rules, flow order, guards, routes, or navigation targets.

---

## What was implemented

### 1. AutolokateRootProvider

**File:** `apps/qr/src/platform/AutolokateRootProvider.tsx`

Nests existing providers:

```
AutolokateRootProvider
  └── JourneyProvider (outer — unchanged)
        └── PwaScanProvider (inner — unchanged)
              └── {children}
```

**Mounted in:** `journey/JourneyOrchestrator.tsx` — wraps entire route tree.

**Removed duplicate mount:** `PwaScanProvider` removed from `PwaScanRoutes.tsx` (provider now at root only).

### 2. Unified Flow Dispatcher

**File:** `apps/qr/src/platform/entry/flow-dispatcher.ts`

| Function | Purpose |
|----------|---------|
| `dispatchPlatformFlow(request, deps)` | Single entry point for flow selection |

**Behavior (unchanged):**

| `flowId` | Action |
|----------|--------|
| `purchase` | `selectActivationFlow('purchase', deps)` |
| `prepaid` | `selectActivationFlow('prepaid', deps)` |
| `b2b2c` | `selectActivationFlow('b2b2c', deps)` |
| `postActivation` | `navigate(pwaScanPaths.loading)` |

**Sources:** `homeCard` | `flowHub` | `qrPayload` (future)

**Consumers updated:**

- `journey/screens/FlowEntryScreen.tsx`
- `journey/screens/FlowHubScreen.tsx`

### 3. Unified Entry Registry

**File:** `apps/qr/src/platform/entry/flow-entry-registry.ts`

| Export | Contents |
|--------|----------|
| `FLOW_ENTRY_REGISTRY` | All 4 flows with labels |
| `ACTIVATION_FLOW_ENTRIES` | purchase, prepaid, b2b2c |
| `POST_ACTIVATION_FLOW_ENTRY` | postActivation scanner |
| `getFlowEntryById()` | Lookup helper |
| `isActivationFlowId()` | Type guard |

### 4. QR Dispatch Contract (interfaces only)

**File:** `apps/qr/src/platform/qr/qr-dispatch-contract.ts`

| Export | Type |
|--------|------|
| `QrPayload` | Discriminated union (purchase, prepaid, b2b2c, activated) |
| `QrDecoder` | Interface — no implementation |
| `QrDecodeResult` | Success / failure union |
| `mapQrPayloadToPlatformFlow()` | Pure mapping to `PlatformFlowId` |
| `createQrDispatchRequest()` | Future bridge to dispatcher |

**Not implemented:** Backend, scanner, routes, `QrDecoder` implementation.

### 5. Platform public API

**File:** `apps/qr/src/platform/index.ts`

Re-exports all platform modules. Also re-exported from `journey/index.ts`:

- `AutolokateRootProvider`

---

## Compatibility layer

### Current entry (production)

```
/journey (FlowEntryScreen)
  └── dispatchPlatformFlow({ flowId, source: 'homeCard' }, deps)
        ├── activation → selectActivationFlow() → existing journey paths
        └── postActivation → /pwa/scan/loading
```

### Future QR entry (not implemented)

```
/scan/:qrId (future route)
  └── QrDecoder.decode(qrId)
        └── createQrDispatchRequest(payload)
              └── dispatchPlatformFlow({ flowId, source: 'qrPayload' }, deps)
```

Same dispatcher, same navigation targets, same session writes.

### Shared orchestration

| Layer | Owner | Changed in Phase 1? |
|-------|-------|---------------------|
| Entry registry | `platform/entry/flow-entry-registry.ts` | ✅ New |
| Dispatcher | `platform/entry/flow-dispatcher.ts` | ✅ New |
| Activation routing | `select-activation-flow.ts` | ❌ Unchanged |
| Post-auth routing | `activation-routing.ts` | ❌ Unchanged |
| Journey session | `JourneyProvider` | ❌ Unchanged |
| PWA session | `PwaScanProvider` | ❌ Unchanged |
| Route guards | `JourneyRouteGuards.tsx` | ❌ Unchanged |

---

## What was NOT touched (per constraints)

- `selectedFlow` semantics
- `JourneyProvider` internals
- `PwaScanProvider` internals
- Session keys (`al-journey-v1`, `al-pwa-scan-v1`)
- Auth models (owner vs bystander)
- Emergency models
- Vehicle models
- Route paths and redirects
- Guard behavior
- Storage structure

---

## Files changed

| File | Change |
|------|--------|
| `platform/AutolokateRootProvider.tsx` | **New** |
| `platform/index.ts` | **New** |
| `platform/entry/types.ts` | **New** |
| `platform/entry/flow-entry-registry.ts` | **New** |
| `platform/entry/flow-dispatcher.ts` | **New** |
| `platform/qr/qr-dispatch-contract.ts` | **New** |
| `journey/JourneyOrchestrator.tsx` | Root provider mount |
| `features/post-activation-pwa/routes/PwaScanRoutes.tsx` | Remove nested provider |
| `journey/screens/FlowEntryScreen.tsx` | Use registry + dispatcher |
| `journey/screens/FlowHubScreen.tsx` | Use registry + dispatcher |
| `journey/index.ts` | Export AutolokateRootProvider |

---

## Build status

```
npm run build — 12/12 packages successful (exit 0)
```

---

## Final verdict

# SAFE UNIFIED PWA READY

Phase 1 safe-merge items complete. Session merge, route aliases, and QR route implementation remain future phases per audit.

---

## Related documents

- [ROOT_PROVIDER_REPORT.md](./ROOT_PROVIDER_REPORT.md)
- [FLOW_DISPATCHER_REPORT.md](./FLOW_DISPATCHER_REPORT.md)
- [REGRESSION_REPORT.md](./REGRESSION_REPORT.md)
- [UNIFIED_PWA_MIGRATION_AUDIT.md](./UNIFIED_PWA_MIGRATION_AUDIT.md)
