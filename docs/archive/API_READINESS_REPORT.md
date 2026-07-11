# API Readiness Report

**Date:** 2026-06-20  
**Scope:** Every screen's data layer — can real APIs be connected with only data wiring (no UI refactor)?  
**Goal:** Identify which mock services are cleanly swappable vs. which require structural changes before API integration.

---

## Summary Table

| Service | File / Function | Status | Work Needed |
|---------|----------------|--------|-------------|
| Mobile validation | `auth-flow.validation.ts :: isValidMobile()` | COUPLED | Replace hardcoded `=== '9999999999'` with format check; no UI change |
| OTP verification | `auth-flow.validation.ts` + 3 route files | COUPLED | Extract async `verifyOtp(mobile, otp)` service; refactor 3 `handleVerify` to async |
| Vahan vehicle lookup | `vahan-demo.ts :: fetchVahanDetails()` | **SWAPPABLE** | Replace function body with `fetch()` to real Vahan API |
| Plan data | `purchase-plans.ts :: PURCHASE_PLANS` constant | COUPLED | Add async `fetchPlans()` + loading/error states on R06 |
| Payment initiation + outcome | `purchase-payment-demo.ts` + `PurchaseRoutes.tsx R09Route` | COUPLED | Extract payment service; wire gateway callback instead of timeout |
| Emergency submission | No function — session-only writes | COUPLED | Add new `submitEmergencyContacts()` service + async step after E5 |
| PWA vehicle lookup | `vahan-demo.ts :: fetchVahanDetails()` | **SWAPPABLE** | Same as Vahan above |
| Prepaid entitlement | `fetch-landing-entitlement.ts :: fetchLandingEntitlement()` | **SWAPPABLE** | Replace `loader()` inside with real `fetch()` |
| B2B2C entitlement | Same `fetchLandingEntitlement()` pattern | **SWAPPABLE** | Same |

---

## 1. Mobile Validation

**File:** `apps/qr/src/features/shared-auth/auth-flow/auth-flow.validation.ts`

**Current behavior:** `isValidMobile(value)` returns `normalizeMobile(value) === '9999999999'`. Only one phone number is "valid" in the entire demo.

**API integration path:**
1. Replace `isValidMobile()` with standard 10-digit Indian mobile format check: `/^[6-9]\d{9}$/`
2. No UI change needed — the validation is called inside the route's `onMobileSubmit` handler

**Status: COUPLED** (trivial fix — no UI refactor)

---

## 2. OTP Verification

**Files:**
- `auth-flow.validation.ts :: isValidOtp()` — hardcoded `value === '123456'`
- `journey/routes/AuthRoutes.tsx :: handleVerify()` — calls `isValidOtp` directly
- `journey/routes/EmergencyRoutes.tsx :: verifyOtp()` — inline mock
- `features/post-activation-pwa/routes/pwa-shared-routes.tsx :: handleVerify()` — inline mock

**Current behavior:** Synchronous string compare. No network call.

**API integration path:**
1. Create `verifyOtp(mobile: string, otp: string): Promise<OtpVerifyResult>` in a new auth service file
2. Refactor all three `handleVerify` callers to `async/await` this service
3. Add error states for network failures (already have `otpState = 'network-error'` UI state — just needs wiring)

**Status: COUPLED** — requires extraction into a shared service and 3-file refactor. No UI component changes needed.

**Note:** The `otpState = 'network-error'` and `'resend-failed'` states already exist in the UI — API integration only needs to set these states correctly.

---

## 3. Vahan Vehicle Lookup (Purchase + PWA)

**File:** `apps/qr/src/features/qr-purchase/data/vahan-demo.ts :: fetchVahanDetails(plate: string)`

**Current behavior:** Waits 3 seconds (simulated), then returns `demoVehicleFields` for `MH 12 AB 3456`, error for `MH 12 AB 0000`, not-found for any other input.

**API integration path:**
```typescript
// Replace the function body:
export async function fetchVahanDetails(plate: string): Promise<VahanFetchResult> {
  const response = await fetch(`/api/vahan/lookup?plate=${encodeURIComponent(plate)}`);
  if (!response.ok) return { status: 'error' };
  const data = await response.json();
  return data.found ? { status: 'success', fields: data.fields } : { status: 'not-found' };
}
```

**Status: SWAPPABLE** — callers use `await fetchVahanDetails(plate)`. Replace function body only.

**Callers:**
- `PurchaseRoutes.tsx :: R04Route` (purchase flow)
- `pwa-park-me-routes.tsx :: PwaParkMeLookingUpRoute` (PWA Park Me)

---

## 4. Plan Data

**File:** `apps/qr/src/features/qr-purchase/data/purchase-plans.ts`

**Current behavior:** `PURCHASE_PLANS` is a static in-file constant array. `getPurchasePlan(id)` is a synchronous lookup. R06 (`ChoosePlanScreen`) imports and renders this directly.

**API integration path requires UI changes:**
1. Create `usePlanData()` hook returning `{ plans, loading, error }`
2. Add loading skeleton to R06 (`PartnerActivationCardSkeleton` pattern already exists for prepaid — reuse)
3. Add error state to R06
4. R06Route must use the hook instead of the static constant

**Status: COUPLED** — UI changes required on R06 to add loading/error states.

---

## 5. Payment Processing

**Files:**
- `apps/qr/src/features/qr-purchase/data/purchase-payment-demo.ts :: getDemoPaymentOutcome(planId)` — maps plan to outcome
- `journey/routes/PurchaseRoutes.tsx :: R09Route` — inline `useEffect` with `setTimeout` driving the outcome

**Current behavior:** `setTimeout(PAYMENT_PROCESSING_MS)` fires, then calls `getDemoPaymentOutcome(planId)` to determine success/failed/unconfirmed/confirming. Routes accordingly.

**API integration path:**
1. Extract payment initiation into a `startPayment(planId, amount)` async function
2. Replace the `setTimeout` in R09Route with `await startPayment(...)` + gateway webhook/callback
3. Map gateway result codes to existing `paymentStatus` states (success/failed/unconfirmed/confirming)
4. Keep the R09 UI unchanged — it already handles all outcome states

**Status: COUPLED** — requires service extraction. R09 UI does not need changes (all outcome states exist).

**Note:** R08 "Pay" CTA will need a brief loading/disabled state when real payment initiation adds latency (currently navigates synchronously to R09).

---

## 6. Emergency Submission

**Current behavior:** Emergency contacts and riders are stored in `journeySession.emergency` via `patchEmergency()`. `E5ContactsSummaryRoute.onContinue()` navigates to `/journey/completed` without any API call.

**No submission function exists.**

**API integration path:**
1. Create `submitEmergencySetup(session: JourneySession): Promise<EmergencySetupResult>` in a new service file
2. Add an intermediate "submitting" step between E5 and `/journey/completed`
3. E5Route's `onContinue` becomes: show loading → call service → on success navigate to completed → on failure show retry

**Status: COUPLED** — new service + new UI loading/error step required. The `/journey/completed` screen itself needs no changes.

---

## 7. Prepaid + B2B2C Entitlement

**File:** `apps/qr/src/features/b2b-shared/fetch-landing-entitlement.ts :: fetchLandingEntitlement(loader, options)`

**Current behavior:** Wraps any `loader()` with a fake 2-second delay. Supports `?demo=error` query override. `useWelcomeLanding()` hook calls it with `getDemoPrepaidLandingEntitlement` (static object).

**API integration path:**
```typescript
// Replace loader call in fetchLandingEntitlement:
const loader = async () => {
  const res = await fetch(`/api/entitlement/${partnerId}`);
  return res.json() as LandingEntitlement;
};
```

**Status: SWAPPABLE** — `fetchLandingEntitlement` already has the async/error/ok shape. Replace the inner `loader()` call. `useWelcomeLanding` hook and all screen components need no changes.

---

## 8. PWA Authentication (Park Me)

**File:** `pwa-shared-routes.tsx :: handleVerify()` (same OTP mock as auth flow)

**API integration path:** Same as §2 — extract into shared `verifyOtp()` service. The PWA caller is a third location that needs the same refactor.

**Status: COUPLED** (same as OTP above)

---

## 9. API Endpoint Checklist

When ready to wire real APIs, these endpoints are required:

| API | Method | Consumer | Priority |
|-----|--------|----------|----------|
| `/api/auth/send-otp?mobile=…` | POST | A1 Mobile submit | P0 |
| `/api/auth/verify-otp` | POST | A2 OTP submit, E1–E3 OTP, PWA verify | P0 |
| `/api/vahan/lookup?plate=…` | GET | R04 fetching, PWA Park Me lookup | P0 |
| `/api/plans?vehicleType=…` | GET | R06 plan selection | P0 |
| `/api/payment/initiate` | POST | R09 payment processing | P0 |
| `/api/payment/status/:id` | GET | R09b / R10c status check | P0 |
| `/api/emergency/submit` | POST | E5 contacts summary continue | P0 |
| `/api/entitlement/:partnerId` | GET | Prepaid/B2B2C welcome | P0 |
| `/api/pwa/park-me/submit` | POST | PWA Park Me status resolved | P1 |
| `/api/pwa/sos/send` | POST | SOS sending | P1 |

---

## 10. Verdict

**3 services SWAPPABLE (no UI work):**
- Vahan lookup (purchase + PWA Park Me)
- Prepaid/B2B2C entitlement

**6 services COUPLED (require structural changes before API integration):**
- Mobile validation (trivial — one-line replace, no UI)
- OTP verification (extract shared service, 3-file refactor)
- Plan data (add loading/error states to R06)
- Payment processing (extract service, add R08 CTA loading state)
- Emergency submission (new async step between E5 and completed)
- PWA Park Me submission (no submission layer yet)

**Total estimated API integration work:** ~2–3 sprint days. All UI components are ready; the integration work is service extraction + state wiring, not UI redesign.
