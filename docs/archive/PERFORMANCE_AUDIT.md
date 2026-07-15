# Performance Audit

**Date:** 2026-06-20  
**Scope:** Re-renders, bundles, animations, effects, CSS

---

## Build Output

| Metric              |                  Value | Assessment              |
| ------------------- | ---------------------: | ----------------------- |
| JS bundle           | 1,098 KB (gzip 280 KB) | ⚠️ Single chunk >500 KB |
| CSS bundle          |    162 KB (gzip 23 KB) | ✅ Acceptable           |
| SOS wav asset       |               3,528 KB | ⚠️ Dominates dist size  |
| Build time          |                  ~2.1s | ✅ Fast                 |
| Modules transformed |                    896 | —                       |

**Note:** Rollup chunk size warning is informational. Code-splitting would reduce initial load but was not applied — no route-order or lazy-load changes per constraints.

---

## Re-renders

| Area             | Finding                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `JourneyContext` | Single state object — all consumers re-render on any session change. Acceptable for linear onboarding flow. |
| `PurchaseRoutes` | 18 effects — stabilized deps this pass to prevent loops                                                     |
| UI primitives    | No excessive memo wrapping — appropriate                                                                    |
| PWA routes       | Local state for forms/OTP; session updates scoped to capture events                                         |

**No unnecessary render hotspots identified requiring fix.**

---

## Animations

| Component            | Reduced Motion                     | Status |
| -------------------- | ---------------------------------- | ------ |
| SOS hold aura        | Static 0.3 opacity (no idle pulse) | ✅     |
| Dispatch timeline    | `@media (prefers-reduced-motion)`  | ✅     |
| Screen spinner       | Reduced motion override            | ✅     |
| Confetti (completed) | Respects reduced motion            | ✅     |
| Plan carousel        | Intentional scroll animation       | ✅     |

**No layout thrashing or animation jank patterns in CSS review.**

---

## Heavy Effects

| Effect                    | Cost                     | Mitigation                              |
| ------------------------- | ------------------------ | --------------------------------------- |
| Vahan demo fetch          | Simulated async          | Demo timer — acceptable                 |
| Payment processing timers | setTimeout chains        | Cleaned up on unmount in PurchaseRoutes |
| SOS status advance        | 10 effects in sos-routes | Timer cleanup on unmount ✅             |
| Reverse geocode           | Async fetch per location | Fire-once on mount with ref gate        |
| Photo compression         | Canvas + JPEG encode     | Runs on capture only                    |
| Lottie (plan carousel)    | eval warning in build    | Third-party — known                     |

---

## CSS Weight

- 162 KB total — includes all journey + PWA + emergency styles
- No duplicate `@keyframes` blocks requiring merge
- Token-based colors predominant post pixel-perfect passes

---

## Repeated Calculations

| Pattern          | Location               | Assessment                           |
| ---------------- | ---------------------- | ------------------------------------ |
| Plan pricing     | `purchase-pricing.ts`  | Pure functions — no issue            |
| Emergency limits | `emergency-limits.ts`  | Single source of truth               |
| Route progress   | Per-flow progress maps | Computed on navigation — lightweight |

---

## Bundle Optimization Opportunities (P2 — Not Applied)

1. Dynamic import for PWA segment (separate entry from journey)
2. Lazy-load Lottie player
3. Compress or stream SOS wav (3.5 MB)
4. Manual chunks for `@autolokate/ui` vs app code

---

## Issues Fixed (Indirect Performance)

| Fix                           | Impact                                  |
| ----------------------------- | --------------------------------------- |
| Purchase effect stabilization | Eliminates effect re-run loops          |
| Park Me auto-locate ref gate  | Prevents duplicate geolocation requests |
| SOS hold ref guards           | Prevents duplicate navigation timers    |

---

## Verdict

**PASS for demo mode** — No blocking performance issues. Bundle size warning documented; SOS asset is primary optimization target for production CDN deployment.
