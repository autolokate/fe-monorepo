# Back Navigation Matrix

**Date:** 2026-06-19  
**Method:** Static route handler audit — all `onBack` / `navigate()` back targets  
**Constraint:** No `navigate(-1)` in codebase (explicit paths only)

---

## Summary

| Metric                                 |                     Value |
| -------------------------------------- | ------------------------: |
| Routes with back affordance            |                   **~52** |
| Routes without back (terminal/spinner) |                   **~13** |
| Navigation bugs found                  |                     **1** |
| Navigation bugs fixed                  |                     **1** |
| Loops (intentional)                    | **1** (SOS leave confirm) |

---

## Fix Applied

| Route                            | Before     | After                      |
| -------------------------------- | ---------- | -------------------------- |
| Auth A1 Mobile (prepaid flow)    | `/journey` | `/journey/prepaid/welcome` |
| Auth A1 Mobile (b2b2c flow)      | `/journey` | `/journey/b2b2c/welcome`   |
| Auth A1 Mobile (purchase / null) | `/journey` | `/journey` (unchanged)     |

**Implementation:** `getAuthFlowBackPath(selectedFlow)` in `activation-routing.ts`, used by `MobileRoute` in `AuthRoutes.tsx`.

---

## Flow Entry + Hub

| Screen     | Back shown | Target | Browser back         |
| ---------- | :--------: | ------ | -------------------- |
| Flow Entry |     No     | —      | Exit / prior history |
| Flow Hub   |     No     | —      | Flow entry           |

---

## Shared Auth

| Screen           | Back target                 | Notes                   |
| ---------------- | --------------------------- | ----------------------- |
| A1 Mobile        | `getAuthFlowBackPath(flow)` | **Fixed** prepaid/B2B2C |
| A2 OTP           | A1 mobile                   |                         |
| A3 Vehicle owner | A2 OTP                      |                         |
| L1 Privacy       | Prior auth screen           | Via legal reader header |
| L2 Terms         | Prior auth screen           | Via legal reader header |

---

## Purchase (`/journey/purchase/*`)

| Screen                | Back target                      |
| --------------------- | -------------------------------- |
| R03 Vehicle           | Flow entry / prior               |
| R04 Fetching          | R03                              |
| R04b Fetch failed     | R04 context                      |
| R05 Confirm           | R03                              |
| R06 Choose plan       | R05                              |
| R07 Rider cover       | R06                              |
| R08 Order summary     | R07                              |
| R08b Promo applied    | R08                              |
| R08c Invalid promo    | R08                              |
| R09 Processing        | R08 (guarded if payment started) |
| R09b Still confirming | R09                              |
| R10 Success           | R09 (guarded — no re-checkout)   |
| R10b Failed           | R08 / retry path                 |
| R10c Unconfirmed      | R09                              |

Payment success guards (`redirectIfPaymentSucceeded`) prevent back into checkout — **by design, not a loop bug**.

---

## Prepaid / B2B2C

| Screen                        | Back target |
| ----------------------------- | ----------- |
| Prepaid welcome               | Flow entry  |
| B2B2C welcome (both variants) | Flow entry  |

---

## Emergency (`/journey/emergency/*`)

| Screen              | Back target                      |
| ------------------- | -------------------------------- |
| R0 Rider prompt     | `getEmergencyFlowBackPath(flow)` |
| R1–R4 Rider chain   | Previous rider step              |
| E0 Contacts empty   | `getEmergencyFlowBackPath(flow)` |
| E1–E3 Contact chain | Previous contact step            |
| E5 Contacts summary | E0 or prior                      |

Prepaid/B2B2C emergency entry backs to welcome — not purchase R10.

---

## Completed

| Screen            | Back               |
| ----------------- | ------------------ |
| Journey completed | No back (terminal) |

---

## Post-Activation PWA (`/pwa/scan/*`)

| Area                               | Back behavior                                  |
| ---------------------------------- | ---------------------------------------------- |
| Verify mobile →                    | Vehicle found                                  |
| Verify OTP →                       | Verify mobile                                  |
| Verify name →                      | Verify OTP                                     |
| Park Me chain                      | Explicit previous park-me route                |
| SOS entry                          | Vehicle / prior context                        |
| SOS holding                        | SOS entry                                      |
| SOS leave confirm ↔ SOS            | **Intentional loop** until user confirms leave |
| SOS terminal (resolved, cancelled) | No back or vehicle reset                       |

PWA uses explicit `navigate(path)` — no history stack dependency.

---

## Refresh + Resume

| Context            | Behavior                                        |
| ------------------ | ----------------------------------------------- |
| Journey session    | `localStorage` persistence restores flow + auth |
| PWA session        | `PwaScanContext` session restore                |
| Payment processing | Guards redirect forward on success              |
| Deep link invalid  | Wildcard → safe entry (flow root / PWA loading) |

---

## Hardware / Browser Back

React Router history stack mirrors explicit navigations. No custom `popstate` interceptors. Browser back follows stack — consistent with in-app back when user arrived via forward navigation.

---

## Verdict

**PASS** — One incorrect auth entry back target fixed globally via routing helper. No dead-end backs on interactive steps; terminal screens correctly omit back.
