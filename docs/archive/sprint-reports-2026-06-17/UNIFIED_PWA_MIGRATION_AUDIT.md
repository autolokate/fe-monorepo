# Unified PWA Migration Audit

**Date:** 2026-06-17  
**Scope:** Audit only — no code, route, session, or business-rule changes  
**Goal:** Determine exactly what is required to become one product with one route tree, one session, one provider, one shell, and one auth — without breaking Purchase, Prepaid, B2B2C, Emergency, or PWA Scanner.

---

## Executive summary

| Dimension  | Current state                               | Unified target     | Merge readiness                         |
| ---------- | ------------------------------------------- | ------------------ | --------------------------------------- |
| Product    | One deployable (`apps/qr`)                  | Same               | ✅ Already one product                  |
| Route tree | Split: `/journey/*` + `/pwa/scan/*`         | Single namespace   | ⚠️ Risky — 62+ routes, different guards |
| Provider   | `JourneyProvider` + `PwaScanProvider`       | One root provider  | ⚠️ Risky — 40+ hook call sites          |
| Session    | `al-journey-v1` + `al-pwa-scan-v1`          | One storage key    | ❌ Breaking — schema + quota conflicts  |
| Shell      | 4 shells (Auth, Flow, Welcome, PwaScan)     | One platform shell | ⚠️ Risky — different chrome contracts   |
| Auth       | Owner auth (journey) + bystander auth (PWA) | One auth model     | ❌ Breaking — semantic field conflicts  |

---

## 1. Route ownership

### Current ownership

| Namespace              | Owner file                                              | Route count        | Provider required        |
| ---------------------- | ------------------------------------------------------- | ------------------ | ------------------------ |
| `/` → `/journey`       | `journey/routes/JourneyRoutes.tsx`                      | 1 redirect + entry | JourneyProvider          |
| `/journey/auth/*`      | `journey/routes/AuthRoutes.tsx`                         | 5 (+ legal)        | JourneyProvider          |
| `/journey/purchase/*`  | `journey/routes/PurchaseRoutes.tsx`                     | 13                 | JourneyProvider + guards |
| `/journey/prepaid/*`   | `journey/routes/PrepaidRoutes.tsx`                      | 1 active           | JourneyProvider          |
| `/journey/b2b2c/*`     | `journey/routes/B2b2cRoutes.tsx`                        | 2                  | JourneyProvider          |
| `/journey/emergency/*` | `journey/routes/EmergencyRoutes.tsx`                    | 10                 | JourneyProvider + guards |
| `/journey/completed`   | `journey/screens/JourneyCompletedScreen.tsx`            | 1                  | JourneyProvider          |
| `/pwa/scan/*`          | `features/post-activation-pwa/routes/PwaScanRoutes.tsx` | 30                 | PwaScanProvider          |

**Top-level split:** `journey/JourneyOrchestrator.tsx` mounts `/pwa/scan/*` **outside** `JourneyProvider`.

**Path constant files:**

- Journey: `journey/constants.ts`, `journey/auth/auth-routing.ts`, `journey/purchase/purchase-routing.ts`, `journey/prepaid/prepaid-routing.ts`, `journey/b2b2c/b2b2c-routing.ts`, `journey/emergency/emergency-routing.ts`
- PWA: `features/post-activation-pwa/constants/pwa-scan-paths.ts`

**Cross-boundary navigation:** Only one link — `FlowEntryScreen` card 4 navigates from `/journey` (inside JourneyProvider) to `/pwa/scan/loading` (unmounts JourneyProvider, mounts PwaScanProvider). No reverse navigation from PWA back to journey with session carry-over.

### Unified requirement

- Single `BrowserRouter` tree under one root layout
- All 62+ routes addressable without provider unmount
- QR entry dispatcher at root (future `/scan/:qrId`)

### Gap analysis

| Gap                                                                                                     | Severity |
| ------------------------------------------------------------------------------------------------------- | -------- |
| Two route mount points with different providers                                                         | High     |
| Journey guards (`RequireAuthCompleted`, `RequireSelectedFlowMatch`) don't apply to PWA                  | High     |
| PWA has no `selectedFlow` — guard model incompatible                                                    | High     |
| PWA wildcard fallback → `/pwa/scan/loading`; journey wildcard → `/journey`                              | Medium   |
| Relative vs absolute route definitions differ (`PwaScanRoutes` uses relative paths under `/pwa/scan/*`) | Medium   |

---

## 2. Provider ownership

### JourneyProvider

**File:** `journey/JourneyContext.tsx`

| Export                                                                         | Purpose                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------- |
| `selectedFlow`                                                                 | `'purchase' \| 'prepaid' \| 'b2b2c' \| null`   |
| `authStatus`                                                                   | `'pending' \| AUTH_COMPLETED`                  |
| `session`                                                                      | `JourneySession`                               |
| `phase`                                                                        | `JourneyPhase` (in-memory only, not persisted) |
| `setSelectedFlow`, `completeAuth`, `clearJourney`, `updateSession`, `setPhase` | Mutations                                      |

**Consumers:** 15+ files — `AuthRoutes`, `PurchaseRoutes`, `EmergencyRoutes`, `JourneyRouteGuards`, `FlowEntryScreen`, welcome screens, completed screen.

**Throws:** `useJourney must be used within JourneyProvider` — hard failure outside provider.

### PwaScanProvider

**File:** `features/post-activation-pwa/context/PwaScanContext.tsx`

| Export                                              | Purpose                                                        |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `session`                                           | `PwaScanSession`                                               |
| `updateSession`                                     | Patch with functional form; returns `SavePwaScanSessionResult` |
| `resetSession`, `storageError`, `clearStorageError` | PWA-specific                                                   |

**Consumers:** 8 files — all under `post-activation-pwa/` (routes, hooks, components).

**Throws:** `usePwaScan must be used within PwaScanProvider` — hard failure outside provider.

**PWA-only features not in JourneyProvider:**

- Photo quota error handling (`storageError`)
- Functional patch updates
- No `selectedFlow`, `authStatus`, or `phase`

### Unified requirement

One `AutolokateProvider` wrapping entire app, exposing namespaced slices or unified session with mode discriminator.

### Gap analysis

| Gap                                                               | Severity |
| ----------------------------------------------------------------- | -------- |
| Mutually exclusive provider trees at orchestrator level           | High     |
| Different `updateSession` signatures (partial vs patch function)  | Medium   |
| Journey `phase` is ephemeral; PWA has no equivalent journey phase | Medium   |
| PWA storage error surface has no journey equivalent               | Low      |

---

## 3. Session ownership

### Journey session (`PersistedJourneyState`)

**Schema:** `journey/types.ts`  
**Storage:** `sessionStorage` → `al-journey-v1`  
**Also:** `localStorage` → `al-selected-flow`

```
PersistedJourneyState {
  selectedFlow: ActivationFlowId | null
  authStatus: 'pending' | AUTH_COMPLETED
  session: JourneySession {
    auth?: { mobile, mobileDisplay, consentAccepted, languageId, otpVerified, ownerName }
    vehicle?: { plate, fields, fetchStatus, confirmed }
    purchase?: PurchaseCheckoutSession
    prepaid?: PrepaidLandingSession
    b2b2c?: B2b2cLandingSession
    emergency?: EmergencySession
  }
}
```

### PWA session (`PwaScanSession`)

**Schema:** `features/post-activation-pwa/context/pwa-scan-types.ts`  
**Storage:** `sessionStorage` → `al-pwa-scan-v1`

```
PwaScanSession {
  bootstrapComplete, verified, mobile, name, consentAccepted
  pendingFlow: 'park-me' | 'sos' | null
  scannedVehicle: { plate, modelSummary, protected, planLabel, fields }
  reporterPlate, reporterFields, reporterProtected, reporterPlanLabel
  permissionsGranted, parkMePhotos, location, locationName, parkMeStatus
  sosPhotos, sosStatus, simulateNetworkFail, locationDenied
}
```

### Unified requirement

Single persisted document, single hydration on app boot, no data loss when crossing activation ↔ scanner.

---

## 4. Storage keys

| Key                | Store          | Owner    | Size risk                               |
| ------------------ | -------------- | -------- | --------------------------------------- |
| `al-journey-v1`    | sessionStorage | Journey  | Low — no binary photos                  |
| `al-selected-flow` | localStorage   | Journey  | Trivial                                 |
| `al-pwa-scan-v1`   | sessionStorage | PWA      | **High** — base64 photos (parkMe + sos) |
| `al-qr-theme`      | localStorage   | App root | Trivial — shared already                |

**PWA storage:** `pwa-scan-storage.ts` implements quota detection (`QuotaExceededError`) and photo byte estimation. Journey persistence has no quota handling.

**Conflict:** Merging PWA photos into `al-journey-v1` would inflate journey session and trigger quota failures during activation flows that today never hit this limit.

---

## 5. Shared components

### Already shared (safe)

| Component                                                     | Package / path                                  | Used by                             |
| ------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------- |
| `AlTextField`, `AlOtpInput`, `AlPlateInput`, `AlButton`, etc. | `@autolokate/ui`                                | All modules                         |
| `A1MobileScreen`, `A2OtpScreen`, `A3VehicleOwnerScreen`       | `features/shared-auth/`                         | Journey auth + PWA verify (UI only) |
| Auth validation                                               | `shared-auth/auth-flow/auth-flow.validation.ts` | Journey + PWA                       |
| Theme                                                         | `@autolokate/design-system/theme.css`           | Entire app                          |

### Not shared (shell layer)

| Shell                    | Path                                                | Used by                        |
| ------------------------ | --------------------------------------------------- | ------------------------------ |
| `AuthStepShell`          | `components/auth-step-shell/`                       | Journey auth, purchase R03–R10 |
| `FlowStepShell`          | `components/flow-step-shell/`                       | Emergency, legacy prepaid      |
| `WelcomeActivationShell` | `components/compositions/welcome-activation/`       | Prepaid, B2B2C welcome         |
| `PwaScanShell`           | `post-activation-pwa/components/PwaScanShell.tsx`   | All PWA routes                 |
| `PwaVerifyShell`         | `post-activation-pwa/components/PwaVerifyShell.tsx` | PWA verify only                |

**PWA verify explicitly avoids AuthStepShell:** `PwaVerifyShell.tsx` comment — _"PWA-native verify frame — replaces onboarding AuthStepShell chrome for 03–05."_

---

## 6. Shared state

| State concept | Journey                                   | PWA                                              | Unified conflict                                 |
| ------------- | ----------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Mobile number | `session.auth.mobile`                     | `session.mobile` (flat)                          | Field path + semantics (owner vs bystander)      |
| Display name  | `session.auth.ownerName`                  | `session.name`                                   | Same A3 screen, different meaning                |
| OTP verified  | `session.auth.otpVerified` + `authStatus` | `session.verified`                               | Dual auth flags                                  |
| Consent       | `session.auth.consentAccepted`            | `session.consentAccepted`                        | Duplicate field, different consent copy variants |
| Vehicle plate | `session.vehicle.plate`                   | `scannedVehicle.plate` + `reporterPlate`         | Three vehicle contexts                           |
| Plan          | `session.purchase.selectedPlanId`         | `scannedVehicle.planLabel` / `reporterPlanLabel` | Different shapes                                 |
| Photos        | —                                         | `parkMePhotos`, `sosPhotos` (base64)             | Journey has none                                 |
| Location      | —                                         | `location`, `locationName`                       | Journey has none                                 |
| Flow intent   | `selectedFlow` + `phase`                  | `pendingFlow`                                    | Orthogonal models                                |

**No shared React context today** between journey and PWA modules.

---

## 7. Shared auth

### Journey auth (owner activation)

- **Routes:** `/journey/auth/mobile` → `/otp` → `/vehicle-owner`
- **Orchestration:** `AuthRoutes.tsx` + `JourneySharedAuthRoute.tsx`
- **Completion:** `completeAuth()` sets `authStatus = AUTH_COMPLETED`, navigates via `getPostAuthActivationPath()`
- **Progress:** 3-segment bar via `useAuthRouteProgress()`
- **Shell:** `AuthStepShell` with progress, consent variants (`owner`, etc.)

### PWA auth (bystander verify)

- **Routes:** `/pwa/scan/verify/mobile` → `/otp` → `/name`
- **Orchestration:** Inline in `pwa-shared-routes.tsx` — **not** `AuthRoutes`
- **Completion:** `updateSession({ verified: true })` + `resumePendingFlow()`
- **Progress:** Hidden (`hideProgress` on A1)
- **Shell:** `PwaVerifyShell` / `PwaScanShell`
- **OTP state:** Local `useState` in route — **not** journey session
- **A3 reuse:** Title _"What should we call you?"_ — bystander name, not owner name

### Unified auth requirement

One auth pipeline serving both owner activation and bystander verify with role/mode discriminator.

### Gap analysis

| Gap                                                              | Severity                  |
| ---------------------------------------------------------------- | ------------------------- |
| Two auth orchestrators (AuthRoutes vs pwa-shared-routes)         | High                      |
| Same screens, different session write targets                    | High                      |
| Journey uses top-level `authStatus`; PWA uses `verified` boolean | High                      |
| PWA OTP held in component state, not session                     | Medium                    |
| Different consent variants and copy                              | Low (solvable with props) |

---

## 8. Shared emergency

### Journey emergency (owner setup during activation)

- **Routes:** `/journey/emergency/*` (R0–R4 rider, E0–E5 contacts)
- **Session:** `session.emergency` — `EmergencySession` type
- **Purpose:** Configure riders and emergency contacts for vehicle owner
- **Guards:** `RequireAuthCompleted` + `RequireSelectedFlow`
- **Terminal:** `/journey/completed`

### PWA emergency (bystander SOS dispatch)

- **Routes:** `/pwa/scan/sos/*` (14 frames)
- **Session:** `sosStatus`, `sosPhotos`, `location`, `locationDenied`
- **Purpose:** Send help for scanned vehicle emergency
- **No** `EmergencySession` usage
- **Terminal states:** `help-dispatched`, `resolved`, `alert-cancelled`, `contacts-only`

**These are different products of "emergency":**

| Aspect      | Journey emergency             | PWA SOS                  |
| ----------- | ----------------------------- | ------------------------ |
| Actor       | Vehicle owner                 | Bystander                |
| Action      | Setup contacts                | Dispatch help            |
| Persistence | `session.emergency.*`         | `session.sos*`           |
| Routes      | 10 under `/journey/emergency` | 14 under `/pwa/scan/sos` |

**Unifying into one `/emergency` namespace would conflate owner setup vs bystander dispatch.**

---

## 9. Shared vehicle model

### Journey `VehicleSession`

```typescript
{ plate?, fields?, fetchStatus?, confirmed? }
```

Used during activation: owner enters/confirms their vehicle (R03–R05).

### PWA `PwaScannedVehicle`

```typescript
{ plate, modelSummary, protected, planLabel?, fields }
```

The vehicle **being scanned** (demo-seeded in `pwa-demo-data.ts`).

### PWA reporter vehicle

```typescript
(reporterPlate, reporterFields, reporterProtected, reporterPlanLabel);
```

The **bystander's own vehicle** in Park Me flow (when reporter is blocked by scanned vehicle).

**Three distinct vehicle contexts.** Collapsing into one `vehicle` object without namespacing would cause data overwrite when a bystander who is also an owner crosses flows.

---

## 10. QR entry model

### Current

- **Dev entry:** `/journey` manual card selection
- **No QR decode** in runtime
- **Post-activation:** Direct nav to `/pwa/scan/loading`
- **Flow registry** declares `guard.qr-valid` on flows but guard is catalog-only (not evaluated at runtime)

### Future (documented in `QR_ENTRY_STRATEGY.md`)

- QR payload → dispatch to purchase / prepaid / b2b2c / activated
- Requires router service **before** session/provider unification is strictly necessary

### Unified dependency

QR entry can be added **without** session merge by dispatching to existing routes. Full unification is **not a prerequisite** for QR entry.

---

## Safe merges

| Item                                           | Rationale                                                   |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Product branding / single PWA manifest         | Already one app                                             |
| `@autolokate/design-system` + `@autolokate/ui` | Already shared                                              |
| Auth **validation** utilities                  | Already shared, no session coupling                         |
| Auth **screen components** (A1/A2/A3)          | Already shared with props; session write stays caller-owned |
| Theme key (`al-qr-theme`)                      | Already app-wide                                            |
| Route **aliases** (parallel old + new URLs)    | Additive, no behavior change                                |
| QR dispatch layer at root                      | New code path calling existing entry functions              |
| Documentation / module map                     | Zero runtime risk                                           |
| Dev entry `/journey` cards retained            | Compatible with production QR entry                         |

---

## Risky merges

| Item                                          | Rationale                                                           |
| --------------------------------------------- | ------------------------------------------------------------------- |
| Single route tree (URL renames)               | 62+ routes, bookmarks, dev preview paths, capture scripts           |
| Single shell component                        | 4 shells with different footer/progress/back contracts              |
| Single auth **orchestrator**                  | Must preserve owner vs bystander semantics + OTP local state in PWA |
| Root provider wrapping all routes             | All hooks must work on every route; test matrix explodes            |
| Merging `EmergencySession` with PWA SOS state | Different actors, different lifecycles                              |
| Collapsing vehicle models without namespacing | Three vehicle contexts                                              |

---

## Breaking merges

| Item                                                              | Rationale                                                                   |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Single session key** merging `al-journey-v1` + `al-pwa-scan-v1` | Schema incompatible; photo quota; field collisions                          |
| **Replacing `authStatus` + `session.auth` with PWA flat fields**  | Breaks all journey guards and 15+ consumers                                 |
| **Removing `selectedFlow`**                                       | Breaks `RequireSelectedFlowMatch`, purchase/prepaid/b2b2c routing           |
| **Big-bang provider swap**                                        | Every `useJourney()` / `usePwaScan()` call site must migrate simultaneously |
| **Unifying owner `ownerName` and bystander `name`**               | Wrong data shown to vehicle owner in activation                             |
| **Moving PWA photos into journey session without quota strategy** | Activation flows fail on sessionStorage quota                               |

---

## Session conflicts (detailed)

| Field     | Journey                      | PWA                    | Conflict type    |
| --------- | ---------------------------- | ---------------------- | ---------------- |
| `mobile`  | `session.auth.mobile`        | `session.mobile`       | Path + semantics |
| Name      | `ownerName`                  | `name`                 | Semantic         |
| Verified  | `authStatus` + `otpVerified` | `verified`             | Dual model       |
| Vehicle   | `vehicle.plate`              | `scannedVehicle.plate` | Context          |
| Plan      | `purchase.selectedPlanId`    | `planLabel` string     | Shape            |
| Photos    | —                            | base64 in session      | Size             |
| Emergency | `emergency.contacts[]`       | `sosStatus` enum       | Domain           |

---

## Route conflicts (detailed)

| Conflict                   | Detail                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Provider boundary          | `/pwa/scan/*` unmounts JourneyProvider — guards stop running                 |
| Auth path duplication      | `/journey/auth/otp` vs `/pwa/scan/verify/otp` — same UI, different routes    |
| Emergency path duplication | `/journey/emergency/*` vs `/pwa/scan/sos/*` — different domains              |
| Wildcard fallbacks         | Different default redirects per tree                                         |
| Progress bars              | Journey routes use `useAuthRouteProgress` / purchase progress — PWA has none |

---

## State conflicts (detailed)

| Conflict                        | Detail                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `phase` (journey) vs none (PWA) | Journey tracks `shared-auth` / `activation` / `emergency`; PWA uses route-local state         |
| PWA OTP in `useState`           | Not in session — lost on provider remount within PWA ok, but blocks shared auth session model |
| `pendingFlow` (PWA)             | No journey equivalent — encodes deferred Park Me/SOS after verify                             |
| `bootstrapComplete` (PWA)       | Journey has no bootstrap gate                                                                 |
| Payment state in journey        | Must never leak into PWA or be cleared by scanner reset                                       |

---

## Provider conflicts (detailed)

| Conflict                         | Detail                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Orchestrator split               | `JourneyOrchestrator.tsx` line 14–21 — explicit isolation                    |
| Hook throw on wrong tree         | Cannot incrementally migrate one route file without provider above it        |
| `updateSession` API mismatch     | Journey: `Partial<JourneySession>`; PWA: patch fn + save result              |
| `clearJourney` vs `resetSession` | Different reset semantics — journey clears flow; PWA resets to demo defaults |

---

## What full unification requires (checklist)

### Route tree

- [ ] Single root layout with persistent provider
- [ ] Namespace design: `/activate/*`, `/scan/*`, `/dashboard`, etc.
- [ ] Parallel URL aliases for all 62 existing paths during transition
- [ ] Migrate `pwaScanPaths` and `journeyPaths` to unified constants
- [ ] Update dev preview (`ScreenDevApp`) and visual capture scripts

### Provider

- [ ] Design `AutolokateProvider` with namespaced API or backward-compat hooks
- [ ] Migrate 15+ `useJourney` call sites
- [ ] Migrate 8+ `usePwaScan` call sites
- [ ] Preserve throw behavior or provide shim hooks during transition

### Session

- [ ] Define unified schema with `activation`, `scanner`, `auth` slices
- [ ] Migration/version bump (`al-autolokate-v2`)
- [ ] Photo storage strategy (IndexedDB or separate key — not inline in main session)
- [ ] Hydration from legacy keys (`al-journey-v1`, `al-pwa-scan-v1`)
- [ ] Preserve `selectedFlow` in localStorage

### Shell

- [ ] Abstract shell props: progress, footer, back, variant, sticky footer
- [ ] Map AuthStepShell, FlowStepShell, WelcomeActivationShell, PwaScanShell onto one component with modes

### Auth

- [ ] Auth mode: `'owner' | 'bystander'`
- [ ] Single orchestrator or shared hook with mode parameter
- [ ] Preserve separate completion handlers per mode

### Business rule preservation

- [ ] `getPostAuthActivationPath()` unchanged
- [ ] `getEmergencyHandoffPath()` unchanged
- [ ] `RequireSelectedFlowMatch('purchase')` unchanged
- [ ] PWA `pendingFlow` resume logic unchanged
- [ ] Payment gates in PurchaseRoutes unchanged

---

## Estimated scope

| Workstream                | Files touched (est.)       | Risk     |
| ------------------------- | -------------------------- | -------- |
| Unified provider          | 25–35                      | High     |
| Unified session schema    | 20–30                      | Breaking |
| Unified routes            | 15–20 + all path constants | High     |
| Unified shell             | 10–15                      | Medium   |
| Unified auth orchestrator | 5–10                       | High     |
| Migration/hydration       | 5–10                       | Breaking |
| Test + capture regen      | 1300+ captures             | High     |

---

## Final verdict

# NOT SAFE TO MERGE

**as a single big-bang unification** of route tree + session + provider + shell + auth.

### Exact reasons

1. **Session schemas are incompatible** — flat PWA vs nested journey auth; base64 photos in PWA session will break activation if merged naively.
2. **Auth semantics diverge** — owner activation (`ownerName`, `authStatus`) vs bystander verify (`name`, `verified`) use the same UI components but must not share one field namespace.
3. **Emergency is two domains** — owner contact setup (`EmergencySession`) vs bystander SOS dispatch (`sosStatus`) must remain isolated slices.
4. **Vehicle has three contexts** — owner activation, scanned vehicle, reporter vehicle — collapsing without namespacing causes silent data overwrite.
5. **Provider split is structural** — 23+ hook consumers throw if provider hierarchy changes incorrectly; orchestrator explicitly isolates PWA from journey guards.
6. **`selectedFlow` + guards are load-bearing** — purchase/prepaid/b2b2c isolation depends on this; PWA has no equivalent and must not inherit these guards.
7. **PWA OTP state is route-local** — not session-persisted; merging auth sessions without refactoring PWA routes breaks verify flow.

### Conditionally safe (phased)

| Phase                                                         | Verdict                                        |
| ------------------------------------------------------------- | ---------------------------------------------- |
| Conceptual "one product" + shared packages                    | ✅ SAFE TO MERGE (already done)                |
| QR dispatch at root calling existing entries                  | ✅ SAFE TO MERGE (additive)                    |
| Route aliases (old + new URLs parallel)                       | ✅ SAFE TO MERGE                               |
| Single provider with **namespaced slices** + compat hooks     | ⚠️ SAFE only with phased migration + hydration |
| Single session with **separate photo storage** + slice schema | ⚠️ SAFE only with versioned migration          |
| Single shell with mode prop                                   | ⚠️ SAFE with visual regression pass            |
| Big-bang: one key, one provider, one tree, one auth namespace | ❌ NOT SAFE TO MERGE                           |

**Recommended path:** Phased unification per `UNIFIED_PWA_PROVIDER_PLAN.md`, `UNIFIED_PWA_SESSION_PLAN.md`, and `UNIFIED_PWA_ROUTE_PLAN.md` — provider first (compat layer), then session slices, then routes, then shell. Do not merge session keys until photo storage is extracted.

---

## Related documents

- [UNIFIED_PWA_RISK_MATRIX.md](./UNIFIED_PWA_RISK_MATRIX.md)
- [UNIFIED_PWA_PROVIDER_PLAN.md](./UNIFIED_PWA_PROVIDER_PLAN.md)
- [UNIFIED_PWA_SESSION_PLAN.md](./UNIFIED_PWA_SESSION_PLAN.md)
- [UNIFIED_PWA_ROUTE_PLAN.md](./UNIFIED_PWA_ROUTE_PLAN.md)
- [SINGLE_PWA_ARCHITECTURE.md](./SINGLE_PWA_ARCHITECTURE.md)
- [QR_ENTRY_STRATEGY.md](./QR_ENTRY_STRATEGY.md)
