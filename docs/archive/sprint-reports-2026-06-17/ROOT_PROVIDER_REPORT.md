# Root Provider Report

**Date:** 2026-06-17  
**Phase:** Safe Unified PWA Phase 1 (Provider P0 + Route R1)

---

## Before

```
BrowserRouter
├── /pwa/scan/*  → PwaScanRoutes → PwaScanProvider → routes
└── *            → JourneyProvider → JourneyRoutes
```

**Problem:** Navigating `/journey` → `/pwa/scan/loading` unmounted `JourneyProvider`. PWA routes had no access to journey context and vice versa.

---

## After

```
BrowserRouter
└── AutolokateRootProvider
      └── JourneyProvider
            └── PwaScanProvider
                  ├── /pwa/scan/*  → PwaScanRoutes (no nested provider)
                  └── *            → JourneyRoutes
```

---

## Implementation

| Item          | Detail                                                         |
| ------------- | -------------------------------------------------------------- |
| Component     | `AutolokateRootProvider`                                       |
| Path          | `apps/qr/src/platform/AutolokateRootProvider.tsx`              |
| Props         | Same as `JourneyProviderProps` (`initialPhase`, `children`)    |
| Nesting order | Journey outer, PWA inner (per UNIFIED_PWA_PROVIDER_PLAN.md P0) |

---

## Consumer API — unchanged

| Hook           | Provider          | Behavior              |
| -------------- | ----------------- | --------------------- |
| `useJourney()` | `JourneyProvider` | Same API, same throws |
| `usePwaScan()` | `PwaScanProvider` | Same API, same throws |

Both hooks now resolve on **all routes** because both providers are always mounted.

---

## Session — unchanged

| Key              | Hydration                             |
| ---------------- | ------------------------------------- |
| `al-journey-v1`  | On `JourneyProvider` mount (app boot) |
| `al-pwa-scan-v1` | On `PwaScanProvider` mount (app boot) |

Both sessions hydrate at app start regardless of initial URL. No schema or key changes.

**Note:** PWA session now hydrates even when user only visits `/journey`. This is acceptable per audit (low memory, demo defaults). No functional regression.

---

## Removed duplication

`PwaScanProvider` wrapper removed from `PwaScanRoutes.tsx`. Single provider instance at root.

---

## Dev preview

`ScreenDevApp` still uses standalone `JourneyProvider` in `DevFlowFrame` for isolated screen capture. Production path uses `AutolokateRootProvider`. Dev PWA screens that need `usePwaScan` may still require separate provider wrapping — pre-existing, not changed in Phase 1.

---

## Verification

| Check                               | Result |
| ----------------------------------- | ------ |
| Build passes                        | ✅     |
| `useJourney()` on `/journey`        | ✅     |
| `usePwaScan()` on `/pwa/scan/*`     | ✅     |
| No nested double `PwaScanProvider`  | ✅     |
| JourneyProvider internals untouched | ✅     |
| PwaScanProvider internals untouched | ✅     |

---

## Verdict

**SAFE UNIFIED PWA READY** — Provider P0 complete.
