# Build and Navigation Recovery Report (Sprint 4.1)

**Date:** 2026-06-17  
**Reference:** [`CONSUMER_APP_FINAL_SIGNOFF.md`](./CONSUMER_APP_FINAL_SIGNOFF.md) P0 blockers  
**Scope:** `@autolokate/qr` — build recovery + emergency back-navigation fix

---

## Summary

All Sprint 4 **P0 blockers addressed in scope** are resolved:

| P0 | Status |
|----|--------|
| P0-1 Production build broken (missing CSS) | ✅ Fixed |
| P0-2 Emergency back-nav → purchase R10 for prepaid/B2B2C | ✅ Fixed |
| P0-3 Demo-only backends | ⏸ Out of scope (requires API integration) |

---

## Broken imports fixed

| File | Issue | Fix |
|------|-------|-----|
| `apps/qr/src/components/flow-step-shell/FlowStepShell.tsx` | Imported deleted `../purchase-step-shell/purchase-step-shell.css` | Removed import; styles already covered by `flow-step-shell.css` + `step-shell-chrome.css` |

**Note:** The user-reported `step-shell-chrome.css` error was a downstream Vite failure. The file exists at `apps/qr/src/components/step-shell-chrome/step-shell-chrome.css` and is correctly referenced from:

- `FlowStepShell.tsx`
- `AuthStepShell.tsx`
- `PurchaseStatusShell.tsx`
- `WelcomeActivationShell.tsx`
- `L1PrivacyPolicyScreen.tsx`
- `L2TermsConditionsScreen.tsx`

---

## CSS / style import audit

Full scan of `apps/qr/src` for style imports:

| Import type | Count | Broken |
|-------------|-------|--------|
| `.css` (relative) | 48 | **0** (after fix) |
| `.scss` | 0 | — |
| `.module.css` | 0 | — |
| `@autolokate/design-system/theme.css` | 1 (`main.tsx`) | ✅ |

No remaining references to deleted shell directories (`onboarding-step-shell/`, `purchase-step-shell/`).

---

## Deleted references removed

| Removed artifact (Sprint 3) | Remaining references after 4.1 |
|-----------------------------|--------------------------------|
| `purchase-step-shell/purchase-step-shell.css` | **0** |
| `purchase-step-shell/PurchaseStepShell.tsx` | **0** |
| `onboarding-step-shell/*` | **0** |
| `AuthFlowApp`, `HomeScreen`, `QrScanRoute`, placeholders | **0** in `src/` |

Barrel exports (`index.ts`, `compositions/index.ts`, `qr-purchase/screens/index.ts`) were already cleaned in Sprint 3; re-audit found no stale exports.

---

## Navigation fix — emergency back

### Problem

`EmergencyRoutes.tsx` hardcoded back navigation to purchase R10:

```typescript
void navigate(purchaseJourneyPaths.r10PaymentSuccess);
```

Prepaid and B2B2C users never complete purchase payment — back trapped them outside their flow (guards rejected or wrong screen).

### Solution

Added flow-aware helper in `activation-routing.ts`:

```typescript
getEmergencyFlowBackPath(flow, session)
```

| Flow | Back target from R0 / E0 (fallback) |
|------|-------------------------------------|
| **Purchase** | `/journey/purchase/r10-payment-success` |
| **Prepaid** | `/journey/prepaid/welcome` |
| **B2B2C** (no riders) | `/journey/b2b2c/welcome` |
| **B2B2C** (riderCount > 0) | `/journey/b2b2c/welcome/plan-rider` |
| **Unknown / null flow** | `/journey` (flow entry) |

### Files changed

| File | Change |
|------|--------|
| `journey/activation-routing.ts` | Added `getEmergencyFlowBackPath()` |
| `journey/routes/EmergencyRoutes.tsx` | R0 `onBack` + E0 `onBack` fallback use helper; removed `purchaseJourneyPaths` import |

E0 internal back paths (rider prompt, riders summary) unchanged — still within emergency segment.

---

## Navigation verification

### Purchase ✅

| Step | Path | Guard / handoff | Verified |
|------|------|-----------------|----------|
| Flow entry | `/journey` → auth | `selectActivationFlow('purchase')` | ✅ Code review |
| Auth | `/journey/auth/*` | A1→A2→A3 guards | ✅ |
| Activation | R03–R10c | `RequireAuthCompleted` + `RequireSelectedFlowMatch` | ✅ |
| Emergency entry | R10 Continue → emergency | `getEmergencyHandoffPath(session)` | ✅ |
| Emergency back (R0) | → R10 success | `getEmergencyFlowBackPath('purchase')` | ✅ |

### Prepaid ✅

| Step | Path | Verified |
|------|------|----------|
| Welcome | `/journey/prepaid/welcome` | ✅ |
| Auth → emergency | Post-auth `getEmergencyHandoffPath` | ✅ |
| Emergency back (R0 / E0) | → `/journey/prepaid/welcome` | ✅ **Fixed** |
| Does **not** route to purchase R10 | — | ✅ |

### B2B2C ✅

| Step | Path | Verified |
|------|------|----------|
| Welcome | `/journey/b2b2c/welcome` | ✅ |
| Plan + rider variant | `/journey/b2b2c/welcome/plan-rider` | ✅ Back when `riderCount > 0` |
| Auth → emergency | Post-auth handoff | ✅ |
| Emergency back (R0 / E0) | → welcome (flow-appropriate) | ✅ **Fixed** |
| Does **not** route to purchase R10 | — | ✅ |

### Emergency ✅

| Step | Path | Verified |
|------|------|----------|
| R0–R4 rider sub-flow | `/journey/emergency/rider-*` | ✅ |
| E0–E5 contact sub-flow | `/journey/emergency/contact-*` | ✅ |
| Legacy redirect | `rider-setup` → `rider-prompt` | ✅ |
| Back stays in current journey | Flow-aware helper | ✅ **Fixed** |

---

## Build status

Commands run **2026-06-17** after fixes:

| Command | Result |
|---------|--------|
| `pnpm --filter @autolokate/qr lint` | ✅ **Pass** (0 errors, 0 warnings) |
| `pnpm --filter @autolokate/qr build` | ✅ **Pass** |
| `pnpm build` (turbo monorepo) | ✅ **Pass** (12/12 tasks) |

### TypeScript

- `tsc -p tsconfig.json` — ✅ **0 errors** (via build)

### Vite

- Production bundle — ✅ **built in ~774ms**
- **407 modules** transformed
- Output: `dist/assets/index-Cd4OXRNi.js` (411 KB / 120 KB gzip)

---

## Success criteria

| Criterion | Status |
|-----------|--------|
| `pnpm build` pass | ✅ |
| `pnpm lint` pass | ✅ |
| No TS errors | ✅ |
| No Vite errors (onboarding) | ✅ |
| No broken CSS imports | ✅ |
| Emergency back-nav inside current journey | ✅ |

---

## Remaining (not in Sprint 4.1 scope)

From signoff P1/P2 — unchanged:

- Demo auth/payment/Vahan/OTP backends (P0-3)
- Prepaid PR01–PR03 unmounted
- B2B2C offer-select + confirmation missing
- Purchase emergency deep-link without payment guard
- Session persistence on tab close

---

**Sprint 4.1 — Build and Navigation Recovery: complete.**
