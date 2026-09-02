# Unified PWA Risk Matrix

**Date:** 2026-06-17  
**Scope:** Audit only  
**Parent:** [UNIFIED_PWA_MIGRATION_AUDIT.md](./UNIFIED_PWA_MIGRATION_AUDIT.md)

---

## Legend

| Rating      | Meaning                                     |
| ----------- | ------------------------------------------- |
| 🟢 Safe     | Can merge without breaking flows            |
| 🟡 Risky    | Merge possible with mitigation + regression |
| 🔴 Breaking | Will break flows if merged incorrectly      |
| ⚫ Blocker  | Must be resolved before any merge           |

---

## Master matrix

| #   | Merge target                        | Purchase | Prepaid | B2B2C | Emergency | PWA Scanner | Rating | Blocker? |
| --- | ----------------------------------- | -------- | ------- | ----- | --------- | ----------- | ------ | -------- |
| 1   | Single product definition           | —        | —       | —     | —         | —           | 🟢     | No       |
| 2   | Shared `@autolokate/ui`             | ✓        | ✓       | ✓     | ✓         | ✓           | 🟢     | No       |
| 3   | Shared design tokens                | ✓        | ✓       | ✓     | ✓         | ✓           | 🟢     | No       |
| 4   | Shared auth validation              | ✓        | ✓       | ✓     | —         | ✓           | 🟢     | No       |
| 5   | Shared auth screens (A1/A2/A3)      | ✓        | ✓       | ✓     | —         | ✓           | 🟢     | No       |
| 6   | QR dispatch layer (additive)        | ✓        | ✓       | ✓     | —         | ✓           | 🟢     | No       |
| 7   | Route URL aliases (parallel)        | ✓        | ✓       | ✓     | ✓         | ✓           | 🟢     | No       |
| 8   | Dev entry `/journey` retained       | ✓        | ✓       | ✓     | ✓         | ✓           | 🟢     | No       |
| 9   | Single route tree (rename)          | ⚠        | ⚠       | ⚠     | ⚠         | ⚠           | 🟡     | No       |
| 10  | Single root provider                | ⚠        | ⚠       | ⚠     | ⚠         | ⚠           | 🟡     | No       |
| 11  | Single shell component              | ⚠        | ⚠       | ⚠     | ⚠         | ⚠           | 🟡     | No       |
| 12  | Single auth orchestrator            | ⚠        | ⚠       | ⚠     | —         | ⚠           | 🟡     | No       |
| 13  | Unified session (sliced)            | ⚠        | ⚠       | ⚠     | ⚠         | ⚠           | 🟡     | No       |
| 14  | Single session key (naive merge)    | ✗        | ✗       | ✗     | ✗         | ✗           | 🔴     | **Yes**  |
| 15  | Merge owner + bystander auth fields | ✗        | ✗       | ✗     | —         | ✗           | 🔴     | **Yes**  |
| 16  | Merge emergency + SOS state         | ✗        | ✗       | ✗     | ✗         | ✗           | 🔴     | **Yes**  |
| 17  | Merge vehicle models (flat)         | ✗        | ✗       | ✗     | —         | ✗           | 🔴     | **Yes**  |
| 18  | Inline PWA photos in journey key    | ✗        | ✗       | ✗     | —         | ✗           | 🔴     | **Yes**  |
| 19  | Remove `selectedFlow`               | ✗        | ✗       | ✗     | ✗         | —           | 🔴     | **Yes**  |
| 20  | Remove journey guards               | ✗        | ✗       | ✗     | ✗         | —           | 🔴     | **Yes**  |
| 21  | Big-bang provider swap              | ✗        | ✗       | ✗     | ✗         | ✗           | 🔴     | **Yes**  |

**Rating key:** ✓ = preserved · ⚠ = at risk · ✗ = broken

---

## Conflict matrix by dimension

### Session conflicts

| Field / concept       | Journey location               | PWA location                 | Merge type       | Rating |
| --------------------- | ------------------------------ | ---------------------------- | ---------------- | ------ |
| Mobile                | `session.auth.mobile`          | `session.mobile`             | Path + semantics | 🔴     |
| Owner/bystander name  | `session.auth.ownerName`       | `session.name`               | Semantic         | 🔴     |
| Auth complete flag    | `authStatus` (top-level)       | `session.verified`           | Model            | 🔴     |
| OTP verified          | `session.auth.otpVerified`     | (not persisted)              | Missing in PWA   | 🟡     |
| Consent               | `session.auth.consentAccepted` | `session.consentAccepted`    | Duplicate path   | 🟡     |
| Selected flow         | `selectedFlow` (top-level)     | —                            | PWA has none     | 🟡     |
| Phase                 | `phase` (in-memory)            | —                            | PWA has none     | 🟢     |
| Owner vehicle         | `session.vehicle`              | —                            | Journey only     | 🟢     |
| Scanned vehicle       | —                              | `session.scannedVehicle`     | PWA only         | 🟢     |
| Reporter vehicle      | —                              | `session.reporterPlate` etc. | PWA only         | 🟢     |
| Purchase checkout     | `session.purchase`             | —                            | Journey only     | 🟢     |
| Prepaid entitlement   | `session.prepaid`              | —                            | Journey only     | 🟢     |
| B2B2C entitlement     | `session.b2b2c`                | —                            | Journey only     | 🟢     |
| Owner emergency setup | `session.emergency`            | —                            | Journey only     | 🟢     |
| SOS dispatch          | —                              | `session.sosStatus` etc.     | PWA only         | 🟢     |
| Park Me photos        | —                              | `session.parkMePhotos`       | PWA only + quota | 🔴     |
| SOS photos            | —                              | `session.sosPhotos`          | PWA only + quota | 🔴     |
| Geo location          | —                              | `session.location`           | PWA only         | 🟢     |
| Pending flow          | —                              | `session.pendingFlow`        | PWA only         | 🟢     |
| Bootstrap gate        | —                              | `session.bootstrapComplete`  | PWA only         | 🟢     |

### Route conflicts

| Conflict                                     | Affected flows  | Rating | Mitigation                                     |
| -------------------------------------------- | --------------- | ------ | ---------------------------------------------- |
| Provider unmount on `/journey` → `/pwa/scan` | All (cross-nav) | 🟡     | Root provider always mounted                   |
| Duplicate auth routes                        | PWA verify      | 🟡     | Shared route component, mode param             |
| Duplicate emergency namespaces               | Journey + PWA   | 🔴     | Keep slices: `/emergency/setup` vs `/scan/sos` |
| Journey wildcard → `/journey`                | Activation      | 🟡     | Preserve fallback during alias phase           |
| PWA wildcard → `/loading`                    | Scanner         | 🟡     | Preserve fallback during alias phase           |
| `RequireSelectedFlowMatch` on PWA            | Scanner         | 🔴     | PWA routes must never inherit journey guards   |
| Purchase payment mount guards                | Purchase        | 🟡     | Keep in route components unchanged             |

### Provider conflicts

| Conflict                               | Consumers         | Rating | Mitigation                 |
| -------------------------------------- | ----------------- | ------ | -------------------------- |
| `useJourney()` throws outside provider | 15+ files         | 🟡     | Compat shim hook           |
| `usePwaScan()` throws outside provider | 8+ files          | 🟡     | Compat shim hook           |
| Different `updateSession` signatures   | All               | 🟡     | Unified API with overload  |
| PWA `storageError` not in journey      | PWA photos        | 🟢     | Keep on scanner slice      |
| `clearJourney` vs `resetSession`       | Entry + completed | 🟡     | Explicit `resetMode()` API |

### State conflicts

| State                   | Journey                          | PWA                       | Rating |
| ----------------------- | -------------------------------- | ------------------------- | ------ |
| OTP input during verify | Session (A2 route)               | Local `useState`          | 🟡     |
| Resend cooldown         | Session/route                    | Local `useState`          | 🟢     |
| Payment processing      | `session.purchase.paymentStatus` | —                         | 🟢     |
| Rider draft             | `session.emergency.rider`        | —                         | 🟢     |
| SOS hold timer          | —                                | Route-local + `sosStatus` | 🟢     |
| Photo capture errors    | —                                | `storageError`            | 🟢     |

---

## Flow-specific risk summary

### Purchase

| Risk                                          | Severity | Trigger                         |
| --------------------------------------------- | -------- | ------------------------------- |
| `RequireSelectedFlowMatch('purchase')` bypass | 🔴       | PWA mounted under same guards   |
| Payment state cleared by scanner reset        | 🔴       | Shared naive session reset      |
| Auth incomplete access to R03                 | 🔴       | `authStatus` not preserved      |
| Route rename breaks R03–R10 deep links        | 🟡       | URL unification without aliases |

### Prepaid

| Risk                            | Severity | Trigger                                  |
| ------------------------------- | -------- | ---------------------------------------- |
| Entitlement seed lost           | 🔴       | Session merge overwrites `prepaid` slice |
| Welcome skip breaks handoff     | 🟡       | QR dispatch bypasses welcome incorrectly |
| `getEmergencyHandoffPath` wrong | 🔴       | `session.purchase` seed corrupted        |

### B2B2C

| Risk                                      | Severity | Trigger                                                           |
| ----------------------------------------- | -------- | ----------------------------------------------------------------- |
| Variant (`plan-only` / `plan-rider`) lost | 🔴       | Session merge                                                     |
| Back-nav from emergency wrong             | 🟡       | `getEmergencyFlowBackPath` depends on `selectedFlow` + riderCount |
| Same entitlement risks as prepaid         | 🔴       | Shared b2b-shared seed path                                       |

### Emergency (journey)

| Risk                           | Severity | Trigger                               |
| ------------------------------ | -------- | ------------------------------------- |
| Rider/contact data lost        | 🔴       | Session overwrite from PWA            |
| Guard bypass (unauthenticated) | 🔴       | Provider/guard refactor               |
| Handoff path wrong after auth  | 🔴       | `activation-routing.ts` inputs change |

### PWA Scanner

| Risk                          | Severity | Trigger                                    |
| ----------------------------- | -------- | ------------------------------------------ |
| Photos lost on session merge  | 🔴       | Schema migration without photo store       |
| Quota errors in activation    | 🔴       | Photos inline in unified key               |
| `pendingFlow` resume broken   | 🔴       | Field rename or loss                       |
| Bystander name shown as owner | 🔴       | Auth field unification                     |
| Verify flow broken            | 🟡       | Auth orchestrator refactor                 |
| Demo vehicle seed lost        | 🟡       | `defaultPwaScanSession()` hydration change |

---

## Mitigation priority

| Priority | Action                                                   | Resolves                |
| -------- | -------------------------------------------------------- | ----------------------- |
| P0       | Namespaced session slices — never flat merge             | #14, #15, #16, #17, #18 |
| P0       | Separate photo storage (IndexedDB or `al-pwa-photos-v1`) | #18                     |
| P0       | Preserve `selectedFlow` + guards for activation routes   | #19, #20                |
| P1       | Root provider with `useJourney` / `usePwaScan` shims     | #21, provider conflicts |
| P1       | Auth mode discriminator (`owner` \| `bystander`)         | #15                     |
| P2       | Route aliases for all 62 paths                           | Route conflicts         |
| P2       | Unified shell with mode prop                             | Shell merge             |
| P3       | QR dispatch (additive, no session merge)                 | Entry unification       |

---

## Final verdict

# NOT SAFE TO MERGE (big-bang)

**Blockers (must not proceed without plan):**

1. Single session key with inline photos
2. Unified auth field namespace (owner/bystander)
3. Unified emergency state (setup vs dispatch)
4. Flat vehicle model
5. Removal of `selectedFlow` / journey guards
6. Simultaneous provider swap without compat hooks

**Safe to proceed independently:**

- QR dispatch layer
- Route aliases
- Provider compat layer (phased)
- Session slice schema with photo extraction (phased)

See [UNIFIED_PWA_PROVIDER_PLAN.md](./UNIFIED_PWA_PROVIDER_PLAN.md), [UNIFIED_PWA_SESSION_PLAN.md](./UNIFIED_PWA_SESSION_PLAN.md), [UNIFIED_PWA_ROUTE_PLAN.md](./UNIFIED_PWA_ROUTE_PLAN.md) for phased approach.
