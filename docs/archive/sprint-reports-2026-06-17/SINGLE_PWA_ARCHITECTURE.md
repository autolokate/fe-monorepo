# Single PWA Architecture

**Product:** Autolokate PWA  
**Date:** 2026-06-17  
**Status:** Architecture definition — **no code, route, session, or business-rule changes in this document**

---

## Executive summary

Autolokate is **one Progressive Web App**, not four separate apps. The four consumer journeys are **modules with distinct entry paths**, sharing auth, design system, UI primitives, and (within activation) a unified journey session.

| What it is                                     | What it is not                  |
| ---------------------------------------------- | ------------------------------- |
| One deployable PWA (`apps/qr`)                 | Four separate products          |
| One platform, multiple entry journeys          | Separate architectures per flow |
| Shared auth + shared UI + shared design tokens | Isolated design systems         |

**Deployable artifact:** `@autolokate/qr` — Vite + React 19 + React Router 7.

---

## Product definition

### Autolokate PWA modules

| #   | Module name                             | Dev entry card       | Runtime entry                                  |
| --- | --------------------------------------- | -------------------- | ---------------------------------------------- |
| 1   | Consumer QR Activation + Purchase       | Card 1 on `/journey` | `/journey` → auth → `/journey/purchase/*`      |
| 2   | Consumer QR Activation — B2B (Pre-Paid) | Card 2 on `/journey` | `/journey` → `/journey/prepaid/welcome` → auth |
| 3   | Consumer QR Activation — B2B2C          | Card 3 on `/journey` | `/journey` → `/journey/b2b2c/welcome` → auth   |
| 4   | QR Scan (Post-Activation)               | Card 4 on `/journey` | `/pwa/scan/loading` (leaves journey context)   |

All four cards remain on **`/journey`** (`FlowEntryScreen`). UX, navigation, and card labels are unchanged.

---

## Current architecture (Phase 1 — live)

Phase 1 is **frozen**: routes, guards, redirects, session schema, and orchestration behave exactly as implemented today.

### Top-level router split

```
main.tsx
  └── JourneyOrchestrator
        ├── /pwa/scan/*     → PwaScanRoutes + PwaScanProvider  (isolated)
        └── *               → JourneyRoutes + JourneyProvider  (activation journeys)
```

**File:** `apps/qr/src/journey/JourneyOrchestrator.tsx`

Post-activation PWA is mounted **outside** `JourneyProvider`. Journey session does not leak into PWA and vice versa.

### Route map (unchanged)

#### Journey root

| Path                   | Screen / behavior                 |
| ---------------------- | --------------------------------- |
| `/`                    | → `/journey`                      |
| `/journey`             | `FlowEntryScreen` — 4 entry cards |
| `/journey/auth/*`      | Shared auth (A1 → A2 → A3)        |
| `/journey/purchase/*`  | Purchase R03–R10                  |
| `/journey/prepaid/*`   | Pre-paid welcome                  |
| `/journey/b2b2c/*`     | Partner welcome                   |
| `/journey/emergency/*` | Rider + emergency contacts        |
| `/journey/completed`   | Activation complete               |

#### Post-activation PWA

| Path prefix           | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `/pwa/scan/loading`   | Bootstrap                                |
| `/pwa/scan/vehicle`   | Scanned vehicle hub                      |
| `/pwa/scan/verify/*`  | Bystander identity (mobile → OTP → name) |
| `/pwa/scan/park-me/*` | Park Me flow                             |
| `/pwa/scan/sos/*`     | SOS emergency flow                       |

**Path constants:** `apps/qr/src/features/post-activation-pwa/constants/pwa-scan-paths.ts`

### Journey orchestration (unchanged)

Runtime navigation is **imperative** via React Router + route components. A declarative flow registry exists as catalog metadata (`apps/qr/src/flow/registry/`) but is not the runtime engine.

**Key orchestration files:**

| Concern                   | Path                                                       |
| ------------------------- | ---------------------------------------------------------- |
| Journey context + session | `apps/qr/src/journey/JourneyContext.tsx`                   |
| Flow selection from entry | `apps/qr/src/journey/navigation/select-activation-flow.ts` |
| Post-auth routing         | `apps/qr/src/journey/activation-routing.ts`                |
| Route guards              | `apps/qr/src/journey/guards/JourneyRouteGuards.tsx`        |
| Auth completion wrapper   | `apps/qr/src/journey/routes/JourneySharedAuthRoute.tsx`    |

**Flow selection behavior (preserved):**

| Card            | Action                                                        |
| --------------- | ------------------------------------------------------------- |
| Purchase        | `setSelectedFlow('purchase')` → `/journey/auth/mobile`        |
| Pre-Paid        | Navigate `/journey/prepaid/welcome` (flow set on welcome CTA) |
| B2B2C           | Navigate `/journey/b2b2c/welcome` (flow set on welcome CTA)   |
| Post-Activation | Navigate `/pwa/scan/loading` — no journey session mutation    |

### Session model (unchanged)

Two isolated session stores — **by design in Phase 1**:

| Store    | Key                                 | Provider          | Schema                                                               |
| -------- | ----------------------------------- | ----------------- | -------------------------------------------------------------------- |
| Journey  | `sessionStorage` → `al-journey-v1`  | `JourneyProvider` | `apps/qr/src/journey/types.ts`                                       |
| PWA scan | `sessionStorage` → `al-pwa-scan-v1` | `PwaScanProvider` | `apps/qr/src/features/post-activation-pwa/context/pwa-scan-types.ts` |

Selected flow persists in `localStorage` → `al-selected-flow`.

**No schema changes are proposed in Phase 1 or this architecture pass.**

### Shared pipeline (all activation journeys)

Every QR activation journey shares the same auth suffix:

```
shared.mobile → shared.otp → shared.account (vehicle owner)
```

Defined in `apps/qr/src/flow/registry/config/shared-pipeline.config.ts`.

Post-auth paths diverge by `selectedFlow` via `getPostAuthActivationPath()` in `activation-routing.ts`.

---

## Future architecture (Phase 2 — document only)

**Not implemented.** Phase 2 defines a **conceptual unified route tree** for when QR becomes the primary entry and activation/post-activation merge under one platform shell.

### Proposed top-level routes

| Route         | Purpose                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| `/activate`   | Unified activation entry (replaces manual `/journey` card selection in production) |
| `/scan/:qrId` | QR decode + journey dispatch                                                       |
| `/dashboard`  | Post-activation home (vehicle status, quick actions)                               |
| `/emergency`  | Emergency contacts + rider management (owner-facing)                               |
| `/vehicle`    | Vehicle profile, plan, RC                                                          |
| `/profile`    | Account, settings, legal                                                           |

### Relationship to Phase 1 routes

| Phase 1 (current)                        | Phase 2 (future mapping)                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `/journey` (dev entry)                   | Retained for development; production uses `/scan/:qrId` or `/activate` |
| `/journey/auth/*`                        | Absorbed into `/activate/*` or query-param journey context             |
| `/journey/purchase/*`                    | `/activate/purchase/*` or journey slug under `/activate`               |
| `/journey/prepaid/*`, `/journey/b2b2c/*` | `/activate/prepaid/*`, `/activate/b2b2c/*`                             |
| `/journey/emergency/*`                   | `/emergency/*` (owner setup)                                           |
| `/journey/completed`                     | `/dashboard` or `/activate/complete`                                   |
| `/pwa/scan/*`                            | `/scan/:qrId/*` (bystander / post-activation)                          |

Exact URL shapes are **TBD at implementation time**. Phase 2 preserves **flow order and business rules**; only the URL namespace and entry mechanism change.

---

## Migration path

### Phase 1 → Phase 2 (when implemented)

| Step | Action                                                                             | Risk level                           |
| ---- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| 1    | Introduce QR payload parser + journey router service                               | Medium — new entry path              |
| 2    | Add `/scan/:qrId` route alongside existing `/pwa/scan/*`                           | Low — parallel mount                 |
| 3    | Map QR payload types to existing `selectActivationFlow()` / PWA bootstrap          | Medium — must preserve handoff logic |
| 4    | Introduce `/activate` shell wrapping existing journey route trees                  | Medium — URL redirects needed        |
| 5    | Unify session (optional) — journey + PWA under one provider with namespaced slices | **High** — schema coupling           |
| 6    | Deprecate `/journey` as production entry; keep for dev/QA                          | Low                                  |
| 7    | Add `/dashboard`, `/vehicle`, `/profile` as post-activation owner surfaces         | Medium — new screens                 |

**Recommended sequencing:** Steps 1–4 can ship without session unification. Step 5 is optional and should not block QR entry.

### What must not change during migration

- Step order within each journey (auth → activation → emergency)
- Business rules (plan/rider entitlement, emergency handoff, payment gates)
- Guard semantics (`RequireAuthCompleted`, `RequireSelectedFlowMatch`)
- Session field names and persistence keys (until an explicit schema migration)

---

## Dependencies

### Monorepo packages (shared platform layer)

```
@autolokate/design-system  ← theme.css, tokens, interaction reset
@autolokate/ui             ← AlButton, AlOtpInput, shells, cards
@autolokate/icons          ← icon glyphs
@autolokate/brand          ← logo assets
@autolokate/auth           ← OTP auth client
@autolokate/api-client     ← API integration
@autolokate/hooks          ← shared hooks
@autolokate/types          ← shared types
@autolokate/utils          ← validation, formatting
```

All feature modules in `apps/qr/src/features/` depend on `@autolokate/ui` and `@autolokate/design-system`.

### In-app module dependencies

```
FlowEntryScreen (/journey)
  ├── purchase  → JourneyProvider → shared-auth → purchase → emergency → completed
  ├── prepaid   → prepaid welcome → JourneyProvider → shared-auth → emergency → completed
  ├── b2b2c     → partner welcome → JourneyProvider → shared-auth → emergency → completed
  └── post-act  → PwaScanProvider (isolated, reuses auth UI components only)

b2b-shared
  └── seeds session.purchase + session.vehicle for prepaid/b2b2c emergency handoff

activation-routing
  └── post-auth path resolution (purchase R03 vs emergency handoff)
```

### External dependencies

| Dependency                    | Used by                     |
| ----------------------------- | --------------------------- |
| React Router 7                | All routing                 |
| sessionStorage / localStorage | Journey + PWA persistence   |
| Figma design tokens           | `@autolokate/design-system` |

---

## Risks

| Risk                                          | Impact                                                 | Mitigation                                                                             |
| --------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **Dual session stores** (journey vs PWA)      | User state lost when crossing `/journey` ↔ `/pwa/scan` | Phase 2 session unification plan; until then, treat as intentional isolation           |
| **Imperative routing vs flow registry drift** | Registry docs diverge from runtime                     | Registry is catalog-only; runtime routes are source of truth for Phase 1               |
| **QR entry without payload spec**             | Wrong journey dispatch                                 | Define payload schema before Phase 2 implementation (see `QR_ENTRY_STRATEGY.md`)       |
| **URL migration breaking bookmarks**          | Production links break                                 | Parallel routes + redirects during Phase 2 rollout                                     |
| **Session schema merge**                      | Data loss or guard regressions                         | Keep schemas separate until explicit migration; namespaced slices preferred over merge |
| **Dev entry vs production entry divergence**  | QA tests wrong entry path                              | Keep `/journey` cards permanently for dev; document production entry separately        |

---

## Key file index

| Concern                | Path                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| App entry              | `apps/qr/src/main.tsx`                                               |
| Top router             | `apps/qr/src/journey/JourneyOrchestrator.tsx`                        |
| Dev entry screen       | `apps/qr/src/journey/screens/FlowEntryScreen.tsx`                    |
| Journey routes         | `apps/qr/src/journey/routes/JourneyRoutes.tsx`                       |
| PWA routes             | `apps/qr/src/features/post-activation-pwa/routes/PwaScanRoutes.tsx`  |
| Journey session schema | `apps/qr/src/journey/types.ts`                                       |
| PWA session schema     | `apps/qr/src/features/post-activation-pwa/context/pwa-scan-types.ts` |
| Flow registry          | `apps/qr/src/flow/registry/config/flows.config.ts`                   |
| Route catalog (schema) | `apps/qr/src/router/routes.schema.ts`                                |
| Module map             | `docs/PLATFORM_MODULE_MAP.md`                                        |
| QR entry strategy      | `docs/QR_ENTRY_STRATEGY.md`                                          |

---

## Related documents

- [PLATFORM_MODULE_MAP.md](./PLATFORM_MODULE_MAP.md) — module ownership and boundaries
- [QR_ENTRY_STRATEGY.md](./QR_ENTRY_STRATEGY.md) — future QR-primary entry model
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — implementation signoff status
