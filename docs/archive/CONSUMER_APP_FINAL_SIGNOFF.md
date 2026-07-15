# Consumer App — Final Signoff (Sprint 4)

**Date:** 2026-06-17  
**Mode:** Audit only — no code changes  
**App:** `@autolokate/qr` · `apps/qr`  
**Figma:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) · `FtHCUnE0HH586PtG5yJyG0`  
**Prior sprints:** Asset recovery (S1) · Pixel parity (S2) · Code hardening (S3)

---

## Verdict

# NOT READY

The consumer app is **not production-ready**. The primary **Purchase + Auth + Emergency** demo path is visually strong and largely wired, but **production build currently fails**, **prepaid/B2B2C flows are incomplete**, **emergency back-navigation breaks non-purchase flows**, and **all backends are demo/mock**.

**Demo / QA staging (purchase path only):** Acceptable for scripted walkthroughs with known credentials — not for production release.

---

## Overall score

| Dimension                          | Score                        | Notes                                                                   |
| ---------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| **Overall consumer app**           | **74 / 100**                 | Weighted across flows + cross-cutting concerns                          |
| Figma parity (implemented screens) | **98%** dark · **97%** light | Sprint 2 matrix — 32 journey screens                                    |
| Functional completeness            | **72 / 100**                 | Purchase strong; prepaid/B2B2C partial                                  |
| Theme (dark + light)               | **98 / 100**                 | `@autolokate/design-system` tokens; toggle in dev + system pref at boot |
| Responsive (320–414)               | **98 / 100**                 | Shell max-width 393px; verified in parity matrix                        |
| Navigation & guards                | **70 / 100**                 | P0 emergency back-nav; payment bypass on emergency                      |
| Session persistence                | **68 / 100**                 | sessionStorage primary; tab-close data loss                             |
| Journey orchestration              | **76 / 100**                 | Purchase end-to-end; prepaid/B2B2C registry ahead of router             |
| Build / lint health                | **50 / 100**                 | ESLint ✅ · **Vite production build ❌**                                |

### Scoring method

Per-flow score = **40% functional** + **40% Figma parity (implemented)** + **20% theme/responsive**.  
Overall = flow weights (Purchase 35%, Auth 20%, Emergency 25%, Prepaid 10%, B2B2C 10%) blended with cross-cutting build/navigation penalties.

---

## Per-flow scores

| Flow                          | Functional | Figma parity | Theme / responsive | **Flow score** | Signoff          |
| ----------------------------- | ---------- | ------------ | ------------------ | -------------- | ---------------- |
| **Auth** (A1–A3 + L1/L2)      | 88         | 99%          | 98                 | **94**         | Conditional demo |
| **Purchase** (R03–R10c)       | 85         | 99%          | 98                 | **93**         | Conditional demo |
| **Emergency** (R0–R4 + E0–E5) | 78         | 98%          | 98                 | **89**         | Blocked (nav P0) |
| **Prepaid**                   | 40         | 96%†         | 96                 | **58**         | No               |
| **B2B2C**                     | 35         | 96%†         | 96                 | **54**         | No               |

†Parity scored on **implemented welcome screens only** (loading/error states included). Registry defines additional steps with **no mounted routes**.

---

## Verification summary

### Auth ✅ / ⚠️

| Check                                  | Result | Evidence                                                      |
| -------------------------------------- | ------ | ------------------------------------------------------------- | ------ |
| A1 Mobile + inline consent             | ✅     | `AuthRoutes.tsx` · `A1MobileScreen.tsx`                       |
| A2 OTP + resend/offline states         | ✅     | `A2OtpScreen.tsx` · route guards L194–318                     |
| A3 Vehicle owner (name)                | ✅     | `A3VehicleOwnerScreen.tsx` · `AlTextField` (S3)               |
| L1/L2 legal readers                    | ✅     | `/journey/auth/legal/privacy                                  | terms` |
| Auth guards on purchase/emergency      | ✅     | `RequireAuthCompleted` in `JourneyRoutes.tsx`                 |
| Post-auth handoff → R03 (purchase)     | ✅     | `JourneySharedAuthRoute.tsx` · `activation-routing.ts`        |
| Demo credentials only                  | ⚠️     | `auth-flow.validation.ts` — mobile `9999999999`, OTP `123456` |
| Re-entry to auth when already complete | ⚠️     | `/journey/auth/*` unguarded                                   |

### Purchase ✅ / ⚠️

| Check                               | Result | Evidence                                                               |
| ----------------------------------- | ------ | ---------------------------------------------------------------------- |
| R03–R10c all mounted                | ✅     | `PurchaseRoutes.tsx` (14 routes)                                       |
| Step prerequisites + payment resume | ✅     | `redirectIfPaymentSucceeded` L84–113                                   |
| Promo branch R08b/R08c              | ✅     | Route handlers wired                                                   |
| Payment state machine (demo)        | ✅     | `purchase-payment-demo.ts`                                             |
| R10 → Emergency handoff             | ✅     | `getEmergencyHandoffPath(session)` L728–731                            |
| Vahan fetch (demo)                  | ⚠️     | `vahan-demo.ts` — timers + hardcoded plates                            |
| R04b “Enter manually”               | ❌     | Sets `not-found` → R03; R05 requires `fetchStatus: 'success'` L356–358 |
| Real payment / Vahan API            | ❌     | Not integrated                                                         |

### Emergency ✅ / ❌

| Check                                       | Result    | Evidence                                                 |
| ------------------------------------------- | --------- | -------------------------------------------------------- |
| Rider sub-flow R0–R4                        | ✅        | `EmergencyRoutes.tsx`                                    |
| Contact sub-flow E0–E5                      | ✅        | No E4 screen by design (picker in E0)                    |
| Plan limits / min contacts                  | ✅        | `emergency-limits.ts` · `E09ContactsSummaryScreen`       |
| Entitlement skip (Safe → E0)                | ✅        | `shouldEnterRiderPrompt` in R0Route                      |
| **Back from R0 → purchase R10**             | ❌ **P0** | `EmergencyRoutes.tsx` L216–218                           |
| **Back from E0 → purchase R10 (non-rider)** | ❌ **P0** | `EmergencyRoutes.tsx` L482                               |
| Deep-link without payment (purchase)        | ⚠️        | `EmergencyActivationRoute` — auth only, no payment guard |
| Demo OTP / contacts                         | ⚠️        | `demo-data.ts` · shared validation                       |
| `/journey/completed` terminal               | ⚠️        | Placeholder UI — `JourneyCompletedScreen.tsx`            |

### Prepaid ❌

| Check                           | Result | Evidence                                                   |
| ------------------------------- | ------ | ---------------------------------------------------------- |
| Welcome screen                  | ✅     | `/journey/prepaid/welcome` · `PrepaidWelcomeScreen.tsx`    |
| PR01–PR03 activation/code steps | ❌     | Screens exist; **not mounted** in `PrepaidRoutes.tsx`      |
| Post-auth path                  | ⚠️     | Auth → emergency directly (`activation-routing.ts` L80–84) |
| Voucher / entitlement API       | ❌     | `fetch-landing-entitlement.ts` (demo)                      |
| Registry vs router              | ❌     | `flows.config.ts` L50–52 vs single welcome route           |

### B2B2C ❌

| Check                                | Result | Evidence                                                   |
| ------------------------------------ | ------ | ---------------------------------------------------------- |
| Partner welcome (2 variants)         | ✅     | `/journey/b2b2c/welcome` · `/welcome/plan-rider`           |
| Offer select + confirmation          | ❌     | Registry-only (`b2b2c.offer-select`, `b2b2c.confirmation`) |
| Post-auth path                       | ⚠️     | Same as prepaid — auth → emergency                         |
| Partner session API                  | ❌     | Demo landing config                                        |
| `plan-rider` variant from flow entry | ⚠️     | URL-only; not in `selectActivationFlow`                    |

### Dark theme ✅

| Check                          | Result                                              |
| ------------------------------ | --------------------------------------------------- |
| Default from system preference | ✅ `main.tsx` L11–17                                |
| Token-driven surfaces          | ✅ `@autolokate/design-system/theme.css`            |
| Parity vs Figma (dark)         | ✅ **98%** weighted avg — `SCREEN_PARITY_MATRIX.md` |
| Dev toggle                     | ✅ `ScreenDevApp` · `useThemeMode`                  |

### Light theme ✅

| Check                   | Result                                                        |
| ----------------------- | ------------------------------------------------------------- |
| Light mode tokens       | ✅ `data-theme="light"` on `documentElement`                  |
| Parity vs Figma (light) | ✅ **97%** weighted avg                                       |
| Known drift             | A1 field border uses token outline vs Figma white stroke (P2) |

### Responsive ✅

| Width                       | Result | Notes                                        |
| --------------------------- | ------ | -------------------------------------------- |
| 320                         | ✅     | Status shell padding reduces @ 20rem         |
| 360 / 375 / 390 / 393 / 414 | ✅     | Content capped 393px; no horizontal overflow |
| Dev viewport controls       | ✅     | `ScreenDevApp` — 320–414 presets             |

### Navigation ⚠️

| Check                                       | Result                                                             |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Flow entry → auth → activation              | ✅ Purchase                                                        |
| Legacy redirects (qr-scan, home)            | ✅ `JourneyRoutes.tsx` L44–54                                      |
| Flow mismatch guard                         | ✅ `RequireSelectedFlowMatch`                                      |
| Emergency back-nav (prepaid/B2B2C)          | ❌ P0                                                              |
| `/journey/completed` unguarded              | ⚠️ P2                                                              |
| `/journey/flow-hub` QA route in prod router | ⚠️ P2                                                              |
| Route schema drift                          | ⚠️ `/prepaid/entry` vs `/welcome`; `/partner-bridge` vs `/welcome` |

### Session persistence ⚠️

| Check                                       | Result | Evidence                                               |
| ------------------------------------------- | ------ | ------------------------------------------------------ |
| Same-tab refresh                            | ✅     | `sessionStorage` key `al-journey-v1`                   |
| Auth + checkout + emergency survive refresh | ✅     | `JourneyContext` hydrates from `loadJourneyState()`    |
| Tab close / new tab                         | ❌     | Session cleared; only `selectedFlow` in `localStorage` |
| `phase` persisted                           | ❌     | Resets to `home`; segment bootstraps partially recover |
| Clear on completed                          | ✅     | `clearJourneyPersistence()` in completed screen        |

### Journey orchestration ⚠️

| Path                                                      | Result                                                |
| --------------------------------------------------------- | ----------------------------------------------------- |
| Purchase: entry → A1–A3 → R03–R10 → emergency → completed | ✅                                                    |
| Prepaid: entry → welcome → A1–A3 → emergency              | ⚠️ Skips PR01–PR03                                    |
| B2B2C: entry → welcome → A1–A3 → emergency                | ⚠️ Skips offer/confirmation                           |
| `flows.config.ts` vs mounted routes                       | ❌ Registry ahead of implementation for prepaid/B2B2C |

### Figma parity ✅ (implemented screens)

| Source                                  | Result                                                              |
| --------------------------------------- | ------------------------------------------------------------------- |
| Sprint 2 matrix (32 screens)            | **98%** dark · **97%** light                                        |
| P0 visual drift (wrong copy/icons/CTAs) | **0 open**                                                          |
| Sprint 1 assets (halos, relation icons) | Recovered                                                           |
| Not in matrix                           | S0 Splash · P01–P06 legacy · R14 Permissions · R15 (component only) |

References: [`SCREEN_PARITY_MATRIX.md`](./archive/SCREEN_PARITY_MATRIX.md) · [`CONSUMER_APP_100_PARITY_REPORT.md`](./archive/CONSUMER_APP_100_PARITY_REPORT.md)

### Build / lint (audit run 2026-06-17)

| Command                              | Result             |
| ------------------------------------ | ------------------ |
| `pnpm --filter @autolokate/qr lint`  | ✅ Pass (0 errors) |
| `pnpm --filter @autolokate/qr build` | ❌ **Fail**        |
| `tsc -p tsconfig.json`               | ✅ Pass            |

**Build failure (P0):** `FlowStepShell.tsx` imports deleted `../purchase-step-shell/purchase-step-shell.css` (removed in Sprint 3 hardening). Vite cannot resolve the asset.

---

## P0 blockers

Must fix before any production release or stakeholder “ready” signoff.

| #        | Blocker                                                        | Impact                                                                                                                                                                                                           | Evidence                                                                                                  |
| -------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **P0-1** | **Production build broken**                                    | Cannot ship artifact                                                                                                                                                                                             | `FlowStepShell.tsx` L17 → missing `purchase-step-shell.css` · Vite error on `pnpm build`                  |
| **P0-2** | **Emergency back-nav assumes purchase payment success**        | Prepaid/B2B2C users hitting Back on R0 or E0 navigate to `/journey/purchase/r10-payment-success`, which requires `paymentStatus: 'success'` and `RequireSelectedFlowMatch flow="purchase"` — **navigation trap** | `EmergencyRoutes.tsx` L216–218, L482                                                                      |
| **P0-3** | **All auth/payment/Vahan/OTP/entitlement paths are demo/mock** | No real user validation or transactions                                                                                                                                                                          | `auth-flow.validation.ts` · `vahan-demo.ts` · `purchase-payment-demo.ts` · `fetch-landing-entitlement.ts` |

---

## P1 improvements

High priority for production; acceptable for controlled demo with scripts if P0-1 and P0-2 are fixed.

| #    | Item                                                                         | Flow                 | Evidence                                                        |
| ---- | ---------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------- |
| P1-1 | Prepaid post-auth skips PR01–PR03 (activation code / validation)             | Prepaid              | `PrepaidRoutes.tsx` · `flows.config.ts` L50–52                  |
| P1-2 | B2B2C missing offer-select + confirmation steps                              | B2B2C                | `flows.config.ts` L60–62 · no screen files                      |
| P1-3 | Purchase users can deep-link to emergency without payment                    | Purchase + Emergency | `JourneyRoutes.tsx` L29–36 — no payment-success guard           |
| P1-4 | R04b “Enter manually” is a dead end (Figma link present, no manual R05 path) | Purchase             | `PurchaseRoutes.tsx` L333–340 vs L356–358                       |
| P1-5 | Session progress lost on tab close (sessionStorage)                          | All                  | `persistence.ts` L12–35                                         |
| P1-6 | Journey completed screen is placeholder, not Figma terminal                  | All                  | `JourneyCompletedScreen.tsx`                                    |
| P1-7 | Route catalog drift (`/entry`, `/partner-bridge` vs `/welcome`)              | QA / tooling         | `routes.schema.ts` vs `prepaid-routing.ts` · `b2b2c-routing.ts` |
| P1-8 | No automated tests for guards, persistence, or handoffs                      | All                  | Zero `*.test.*` in onboarding app                               |

---

## P2 polish

| #     | Item                                                                                  | Notes                       |
| ----- | ------------------------------------------------------------------------------------- | --------------------------- |
| P2-1  | Auth re-entry allowed when `AUTH_COMPLETED`                                           | `/journey/auth/*` unguarded |
| P2-2  | `phase` not persisted across refresh                                                  | `JourneyContext.tsx`        |
| P2-3  | `/journey/completed` reachable without finishing journey                              | No guards                   |
| P2-4  | `/journey/flow-hub` exposed in production router                                      | QA-only surface             |
| P2-5  | S0 Splash not implemented                                                             | Figma `27:98`               |
| P2-6  | R14 Permissions / R15 Activation complete — components only, no journey route         | Dev catalog                 |
| P2-7  | Light theme A1 field border token vs Figma white stroke                               | Matrix P2                   |
| P2-8  | `PromoCodeField` uses styled native inputs                                            | Deferred in S3 hardening    |
| P2-9  | Emergency index `/journey/emergency` always → rider-prompt (extra hop for Safe plans) | `JourneyRoutes.tsx` L59–61  |
| P2-10 | Dev catalog missing R08c, R09b, R10c previews                                         | `ScreenDevApp.tsx`          |

---

## Flow-by-flow signoff detail

### Auth — **94 / 100** · Conditional demo ✅

**Strengths:** A1→A2→A3 sequence with step guards; inline consent on A1; L1/L2 legal readers; offline handling; Figma parity **99%** dark on implemented frames; Sprint 3 `AlTextField` / `AlCheckbox` promotion.

**Gaps:** Demo mobile/OTP only; auth routes reachable after completion; no production identity provider.

### Purchase — **93 / 100** · Conditional demo ✅

**Strengths:** Full R03–R10c router; payment-state resume; promo branches; guarded prerequisites; **99%** dark parity; Sprint 2 footer/copy fixes (R09b, R04b link).

**Gaps:** Demo Vahan + payment; R04b manual entry dead end; R10c retry UX limited; real APIs required for prod.

### Emergency — **89 / 100** · Blocked ❌

**Strengths:** R0–R4 + E0–E5 wired; rider entitlement logic; 8-tile relation grid; **98%** dark parity; offline/error on R0.

**Gaps:** **P0 back-nav to purchase R10**; no payment guard for purchase flow; demo OTP/contacts; completed placeholder.

### Prepaid — **58 / 100** · Not signed off ❌

**Strengths:** Welcome screen with loading/error states; entitlement seeding via `applyLandingEntitlementToSession`; **96–97%** parity on welcome frames.

**Gaps:** PR01–PR03 unmounted; post-auth jumps to emergency; demo voucher API; registry/QA path drift.

### B2B2C — **54 / 100** · Not signed off ❌

**Strengths:** Partner welcome (plan-only + plan-rider URL variant); loading/error states; **96%** parity on welcome.

**Gaps:** 2 of 3 registry steps missing; no offer-select UI; same emergency back-nav P0 as prepaid.

---

## Recommended next steps (post-audit)

1. **Fix P0-1** — restore or relocate `purchase-step-shell.css` import in `FlowStepShell.tsx` (Sprint 3 regression).
2. **Fix P0-2** — flow-aware emergency back target (welcome or flow-specific activation, not purchase R10).
3. **Integrate real APIs** (P0-3) — auth OTP, Vahan, payment gateway, prepaid voucher, partner entitlement.
4. **Mount prepaid PR01–PR03** and **implement B2B2C offer-select + confirmation** per `flows.config.ts`.
5. **Add payment-success guard** on emergency segment for purchase flow (or document intentional bypass).
6. **Implement R04b manual vehicle entry** path to R05.
7. **Replace journey completed placeholder** with Figma terminal frame.
8. **Add guard/persistence integration tests** before re-signoff.

---

## Sign-off matrix

| Stakeholder ask                            | Verdict                                     |
| ------------------------------------------ | ------------------------------------------- |
| Production release                         | **NOT READY**                               |
| Stakeholder demo (purchase path, scripted) | **READY WITH GAPS** after P0-1 + P0-2 fixes |
| Figma parity on implemented screens        | **PASS** (98% dark / 97% light)             |
| Code health (lint)                         | **PASS**                                    |
| Code health (production build)             | **FAIL**                                    |
| All five flows complete                    | **NOT READY** (prepaid/B2B2C partial)       |

---

## Audit references

| Document                                                                                     | Sprint |
| -------------------------------------------------------------------------------------------- | ------ |
| [`MISSING_ASSET_RECOVERY_REPORT.md`](./archive/MISSING_ASSET_RECOVERY_REPORT.md)             | 1      |
| [`SCREEN_PARITY_MATRIX.md`](./archive/SCREEN_PARITY_MATRIX.md)                               | 2      |
| [`CONSUMER_APP_100_PARITY_REPORT.md`](./archive/CONSUMER_APP_100_PARITY_REPORT.md)           | 2      |
| [`CONSUMER_APP_FINAL_HARDENING_REPORT.md`](./archive/CONSUMER_APP_FINAL_HARDENING_REPORT.md) | 3      |
| **This document**                                                                            | 4      |

---

**Sprint 4 — Final Consumer Signoff: audit complete.**  
**Verdict: NOT READY**
