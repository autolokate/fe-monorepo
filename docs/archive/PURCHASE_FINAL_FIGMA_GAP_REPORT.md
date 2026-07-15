# Purchase Final Figma Gap Report

**Date:** 2026-06-18  
**Source of truth:** Figma · [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/Autolokate-%C2%B7-Consumer-App)  
**Section:** `167:434` · **Consumer · QR Activation + Purchase · ✅ READY FOR DEV**  
**Method:** Read-only code audit · route graph trace · session schema review · Figma inventory cross-reference (`docs/archive/PURCHASE_FIGMA_AUDIT.md`, Phase A–C signoff docs)  
**Constraints:** Audit only — no code modified

---

## Executive summary

Of the **16 requested frames**, **14 have UI implementations** (R03b is an inline variant on R03; R09b and R10c are absent). **11 frames are reachable** in the live purchase journey (`/journey/purchase/*`). **R14 and R15 components exist but are not reachable in prod** — their routes redirect immediately to R10. **R10 Continue is a no-op**, so the Figma happy path **R10 → R14 → R15 never completes** in the journey.

**R10c Payment Unconfirmed is completely missing** — no component, no route, not in dev preview, not reachable by any path.

---

## Summary table

| Frame                          | Implemented         | Reachable      | Parity % | Blocker                                           |
| ------------------------------ | ------------------- | -------------- | -------- | ------------------------------------------------- |
| **R03** · Vehicle number       | Yes                 | Yes            | 98%      | —                                                 |
| **R03b** · Vehicle not found   | Yes (inline on R03) | Yes            | 98%      | —                                                 |
| **R04** · Fetching details     | Yes                 | Yes            | 97%      | —                                                 |
| **R04b** · Fetch failed        | Yes                 | Yes            | 98%      | Enter manually (Figma hotspot only)               |
| **R05** · Confirm vehicle      | Yes                 | Yes            | 95%      | —                                                 |
| **R06** · Choose plan          | Yes                 | Yes            | 94%      | Carousel motion / dense-card tuning (P2)          |
| **R07** · Rider cover          | Yes                 | Yes            | 93%      | Extra plan-context line vs Figma                  |
| **R08** · Order summary        | Yes                 | Yes            | 92%      | No promo text input · invalid promo (R08c) absent |
| **R08b** · Promo applied       | Yes                 | Yes            | 95%      | —                                                 |
| **R09** · Processing payment   | Yes                 | Yes            | 97%      | —                                                 |
| **R09b** · Still confirming    | **No**              | **No**         | **0%**   | **Screen not built**                              |
| **R10** · Payment success      | Yes                 | Yes (terminal) | 95%      | **Continue does not navigate to R14**             |
| **R10b** · Payment failed      | Yes                 | Yes (branch)   | 97%      | —                                                 |
| **R10c** · Payment unconfirmed | **No**              | **No**         | **0%**   | **Screen not built**                              |
| **R14** · Permissions          | Yes (component)     | **No**         | 88%      | **Route redirects to R10 · gating mismatch**      |
| **R15** · Activation complete  | Yes (component)     | **No**         | 95%      | **Route redirects to R10 · never reached**        |

**Aggregate (requested frames):** 14/16 implemented · 11/16 journey-reachable · ~84% weighted visual parity · **5 P0 blockers**

---

## Per-frame audit

### R03 · Vehicle number — Figma `170:25`

| #                         | Finding                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `features/qr-purchase/screens/r03-vehicle-number/R03VehicleNumberScreen.tsx`                                 |
| 2. Reachable in journey?  | **Yes** — first purchase screen after Shared Auth (`r03-vehicle`)                                                      |
| 3. Figma node id          | `170:25`                                                                                                               |
| 4. Visual parity %        | **98%**                                                                                                                |
| 5. Missing states         | `loading` (`plateState === 'loading'`) exists in dev preview only; routing never sets it (submit goes straight to R04) |
| 6. Missing copy           | None — title, description, CTA, ctaHelper match Figma                                                                  |
| 7. Missing animations     | None specified                                                                                                         |
| 8. Missing icons          | None — `shield-check` in `TrustRow`, preview chips use `check`                                                         |
| 9. Missing spacing/layout | Fluid footer vs Figma absolute y=762 (accepted P2 web adaptation)                                                      |
| 10. Missing interactions  | Disabled CTA until valid plate length — implemented                                                                    |

---

### R03b · Vehicle not found — Figma `579:1700`

| #                         | Finding                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes (inline)** — same `R03VehicleNumberScreen` when `plateState === 'error'`                       |
| 2. Reachable in journey?  | **Yes** — any non-demo plate (≥8 chars, not `MH 12 AB 3456` / `MH 12 AB 0000`) → inline error on R03 |
| 3. Figma node id          | `579:1700`                                                                                           |
| 4. Visual parity %        | **98%**                                                                                              |
| 5. Missing states         | None — error is the only R03b state                                                                  |
| 6. Missing copy           | None — “We couldn't find that number, check and try again”                                           |
| 7. Missing animations     | None                                                                                                 |
| 8. Missing icons          | Same as R03                                                                                          |
| 9. Missing spacing/layout | Amber error + 2px plate border via `AlPlateInput` error prop                                         |
| 10. Missing interactions  | CTA re-enabled when plate valid — implemented                                                        |

---

### R04 · Fetching details — Figma `179:25`

| #                         | Finding                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r04-fetching-vehicle/R04FetchingVehicleScreen.tsx`           |
| 2. Reachable in journey?  | **Yes** — R03 Continue with valid demo plate → auto-fetch → R05 or R04b |
| 3. Figma node id          | `179:25`                                                                |
| 4. Visual parity %        | **97%**                                                                 |
| 5. Missing states         | Loading only (correct)                                                  |
| 6. Missing copy           | None                                                                    |
| 7. Missing animations     | Spinner uses `AlScreenSpinner animated` — rotation present              |
| 8. Missing icons          | 60×60 green loader — `AlScreenSpinner` lg                               |
| 9. Missing spacing/layout | Centered Display title + spinner via `PurchaseStatusShell`              |
| 10. Missing interactions  | No back / no CTA (correct); transient auto-navigate                     |

---

### R04b · Couldn't fetch from Vahan — Figma `579:1663`

| #                         | Finding                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| 1. Exists in code?        | **Yes** — `r04b-fetch-failed/R04bFetchFailedScreen.tsx`            |
| 2. Reachable in journey?  | **Yes** — plate `MH 12 AB 0000` or offline during fetch            |
| 3. Figma node id          | `579:1663`                                                         |
| 4. Visual parity %        | **98%**                                                            |
| 5. Missing states         | Retry only; **“Enter manually” prototype hotspot not implemented** |
| 6. Missing copy           | None — title, description, “Try again” match                       |
| 7. Missing animations     | Static halo SVG (no pulse)                                         |
| 8. Missing icons          | `fetch-failed-halo` 240px amber                                    |
| 9. Missing spacing/layout | `ambient="attention"` amber tint                                   |
| 10. Missing interactions  | Retry → R03; **no manual entry path**                              |

---

### R05 · Confirm vehicle — Figma `170:71`

| #                         | Finding                                                       |
| ------------------------- | ------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r05-confirm-vehicle/R05ConfirmVehicleScreen.tsx`   |
| 2. Reachable in journey?  | **Yes** — R04 success; guarded by `fetchStatus === 'success'` |
| 3. Figma node id          | `170:71`                                                      |
| 4. Visual parity %        | **95%**                                                       |
| 5. Missing states         | Success/filled only (correct for frame)                       |
| 6. Missing copy           | None — RC card fields, “Looks right”                          |
| 7. Missing animations     | None                                                          |
| 8. Missing icons          | `circle-check` verified chip, `car` watermark                 |
| 9. Missing spacing/layout | RC card radius 16px, field grid                               |
| 10. Missing interactions  | Back → R03; Continue → R06 (resets purchase session)          |

---

### R06 · Choose plan — Figma `183:25` · `243:49` · `243:76` · `243:103`

| #                         | Finding                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r06-choose-plan/R06ChoosePlanScreen.tsx` + `PlanCarousel`                     |
| 2. Reachable in journey?  | **Yes** — R05 Continue                                                                   |
| 3. Figma node id          | `183:25` (Secure centered) · `243:49` (Safe) · `243:76` (Shield) · `243:103` (Shield+)   |
| 4. Visual parity %        | **94%**                                                                                  |
| 5. Missing states         | All 4 centered plan selections implemented; unselected neighbor peek via carousel scroll |
| 6. Missing copy           | None — hint, plan names, prices, features, dynamic “Choose {plan}”                       |
| 7. Missing animations     | Selection scale/glow/check pop implemented; web scroll-snap vs Figma drag                |
| 8. Missing icons          | `circle-check` feature + selected mark                                                   |
| 9. Missing spacing/layout | Secure dense card required tighter line-heights; carousel viewport headroom for scale    |
| 10. Missing interactions  | Tap card to select; one-step snap scroll; CTA syncs to selection                         |

---

### R07 · Add rider cover — Figma `186:25`

| #                         | Finding                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r07-rider-cover/R07RiderCoverScreen.tsx`                                         |
| 2. Reachable in journey?  | **Yes** — R06 Continue                                                                      |
| 3. Figma node id          | `186:25`                                                                                    |
| 4. Visual parity %        | **93%**                                                                                     |
| 5. Missing states         | 1 rider / 2 riders / skip (`riderCount` 0) in routing; dev preview defaults to 1 rider only |
| 6. Missing copy           | None — title, description, skip link, dynamic CTA                                           |
| 7. Missing animations     | Selection border transition (CSS)                                                           |
| 8. Missing icons          | `user` / `users` on rider option cards                                                      |
| 9. Missing spacing/layout | **Extra `ob-purchase-plan-context` line above options — not in Figma frame**                |
| 10. Missing interactions  | Select 1/2 riders, skip → R08 with `riderCount: 0`                                          |

---

### R08 · Order summary — Figma `190:25`

| #                         | Finding                                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r08-order-summary/R08OrderSummaryScreen.tsx`                                                                                                                   |
| 2. Reachable in journey?  | **Yes** — R07 Continue or Skip                                                                                                                                            |
| 3. Figma node id          | `190:25`                                                                                                                                                                  |
| 4. Visual parity %        | **92%**                                                                                                                                                                   |
| 5. Missing states         | Default with rider; **R08c invalid promo (`579:1748`) not built**; **R08d no-rider (`648:2053`) partially supported** (skip path) but shows promo field unlike Figma R08d |
| 6. Missing copy           | None on default frame                                                                                                                                                     |
| 7. Missing animations     | None                                                                                                                                                                      |
| 8. Missing icons          | `circle-check` on R08b applied variant only                                                                                                                               |
| 9. Missing spacing/layout | Summary card, GST note, gateway note match structure                                                                                                                      |
| 10. Missing interactions  | **Promo is one-tap Apply (hardcoded `FRIEND50`) — no text input row**; Pay → R09                                                                                          |

---

### R08b · Promo applied — Figma `333:37`

| #                         | Finding                                                   |
| ------------------------- | --------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r08b-promo-applied/R08bPromoAppliedScreen.tsx` |
| 2. Reachable in journey?  | **Yes** — R08 Apply promo                                 |
| 3. Figma node id          | `333:37`                                                  |
| 4. Visual parity %        | **95%**                                                   |
| 5. Missing states         | Applied only (correct)                                    |
| 6. Missing copy           | None — FRIEND50, −₹100, dynamic Pay total                 |
| 7. Missing animations     | None                                                      |
| 8. Missing icons          | `circle-check` on promo chip row                          |
| 9. Missing spacing/layout | Matches R08 shell                                         |
| 10. Missing interactions  | Remove → R08; Pay → R09                                   |

---

### R09 · Processing payment — Figma `192:25`

| #                         | Finding                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r09-processing-payment/R09ProcessingPaymentScreen.tsx` |
| 2. Reachable in journey?  | **Yes** — R08/R08b Pay                                            |
| 3. Figma node id          | `192:25`                                                          |
| 4. Visual parity %        | **97%**                                                           |
| 5. Missing states         | Processing only; **no timeout branch to R09b**                    |
| 6. Missing copy           | None                                                              |
| 7. Missing animations     | Animated spinner                                                  |
| 8. Missing icons          | 60×60 green `AlScreenSpinner`                                     |
| 9. Missing spacing/layout | Centered Display via `PurchaseStatusShell`                        |
| 10. Missing interactions  | 3s demo timer → R10 or R10b; no back                              |

---

### R09b · Still confirming — Figma `579:1687`

| #                         | Finding                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| 1. Exists in code?        | **No**                                                                |
| 2. Reachable in journey?  | **No**                                                                |
| 3. Figma node id          | `579:1687`                                                            |
| 4. Visual parity %        | **0%**                                                                |
| 5. Missing states         | Extended loading / “Check status” hotspot — entire frame absent       |
| 6. Missing copy           | “Still confirming your payment” / “This is taking longer than usual…” |
| 7. Missing animations     | Spinner (would mirror R09)                                            |
| 8. Missing icons          | Spinner                                                               |
| 9. Missing spacing/layout | N/A                                                                   |
| 10. Missing interactions  | Figma prototype “Check status” — no route                             |

---

### R10 · Payment success — Figma `193:25`

| #                         | Finding                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r10-payment-success/R10PaymentSuccessScreen.tsx`                       |
| 2. Reachable in journey?  | **Yes** — R09 success (Safe / Secure / Shield); **effective journey terminal**    |
| 3. Figma node id          | `193:25` (halo `193:28`)                                                          |
| 4. Visual parity %        | **95%**                                                                           |
| 5. Missing states         | Success only                                                                      |
| 6. Missing copy           | Dynamic `₹{amount} paid · your {Plan} plan is now active`                         |
| 7. Missing animations     | Static halo SVG (blur approximated)                                               |
| 8. Missing icons          | `payment-success-halo` 240px                                                      |
| 9. Missing spacing/layout | Centered hero + CTA                                                               |
| 10. Missing interactions  | **Continue `onContinue` is empty no-op in `R10Route` — does not navigate to R14** |

---

### R10b · Payment failed — Figma `194:25`

| #                         | Finding                                                     |
| ------------------------- | ----------------------------------------------------------- |
| 1. Exists in code?        | **Yes** — `r10b-payment-failed/R10bPaymentFailedScreen.tsx` |
| 2. Reachable in journey?  | **Yes** — R09 fail when plan is Shield+ (demo rule)         |
| 3. Figma node id          | `194:25`                                                    |
| 4. Visual parity %        | **97%**                                                     |
| 5. Missing states         | Failed + retry                                              |
| 6. Missing copy           | None                                                        |
| 7. Missing animations     | Static amber halo                                           |
| 8. Missing icons          | `fetch-failed-halo` (shared with R04b)                      |
| 9. Missing spacing/layout | `ambient="attention"`                                       |
| 10. Missing interactions  | Retry → R08/R08b (resets payment status)                    |

---

### R10c · Payment unconfirmed — Figma `579:1638`

| #                         | Finding                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------ |
| 1. Exists in code?        | **No** — no `R10c*.tsx`, no screen folder, no mentions in `apps/qr/src`              |
| 2. Reachable in journey?  | **No** — no route, no session branch                                                 |
| 3. Figma node id          | `579:1638`                                                                           |
| 4. Visual parity %        | **0%**                                                                               |
| 5. Missing states         | Ambiguous / pending payment — entire frame                                           |
| 6. Missing copy           | “We couldn't confirm your payment” / WhatsApp verification body / “Check status” CTA |
| 7. Missing animations     | None specified (static error/ambiguous hero)                                         |
| 8. Missing icons          | No halo asset defined in implementation                                              |
| 9. Missing spacing/layout | N/A                                                                                  |
| 10. Missing interactions  | “Check status” — Figma hotspot only                                                  |

#### R10c special verification

| Question                                 | Answer                                                         |
| ---------------------------------------- | -------------------------------------------------------------- |
| Is R10c Payment Unconfirmed implemented? | **No**                                                         |
| Is it reachable through the journey?     | **No**                                                         |
| Is it only in dev preview?               | **No** — not in `ScreenDevApp` either                          |
| Is it completely missing?                | **Yes** — documented in Figma audit / Phase C scope notes only |

`PurchasePaymentStatus` is `'idle' | 'processing' | 'success' | 'failed'` — no `unconfirmed` / `pending` branch. R09 timer resolves only to success or failed.

---

### R14 · Permissions — Figma `32:132` · R14b `764:2199`

| #                         | Finding                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes (component)** — `r14-permissions/R14PermissionsScreen.tsx`                                                        |
| 2. Reachable in journey?  | **No** — `R14Route` immediately `navigate`s to R10 and renders `null`                                                   |
| 3. Figma node id          | `32:132` (all off) · `764:2199` (one on)                                                                                |
| 4. Visual parity %        | **88%** (component vs Figma)                                                                                            |
| 5. Missing states         | All-off and all-on in dev (`r14`, `r14b`); **Figma R14b is “at least one on” — code requires all 3 toggles ON** for CTA |
| 6. Missing copy           | Permission rows match catalog; **“Skip” link added — not in R14 Figma frame**                                           |
| 7. Missing animations     | Toggle state (CSS)                                                                                                      |
| 8. Missing icons          | `map-pin`, `shield-check`, `bell` per row                                                                               |
| 9. Missing spacing/layout | 12px row gap, 46px toggle column                                                                                        |
| 10. Missing interactions  | **Not wired in routing** — `onAllow` / `onSkip` / toggles only work in dev preview                                      |

---

### R15 · Activation complete — Figma `171:59`

| #                         | Finding                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1. Exists in code?        | **Yes (component)** — `r15-activation-complete/R15ActivationCompleteScreen.tsx`                            |
| 2. Reachable in journey?  | **No** — `R15Route` redirects to R10                                                                       |
| 3. Figma node id          | `171:59`                                                                                                   |
| 4. Visual parity %        | **95%** (component vs Figma)                                                                               |
| 5. Missing states         | Complete; `completed` prop disables CTA (“Done”) — dev/edge only                                           |
| 6. Missing copy           | Dynamic `{Plan} is active` title + plate description                                                       |
| 7. Missing animations     | Static halo                                                                                                |
| 8. Missing icons          | `activation-complete-halo` + green `AlChip`                                                                |
| 9. Missing spacing/layout | Chip below description via `bodyAccessory`                                                                 |
| 10. Missing interactions  | **Terminal “Go to home” not reachable in journey**; `activationComplete` session flag never set by routing |

---

## P0 blockers

| ID       | Frame         | Blocker                                                                     | Impact                                                         |
| -------- | ------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **P0-1** | **R10 → R14** | `R10Route.onContinue` is a no-op; Figma happy path stops at payment success | Permissions and activation never start in prod                 |
| **P0-2** | **R14**       | Route stub redirects to R10; screen never renders in journey                | Entire permissions step unreachable despite component existing |
| **P0-3** | **R15**       | Route stub redirects to R10; activation complete never shown                | Journey cannot terminate at Figma terminal frame               |
| **P0-4** | **R09b**      | Frame not implemented (`579:1687`)                                          | Payment timeout / extended confirming branch missing           |
| **P0-5** | **R10c**      | Frame not implemented (`579:1638`)                                          | Ambiguous payment outcome branch missing                       |

---

## P1 blockers

| ID       | Frame                   | Blocker                                                                       | Impact                                                |
| -------- | ----------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| **P1-1** | **R14 / R14b**          | CTA gated on **all 3 toggles ON**; Figma R14b shows CTA when **≥1 toggle on** | Wrong permissions gating vs Figma                     |
| **P1-2** | **R08**                 | Promo apply is one-tap demo (`FRIEND50`); no text input or validation         | Cannot reach invalid-promo UX; blocks R08c parity     |
| **P1-3** | **R08c**                | Invalid promo frame (`579:1748`) not built                                    | Error state for bad promo codes missing               |
| **P1-4** | **R04b**                | “Enter manually” Figma hotspot not implemented                                | Recovery path after Vahan fail incomplete             |
| **P1-5** | **Post-payment guards** | R03–R07, R04b lack `paymentStatus === 'success'` guards                       | Browser-back after R10 can expose pre-payment screens |
| **P1-6** | **R14**                 | “Skip” link present in code but absent from Figma R14 frame                   | Product/copy decision vs strict Figma parity          |

---

## P2 improvements

| ID        | Frame          | Improvement                                                     |
| --------- | -------------- | --------------------------------------------------------------- |
| **P2-1**  | R03–R08        | Fluid footer vs Figma absolute CTA y=762                        |
| **P2-2**  | R05            | RC card watermark / field spacing minor deltas (~95%)           |
| **P2-3**  | R06            | Carousel web scroll vs Figma snap positioning; motion polish    |
| **P2-4**  | R07            | Remove or justify extra plan-context line above rider cards     |
| **P2-5**  | R08 / R08d     | No-rider summary should hide promo field per Figma `648:2053`   |
| **P2-6**  | R10, R10b, R15 | Halo `filter: blur(40px)` approximated in SVG                   |
| **P2-7**  | R03            | `loading` plate state unused in routing (dev-only)              |
| **P2-8**  | R07            | Dev preview missing “2 riders selected” state toggle            |
| **P2-9**  | All            | No iOS status bar in web shell (accepted)                       |
| **P2-10** | R06–R08        | Dark card surfaces in light theme (matches Figma export intent) |
| **P2-11** | Catalog        | Legacy P01–P06 routes still mounted; `routes.schema.ts` stale   |
| **P2-12** | Helpers        | `purchaseStepPathSequence` omits R04b, R08b, R10b, R14, R15     |

---

## Journey reachability map

```
Auth (mobile → otp → vehicle-owner)
  └─► R03 ──valid plate──► R04 ──success──► R05 ──► R06 ──► R07 ──► R08 ──promo──► R08b
        │                      │                                              │
        │ invalid (inline R03b)│ error/offline                                └──Pay──► R09
        │                      └──► R04b ──retry──► R03                              │
                                                                                     ├──► R10 (TERMINAL — Continue no-op)
                                                                                     └──► R10b ──retry──► R08/R08b

R14 URL ──redirect──► R10   (component dev-only)
R15 URL ──redirect──► R10   (component dev-only)

R09b ── NOT IN CODE
R10c ── NOT IN CODE
```

### Dev preview only (`?dev=1` · `ScreenDevApp`)

| Dev ID                   | Frame          | Notes                                |
| ------------------------ | -------------- | ------------------------------------ |
| `r03` + states           | R03 / R03b     | empty · filled · error · loading     |
| `r04`, `r04b`, `r05`     | R04, R04b, R05 | Static                               |
| `r06-plan` + plan states | R06            | safe · secure · shield · shield-plus |
| `r07`, `r08`, `r08b`     | R07, R08, R08b | Static defaults                      |
| `r09`, `r10`, `r10b`     | R09, R10, R10b | Static                               |
| **`r14`, `r14b`**        | **R14, R14b**  | **Prod journey cannot reach these**  |
| **`r15`**                | **R15**        | **Prod journey cannot reach this**   |
| —                        | **R09b, R10c** | **Not in dev preview**               |

---

## Related Figma frames (section `167:434`, not in required list)

| Frame                | Node       | Implemented    | Notes                                                         |
| -------------------- | ---------- | -------------- | ------------------------------------------------------------- |
| R08c · Promo invalid | `579:1748` | No             | P1 gap                                                        |
| R08d · No rider      | `648:2053` | Partial        | Skip path sets `riderCount: 0` but UI still shows promo field |
| R14b · One on        | `764:2199` | Partial        | Dev `r14b` uses all-on, not one-on                            |
| R01 · Scan sticker   | `178:25`   | No (pre-app)   | Replaced by auth entry                                        |
| R02 · Your name      | `174:25`   | Shared Auth A3 | Boundary — not purchase route                                 |

---

## File references

| Area                       | Path                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| Purchase routes            | `apps/qr/src/journey/routes/PurchaseRoutes.tsx`                  |
| Path constants             | `apps/qr/src/journey/purchase/purchase-routing.ts`               |
| Session types              | `apps/qr/src/features/qr-purchase/types-checkout.ts`             |
| Demo payment               | `apps/qr/src/features/qr-purchase/data/purchase-payment-demo.ts` |
| Dev preview                | `apps/qr/src/dev/ScreenDevApp.tsx`                               |
| Figma inventory (archived) | `docs/archive/PURCHASE_FIGMA_AUDIT.md`                           |
| Phase A signoff            | `docs/PHASE_A_VISUAL_SIGNOFF.md`                                 |
| Phase B impl (archived)    | `docs/archive/PHASE_B_IMPLEMENTATION.md`                         |
| Phase C impl (archived)    | `docs/archive/PHASE_C_IMPLEMENTATION.md`                         |

---

## Verdict

**Phase A–B screens (R03–R08b)** are largely implemented and journey-reachable at **~93–98% visual parity**.

**Phase C payment screens (R09, R10, R10b)** are implemented and reachable, but the **post-payment arc (R10 → R14 → R15) is broken in routing** despite R14/R15 components existing.

**R09b and R10c are completely absent** from code, routes, and dev preview.

**Fix P0 blockers before claiming Figma parity** for the full Consumer · QR Activation + Purchase section.

---

**Audit complete.** No routes modified. No UI implemented.
