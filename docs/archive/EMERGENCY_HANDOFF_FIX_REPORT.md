# Emergency Handoff Fix Report

**Date:** 2026-06-18  
**Scope:** R10 Payment Success → Consumer · Emergency + Rider handoff only  
**No changes:** Emergency screen UI, Purchase screen UI

---

## Summary

R10 Payment Success was a **terminal dead-end** — `R10PaymentSuccessScreen` rendered without `onContinue`, so the Continue CTA did nothing.

**Fix:** Wire `R10Route` to call `setPhase('emergency')` and navigate via plan-aware `getEmergencyHandoffPath(session)`. Purchase session fields are preserved; emergency limits continue reading `session.purchase.selectedPlanId`.

**Build:** `pnpm --filter @autolokate/qr build` — ✅ pass

---

## Route graph — before

```mermaid
flowchart LR
  Auth[Shared Auth] --> R03[R03 Vehicle]
  R03 --> R04[R04 Fetch]
  R04 --> R05[R05 Confirm]
  R05 --> R06[R06 Plan]
  R06 --> R07[R07 Rider cover]
  R07 --> R08[R08 Order summary]
  R08 --> R09[R09 Processing]
  R09 --> R10[R10 Payment success]
  R10 -.->|Continue: no handler| X[DEAD END]
  P06[P06 legacy success] -->|onContinue| R0[R0 Rider prompt]
  Emergency[Emergency suffix] --> Completed[/journey/completed]
```

**Problems**

- R10 Continue had no `onContinue` prop → button inert
- `getEmergencyHandoffPath()` always returned `/journey/emergency/rider-prompt` (Safe users relied on R0 redirect hop)
- Comments/schema labeled R10 as terminal

---

## Route graph — after

```mermaid
flowchart LR
  Auth[Shared Auth] --> R03[R03 Vehicle]
  R03 --> R04[R04 Fetch]
  R04 --> R05[R05 Confirm]
  R05 --> R06[R06 Plan]
  R06 --> R07[R07 Rider cover]
  R07 --> R08[R08 Order summary]
  R08 --> R09[R09 Processing]
  R09 --> R10[R10 Payment success]
  R10 -->|Continue · plan-aware| Entry{Plan?}
  Entry -->|Safe| E0[E0 Contacts empty]
  Entry -->|Secure / Shield / Shield+| R0[R0 Rider prompt]
  R0 --> R4[R4 Riders summary]
  R4 --> E0
  E0 --> E1[E1 Contact mobile]
  E1 --> E2[E2 Contact OTP]
  E2 --> E3[E3 Contact name]
  E3 --> E5[E5 Contacts summary]
  E5 --> Completed[/journey/completed]
  P06[P06 legacy success] -->|onContinue · same rules| Entry
```

---

## Plan routing matrix

| Plan | `selectedPlanId` | R10 Continue destination | First screen shown | Emergency limits |
|------|------------------|--------------------------|--------------------|------------------|
| **Safe** | `safe` | `/journey/emergency/contacts-empty` | **E0** No contacts | 1 contact, 0 riders |
| **Secure** | `secure` | `/journey/emergency/rider-prompt` | **R0** Rider prompt | 2 contacts, up to 2 riders |
| **Shield** | `shield` | `/journey/emergency/rider-prompt` | **R0** Rider prompt | 3 contacts, up to 2 riders |
| **Shield+** | `shield-plus` | `/journey/emergency/rider-prompt` | **R0** Rider prompt | 3 contacts, up to 2 riders |

**Handoff function** (`activation-routing.ts`):

```typescript
export function getEmergencyHandoffPath(
  session?: Pick<JourneySession, 'purchase'>,
): string {
  const planId = resolvePurchasePlanId(session?.purchase?.selectedPlanId);
  if (planId === 'safe') {
    return emergencyJourneyPaths.contactsEmpty;
  }
  return emergencyJourneyPaths.riderPrompt;
}
```

**Note:** If a non-Safe plan has `riderCount: 0` (no addon purchased), R0 still mounts briefly then redirects to E0 via existing `shouldEnterRiderPrompt()` guard. Typical R07 journey defaults `riderCount` to ≥ 1 for addon plans.

---

## Files changed

| File | Change |
|------|--------|
| `apps/qr/src/journey/activation-routing.ts` | Plan-aware `getEmergencyHandoffPath(session)` |
| `apps/qr/src/journey/routes/PurchaseRoutes.tsx` | R10 `onContinue` → emergency; P06 passes `session` |
| `apps/qr/src/journey/purchase/purchase-routing.ts` | Comment: R10 → Emergency (not terminal) |
| `apps/qr/src/router/routes.schema.ts` | R10 label updated |

**Not modified:** `R10PaymentSuccessScreen.tsx`, any emergency screen component, any other purchase screen component.

---

## Session persistence verification

R10 Continue handler:

```typescript
onContinue={() => {
  setPhase('emergency');
  void navigate(getEmergencyHandoffPath(session));
}}
```

| Field | Cleared on handoff? | Still read by emergency? |
|-------|---------------------|--------------------------|
| `session.purchase.selectedPlanId` | ❌ No | ✅ `resolveEmergencyFoundationContext()` |
| `session.purchase.riderCount` | ❌ No | ✅ `getEntitledRiderSlots()` |
| `session.purchase.paymentStatus` | ❌ No | ✅ Stays `'success'` |
| `session.purchase.paidAmountInr` | ❌ No | ✅ Retained for R10 back-navigation display |
| `session.auth.*` | ❌ No | — |
| `session.vehicle.*` | ❌ No | — |

No `patchPurchase`, `updateSession({ purchase: undefined })`, or `clearJourney()` on handoff.

Emergency limits source chain unchanged:

```
session.purchase.selectedPlanId
  → resolvePurchasePlanId()
  → getEmergencyPlanLimits()
  → maxEmergencyContacts / maxRiders
```

---

## Journey verification

### Full path: Auth → Purchase → R10 → Emergency → Completed

| Step | Route | Verified |
|------|-------|----------|
| 1 | `/journey/auth/*` → vehicle owner | ✅ Existing |
| 2 | `/journey/purchase/r03-vehicle` … `r09-processing-payment` | ✅ Existing |
| 3 | R09 success → `r10-payment-success` | ✅ `paymentStatus: 'success'` set |
| 4 | R10 Continue → emergency entry | ✅ **Fixed** |
| 5 | Emergency suffix → E5 Continue | ✅ `getCompletedPath()` |
| 6 | `/journey/completed` | ✅ Existing |

### Per-plan handoff (static analysis + build)

| Plan | R10 → | Expected first UI | Limits at E5 |
|------|-------|-------------------|--------------|
| **Safe** | `contacts-empty` | E05ContactsEmptyScreen, max 1 contact | `canAddEmergencyContact` caps at 1 |
| **Secure** | `rider-prompt` | E01RiderPromptScreen (if riders entitled) | max 2 contacts |
| **Shield** | `rider-prompt` | E01RiderPromptScreen | max 3 contacts |
| **Shield+** | `rider-prompt` | E01RiderPromptScreen | max 3 contacts |

### Safe plan shortcut

Safe users **skip R0 entirely** — land directly on E0. Matches product rule: Safe has no rider addon (`maxRiders: 0`).

### Secure / Shield / Shield+ rider flow

1. R10 → R0  
2. User continues or skips rider → E0  
3. Contact capture loop → E5  
4. E5 Continue → Completed  

R4 (riders summary) appears when entitled rider slots > 0 and user completes rider capture.

### Regression checks

| Case | Result |
|------|--------|
| R10 without `paymentStatus: 'success'` | Redirect to R08 (unchanged guard) |
| Payment success resume (`redirectIfPaymentSucceeded`) | Still lands on R10 before Continue |
| P06 legacy handoff | Uses same plan-aware `getEmergencyHandoffPath(session)` |
| R0 back from emergency | Still → `r10-payment-success` (unchanged) |

---

## Manual QA checklist

Run `pnpm --filter @autolokate/qr dev`, complete purchase for each plan, tap **Continue** on R10:

- [ ] **Safe** — lands on E0; description shows 1 contact max  
- [ ] **Secure** — lands on R0; rider prompt copy reflects entitled slots  
- [ ] **Shield** — lands on R0; E5 allows up to 3 contacts  
- [ ] **Shield+** — lands on R0; same as Shield  
- [ ] After E5 Continue — reaches `/journey/completed`  
- [ ] Browser refresh on emergency route — `selectedPlanId` still drives limits  

---

## Out of scope (unchanged)

- Emergency screen pixel/copy fixes from `EMERGENCY_FINAL_SIGNOFF.md`
- Purchase screen visual changes
- R0 back target when user entered via P06 vs R10
- Native contact picker stub on E0
- `setPhase('completed')` on E5 Continue (phase remains `emergency` until completed screen actions)

---

*Handoff fix complete. R10 is no longer terminal.*
