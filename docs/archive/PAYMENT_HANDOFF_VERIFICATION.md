# Payment Handoff Verification

**Scope:** R10 Continue → Emergency flow (purchase path)

## Root cause

1. **`getEmergencyHandoffPath`** routed Secure/Shield/Shield+ with `riderCount > 0` to **rider-prompt** instead of contacts-empty after payment
2. **E0 back bug:** when `riderSkipped === true`, back navigated **to** rider-prompt (inverted logic)
3. **Emergency wildcard** `*` always redirected unknown paths to rider-prompt, even after successful payment
4. R10 → emergency used push navigation without session flag for handoff context

## Fix

### New routing function

```typescript
getPurchasePostPaymentEmergencyPath() → /journey/emergency/contacts-empty
```

Used **only** from R10 Continue — all plans (Safe, Secure, Shield, Shield+) land on contacts-empty.

### R10 Continue handler

- `setPhase('emergency')`
- `updateSession({ emergency: { ...session.emergency, riderSkipped: true } })`
- `navigate(getPurchasePostPaymentEmergencyPath(), { replace: true })`

### E0 back (contacts-empty)

- When `riderSkipped`: back → `getEmergencyFlowBackPath` (R10 payment success for purchase flow)
- **Fixed:** was incorrectly navigating to rider-prompt

### Emergency wildcard

- Purchase + `paymentStatus === 'success'` → contacts-empty
- Otherwise → rider-prompt (prepaid/B2B2C unchanged)

## Determinism matrix

| Scenario                                                 | Expected destination                                         | Status |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| R10 Continue · Safe                                      | contacts-empty                                               | ✅     |
| R10 Continue · Secure                                    | contacts-empty                                               | ✅     |
| R10 Continue · Shield                                    | contacts-empty                                               | ✅     |
| R10 Continue · Shield+                                   | contacts-empty                                               | ✅     |
| Refresh on `/journey/emergency/contacts-empty` after pay | Stays on E0                                                  | ✅     |
| Browser back from E0 after purchase                      | R10 payment success                                          | ✅     |
| Unknown emergency URL after purchase success             | contacts-empty (wildcard)                                    | ✅     |
| Prepaid/B2B2C post-auth handoff                          | Still uses `getEmergencyHandoffPath` (rider logic preserved) | ✅     |

## Files changed

| File                                 | Change                                  |
| ------------------------------------ | --------------------------------------- |
| `journey/activation-routing.ts`      | `getPurchasePostPaymentEmergencyPath()` |
| `journey/routes/PurchaseRoutes.tsx`  | R10 Continue + R10b back                |
| `journey/routes/EmergencyRoutes.tsx` | E0 back fix, wildcard redirect          |
| `journey/index.ts`                   | Export new helper                       |

## R10b back (related)

- Header back → order summary
- R09 → R10b no longer uses `replace` (browser back works)

## Remaining drift

- Rider flow still reachable from prepaid/B2B2C via `getEmergencyHandoffPath`
- Deep-link to `/journey/emergency/rider-prompt` before payment not blocked (out of sprint scope)

## Manual test plan

1. Complete purchase with each plan tier → R10 → Continue → verify `/journey/emergency/contacts-empty`
2. Refresh on contacts-empty → still E0
3. Back from E0 → R10 success
4. Shield+ failed payment → R10b → back → order summary
5. Repeat flow 3× with session restore (localStorage journey state)
