# Emergency Blank Screen — Root Cause Audit

**Date:** 2026-06-18  
**Issue:** R10 Payment Success → Continue → blank screen  
**Method:** Live runtime audit (`pnpm dev` @ `http://127.0.0.1:5173`, browser CDP + snapshots)  
**Scope:** Audit only — no code changes

---

## Executive summary

**Root cause:** `EmergencyRoutes` registers child `<Route>` paths as **absolute URLs** (`/journey/emergency/rider-prompt`) inside a **descendant** `<Routes>` tree mounted under parent `/journey/emergency/*`. React Router v7 matches descendant routes against the **remaining pathname segment** (`rider-prompt`), not the full URL. **No child route ever matches → `<Routes>` renders `null` → blank page.**

The R10 handoff **does navigate correctly**. The blank screen is **not** caused by missing `onContinue`, guards, context, or session clearing. It is a **nested route configuration bug** that affects **all plans**.

---

## 1. Actual URL after R10 Continue

### Runtime test (seeded journey session, auth complete, `selectedFlow: purchase`)

| Plan       | R10 Continue → `window.location.pathname` | Handoff target (expected)              |
| ---------- | ----------------------------------------- | -------------------------------------- |
| **Safe**   | `/journey/emergency/contacts-empty`       | ✅ Correct (`getEmergencyHandoffPath`) |
| **Secure** | `/journey/emergency/rider-prompt`         | ✅ Correct                             |

**Logged values (browser CDP):**

```javascript
// Safe — after R10 Continue click
window.location.pathname;
// → "/journey/emergency/contacts-empty"

// Secure — after R10 Continue click
window.location.pathname;
// → "/journey/emergency/rider-prompt"
```

**Shield / Shield+** would follow the same Secure pattern (`rider-prompt`) per `getEmergencyHandoffPath()` — the route-matching failure is plan-agnostic.

---

## 2. Route registration audit

### BrowserRouter tree (verified in code + runtime)

```
BrowserRouter
└── JourneyProvider
    └── JourneyRoutes
        ├── /journey/purchase/*  → PurchaseActivationRoute → PurchaseRoutes  ✅ WORKS
        └── /journey/emergency/* → EmergencyActivationRoute → EmergencyRoutes ❌ BLANK
```

### Parent route — exists and matches

```79:79:apps/qr/src/journey/routes/JourneyRoutes.tsx
        <Route path="/journey/emergency/*" element={<EmergencyActivationRoute />} />
```

Runtime: URL stays at `/journey/emergency/...` (no bounce to auth or `*` fallback).

### Guards — pass (not the cause)

`EmergencyActivationRoute` wraps:

1. `RequireAuthCompleted` — redirects to auth if incomplete
2. `RequireSelectedFlow` — redirects if no `selectedFlow`

Runtime with seeded `authStatus: 'AUTH_COMPLETED'` + `selectedFlow: 'purchase'`: **no guard redirect**.

### Child routes — registered but **never match**

```660:676:apps/qr/src/journey/routes/EmergencyRoutes.tsx
export function EmergencyRoutes() {
  return (
    <EmergencySegmentBootstrap>
      <Routes>
        <Route path={emergencyJourneyPaths.legacyRiderSetup} element={<LegacyRiderSetupRedirect />} />
        <Route path={emergencyJourneyPaths.riderPrompt} element={<R0Route />} />
        ...
        <Route path={emergencyJourneyPaths.contactsEmpty} element={<E0Route />} />
        ...
        <Route path={`${journeyPaths.emergency}/*`} element={<Navigate to={...} replace />} />
      </Routes>
    </EmergencySegmentBootstrap>
  );
}
```

`emergencyJourneyPaths.*` values are **full paths**, e.g.:

| Constant        | Value                               |
| --------------- | ----------------------------------- |
| `riderPrompt`   | `/journey/emergency/rider-prompt`   |
| `contactsEmpty` | `/journey/emergency/contacts-empty` |

### Working reference — PurchaseRoutes (same pattern, correct paths)

```661:672:apps/qr/src/journey/routes/PurchaseRoutes.tsx
      <Routes>
        <Route index element={<Navigate to={purchaseJourneyPaths.r03Vehicle} replace />} />
        <Route path="r03-vehicle" element={<R03Route />} />
        ...
        <Route path="r10-payment-success" element={<R10Route />} />
```

Purchase uses **relative** segments (`r10-payment-success`) under parent `/journey/purchase/*`.  
Emergency uses **absolute** paths (`/journey/emergency/rider-prompt`) under parent `/journey/emergency/*`.

**This asymmetry is the bug.**

---

## 3. Render verification

### DOM after blank screen

```javascript
document.getElementById('root').innerHTML;
// → "<div class=\"journey-frame\"></div>"

document.querySelector('.journey-frame').innerHTML;
// → ""   (empty string)
```

| Check                                 | Result                                               |
| ------------------------------------- | ---------------------------------------------------- |
| `JourneyRoutes` mounts                | ✅ `journey-frame` present                           |
| Parent `/journey/emergency/*` matches | ✅ URL unchanged                                     |
| Guards render children                | ✅ (not redirected to auth)                          |
| `EmergencySegmentBootstrap` mounts    | ✅ (no error; frame exists)                          |
| Child `<Routes>` matches a route      | ❌ **No match**                                      |
| Target screen component mounts        | ❌ `E01` / `E05` never render                        |
| Redirect loop                         | ❌ None — URL stable                                 |
| Guard redirect                        | ❌ None (with valid session)                         |
| `null` return from route              | ✅ **Implicit** — RR renders nothing when no match   |
| Missing `JourneyProvider`             | ❌ Not the issue — purchase routes work in same tree |
| React render exception                | ❌ None in console                                   |

### Screenshot

Full black/empty viewport at `/journey/emergency/contacts-empty` and `/journey/emergency/rider-prompt` with zero accessibility nodes in snapshot.

---

## 4. Per-plan runtime report

| Plan        | R10 destination URL                         | Parent matched route   | Child matched route | Rendered component                |
| ----------- | ------------------------------------------- | ---------------------- | ------------------- | --------------------------------- |
| **Safe**    | `/journey/emergency/contacts-empty`         | `/journey/emergency/*` | **none**            | **blank** (`journey-frame` empty) |
| **Secure**  | `/journey/emergency/rider-prompt`           | `/journey/emergency/*` | **none**            | **blank**                         |
| **Shield**  | `/journey/emergency/rider-prompt` (by code) | `/journey/emergency/*` | **none**            | **blank** (same mechanism)        |
| **Shield+** | `/journey/emergency/rider-prompt` (by code) | `/journey/emergency/*` | **none**            | **blank** (same mechanism)        |

**Conclusion:** Plan routing at handoff is correct. Blank screen is identical for all plans.

---

## 5. Browser console

| Error type                              | Observed          |
| --------------------------------------- | ----------------- |
| React errors                            | **None**          |
| Route warnings (e.g. no routes matched) | **None** (silent) |
| Context errors (`useJourney`)           | **None**          |
| Render exceptions                       | **None**          |

React Router v7 returns **no UI and no error** when a descendant `<Routes>` has zero matches — this presents as a blank screen.

---

## 6. JourneyProvider / session state at blank screen

After Secure R10 → Continue (still blank at `rider-prompt`):

```json
{
  "selectedFlow": "purchase",
  "authStatus": "AUTH_COMPLETED",
  "session": {
    "purchase": {
      "selectedPlanId": "secure",
      "riderCount": 1,
      "paymentStatus": "success",
      "paidAmountInr": 1948
    },
    "auth": { "otpVerified": true }
  }
}
```

| Field               | Status                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `selectedPlanId`    | ✅ Preserved                                                                                                     |
| `riderCount`        | ✅ Preserved                                                                                                     |
| `paymentStatus`     | ✅ `'success'`                                                                                                   |
| `paidAmountInr`     | ✅ Preserved                                                                                                     |
| `session.emergency` | Empty `{}` — expected before first emergency screen mounts                                                       |
| `JourneyProvider`   | ✅ Present (purchase R10 rendered correctly in same session)                                                     |
| `phase`             | Set to `'emergency'` by `EmergencySegmentBootstrap` (not externally visible; bootstrap runs when parent matches) |

**Session persistence is not the problem.**

---

## 7. Redirect chains

```
R10 Continue
  → navigate("/journey/emergency/contacts-empty")   [Safe]
  → navigate("/journey/emergency/rider-prompt")     [Secure+]
  → JourneyRoutes matches /journey/emergency/*
  → EmergencyActivationRoute (guards pass)
  → EmergencyRoutes <Routes> — NO MATCH
  → STOP (blank)
```

- No redirect to `/journey/auth/mobile`
- No redirect to `*` catch-all at JourneyRoutes level
- Catch-all inside `EmergencyRoutes` (`/journey/emergency/*`) **also fails to match** (same absolute-path bug)
- No loop

---

## 8. Why the handoff report was wrong

`EMERGENCY_HANDOFF_FIX_REPORT.md` verified:

- ✅ `onContinue` wired in `R10Route`
- ✅ `getEmergencyHandoffPath(session)` returns correct URLs
- ✅ TypeScript build passes

It did **not** run the app and confirm descendant route matching. Navigation and route registration are both "correct" at the URL/orchestration layer, but **child route `path` props are incompatible with React Router's descendant matching rules**.

---

## 9. Exact root cause

> **`EmergencyRoutes.tsx` uses absolute `path` values (`/journey/emergency/...`) in a descendant `<Routes>` component nested under `<Route path="/journey/emergency/*">`. React Router v7 matches descendant routes against the unmatched suffix (`rider-prompt`, `contacts-empty`, etc.). Absolute paths never match → zero routes → blank render.**

### Mechanism (React Router v7 descendant routes)

When parent `/journey/emergency/*` matches URL `/journey/emergency/rider-prompt`:

- Parent consumes `/journey/emergency/`
- Remaining pathname for descendant matching: **`rider-prompt`**
- Child `path="/journey/emergency/rider-prompt"` does **not** equal `rider-prompt`
- Child `path="rider-prompt"` **would** match ← what `PurchaseRoutes` does

---

## 10. Exact fix (routing only — no UI changes)

**File:** `apps/qr/src/journey/routes/EmergencyRoutes.tsx`

Change child `Route` `path` props from full `emergencyJourneyPaths.*` URLs to **relative segments**, mirroring `PurchaseRoutes`:

```tsx
<Routes>
  <Route path="rider-setup" element={<LegacyRiderSetupRedirect />} />
  <Route path="rider-prompt" element={<R0Route />} />
  <Route path="rider-mobile" element={<R1Route />} />
  <Route path="rider-otp" element={<R2Route />} />
  <Route path="rider-name" element={<R3Route />} />
  <Route path="riders-summary" element={<R4Route />} />
  <Route path="contacts-empty" element={<E0Route />} />
  <Route path="contact-mobile" element={<E1Route />} />
  <Route path="contact-otp" element={<E2Route />} />
  <Route path="contact-name" element={<E3Route />} />
  <Route path="contacts-summary" element={<E5Route />} />
  <Route path="*" element={<Navigate to={emergencyJourneyPaths.riderPrompt} replace />} />
</Routes>
```

**Keep unchanged:**

- `emergencyJourneyPaths` full URLs for `navigate()` calls throughout the app
- `getEmergencyHandoffPath(session)` return values
- All screen components (no UI edits)
- `R10Route` `onContinue` handler

### Post-fix expected runtime

| Plan    | URL after R10                       | Matched child path | Component                |
| ------- | ----------------------------------- | ------------------ | ------------------------ |
| Safe    | `/journey/emergency/contacts-empty` | `contacts-empty`   | `E05ContactsEmptyScreen` |
| Secure  | `/journey/emergency/rider-prompt`   | `rider-prompt`     | `E01RiderPromptScreen`   |
| Shield  | `/journey/emergency/rider-prompt`   | `rider-prompt`     | `E01RiderPromptScreen`   |
| Shield+ | `/journey/emergency/rider-prompt`   | `rider-prompt`     | `E01RiderPromptScreen`   |

### Verification steps after fix

1. Complete purchase → R10 → Continue for Safe and Secure
2. Confirm `window.location.pathname` unchanged (already correct)
3. Confirm `document.querySelector('.journey-frame')` contains screen headings
4. Confirm `session.purchase.selectedPlanId` still drives emergency limits

---

## Appendix — runtime evidence log

| Step | Action                                                     | URL                                     | `journey-frame` content             |
| ---- | ---------------------------------------------------------- | --------------------------------------- | ----------------------------------- |
| A    | Direct nav (auth incomplete)                               | `/journey/auth/mobile`                  | Auth mobile screen (guard redirect) |
| B    | Seed session + nav `/journey/emergency/contacts-empty`     | `/journey/emergency/contacts-empty`     | **empty**                           |
| C    | Seed session + R10 Safe + Continue                         | `/journey/emergency/contacts-empty`     | **empty**                           |
| D    | Seed session + nav `/journey/emergency/rider-prompt`       | `/journey/emergency/rider-prompt`       | **empty**                           |
| E    | Seed session + R10 Secure + Continue                       | `/journey/emergency/rider-prompt`       | **empty**                           |
| F    | Seed session + nav `/journey/purchase/r10-payment-success` | `/journey/purchase/r10-payment-success` | Payment success screen ✅           |

---

_Audit complete. Handoff navigation works; emergency child route paths do not match at runtime._
