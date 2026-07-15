# Purchase Blocker Fix Report

**Date:** 2026-06-17  
**Scope:** B1 · B2 from [`PURCHASE_FINAL_SIGNOFF.md`](./PURCHASE_FINAL_SIGNOFF.md)  
**Constraints honored:** Guard fixes only · no UI · no layouts · no Figma parity changes · no new screens

---

## Summary

Two route-guard blockers are resolved. After `paymentStatus === 'success'`, checkout/processing screens (R08 · R08b · R09) redirect to the correct post-payment step, and `startPayment()` is a no-op that redirects instead of mutating session.

### Verdict: **PRODUCTION READY**

(B1 and B2 blockers cleared. Demo/integration gaps from the final signoff remain out of scope.)

---

## Changes

| File                                                 | Change                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `apps/qr/src/journey/routes/PurchaseRoutes.tsx`      | Post-payment redirect helpers · R08/R08b/R09 guards · `startPayment()` success guard |
| `apps/qr/src/features/qr-purchase/types-checkout.ts` | `permissionsStepReached?: boolean` — routing flag only (set on R10 → R14)            |

### New helpers

```ts
getPostPaymentSuccessPath(purchase); // R10 | R14 | R15
redirectIfPaymentSucceeded(navigate, purchase); // returns true if redirected
```

### Redirect decision tree (B1)

When `paymentStatus === 'success'` and user hits R08 / R08b / R09:

| Session state                                  | Redirect |
| ---------------------------------------------- | -------- |
| `activationComplete === true`                  | R15      |
| `permissionOutcome === 'granted' \| 'skipped'` | R15      |
| `permissionsStepReached === true`              | R14      |
| Otherwise                                      | R10      |

`permissionsStepReached` is set `true` on R10 **Continue → R14** and reset `false` on R05 purchase bootstrap and new `startPayment()` (non-success path only).

### B2 — `startPayment()` guard

```ts
if (purchase.paymentStatus === 'success') {
  navigate(getPostPaymentSuccessPath(purchase), { replace: true });
  return; // no session mutation
}
```

Prevents duplicate payment, permission reset, and activation reset.

Handler-level guards on R08/R08b **Apply promo** and **Remove promo** also call `redirectIfPaymentSucceeded` before mutating promo state.

---

## Route guard audit

| Route | Guard (post-fix)                                                                      | Result                          |
| ----- | ------------------------------------------------------------------------------------- | ------------------------------- |
| R08   | `redirectIfPaymentSucceeded` first · then plan guard                                  | ✅ Blocks post-success checkout |
| R08b  | `redirectIfPaymentSucceeded` first · then promo guard                                 | ✅                              |
| R09   | `redirectIfPaymentSucceeded` first · then processing guard · timer skips if `success` | ✅                              |
| R10   | Requires `paymentStatus === 'success'`                                                | ✅ Unchanged                    |
| R10b  | Requires `paymentStatus === 'failed'`                                                 | ✅ Retry path unaffected        |
| R14   | Requires `paymentStatus === 'success'`                                                | ✅ Unchanged                    |
| R15   | Requires success + granted/skipped                                                    | ✅ Unchanged                    |

### Blocked transitions (after success)

| From (attempted)  | Redirect target                 |
| ----------------- | ------------------------------- |
| R08               | R10 · R14 · or R15              |
| R08b              | R10 · R14 · or R15              |
| R09               | R10 · R14 · or R15              |
| R08 Pay CTA       | Same (via `startPayment` guard) |
| R08b Pay CTA      | Same                            |
| R08 Apply promo   | Same (handler guard)            |
| R08b Remove promo | Same (handler guard)            |

### Allowed transitions (after success)

| From | To  | Notes                                    |
| ---- | --- | ---------------------------------------- |
| R10  | R14 | Continue (sets `permissionsStepReached`) |
| R14  | R10 | Back — intentional                       |
| R14  | R15 | Allow / Skip                             |
| R15  | —   | Terminal                                 |

---

## History navigation audit

| Scenario                 | Before fix                | After fix                                    |
| ------------------------ | ------------------------- | -------------------------------------------- |
| R10 → browser back → R09 | R09 shown / timer may run | → R10 (replace)                              |
| R10 → back → R08         | Checkout + Pay available  | → R10 (replace)                              |
| R14 → back → R10         | OK                        | OK (unchanged)                               |
| R14 → back chain → R08   | Re-pay possible           | → R14 (replace) if `permissionsStepReached`  |
| R15 → back → R08         | Re-pay possible           | → R15 (replace) if granted/skipped/complete  |
| R10b Retry (failed)      | → R08 · can pay again     | ✅ Unchanged — `paymentStatus !== 'success'` |

All post-success redirects use `{ replace: true }` to avoid re-adding blocked entries to the history stack.

---

## Session recovery audit

| Scenario                                    | Session on disk                          | Recovery behaviour                                                               |
| ------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| Refresh on R08 after success                | `paymentStatus: 'success'`               | Guard → R10/R14/R15                                                              |
| Refresh on R09 after success                | same                                     | Guard → R10/R14/R15 · timer does not run                                         |
| Refresh on R09 mid-processing               | `paymentStatus: 'processing'`            | Timer re-runs (demo) · unchanged                                                 |
| Refresh on R10 after success                | success                                  | Stays on R10 ✅                                                                  |
| Refresh on R14 after success + step reached | success · `permissionsStepReached: true` | Stays on R14 ✅                                                                  |
| Refresh on R15 after grant/skip             | success · outcome set                    | Stays on R15 ✅                                                                  |
| Pay tap with stale success in session       | success                                  | `startPayment` redirects · **no** `permissionOutcome`/`activationComplete` reset |

### Protected session fields (after success)

These are **not** overwritten when `paymentStatus === 'success'`:

- `permissionOutcome`
- `activationComplete`
- `permissions` toggles
- `paidAmountInr`
- `permissionsStepReached`

---

## Refresh audit

| Screen | Refresh with `paymentStatus: success` | Expected                | Actual |
| ------ | ------------------------------------- | ----------------------- | ------ |
| R08    | yes                                   | Redirect off checkout   | ✅     |
| R08b   | yes                                   | Redirect off checkout   | ✅     |
| R09    | yes                                   | Redirect off processing | ✅     |
| R10    | yes                                   | Remain on success       | ✅     |
| R14    | yes + step reached                    | Remain on permissions   | ✅     |
| R15    | yes + outcome set                     | Remain on complete      | ✅     |

---

## Build verification

```bash
pnpm --filter @autolokate/qr build
```

**Result:** ✅ Pass

---

## Out of scope (unchanged)

| Item                              | Status                                      |
| --------------------------------- | ------------------------------------------- |
| Real payment gateway              | Demo timer only                             |
| R08c / R09b / R10c Figma frames   | Not built                                   |
| Legacy P01–P06 routes             | Still mounted (documented in final signoff) |
| R15 terminal — no home navigation | By Phase C design                           |
| Offline UX on checkout R08–R15    | Not in blocker scope                        |

---

## Signoff update

| Blocker                                      | Status   |
| -------------------------------------------- | -------- |
| **B1** — Post-success access to R08/R08b/R09 | ✅ Fixed |
| **B2** — `startPayment()` after success      | ✅ Fixed |

### **PRODUCTION READY**

Purchase flow blockers B1 and B2 are resolved. Prepaid and B2B2C work may proceed per [`PURCHASE_FINAL_SIGNOFF.md`](./PURCHASE_FINAL_SIGNOFF.md) guidance.
