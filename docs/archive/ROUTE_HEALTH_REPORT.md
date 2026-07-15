# Route Health Report

**Date:** 2026-06-20  
**Source:** Code-verified audit of mounted routes (not implementation docs)  
**Constraint:** Guard logic not modified — gaps documented only

---

## Mount Tree

```
/ → /journey
/pwa/scan/* → PwaScanRoutes (no JourneyProvider)
* → JourneyProvider → JourneyRoutes
```

---

## Flow Summary

| Flow          | Entry                      | Guards (runtime)                                                | Terminal                     |
| ------------- | -------------------------- | --------------------------------------------------------------- | ---------------------------- |
| **Purchase**  | `/journey` → auth → R03    | `RequireAuthCompleted` + `RequireSelectedFlowMatch('purchase')` | R10/R10b/R10c → Emergency    |
| **Prepaid**   | `/journey/prepaid/welcome` | None                                                            | Emergency → Completed        |
| **B2B2C**     | `/journey/b2b2c/welcome`   | None                                                            | Emergency → Completed        |
| **Emergency** | Post-activation handoff    | `RequireAuthCompleted` + `RequireSelectedFlow`                  | `/journey/completed`         |
| **Auth**      | `/journey/auth/*`          | None (entry)                                                    | → flow-specific next step    |
| **PWA**       | `/pwa/scan/loading`        | None (isolated session)                                         | Status screens → vehicle hub |
| **Completed** | Emergency E5/R4 continue   | **None**                                                        | Finish → `/journey`          |

---

## Guards Inventory

| Guard                                  | Mounted On                                              |
| -------------------------------------- | ------------------------------------------------------- |
| `RequireAuthCompleted`                 | `/journey/purchase/*`, `/journey/emergency/*`           |
| `RequireSelectedFlowMatch('purchase')` | `/journey/purchase/*`                                   |
| `RequireSelectedFlow`                  | `/journey/emergency/*`                                  |
| `PwaPhotoRouteGuard`                   | PWA photo routes (diagnostic only — not access control) |

**Not mounted:** Declarative catalog guards in `routes.schema.ts`

---

## Per-Flow Findings

### Purchase ✅ (guarded)

- Entry: Auth complete → R03
- Session guards inside `PurchaseRoutes.tsx` for payment resume, vehicle state
- Back navigation wired per screen
- `redirectIfPaymentSucceeded` active R03–R09b
- **P2:** R04b lacks plate prerequisite redirect
- **P2:** Auth re-entry possible after purchase complete

### Prepaid ⚠️

- **P1:** No auth/flow guard on welcome — deep link possible
- **P1:** Schema path `/journey/prepaid/entry` vs mounted `/journey/prepaid/welcome`
- **P2:** PR01–PR03 screens exist but unreachable

### B2B2C ⚠️

- **P1:** Same unguarded welcome as prepaid
- **P1:** Schema `partner-bridge` vs mounted `welcome`
- **P2:** `welcome/plan-rider` orphan from flow entry

### Emergency ⚠️

- Parent guards correct
- **P1:** R1–R3, E2–E3 reachable without session prerequisites
- **P1:** Authed + no-flow recovery → purchase R03 (not flow entry)
- Back navigation comprehensive via `getEmergencyFlowBackPath`

### Post-Activation PWA ⚠️

- Isolated from journey — by design
- **P1:** Deep link to verify OTP/name bypasses mobile prerequisite
- **P1:** Deep link to Park Me bypasses verify gate
- **P2:** SOS holding refresh loses `location.state`
- **P2:** `/pwa/scan/park-me/review` legacy redirect
- **P2:** PWA paths absent from `routes.schema.ts`

### Auth ✅

- OTP/vehicle-owner prerequisite redirects active
- **P2:** No block on re-entry when auth already complete
- **P2:** Schema `/shared/*` legacy — actual mount is `/journey/auth/*`

### Flow Entry ✅

- `/journey`, `/journey/flow-hub` (QA), redirects for `/journey/home`, `/journey/qr-scan`
- **P1:** `/activate/:token` in schema — not mounted

### Completed ⚠️

- **P1:** No auth/completion guard — directly reachable
- **P2:** Incorrect schema stepId mapping

---

## Schema Drift Summary

| Schema Path                     | Mounted?                   |
| ------------------------------- | -------------------------- |
| `/activate/:token`              | ❌                         |
| `/shared/*`                     | ❌ (use `/journey/auth/*`) |
| `/prepaid/pr01–pr03`            | ❌                         |
| `/flow/*`                       | ❌                         |
| `/journey/prepaid/entry`        | ❌ (use `welcome`)         |
| `/journey/b2b2c/partner-bridge` | ❌ (use `welcome`)         |
| `/pwa/scan/*`                   | ✅ (not in schema)         |

---

## Refresh / Session Behavior

| Store           | Key                               | Survives Refresh                        |
| --------------- | --------------------------------- | --------------------------------------- |
| Journey session | `sessionStorage` `al-journey-v1`  | ✅ Same tab                             |
| Selected flow   | `localStorage` `al-selected-flow` | ✅ Cross-tab                            |
| Journey phase   | In-memory only                    | ❌ Self-heals via route segment effects |
| PWA session     | `sessionStorage` `al-pwa-scan-v1` | ✅ Same tab                             |

---

## Risk Rollup

| Priority | Count | Theme                                            |
| -------- | ----: | ------------------------------------------------ |
| P0       |     0 | No total flow breakage in mounted routers        |
| P1       |    12 | Unguarded routes, schema drift, deep links       |
| P2       |   15+ | Legacy catalog, phase non-persistence, QA routes |

---

## Verdict

**PASS for demo flows** — all primary happy paths work with guards on purchase/emergency. **READY WITH KNOWN GAPS** for production hardening of deep links and schema alignment.
