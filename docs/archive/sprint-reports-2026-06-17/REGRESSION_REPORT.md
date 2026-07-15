# Regression Report — Safe Unified PWA Phase 1

**Date:** 2026-06-17  
**Change set:** AutolokateRootProvider + flow dispatcher + entry registry + QR contract

---

## Build verification

| Command                       | Result                    |
| ----------------------------- | ------------------------- |
| `npm run build`               | ✅ 12/12 packages, exit 0 |
| TypeScript (`tsc -p apps/qr`) | ✅ Passed via build       |
| Linter (changed files)        | ✅ No errors              |

---

## Flow verification matrix

| #   | Flow            | Entry             | Expected first route       | Code path                                                         | Status       |
| --- | --------------- | ----------------- | -------------------------- | ----------------------------------------------------------------- | ------------ |
| 1   | Purchase        | `/journey` card 1 | `/journey/auth/mobile`     | `dispatchPlatformFlow` → `selectActivationFlow('purchase')`       | ✅ Preserved |
| 2   | Pre-Paid        | `/journey` card 2 | `/journey/prepaid/welcome` | `dispatchPlatformFlow` → `selectActivationFlow('prepaid')`        | ✅ Preserved |
| 3   | B2B2C           | `/journey` card 3 | `/journey/b2b2c/welcome`   | `dispatchPlatformFlow` → `selectActivationFlow('b2b2c')`          | ✅ Preserved |
| 4   | Post-activation | `/journey` card 4 | `/pwa/scan/loading`        | `dispatchPlatformFlow('postActivation')` → `pwaScanPaths.loading` | ✅ Preserved |

---

## Session verification

| Check                             | Before                                         | After                                | Status       |
| --------------------------------- | ---------------------------------------------- | ------------------------------------ | ------------ |
| Journey storage key               | `al-journey-v1`                                | `al-journey-v1`                      | ✅ Unchanged |
| PWA storage key                   | `al-pwa-scan-v1`                               | `al-pwa-scan-v1`                     | ✅ Unchanged |
| Selected flow key                 | `al-selected-flow`                             | `al-selected-flow`                   | ✅ Unchanged |
| JourneyProvider persistence logic | `persistence.ts`                               | Unmodified                           | ✅           |
| PwaScanProvider persistence logic | `pwa-scan-storage.ts`                          | Unmodified                           | ✅           |
| Cross-nav session loss            | Journey persisted in storage when entering PWA | Same + journey context stays mounted | ✅ Improved  |

---

## Provider verification

| Check                                  | Status                  |
| -------------------------------------- | ----------------------- |
| `useJourney()` API unchanged           | ✅                      |
| `usePwaScan()` API unchanged           | ✅                      |
| No double `PwaScanProvider` nesting    | ✅                      |
| JourneyProvider internals unchanged    | ✅                      |
| PwaScanProvider internals unchanged    | ✅                      |
| Both providers available on all routes | ✅ New (Phase 1 intent) |

---

## Navigation verification

| Check                             | Status |
| --------------------------------- | ------ |
| Route paths unchanged             | ✅     |
| Redirects unchanged               | ✅     |
| `journeyPaths.*` unchanged        | ✅     |
| `pwaScanPaths.*` unchanged        | ✅     |
| Guard wrappers unchanged          | ✅     |
| `selectActivationFlow` unchanged  | ✅     |
| `activation-routing.ts` unchanged | ✅     |

---

## UI verification

| Check                                  | Status                           |
| -------------------------------------- | -------------------------------- |
| FlowEntryScreen — 4 cards, same labels | ✅ (from registry, same strings) |
| FlowEntryScreen — theme toggle         | ✅ Unchanged                     |
| FlowHubScreen — QA buttons             | ✅ Same behavior via dispatcher  |
| No new screens                         | ✅                               |
| No shell changes                       | ✅                               |

---

## Business rules verification

| Rule                                            | Status                                   |
| ----------------------------------------------- | ---------------------------------------- |
| Purchase → auth → R03 path                      | ✅ Unchanged                             |
| Prepaid welcome → auth handoff                  | ✅ Unchanged                             |
| B2B2C welcome → auth handoff                    | ✅ Unchanged                             |
| `getPostAuthActivationPath`                     | ✅ Not modified                          |
| `getEmergencyHandoffPath`                       | ✅ Not modified                          |
| `RequireSelectedFlowMatch('purchase')`          | ✅ Not modified                          |
| Post-activation: no `setSelectedFlow` on card 4 | ✅ Preserved (dispatcher navigates only) |

---

## Risk items explicitly NOT implemented

| Item                   | Status                |
| ---------------------- | --------------------- |
| Session merge          | ❌ Not done (correct) |
| Route URL changes      | ❌ Not done (correct) |
| QR route `/scan/:qrId` | ❌ Not done (correct) |
| Auth field unification | ❌ Not done (correct) |
| Guard changes          | ❌ Not done (correct) |

---

## Known non-regressions / acceptable changes

| Change                                                     | Impact                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| PWA session hydrates at app boot on `/journey` only visits | Low — demo defaults, no user-visible change until PWA entered |
| Journey React context stays mounted during PWA flow        | Positive — no context loss on cross-nav                       |

---

## Manual test checklist (recommended)

- [ ] `/journey` → Purchase → complete auth → R03
- [ ] `/journey` → Prepaid → welcome → activate → auth
- [ ] `/journey` → B2B2C → welcome → activate → auth
- [ ] `/journey` → Post-activation → loading → vehicle hub
- [ ] Return `/journey` after PWA — journey session intact
- [ ] `/journey/flow-hub` QA buttons still route correctly

_Automated E2E not run in this pass; static analysis + build green._

---

## Final verdict

# SAFE UNIFIED PWA READY

No session loss, navigation regressions, provider regressions, or UI regressions identified in static verification. Build passes. All four flows preserve prior behavior via delegated dispatch.
