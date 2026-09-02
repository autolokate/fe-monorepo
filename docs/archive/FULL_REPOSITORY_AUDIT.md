# Full Repository Audit

**Date:** 2026-06-20  
**Scope:** Entire monorepo — `apps/qr`, `packages/*`, build output, routing, state, CSS, design system  
**Truth hierarchy:** Figma → Screenshots → Audit Reports → Implementation Reports  
**Constraints honored:** No journey architecture, business rules, plan limits, payment logic, session schema, route order, flow order, guard logic, or Figma UX changes

---

## Executive Summary

| Area          | Status  | Notes                                                    |
| ------------- | ------- | -------------------------------------------------------- |
| TypeScript    | ✅ PASS | 0 errors across workspace                                |
| ESLint        | ✅ PASS | 0 errors after hardening pass                            |
| Build         | ✅ PASS | Vite production build succeeds                           |
| React quality | ✅ PASS | No setState-in-render, cleanup patterns verified         |
| Routing       | ⚠️ GAPS | Documented guard/schema gaps — intentionally not changed |
| Bundle        | ⚠️ WARN | 1.1 MB JS + 3.5 MB SOS wav asset                         |
| Dead code     | ⚠️ P2   | Dev-only orphan screens (P01–P06, R14/R15)               |

**Verdict:** **READY WITH KNOWN GAPS** — production-safe for demo mode; catalog/guard/deep-link gaps documented, not fixed per constraints.

---

## Phase 1 — Repository Health

### TypeScript / React / Build

| Check                             | Result                                                               |
| --------------------------------- | -------------------------------------------------------------------- |
| `pnpm -r typecheck`               | ✅ 0 errors                                                          |
| `pnpm -r lint`                    | ✅ 0 errors                                                          |
| `pnpm -r build`                   | ✅ Success (~2.1s)                                                   |
| Explicit `any`                    | ✅ 0 occurrences                                                     |
| `@ts-ignore` / `@ts-expect-error` | ✅ 0 occurrences                                                     |
| `eslint-disable`                  | 3 intentional (deprecated API shims in auth screens + routes.schema) |

### Bundle Structure

| Asset                       | Size                   |
| --------------------------- | ---------------------- |
| `index-*.js`                | 1,098 KB (gzip 280 KB) |
| `index-*.css`               | 162 KB (gzip 23 KB)    |
| `sos-emergency-alarm-*.wav` | 3,528 KB               |
| **Total dist**              | ~4.6 MB                |

Rollup warns on >500 KB chunk — expected given single-bundle onboarding app. SOS wav dominates total size.

### Large Files (>200 lines, justified)

| Lines | File                                                         | Justification                        |
| ----: | ------------------------------------------------------------ | ------------------------------------ |
|  1043 | `dev/ScreenDevApp.tsx`                                       | Dev-only preview harness             |
|   861 | `journey/routes/PurchaseRoutes.tsx`                          | Route orchestration + session guards |
|   861 | `journey/routes/EmergencyRoutes.tsx`                         | Multi-path emergency graph           |
|   689 | `features/post-activation-pwa/routes/pwa-sos-routes.tsx`     | SOS timeline + hold state machine    |
|   537 | `features/post-activation-pwa/routes/pwa-park-me-routes.tsx` | Park Me photo/location flow          |
|   517 | `router/routes.schema.ts`                                    | Catalog + legacy path registry       |
|   422 | `features/post-activation-pwa/routes/pwa-shared-routes.tsx`  | PWA verify + vehicle hub             |
|   404 | `journey/routes/AuthRoutes.tsx`                              | Shared auth segment                  |
|   283 | `packages/ui/.../DispatchTimeline.tsx`                       | Figma timeline primitive             |
|   263 | `packages/ui/utils/sos-alert-tone.ts`                        | Audio preload + tone logic           |

All cohesive route files retained per maintainability-over-line-count rule.

### Dead / Duplicate Code

| Category                        | Finding                                | Action                                 |
| ------------------------------- | -------------------------------------- | -------------------------------------- |
| Orphan purchase screens P01–P06 | Dev-only (`ScreenDevApp`)              | Documented — not deleted (dev harness) |
| Archived R14/R15                | Not in route graph                     | Documented                             |
| `@autolokate/utils`             | 0 runtime imports                      | Package reserved for future API layer  |
| Mobile format helpers           | 3 parallel implementations             | Documented — low risk (demo mode)      |
| UI exports unused in app        | `AlBottomNav`, `AlContainer`, `AlGrid` | Shared library inventory — not dead    |

### Circular Dependencies

Type-layer coupling: `journey/types.ts` ↔ `features/*/types`. Type-only at compile time; no runtime cycle detected.

---

## Issues Found vs Fixed (This Pass)

| Issue                                                            | Severity | Fixed | Files                                                              |
| ---------------------------------------------------------------- | -------- | ----- | ------------------------------------------------------------------ |
| ESLint deprecated prop usage (`PhotoGrid`, `ScannedVehicleCard`) | P1       | ✅    | `PhotoGrid.tsx`, `ScannedVehicleCard.tsx`, `pwa-shared-routes.tsx` |
| Purchase effect instability (`session.purchase ?? {}`)           | P1       | ✅    | `PurchaseRoutes.tsx`                                               |
| Geolocation unmount guard                                        | P1       | ✅    | `use-geolocation.ts`                                               |
| SOS hold timer stale closure                                     | P2       | ✅    | `pwa-sos-routes.tsx`                                               |
| Park Me auto-locate effect deps                                  | P2       | ✅    | `pwa-park-me-routes.tsx`                                           |
| Deprecated `RELATIONSHIP_OPTIONS` imports                        | P2       | ✅    | `EmergencyContactRow.tsx`, `RelationshipSelector.tsx`              |
| Unused imports/vars lint failures                                | P2       | ✅    | Multiple PWA + auth files                                          |
| Template literal ESLint (UI)                                     | P2       | ✅    | `DispatchTimeline.tsx`, `ScreenSpinner.tsx`                        |
| `navigator.platform` deprecated                                  | P2       | ✅    | `SosHoldButton.tsx`                                                |

---

## Risk Assessment

| Risk                    | Level  | Regression Risk                        |
| ----------------------- | ------ | -------------------------------------- |
| ESLint/TS fixes         | Low    | Low — no flow changes                  |
| Purchase memoization    | Low    | Low — stabilizes effects only          |
| Geolocation mount guard | Low    | Low — prevents post-unmount setState   |
| Deprecated prop removal | Low    | Low — callers updated to `footerLabel` |
| Documented guard gaps   | Medium | None — not modified                    |

---

## Remaining Gaps (Not Fixed — By Constraint)

1. Declarative guard catalog in `routes.schema.ts` not wired at runtime
2. Prepaid/B2B2C/completed routes lack auth guards
3. PWA verify deep links lack prerequisite redirects
4. `/activate/:token` in schema but not mounted
5. `phase` not persisted on refresh (self-heals via segment effects)
6. Bundle not code-split (P2 optimization)
7. Dev orphan screens remain in repo

---

## Final Repository Health Verdict

**READY WITH KNOWN GAPS** — codebase is lint-clean, type-safe, and builds successfully. Known gaps are architectural/documentation items explicitly excluded from this pass.
