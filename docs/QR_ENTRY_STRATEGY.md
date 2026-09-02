# QR Entry Strategy

**Product:** Autolokate PWA  
**Date:** 2026-06-17  
**Status:** **Document only — not implemented**

This document defines the future model where **QR scan is the primary production entry**, replacing manual flow selection. Current dev entry (`/journey` with four cards) is unchanged and remains the development/QA entry point.

---

## Current state (Phase 1)

### Production vs development entry

| Context                     | Entry                          | Behavior                                   |
| --------------------------- | ------------------------------ | ------------------------------------------ |
| **Development / QA**        | `/journey` (`FlowEntryScreen`) | Four cards; manual journey selection       |
| **Post-activation (today)** | `/pwa/scan/loading`            | Direct navigation from card 4 or deep link |
| **Activation (today)**      | `/journey` → card → auth       | No QR payload parsing                      |

There is **no QR decode step** in the current implementation. Flow type is chosen explicitly on the entry screen.

### What stays unchanged in Phase 1

- `/journey` entry screen and four cards
- `/journey/*` route tree
- `/pwa/scan/*` route tree
- All guards, redirects, session keys, business rules

---

## Future state (Phase 2)

### Primary entry model

```
User scans QR code
       │
       ▼
  /scan/:qrId          ← unified QR entry (future)
       │
       ▼
  Decode QR payload
       │
       ├── type: purchase      → activation journey (purchase)
       ├── type: prepaid       → activation journey (pre-paid)
       ├── type: b2b2c         → activation journey (B2B2C)
       └── type: activated     → post-activation scanner
```

**QR becomes the router.** The payload determines which existing journey module runs. No new business logic — only a new dispatch layer on top of current orchestration.

### Proposed QR payload schema (draft)

```typescript
// Document only — not implemented
type QrPayload =
  | { type: 'purchase'; token: string; orgId?: string }
  | { type: 'prepaid'; voucherId: string; entitlement: LandingEntitlement }
  | {
      type: 'b2b2c';
      partnerId: string;
      variant: 'plan-only' | 'plan-rider';
      entitlement: LandingEntitlement;
    }
  | { type: 'activated'; vehicleId: string; plate: string; planLabel?: string };
```

| Payload type | Maps to current flow                          | First route (existing)                                              |
| ------------ | --------------------------------------------- | ------------------------------------------------------------------- |
| `purchase`   | `selectedFlow = 'purchase'`                   | `/journey/auth/mobile`                                              |
| `prepaid`    | `selectedFlow = 'prepaid'` + seed entitlement | `/journey/prepaid/welcome` or skip to auth if voucher pre-validated |
| `b2b2c`      | `selectedFlow = 'b2b2c'` + seed entitlement   | `/journey/b2b2c/welcome` or skip to auth if partner session exists  |
| `activated`  | PWA scan (no journey session)                 | `/pwa/scan/loading` → vehicle hub                                   |

**Open decisions (TBD at implementation):**

- Whether prepaid/b2b2c welcome screens are skipped when entitlement is fully resolved from QR
- Whether `/scan/:qrId` wraps or replaces `/pwa/scan/*` URLs
- Offline / invalid QR error surfaces

---

## Dispatch architecture (future)

### QR router service (conceptual)

```
scan/:qrId
    │
    ▼
┌──────────────────┐
│  QrDecodeService │  ← fetch/decode payload by qrId
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ JourneyDispatcher│  ← maps payload.type → existing entry functions
└────────┬─────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
 purchase   prepaid    b2b2c    activated
    │         │          │          │
    ▼         ▼          ▼          ▼
selectActivation  seed + welcome  seed + welcome  PwaScan bootstrap
Flow('purchase')  + auth path    + auth path     (existing)
```

**Key principle:** Dispatch calls **existing functions** — `selectActivationFlow()`, `applyLandingEntitlementToSession()`, PWA loading bootstrap — not new journey logic.

### Mapping to current code (reference)

| Future dispatch action    | Existing code                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Start purchase activation | `selectActivationFlow('purchase', deps)` in `journey/navigation/select-activation-flow.ts` |
| Start prepaid             | Navigate `prepaidJourneyPaths.welcome` + welcome CTA seeds session                         |
| Start B2B2C               | Navigate `b2b2cJourneyPaths.welcome` + welcome CTA seeds session                           |
| Seed entitlement          | `applyLandingEntitlementToSession()` in `features/b2b-shared/`                             |
| Start post-activation     | Navigate `pwaScanPaths.loading`                                                            |
| Post-auth routing         | `getPostAuthActivationPath()` in `journey/activation-routing.ts`                           |

---

## Route architecture (Phase 2 — document only)

Future unified routes defined in `SINGLE_PWA_ARCHITECTURE.md`:

| Route         | Role                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| `/scan/:qrId` | QR decode + dispatch (replaces manual entry in production)                      |
| `/activate`   | Activation shell (wraps current `/journey/auth/*`, `/journey/purchase/*`, etc.) |
| `/dashboard`  | Post-activation owner home                                                      |
| `/emergency`  | Owner emergency contact management                                              |
| `/vehicle`    | Vehicle + plan profile                                                          |
| `/profile`    | Account settings                                                                |

### URL transition plan

| Current               | Future (production)                          | Dev fallback                |
| --------------------- | -------------------------------------------- | --------------------------- |
| `/journey`            | `/scan/:qrId` or `/activate`                 | `/journey` (cards retained) |
| `/journey/auth/*`     | `/activate/auth/*`                           | unchanged path alias        |
| `/journey/purchase/*` | `/activate/purchase/*`                       | unchanged path alias        |
| `/pwa/scan/*`         | `/scan/:qrId/park-me/*`, `/scan/:qrId/sos/*` | `/pwa/scan/*` alias         |

Parallel routes and redirects should run during rollout so existing deep links keep working.

---

## Guard integration (future)

Current declarative guards in `flow/guards/catalog.ts` align with QR validation:

| Guard ID                | QR relevance                            |
| ----------------------- | --------------------------------------- |
| `guard.qr-valid`        | QR token must decode and not be expired |
| `guard.voucher-valid`   | Pre-paid voucher in payload             |
| `guard.partner-session` | B2B2C partner context in payload        |
| `guard.org-verified`    | Fleet B2B (future)                      |
| `guard.authenticated`   | Existing — unchanged                    |
| `guard.otp-verified`    | Existing — unchanged                    |

Phase 2 adds a **QR decode guard** at `/scan/:qrId` before dispatch. All downstream guards remain unchanged.

---

## Session implications

### Phase 1 (current)

- Journey and PWA sessions are isolated.
- QR scan (card 4) does not touch journey session.

### Phase 2 options

| Option                    | Description                                         | Risk                    |
| ------------------------- | --------------------------------------------------- | ----------------------- |
| **A — Keep isolated**     | QR dispatch sets journey OR PWA session, never both | Low — matches today     |
| **B — Unified provider**  | Single context with `{ journey, pwaScan }` slices   | High — schema migration |
| **C — Shared auth slice** | Extract auth fields both contexts read              | Medium — partial merge  |

**Recommendation:** Option A for initial QR rollout. Option C only if bystander verify must share owner auth state (not required today).

**Session schema changes are out of scope** until an explicit migration is approved.

---

## Migration checklist (when implementing)

- [ ] Define QR payload schema + API contract (`/scan/:qrId` decode endpoint)
- [ ] Implement `QrDecodeService` + error states (invalid, expired, offline)
- [ ] Implement `JourneyDispatcher` mapping to existing entry functions
- [ ] Add `/scan/:qrId` route parallel to existing paths
- [ ] Add redirect aliases from old URLs
- [ ] Keep `/journey` entry screen for dev/QA
- [ ] Update deep link documentation
- [ ] E2E tests: each payload type lands on correct first screen
- [ ] Verify guards and session keys unchanged
- [ ] Production entry documentation separate from dev entry

---

## Risks

| Risk                          | Description                                                  | Mitigation                                                                             |
| ----------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --- |
| **Wrong journey dispatch**    | Invalid payload routes user to purchase instead of activated | Strict payload typing; fail closed to error screen                                     |
| **Skipped welcome screens**   | Pre-seeded entitlement bypasses consent/plan display         | Product decision per flow; default to showing welcome until spec says otherwise        |
| **Deep link breakage**        | URL rename breaks existing `/pwa/scan/*` links               | Parallel routes + 301 redirects for 2 release cycles                                   |
| **QR offline**                | Cannot decode without network                                | Cache last-known vehicle for activated type; block activation types with clear message |
| **Dual entry confusion**      | Dev uses `/journey`, prod uses `/scan/:qrId`                 | Document clearly; env flag `VITE_ENTRY_MODE=dev                                        | qr` |
| **Registry vs runtime drift** | Flow registry updated but dispatcher uses old paths          | Dispatcher imports from same routing constants as JourneyRoutes                        |

---

## Testing strategy (future)

| Scenario                       | Expected first screen                                 |
| ------------------------------ | ----------------------------------------------------- |
| QR `purchase` + new user       | `/journey/auth/mobile` (or `/activate/auth/mobile`)   |
| QR `prepaid` + valid voucher   | `/journey/prepaid/welcome` or auth if welcome skipped |
| QR `b2b2c` plan-rider          | `/journey/b2b2c/welcome/plan-rider`                   |
| QR `activated` + known vehicle | `/pwa/scan/vehicle`                                   |
| Invalid QR                     | Error screen (TBD)                                    |
| Expired QR                     | Error screen with re-scan CTA                         |

Regression: all four `/journey` cards must still work identically for dev/QA.

---

## Related documents

- [SINGLE_PWA_ARCHITECTURE.md](./SINGLE_PWA_ARCHITECTURE.md) — Phase 1/2 architecture, migration path
- [PLATFORM_MODULE_MAP.md](./PLATFORM_MODULE_MAP.md) — module ownership and dependencies
