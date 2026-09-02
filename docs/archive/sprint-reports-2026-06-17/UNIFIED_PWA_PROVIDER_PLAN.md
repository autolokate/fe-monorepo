# Unified PWA Provider Plan

**Date:** 2026-06-17  
**Scope:** Plan only — no implementation  
**Parent:** [UNIFIED_PWA_MIGRATION_AUDIT.md](./UNIFIED_PWA_MIGRATION_AUDIT.md)

---

## Objective

Collapse `JourneyProvider` and `PwaScanProvider` into one root **`AutolokateProvider`** that wraps the entire route tree, while preserving all existing behavior for Purchase, Prepaid, B2B2C, Emergency, and PWA Scanner.

---

## Current state

```
JourneyOrchestrator
├── Route /pwa/scan/*  → PwaScanRoutes → PwaScanProvider
└── Route *            → JourneyProvider → JourneyRoutes
```

| Provider        | File                                                      | Hook           | Consumers |
| --------------- | --------------------------------------------------------- | -------------- | --------- |
| JourneyProvider | `journey/JourneyContext.tsx`                              | `useJourney()` | 15+ files |
| PwaScanProvider | `features/post-activation-pwa/context/PwaScanContext.tsx` | `usePwaScan()` | 8+ files  |

**Critical:** Providers are mutually exclusive at runtime. Navigating `/journey` → `/pwa/scan/loading` unmounts one and mounts the other.

---

## Target state

```
AutolokateProvider (root — always mounted)
└── BrowserRouter
    └── Routes (unified tree)
        ├── /journey/*        (legacy alias)
        ├── /pwa/scan/*       (legacy alias)
        └── /scan/*, /activate/*  (future)
```

---

## Proposed provider API

### Option A — Namespaced slices (recommended)

```typescript
// Conceptual — not implemented
type AutolokateContextValue = {
  // Activation slice (replaces JourneyProvider surface)
  activation: {
    selectedFlow: ActivationFlowId | null;
    authStatus: AuthStatus;
    phase: JourneyPhase;
    session: JourneySession;
    setSelectedFlow: (flow: ActivationFlowId) => void;
    completeAuth: () => void;
    clearJourney: () => void;
    setPhase: (phase: JourneyPhase) => void;
    updateSession: (patch: Partial<JourneySession>) => void;
  };

  // Scanner slice (replaces PwaScanProvider surface)
  scanner: {
    session: PwaScanSession;
    updateSession: (patch: PwaSessionPatch) => SavePwaScanSessionResult;
    resetSession: () => void;
    storageError: string | null;
    clearStorageError: () => void;
  };
};
```

### Option B — Flat unified session (not recommended)

Single `session` object merging all fields — **rejected** due to field collisions documented in audit.

---

## Compat hook strategy (phased)

Phase 1 of provider unification must **not** break existing call sites.

| Shim hook      | Delegates to                 | Until                                          |
| -------------- | ---------------------------- | ---------------------------------------------- |
| `useJourney()` | `useAutolokate().activation` | All call sites migrated or permanently shimmed |
| `usePwaScan()` | `useAutolokate().scanner`    | All call sites migrated or permanently shimmed |

**Implementation location (future):** `platform/AutolokateContext.tsx` with re-exports from `journey/JourneyContext.tsx` and `post-activation-pwa/context/PwaScanContext.tsx` as thin wrappers.

---

## Migration phases

### Phase P0 — Root mount (no API change)

| Step | Action                                                              | Risk      |
| ---- | ------------------------------------------------------------------- | --------- |
| P0.1 | Create `AutolokateProvider` composing existing providers nested     | 🟢 Low    |
| P0.2 | Move both providers inside single `BrowserRouter` route tree        | 🟢 Low    |
| P0.3 | Change `JourneyOrchestrator` to mount one wrapper, not split routes | 🟡 Medium |

**P0 structure:**

```
AutolokateProvider
  JourneyProvider
    PwaScanProvider   // both always mounted
      Routes
```

**Note:** Nesting both providers (instead of merging state) is a **zero-behavior-change** first step. Both sessions persist independently; both hooks work everywhere.

**Risk:** Slightly higher memory; both sessions hydrate on app boot even if user only uses one flow. Acceptable.

### Phase P1 — Orchestrator flatten

| Step | Action                                                      | Risk          |
| ---- | ----------------------------------------------------------- | ------------- |
| P1.1 | Remove provider boundary at `/pwa/scan/*` route level       | 🟢 if P0 done |
| P1.2 | Delete `PwaScanProvider` wrapper inside `PwaScanRoutes.tsx` | 🟢            |
| P1.3 | Verify all PWA routes still resolve `usePwaScan()`          | 🟢            |

### Phase P2 — State merge into single context

| Step | Action                                               | Risk |
| ---- | ---------------------------------------------------- | ---- |
| P2.1 | Implement namespaced state in `AutolokateProvider`   | 🟡   |
| P2.2 | Wire activation slice to `al-journey-v1` persistence | 🟡   |
| P2.3 | Wire scanner slice to `al-pwa-scan-v1` persistence   | 🟡   |
| P2.4 | Replace nested providers with single reducer/context | 🔴   |
| P2.5 | Keep compat hooks                                    | 🟢   |

**Do not start P2 until session plan approved** — see [UNIFIED_PWA_SESSION_PLAN.md](./UNIFIED_PWA_SESSION_PLAN.md).

### Phase P3 — Deprecate legacy providers

| Step | Action                                                              | Risk |
| ---- | ------------------------------------------------------------------- | ---- |
| P3.1 | Mark `JourneyProvider` / `PwaScanProvider` as internal              | 🟢   |
| P3.2 | Export only `AutolokateProvider`, `useAutolokate`                   | 🟢   |
| P3.3 | Migrate dev preview `JourneyProvider` wrapper in `ScreenDevApp.tsx` | 🟡   |

---

## Consumer migration map

### useJourney() — must continue working

| File                                               | Usage                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| `journey/routes/AuthRoutes.tsx`                    | session, updateSession, selectedFlow, setPhase |
| `journey/routes/PurchaseRoutes.tsx`                | session, updateSession, setPhase               |
| `journey/routes/EmergencyRoutes.tsx`               | session, updateSession, selectedFlow, setPhase |
| `journey/routes/JourneySharedAuthRoute.tsx`        | completeAuth, selectedFlow, session            |
| `journey/guards/JourneyRouteGuards.tsx`            | selectedFlow, authStatus, session              |
| `journey/screens/FlowEntryScreen.tsx`              | setSelectedFlow, setPhase, updateSession       |
| `journey/screens/FlowHubScreen.tsx`                | setSelectedFlow, setPhase, updateSession       |
| `journey/screens/JourneyCompletedScreen.tsx`       | session, clearJourney, setPhase                |
| `features/qr-prepaid/.../PrepaidWelcomeScreen.tsx` | setSelectedFlow, setPhase, updateSession       |
| `features/qr-b2b2c/.../PartnerWelcomeScreen.tsx`   | setSelectedFlow, setPhase, updateSession       |
| `dev/DevCompletedPreview.tsx`                      | updateSession                                  |
| `dev/ScreenDevApp.tsx`                             | JourneyProvider wrapper                        |

### usePwaScan() — must continue working

| File                                                            | Usage                       |
| --------------------------------------------------------------- | --------------------------- |
| `post-activation-pwa/routes/pwa-shared-routes.tsx`              | session, updateSession      |
| `post-activation-pwa/routes/pwa-park-me-routes.tsx`             | session, updateSession      |
| `post-activation-pwa/routes/pwa-sos-routes.tsx`                 | session, updateSession      |
| `post-activation-pwa/hooks/use-pwa-photo-capture.ts`            | updateSession, storageError |
| `post-activation-pwa/hooks/use-resolve-stored-location-name.ts` | session, updateSession      |
| `post-activation-pwa/components/PwaEmergencyScreen.tsx`         | session                     |
| `post-activation-pwa/components/PwaPhotoRouteGuard.tsx`         | storageError                |

---

## API compatibility requirements

| Current API                               | Must preserve                                   |
| ----------------------------------------- | ----------------------------------------------- |
| `useJourney().selectedFlow`               | ✓                                               |
| `useJourney().authStatus`                 | ✓                                               |
| `useJourney().completeAuth()`             | ✓                                               |
| `useJourney().updateSession(partial)`     | ✓ — partial merge semantics                     |
| `useJourney().clearJourney()`             | ✓ — clears `al-journey-v1` + `al-selected-flow` |
| `useJourney().phase`                      | ✓ — in-memory                                   |
| `usePwaScan().updateSession(patch \| fn)` | ✓ — functional patch                            |
| `usePwaScan().updateSession` return value | ✓ — `SavePwaScanSessionResult`                  |
| `usePwaScan().resetSession()`             | ✓ — resets to `defaultPwaScanSession()`         |
| `usePwaScan().storageError`               | ✓ — photo quota                                 |

---

## What must NOT change

- `completeAuth()` sets `authStatus = AUTH_COMPLETED` — guards depend on this
- `setSelectedFlow()` persists to localStorage — flow match guards depend on this
- `clearJourney()` semantics on completed screen — must not clear scanner session unless explicit
- PWA `resetSession()` must not clear activation session
- Throw behavior during migration: shims must not silently return null

---

## clearJourney / resetSession interaction

**Current:** Independent — clearing journey does not touch PWA session.

**Unified rule (required):**

| Action                  | Clears activation slice | Clears scanner slice |
| ----------------------- | ----------------------- | -------------------- | --------------------- |
| `clearJourney()`        | ✓                       | ✗                    |
| `resetSession()`        | ✗                       | ✓                    |
| Full app reset (future) | ✓                       | ✓                    | Explicit new API only |

**Breaking if violated:** User completes activation, scans QR, loses scanner state on "Go to home" — or vice versa.

---

## Dev preview impact

`ScreenDevApp.tsx` wraps subsets in `JourneyProvider initialPhase="activation"`. Plan:

- Dev preview uses same `AutolokateProvider` as production
- PWA dev screens get scanner slice without manual `PwaScanProvider` injection
- No second `BrowserRouter` in dev (already separate from production orchestrator)

---

## Testing checklist (when implemented)

- [ ] Purchase E2E: `/journey` → auth → R03 → R10 → emergency → completed
- [ ] Prepaid E2E: welcome → auth → emergency handoff (Safe + rider variants)
- [ ] B2B2C E2E: welcome plan-rider → auth → R0 handoff
- [ ] PWA E2E: loading → vehicle → verify → park-me → photos → status
- [ ] PWA E2E: loading → vehicle → SOS hold → dispatch → resolved
- [ ] Cross-nav: `/journey` card 4 → PWA — activation session still in storage when returning via `/journey`
- [ ] `clearJourney` does not wipe PWA photos
- [ ] All guards reject unauthenticated purchase access

---

## Timeline estimate

| Phase                        | Effort   | Prerequisite         |
| ---------------------------- | -------- | -------------------- |
| P0 — nested root mount       | 1–2 days | None                 |
| P1 — flatten route providers | 0.5 day  | P0                   |
| P2 — merged context          | 3–5 days | Session plan         |
| P3 — deprecate legacy        | 1–2 days | P2 + full regression |

**Minimum viable unification:** P0 + P1 = one provider tree, zero session merge, **SAFE TO MERGE**.

---

## Verdict for provider plan

| Approach                                          | Verdict              |
| ------------------------------------------------- | -------------------- |
| P0 + P1 (nested providers, single mount)          | ✅ SAFE TO MERGE     |
| P2 (merged state) without session plan            | ❌ NOT SAFE TO MERGE |
| Big-bang delete JourneyProvider + PwaScanProvider | ❌ NOT SAFE TO MERGE |
