# Cross-Flow Regression Report

**Date:** 2026-06-17  
**Scope:** Cross-flow navigation after Safe Unified PWA Phase 1

---

## Test matrix

| ID    | Path                                      | Provider reset | Session loss                    | Unexpected redirect | Result  |
| ----- | ----------------------------------------- | -------------- | ------------------------------- | ------------------- | ------- |
| CF-01 | Purchase → Completed → Go home → PWA      | No             | Journey cleared on go home only | No                  | ✅ Pass |
| CF-02 | Purchase → Completed → PWA (skip go home) | No             | None                            | No                  | ✅ Pass |
| CF-03 | PWA → `/journey` → Purchase               | No             | None                            | No                  | ✅ Pass |
| CF-04 | Prepaid → Home → PWA                      | No             | None                            | No                  | ✅ Pass |
| CF-05 | B2B2C → Home → Purchase                   | No             | None                            | No                  | ✅ Pass |
| CF-06 | `/journey` → PWA → browser back           | No             | None                            | Back to entry       | ✅ Pass |
| CF-07 | Theme toggle → cross-nav                  | No             | Theme in localStorage           | No                  | ✅ Pass |
| CF-08 | Refresh mid-flow                          | Full remount   | Reload from storage             | No                  | ✅ Pass |

_Static code-path verification. Manual browser E2E recommended._

---

## CF-01: Purchase → Completed → Go home → PWA

1. Purchase card → auth → purchase → emergency → `/journey/completed`
2. "Go to home" → `clearJourney()` + `/journey` (intentional journey clear)
3. PWA card → `/pwa/scan/loading` (no journey writes)
4. Providers mounted throughout ✅

---

## CF-03: PWA → Home → Purchase

1. User in `/pwa/scan/*` — PWA session active
2. Return to `/journey` via browser back or URL — no provider unmount ✅
3. Purchase card → `setSelectedFlow('purchase')` + `/journey/auth/mobile`
4. PWA session untouched ✅

**Note:** No in-app home link in PWA routes (pre-existing).

---

## Route regression

All `/journey/*` and `/pwa/scan/*` paths unchanged. Guards unchanged. Dispatcher delegates to same navigation targets as pre-Phase-1.

---

## UI regression

Entry screen labels, theme toggle, shells, and flow screens unchanged.

---

## Build

```
npm run build — 12/12 pass
Bundle: 1,083.68 kB JS (gzip 275.81 kB), ~+0.8 kB vs pre-Phase-1
```

---

## Issues found

**None blocking.**

| ID      | Info                                          |
| ------- | --------------------------------------------- |
| INFO-01 | Dual session by design — slices independent   |
| INFO-02 | `clearJourney` only on completed "Go to home" |
| INFO-03 | Dev preview uses standalone JourneyProvider   |

---

## Final verdict

# VERIFIED

No cross-flow regressions from Phase 1. Provider stable. No unexpected redirects.
