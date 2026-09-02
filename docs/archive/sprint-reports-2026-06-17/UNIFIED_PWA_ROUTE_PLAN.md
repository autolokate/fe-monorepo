# Unified PWA Route Plan

**Date:** 2026-06-17  
**Scope:** Plan only — no implementation  
**Parent:** [UNIFIED_PWA_MIGRATION_AUDIT.md](./UNIFIED_PWA_MIGRATION_AUDIT.md)

---

## Objective

Define how to achieve **one route tree** for Autolokate PWA while preserving all existing paths, guards, redirects, and flow order for Purchase, Prepaid, B2B2C, Emergency, and PWA Scanner.

---

## Current route inventory

### Summary

| Tree    | Prefix        | Routes       | Provider        | Guard layer                   |
| ------- | ------------- | ------------ | --------------- | ----------------------------- |
| Journey | `/journey/*`  | ~32          | JourneyProvider | `JourneyRouteGuards`          |
| PWA     | `/pwa/scan/*` | 30           | PwaScanProvider | Inline + `PwaPhotoRouteGuard` |
| Root    | `/`           | → `/journey` | JourneyProvider | —                             |

**Total:** ~62 active routes + redirects.

### Journey routes (frozen)

| Segment   | Paths                                                        | Guard                                                           |
| --------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Entry     | `/journey`, `/journey/home`, `/journey/flow-hub`             | None                                                            |
| Auth      | `/journey/auth/mobile`, `/otp`, `/vehicle-owner`, `/legal/*` | None (completion handler in wrapper)                            |
| Purchase  | `/journey/purchase/r03-vehicle` … `r10c-payment-unconfirmed` | `RequireAuthCompleted` + `RequireSelectedFlowMatch('purchase')` |
| Prepaid   | `/journey/prepaid/welcome`                                   | None                                                            |
| B2B2C     | `/journey/b2b2c/welcome`, `/welcome/plan-rider`              | None                                                            |
| Emergency | `/journey/emergency/rider-prompt` … `contacts-summary`       | `RequireAuthCompleted` + `RequireSelectedFlow`                  |
| Completed | `/journey/completed`                                         | None                                                            |

### PWA routes (frozen)

| Segment   | Paths                                      | Guard                    |
| --------- | ------------------------------------------ | ------------------------ |
| Bootstrap | `/pwa/scan/loading`                        | None                     |
| Hub       | `/pwa/scan/vehicle`                        | None                     |
| Verify    | `/pwa/scan/verify/mobile`, `/otp`, `/name` | None                     |
| Park Me   | `/pwa/scan/park-me/*` (11 routes)          | Inline navigation guards |
| SOS       | `/pwa/scan/sos/*` (14 routes)              | Inline + photo guard     |

---

## Target route architecture (phased)

### Phase R0 — Current (no change)

All paths unchanged. Documented in `SINGLE_PWA_ARCHITECTURE.md`.

### Phase R1 — Single mount, legacy paths

One `Routes` tree; all existing URLs work identically.

```
BrowserRouter
└── AutolokateProvider
    └── Routes
        ├── /pwa/scan/*     → PwaScanRoutes (unchanged paths)
        └── /*              → JourneyRoutes (unchanged paths)
```

**Change:** Provider nesting only. **Zero URL change.**

### Phase R2 — Parallel aliases (additive)

New production-oriented paths alias to existing route components.

| New path (alias)                 | Resolves to                     | Component                                     |
| -------------------------------- | ------------------------------- | --------------------------------------------- |
| `/scan/loading`                  | `/pwa/scan/loading`             | `PwaLoadingRoute`                             |
| `/scan/vehicle`                  | `/pwa/scan/vehicle`             | `PwaVehicleFoundRoute`                        |
| `/scan/verify/mobile`            | `/pwa/scan/verify/mobile`       | `PwaVerifyMobileRoute`                        |
| `/activate`                      | `/journey`                      | `FlowEntryScreen` (dev) or QR dispatch (prod) |
| `/activate/auth/mobile`          | `/journey/auth/mobile`          | `A1MobileScreen` via AuthRoutes               |
| `/activate/purchase/r03-vehicle` | `/journey/purchase/r03-vehicle` | PurchaseRoutes                                |

**Rule:** Old paths remain permanently during R2. Redirects are **optional** and must not be one-way until telemetry confirms migration.

### Phase R3 — QR entry route (future)

| Path          | Handler                                            |
| ------------- | -------------------------------------------------- |
| `/scan/:qrId` | Decode payload → dispatch to existing first screen |

Dispatch targets (unchanged logic):

| Payload type | First screen                      |
| ------------ | --------------------------------- |
| `purchase`   | `/journey/auth/mobile` (or alias) |
| `prepaid`    | `/journey/prepaid/welcome`        |
| `b2b2c`      | `/journey/b2b2c/welcome`          |
| `activated`  | `/pwa/scan/loading`               |

See [QR_ENTRY_STRATEGY.md](./QR_ENTRY_STRATEGY.md).

### Phase R4 — Owner post-activation routes (future, new screens)

| Path         | Purpose                            |
| ------------ | ---------------------------------- |
| `/dashboard` | Owner home after activation        |
| `/emergency` | Owner emergency contact management |
| `/vehicle`   | Vehicle + plan profile             |
| `/profile`   | Account settings                   |

**Note:** These are **new** routes, not renames of existing journey/PWA paths. No breaking change to current flows.

---

## Route ownership after unification

| Domain           | Route owner file (future)                      | Path namespace                        |
| ---------------- | ---------------------------------------------- | ------------------------------------- |
| Platform root    | `platform/routes/AutolokateRoutes.tsx`         | `/`                                   |
| Activation entry | `journey/routes/JourneyRoutes.tsx`             | `/journey/*`, `/activate/*`           |
| Auth             | `journey/routes/AuthRoutes.tsx`                | `/journey/auth/*`, `/activate/auth/*` |
| Purchase         | `journey/routes/PurchaseRoutes.tsx`            | `/journey/purchase/*`                 |
| Prepaid          | `journey/routes/PrepaidRoutes.tsx`             | `/journey/prepaid/*`                  |
| B2B2C            | `journey/routes/B2b2cRoutes.tsx`               | `/journey/b2b2c/*`                    |
| Emergency setup  | `journey/routes/EmergencyRoutes.tsx`           | `/journey/emergency/*`                |
| Scanner          | `post-activation-pwa/routes/PwaScanRoutes.tsx` | `/pwa/scan/*`, `/scan/*`              |
| QR dispatch      | `platform/routes/QrDispatchRoute.tsx` (future) | `/scan/:qrId`                         |

**Principle:** Feature folders keep route **components**; platform layer owns **mount tree**.

---

## Path constant migration

### Current constants (must remain valid)

| File                                              | Export                  |
| ------------------------------------------------- | ----------------------- |
| `journey/constants.ts`                            | `journeyPaths`          |
| `journey/auth/auth-routing.ts`                    | `authJourneyPaths`      |
| `journey/purchase/purchase-routing.ts`            | `purchaseJourneyPaths`  |
| `journey/prepaid/prepaid-routing.ts`              | `prepaidJourneyPaths`   |
| `journey/b2b2c/b2b2c-routing.ts`                  | `b2b2cJourneyPaths`     |
| `journey/emergency/emergency-routing.ts`          | `emergencyJourneyPaths` |
| `post-activation-pwa/constants/pwa-scan-paths.ts` | `pwaScanPaths`          |

### Future unified constants (additive)

```typescript
// Conceptual — future platform/routes/paths.ts
export const autolokatePaths = {
  // Legacy (permanent during migration)
  journey: journeyPaths,
  pwaScan: pwaScanPaths,

  // Production aliases
  scan: { loading: '/scan/loading', vehicle: '/scan/vehicle', ... },
  activate: { root: '/activate', auth: { mobile: '/activate/auth/mobile', ... } },

  // Owner post-activation (new)
  dashboard: '/dashboard',
  emergency: '/emergency',
  vehicle: '/vehicle',
  profile: '/profile',
};
```

**Rule:** All navigation inside feature code continues using `journeyPaths` / `pwaScanPaths` until explicit migration wave. Aliases are mounted at router level, not by rewriting every `navigate()` call at once.

---

## Guard plan

### Journey guards — unchanged scope

| Guard                                  | Applies to                                    | Must NOT apply to |
| -------------------------------------- | --------------------------------------------- | ----------------- |
| `RequireAuthCompleted`                 | `/journey/purchase/*`, `/journey/emergency/*` | `/pwa/scan/*`     |
| `RequireSelectedFlow`                  | `/journey/emergency/*`                        | `/pwa/scan/*`     |
| `RequireSelectedFlowMatch('purchase')` | `/journey/purchase/*`                         | All other         |

**Risk if unified tree wraps PWA under journey guards:** Bystander scan blocked at auth gate. **Mitigation:** Guard wrappers stay on activation route segments only.

### PWA guards — unchanged scope

| Guard                       | Applies to               |
| --------------------------- | ------------------------ |
| `PwaPhotoRouteGuard`        | Photo capture routes     |
| Inline `Navigate` redirects | Park Me / SOS flow order |

### Future QR guard (additive)

| Guard                   | Applies to         |
| ----------------------- | ------------------ |
| `RequireValidQrPayload` | `/scan/:qrId` only |

---

## Redirect preservation

These redirects are load-bearing — must not change behavior:

| From                    | To                                | Reason            |
| ----------------------- | --------------------------------- | ----------------- |
| `/`                     | `/journey`                        | App entry         |
| `/journey/purchase`     | `/journey/purchase/r03-vehicle`   | Purchase entry    |
| `/journey/emergency`    | `/journey/emergency/rider-prompt` | Emergency index   |
| `/journey/auth/splash`  | `/journey/auth/mobile`            | Deprecated splash |
| `/pwa/scan/`            | `/pwa/scan/loading`               | PWA bootstrap     |
| `/pwa/scan/*` (unknown) | `/pwa/scan/loading`               | PWA fallback      |
| `/journey/*` (unknown)  | `/journey`                        | Journey fallback  |

---

## Flow order preservation

Route unification must **not** reorder steps within flows.

### Purchase (13 steps after auth)

R03 → R04 → R04b → R05 → R06 → R07 → R08 → R08b → R08c → R09 → R09b → R10 → (R10b/R10c) → Emergency

### Prepaid

Welcome → Auth → Emergency handoff (via `getEmergencyHandoffPath`)

### B2B2C

Welcome → Auth → Emergency handoff

### Emergency suffix

R0 → R1 → R2 → R3 → R4 → E0 → E1 → E2 → E3 → E5 → Completed

### PWA Park Me

vehicle-number → looking-up → confirm → permissions → photos → review → status/\*

### PWA SOS

sos → holding → allow-location → scene-photos → sending → help-received → dispatched → resolved

**Verification:** Route plan changes mount points only; `navigate()` targets in route files stay identical during R0–R2.

---

## Cross-boundary navigation

### Current

| From              | To                  | Session effect                                             |
| ----------------- | ------------------- | ---------------------------------------------------------- |
| `/journey` card 4 | `/pwa/scan/loading` | JourneyProvider unmounts; PWA mounts; both keys in storage |
| PWA SOS resolved  | `/pwa/scan/vehicle` | Scanner only                                               |
| Journey completed | `/journey` (home)   | `clearJourney()`                                           |

### After R1 (single mount)

| From      | To            | Session effect                                  |
| --------- | ------------- | ----------------------------------------------- |
| Same URLs | Same behavior | Both providers mounted; no unmount on cross-nav |

**Improvement:** Activation session stays in React context when entering PWA (still isolated by slice).

---

## Dev / QA impact

| Surface                   | Impact                                                                     |
| ------------------------- | -------------------------------------------------------------------------- |
| `ScreenDevApp.tsx`        | Dev screen registry uses journey paths — unchanged in R0–R2                |
| Visual capture scripts    | Path-based URLs — aliases require duplicate captures or redirect following |
| `router/routes.schema.ts` | Catalog update for aliases (metadata only)                                 |
| FlowHub QA                | `/journey/flow-hub` — keep as dev-only                                     |

---

## Migration phases summary

| Phase | URL change                    | Provider change | Risk |
| ----- | ----------------------------- | --------------- | ---- |
| R0    | None                          | None            | 🟢   |
| R1    | None                          | Single mount    | 🟢   |
| R2    | Additive aliases              | None            | 🟢   |
| R3    | `/scan/:qrId` additive        | QR dispatch     | 🟡   |
| R4    | New owner routes              | New screens     | 🟡   |
| R5    | Deprecate old URLs (optional) | Redirects       | 🔴   |

**Do not execute R5** until full regression + external link audit.

---

## Route conflict resolution

| Conflict                                              | Resolution                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/scan/:qrId` vs `/scan/loading`                      | Static routes before param route: `/scan/loading` registered before `/scan/:qrId`                               |
| `/emergency` (future owner) vs `/journey/emergency/*` | Different namespaces: `/emergency` (owner app) vs `/journey/emergency/*` (activation suffix) — document clearly |
| Auth path duplication                                 | Shared route elements; mode from route prefix or context                                                        |
| Wildcard fallbacks                                    | Per-subtree wildcards preserved                                                                                 |

---

## Testing checklist (when implemented)

- [ ] Every `journeyPaths.*` URL resolves
- [ ] Every `pwaScanPaths.*` URL resolves
- [ ] Purchase guard blocks unauthenticated `/journey/purchase/r03-vehicle`
- [ ] PWA `/pwa/scan/vehicle` accessible without auth
- [ ] Flow order: purchase payment → emergency contacts-empty
- [ ] Flow order: prepaid Safe plan → E0 skip R0
- [ ] Flow order: PWA park-me deferred verify → resume after name
- [ ] All legacy redirects return 302/Navigate equivalent
- [ ] Dev entry 4 cards navigate correctly
- [ ] Unknown paths fall back correctly per subtree

---

## Verdict for route plan

| Phase                            | Verdict                                               |
| -------------------------------- | ----------------------------------------------------- |
| R0 — no change                   | ✅ SAFE                                               |
| R1 — single mount, same URLs     | ✅ SAFE TO MERGE                                      |
| R2 — parallel aliases            | ✅ SAFE TO MERGE                                      |
| R3 — QR dispatch route           | ✅ SAFE TO MERGE (additive)                           |
| R4 — new owner routes            | ✅ SAFE TO MERGE (additive)                           |
| R5 — remove legacy URLs          | ❌ NOT SAFE TO MERGE without extended parallel period |
| Big-bang URL rename (no aliases) | ❌ NOT SAFE TO MERGE                                  |

**Recommended:** R1 → R2 → R3 in sequence. Keep `/journey` and `/pwa/scan/*` permanently for dev/QA even after production QR entry.
