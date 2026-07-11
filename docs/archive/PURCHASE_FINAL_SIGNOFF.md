# Purchase Final Signoff — Consumer · QR Activation + Purchase

> **⚠️ UPDATED 2026-06-19 — R14/R15 ARCHIVED**
> This report was written on 2026-06-17 when R14 and R15 were still considered active routes. As of the Purchase Flow Correction (2026-06-18), R14 Permissions and R15 Activation Complete are **archived and must not be restored**. Purchase now terminates at **R10 / R10b / R10c**. All R14/R15 route graph entries, test paths, and session field references below are updated to reflect the current architecture. See `PURCHASE_FINAL_FIGMA_GAP_REPORT.md` for the authoritative current gap analysis.

**Date:** 2026-06-17 (updated 2026-06-19)  
**Scope:** End-to-end audit · Mobile → OTP → Name → R03–R10 (R14/R15 archived — see banner above)  
**Method:** Read-only code audit · route graph trace · session schema review · Figma cross-reference (sections `167:434`, Phases A–C docs)  
**Constraints honored:** No new screens · no architecture changes · no deletions

---

## Executive summary

The **active purchase journey (R03–R10)** is fully wired for demo/UI purposes. All four plan tiers reach the expected payment outcome. Session fields persist via `sessionStorage`. No redirect loops or blank screens were found on the primary path.

**Two route-guard gaps** allow browser-back / deep-link regression after payment success. Several **Figma branch frames** (R08c, R09b, R10c) and **legacy orphan routes** (P01–P06) remain. R14 and R15 are archived; purchase terminates at R10 / R10b / R10c.

### Verdict: **FIXES REQUIRED**

Purchase flow is **complete for demo signoff** but **not production-ready** until post-payment guards are added. Prepaid and B2B2C may begin **in parallel with purchase guard fixes** — they do not share P01–P06 code — but purchase should not ship without fixing §7 blockers.

---

## 1. Route audit

### 1.1 Active screen inventory

| Segment | Screen | Route | In active graph |
|---------|--------|-------|-----------------|
| Auth | Mobile | `/journey/auth/mobile` | ✅ |
| Auth | OTP | `/journey/auth/otp` | ✅ |
| Auth | Name (vehicle owner) | `/journey/auth/vehicle-owner` | ✅ |
| Purchase | R03 Vehicle | `…/r03-vehicle` | ✅ |
| Purchase | R04 Fetching | `…/r04-fetching` | ✅ |
| Purchase | R04b Fetch failed | `…/r04b-fetch-failed` | ✅ branch |
| Purchase | R05 Confirm | `…/r05-confirm` | ✅ |
| Purchase | R06 Choose plan | `…/r06-choose-plan` | ✅ |
| Purchase | R07 Rider cover | `…/r07-rider-cover` | ✅ |
| Purchase | R08 Order summary | `…/r08-order-summary` | ✅ |
| Purchase | R08b Promo applied | `…/r08b-promo-applied` | ✅ branch |
| Purchase | R09 Processing | `…/r09-processing-payment` | ✅ |
| Purchase | R10 Success | `…/r10-payment-success` | ✅ |
| Purchase | R10b Failed | `…/r10b-payment-failed` | ✅ branch |
| Purchase | ~~R14 Permissions~~ | ~~`…/r14-permissions`~~ | **ARCHIVED** |
| Purchase | ~~R15 Activation complete~~ | ~~`…/r15-activation-complete`~~ | **ARCHIVED** |

### 1.2 Complete transition table

```
/journey → auth/mobile

AUTH
  mobile ──Continue──► otp
  mobile ◄──Back── otp | privacy | terms
  otp ──Verify (123456)──► vehicle-owner
  otp ──guard: no mobile──► mobile
  vehicle-owner ──Continue──► purchase/r03-vehicle
  vehicle-owner ◄──Back── otp

VEHICLE (Phase A)
  r03 ──Fetch (valid plate)──► r04-fetching
  r03 ──invalid plate──► r03 (inline R03b error)
  r03 ◄──Back── auth/vehicle-owner
  r04 ──success (3s)──► r05-confirm
  r04 ──error / offline──► r04b-fetch-failed
  r04 ──guard: no plate──► r03
  r04b ──Try again──► r03
  r05 ──Looks right──► r06-choose-plan (resets purchase session)
  r05 ◄──Back── r03
  r05 ──guard: no success fields──► r03

CHECKOUT (Phase B)
  r06 ──Choose {plan}──► r07-rider-cover
  r06 ◄──Back── r05
  r07 ──Add rider──► r08-order-summary (rider 1|2, promo cleared)
  r07 ──Skip──► r08-order-summary (rider 0, promo cleared)
  r07 ◄──Back── r06
  r08 ──Apply promo──► r08b-promo-applied
  r08 ──Pay──► r09-processing-payment
  r08 ◄──Back── r07
  r08b ──Pay──► r09-processing-payment
  r08b ──Remove / Back──► r08-order-summary
  r08b ──guard: no promo──► r08

PAYMENT (Phase C)
  r09 ──3s + Safe|Secure|Shield──► r10-payment-success
  r09 ──3s + Shield+──► r10b-payment-failed
  r09 ──guard: not processing──► r08 | r08b
  r10 ──Continue──► Emergency (contacts-empty)  [R14/R15 archived]
  r10 ──guard: not success──► r08 | r08b
  r10b ──Retry payment──► r08 | r08b (payment reset)
  r10b ──guard: not failed──► r08 | r08b

[ARCHIVED — do not restore]
~~PERMISSIONS + TERMINAL~~
~~r14 ──Allow & continue (all toggles ON)──► r15 (granted)~~
~~r14 ──Skip──► r15 (skipped)~~
~~r14 ◄──Back── r10~~
~~r14 ──guard: not success──► r08 | r08b~~
~~r15 ──Go to home──► activationComplete=true (stays on R15)~~
~~r15 ──guard: no granted|skipped──► r14~~
```

### 1.3 Route health checklist

| Check | Result | Notes |
|-------|--------|-------|
| No dead ends on happy path | ✅ | R10 → Emergency (contacts-empty) is terminal for purchase |
| No blank screens | ✅ | Every route renders a screen component |
| No redirect loops | ✅ | All guard chains terminate |
| No unreachable active screens | ✅ | R04b / R08b / R10b reachable via branches |
| Deep-link safety | ⚠️ | R04b unguarded; post-success R08 accessible (§7) |
| Browser-back safety | ⚠️ | After R10 success, back to R08 allows re-pay (§7) |
| `purchaseStepPathSequence` accuracy | ⚠️ | Omits R04b, R08b, R10b — helpers misleading only |

---

## 2. State audit

| State | Where implemented | Reachable | Gap |
|-------|-------------------|-----------|-----|
| **Success** | R05 confirm · R10 payment → Emergency | ✅ | — |
| **Error** | R03b plate not found · R04b Vahan fail · R10b payment fail | ✅ | — |
| **Loading** | R04 fetching · R09 processing | ✅ | Spinner static (no CSS animation) — P2 |
| **Retry** | R04b Try again · R10b Retry payment | ✅ | Shield+ retry loops until plan change — expected demo |
| **Offline** | Auth mobile/OTP · Vahan fetch (`navigator.onLine`) | ✅ partial | **No offline UX on R08–R10 checkout/payment** |
| ~~**Permission granted**~~ | ~~R14 Allow (all toggles ON) → `permissionOutcome: 'granted'`~~ | ARCHIVED | R14 archived |
| ~~**Permission skipped**~~ | ~~R14 Skip → `permissionOutcome: 'skipped'`~~ | ARCHIVED | R14 archived |
| ~~**Permission denied**~~ | — | ARCHIVED | R14 archived |
| **Promo invalid (R08c)** | — | ❌ | Figma frame `579:1748` not built |
| **Payment confirming (R09b)** | — | ❌ | Figma frame `579:1687` not built |
| **Payment unconfirmed (R10c)** | — | ❌ | Figma frame `579:1638` not built |

### Demo state triggers

| Domain | Trigger | Result |
|--------|---------|--------|
| Auth mobile | `9999999999` + consent | OTP step |
| Auth OTP | `123456` | Name step |
| Auth OTP | `000000` | Expired state |
| Vahan plate | `MH 12 AB 3456` | R05 success |
| Vahan plate | `MH 12 AB 0000` | R04b error |
| Vahan plate | any other valid length | R03 inline error |
| Vahan | `navigator.onLine === false` | R04b error |
| Promo | R08 Apply tap | Hardcoded `FRIEND50` → R08b |
| Payment | Safe · Secure · Shield | R10 success |
| Payment | Shield+ | R10b failed |

---

## 3. Journey audit — four plan paths

Assumes demo plate `MH 12 AB 3456`, auth demo credentials, forward-only navigation.

### 3.1 Safe (`selectedPlanId: 'safe'`)

| Variant | Path | Expected | Actual |
|---------|------|----------|--------|
| Skip rider · no promo | R06 Safe → R07 Skip → R08 Pay → R09 → R10 → Emergency | Payment success → Emergency | ✅ |
| 1 rider · no promo | … → R07 Add 1 → R08 Pay → … → R10 → Emergency | Payment success → Emergency | ✅ |
| With promo | … → R08 Apply → R08b Pay → … → R10 → Emergency | Payment success · total −₹100 → Emergency | ✅ |

### 3.2 Secure (default)

| Variant | Path | Expected | Actual |
|---------|------|----------|--------|
| Default bootstrap | R05 resets to Secure · rider 1 | R06 shows Secure selected | ✅ |
| Skip rider | Same as Safe | R10 → Emergency | ✅ |
| ~~Allow all permissions~~ | ~~R14 all toggles ON → Allow~~ | ARCHIVED | R14 archived |

### 3.3 Shield

| Variant | Path | Expected | Actual |
|---------|------|----------|--------|
| Happy path | R06 Shield → R07 → R08 Pay → R09 → R10 → Emergency | Payment success → Emergency | ✅ |

### 3.4 Shield+ (`selectedPlanId: 'shield-plus'`)

| Variant | Path | Expected | Actual |
|---------|------|----------|--------|
| Payment fail | … → R08 Pay → R09 → **R10b** | Payment failed | ✅ |
| Retry same plan | R10b Retry → R08 Pay → R09 → R10b | Fails again | ✅ (demo rule) |
| Recovery | R10b → Back chain to R06 → change plan → R10 | Success on non-Shield+ | ✅ |
| With promo | R08b Pay → R09 → R10b | Still fails (plan-driven) | ✅ |

### 3.5 Path summary matrix

| Plan | Payment | Terminal screen | Final destination |
|------|---------|-----------------|-------------------|
| Safe | R10 ✅ | R10 (payment success) | Emergency contacts-empty |
| Secure | R10 ✅ | R10 (payment success) | Emergency contacts-empty |
| Shield | R10 ✅ | R10 (payment success) | Emergency contacts-empty |
| Shield+ | R10b ✅ | R10b (payment failed) | Retry or change plan |

---

## 4. Session audit

**Persistence:** `sessionStorage` key `al-journey-v1` + `localStorage` `al-selected-flow` fallback  
**Writer:** `JourneyContext.updateSession` → shallow merge at session root; `patchPurchase` deep-merges `purchase` object

### 4.1 Field coverage

| Field | Session path | Written at | Survives refresh | Verified |
|-------|--------------|------------|------------------|----------|
| Selected plan | `purchase.selectedPlanId` | R06 select · R05 bootstrap | ✅ | ✅ |
| Rider selection | `purchase.riderCount` (0\|1\|2) | R07 continue/skip | ✅ | ✅ |
| Promo applied | `purchase.promoApplied` | R08 Apply · cleared R07 | ✅ | ✅ |
| Promo code | `purchase.promoCode` | R08 Apply (`FRIEND50`) | ✅ | ✅ |
| Checkout ready | `purchase.checkoutReady` | R08/R08b Pay | ✅ | ✅ |
| Payment status | `purchase.paymentStatus` | R09 timer · R10b retry | ✅ | ✅ |
| Paid amount | `purchase.paidAmountInr` | `startPayment()` | ✅ | ✅ |
| ~~Permissions~~ | ~~`purchase.permissions.*`~~ | ~~R14 toggles~~ | ARCHIVED | ARCHIVED |
| ~~Permission outcome~~ | ~~`purchase.permissionOutcome`~~ | ~~R14 Allow/Skip~~ | ARCHIVED | ARCHIVED |
| ~~Activation complete~~ | ~~`purchase.activationComplete`~~ | ~~R15 CTA~~ | ARCHIVED | ARCHIVED |
| Vehicle | `session.vehicle.*` | R03–R05 | ✅ | ✅ |
| Auth | `session.auth.*` | Auth steps | ✅ | ✅ |

### 4.2 Session lifecycle resets

| Event | Effect |
|-------|--------|
| R05 Continue | Full `purchase` object reset (plan → Secure default) |
| `startPayment()` | Sets processing state |
| R07 → R08 | Clears promo |
| R10b Retry | `checkoutReady: false` · `paymentStatus: 'idle'` |
| `clearJourney()` | Only on `/journey/completed` Start over |

### 4.3 Session issues

| # | Issue | Severity |
|---|-------|----------|
| S1 | Re-pay after success resets payment state via `startPayment()` — post-payment guard missing | **High** |
| S2 | `phase` React state not persisted — cosmetic only; URL + sessionStorage drive routing | Low |
| S3 | `updateSession` shallow merge — safe when callers spread nested objects (current code does) | Info |

---

## 5. Visual audit — Figma parity gaps

Rechecked against Figma section `167:434` and Phase A–C signoff docs. No new pixel diff run in CI.

### 5.1 By screen (active journey)

| Screen | Parity (est.) | Remaining gaps |
|--------|---------------|----------------|
| A1 Mobile / A2 OTP / A3 Name | ~95% | No iOS status bar (P2 accepted) |
| R03 / R03b | ~98% | Fluid footer vs absolute y=762 (P2) |
| R04 | ~97% | Static spinner — no rotation animation |
| R04b | ~95% | Halo SVG vs CSS gradient approximation (Phase A note) |
| R05 | ~97% | — |
| R06 | ~95% | Carousel centering web scroll vs Figma snap |
| R07 | ~95% | Plan context line not in Figma frame (functional add) |
| R08 / R08b | ~95% | Promo one-tap demo — no text input row |
| **R08c** | **0%** | **Not implemented** |
| R09 | ~97% | Static spinner |
| R10 | ~95% | `payment-success-halo` SVG approximation |
| R10b | ~97% | Reuses R04b amber halo pattern |
| **R09b / R10c** | **0%** | **Not implemented** |
| ~~R14~~ | ARCHIVED | Route archived — do not restore |
| ~~R15~~ | ARCHIVED | Route archived — do not restore |

### 5.2 Cross-cutting visual gaps

| Gap | Severity | Screens |
|-----|----------|---------|
| No iOS status bar in web shell | P2 accepted | All |
| Dark card surfaces (`#1A1A1A`) in light theme | P2 | R06–R08 cards |
| Spinner not animated | P2 | R04, R09 |
| Halo blur `filter: blur(40px)` approximated in SVG | P2 | R10, R10b |
| R07 plan context line extra element | P2 | R07–R08 |

### 5.3 Unimplemented Figma frames (documented, not deleted)

| Frame | Node | Status |
|-------|------|--------|
| R08c · Promo invalid | `579:1748` | Not built |
| R09b · Still confirming | `579:1687` | Not built |
| R10c · Payment unconfirmed | `579:1638` | Not built |
| R01 QR Scan | — | Replaced by auth entry |
| R02 Name (purchase) | — | Shared A3 |

---

## 6. Obsolete routes & dead code (document only — do not delete)

### 6.1 Legacy purchase P01–P06

| Item | Path | Status |
|------|------|--------|
| P01 Plan selection | `features/qr-purchase/screens/p01-plan-selection/` | **Orphan** — mounted at `…/p01-plan-selection` |
| P02 Plan details | `…/p02-plan-details/` | Orphan |
| P03 Rider selection | `…/p03-rider-selection/` | Orphan |
| P04 Checkout summary | `…/p04-checkout-summary/` | Orphan |
| P05 Payment processing | `…/p05-payment-processing/` | Orphan |
| P06 Payment success | `…/p06-payment-success/` | Orphan · **P06 → emergency handoff** |
| Route wiring | `PurchaseRoutes.tsx` P01Route–P06Route | Dev/deep-link reachable |
| Path constants | `purchase-routing.ts` p01*–p06* | Not in `purchaseStepPathSequence` |
| Screen inventory | `features/qr-purchase/screens/inventory.ts` | P01–P06 step IDs only |
| Dev preview | `ScreenDevApp` · “Purchase (Phase 5 legacy)” | Dev-only |

### 6.2 Legacy auth

| Item | Path | Status |
|------|------|--------|
| **AuthFlowApp** | `features/shared-auth/auth-flow/AuthFlowApp.tsx` | **Dead** — not in `main.tsx` |
| AuthCompletedView | `auth-flow/AuthCompletedView.tsx` | Dead — AuthFlowApp only |
| SharedAuthSegment | `auth-flow/SharedAuthSegment.tsx` | Dead — no imports |
| Package export | `onboarding/src/index.ts` exports AuthFlowApp | Dead export surface |
| Deprecated R03/R04 auth screens | `shared-auth/screens/r03-mobile-number/` etc. | Dead |
| purchase-activation R01/R02/R05/R06 | `features/purchase-activation/` | Dev-only (ScreenDevApp deprecated section) |

### 6.3 Unused placeholders & redirects

| Item | Path | Status |
|------|------|--------|
| QrScanRoute | `journey/routes/QrScanRoute.tsx` | **Unmounted** |
| `/journey/qr-scan` redirect | `JourneyRoutes.tsx` | → auth/mobile |
| `/journey/purchase/qr-scan` redirect | `JourneyRoutes.tsx` | → r03-vehicle |
| EmergencyPlaceholderScreen | `journey/screens/EmergencyPlaceholderScreen.tsx` | **Unmounted** |
| HomeScreen | `journey/screens/HomeScreen.tsx` | Orphan — `/journey/home` not default entry |
| ActivationPlaceholderScreen | `journey/screens/ActivationPlaceholderScreen.tsx` | **Active** for prepaid/b2b2c only |
| PurchaseStepShell | `components/purchase-step-shell/` | Zero consumers |
| auth legacySharedPaths | `journey/auth/auth-routing.ts` | Schema only |
| routes.schema.ts P01–P06 | `router/routes.schema.ts` | Stale catalog |
| flows.config.ts purchase steps | `flow/registry/config/flows.config.ts` | Stale P01–P06 step IDs |
| steps.config.ts | `flow/registry/config/steps.config.ts` | Stale labels |

### 6.4 Stale cross-flow references

| Item | Issue |
|------|-------|
| `EmergencyRoutes` E01 back | Navigates to `p06PaymentSuccess` — should navigate to R10 for purchase flow |
| P06Route onContinue | `setPhase('emergency')` — only via orphan P06 URL |
| `/journey/completed` | Not wired from purchase path; enters via emergency completion |

---

## 7. Blockers (fixes required before production)

| # | Blocker | Impact | Suggested fix (future — not in this audit) |
|---|---------|--------|---------------------------------------------|
| **B1** | **R08/R08b lack post-success guard** | Browser back after R10 allows re-pay; payment session corrupted | Redirect to R10 when `paymentStatus === 'success'` |
| **B2** | **`startPayment()` callable after payment success** | Same as B1 — session regression | Guard Pay CTA or route entry |

### Non-blockers (accepted for demo / documented)

| Item | Rationale |
|------|-----------|
| R14/R15 archived | Archived per Purchase Flow Correction 2026-06-18 — do not restore |
| Demo payment / promo / Vahan | Integration deferred |
| R08c / R09b / R10c missing | Out of Phase B/C scope |
| Legacy P01–P06 mounted | Dev/orphan — cleanup later |
| Permission “denied” vs “skipped” | UI-only priming — no OS APIs |
| No checkout offline UX | Auth + Vahan cover offline; payment segment does not |

---

## 8. Build verification

```bash
pnpm --filter @autolokate/icons --filter @autolokate/ui --filter @autolokate/qr build
```

**Status at audit:** ✅ Pass

---

## 9. Signoff checklist

| Criterion | Status |
|-----------|--------|
| Mobile → OTP → Name → R03–R10 wired (R14/R15 archived) | ✅ |
| All 4 plans reach expected payment outcome | ✅ |
| R10 → Emergency handoff wired (contacts-empty) | ✅ |
| Session fields persist | ✅ |
| No redirect loops | ✅ |
| No blank screens on active path | ✅ |
| Post-payment route guards | ❌ B1 |
| Figma branch frames R08c/R09b/R10c | ❌ Out of scope |
| Legacy code documented | ✅ |
| Real payment gateway | ❌ Demo only (expected) |

---

## Verdict

### **FIXES REQUIRED**

The Consumer · QR Activation + Purchase journey is **functionally complete for UI/demo** from auth through activation complete. **Two route-guard gaps (B1–B2)** must be fixed before production release.

**Prepaid / B2B2C:** May begin implementation — separate route segments (`/journey/prepaid/*`, `/journey/b2b2c/*`) and placeholder screens already exist. Recommend fixing **B1** before any cross-flow QA that mixes purchase browser history with new flows.

---

## Appendix — file references

| Area | Primary files |
|------|---------------|
| Journey router | `apps/qr/src/journey/routes/JourneyRoutes.tsx` |
| Purchase routes | `apps/qr/src/journey/routes/PurchaseRoutes.tsx` |
| Path constants | `apps/qr/src/journey/purchase/purchase-routing.ts` |
| Session | `apps/qr/src/journey/JourneyContext.tsx` · `persistence.ts` |
| Demo rules | `vahan-demo.ts` · `purchase-payment-demo.ts` · `auth-flow.validation.ts` |
| Phase docs (archived) | `docs/archive/PHASE_A_*` · `docs/archive/PHASE_B_IMPLEMENTATION.md` · `docs/archive/PHASE_C_IMPLEMENTATION.md` |
| Figma audit (archived) | `docs/archive/PURCHASE_FIGMA_AUDIT.md` |
| Dev preview | `apps/qr/src/dev/ScreenDevApp.tsx` |
