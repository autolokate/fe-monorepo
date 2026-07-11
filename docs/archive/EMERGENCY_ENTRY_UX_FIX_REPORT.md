# Emergency Entry UX Fix — Report

**App:** `@autolokate/qr`  
**Date:** 2026-06-18  
**Source audit:** `docs/EMERGENCY_ENTRY_FLOW_VERIFICATION.md`  
**Scope:** R0 entry loading UX + plan-aware handoff routing only  
**No changes to:** Figma copy · Emergency screen UI components · Journey architecture / route graph

---

## Executive summary

Removed the **forced 600ms loading state** on every R0 mount when purchase session already contains `selectedPlanId` and `riderCount`. Updated `getEmergencyHandoffPath()` to skip R0 when rider entitlement is zero (not only for Safe plan).

Build: `pnpm --filter @autolokate/qr build` ✅

---

## Before behavior

| Area | Behavior |
|------|----------|
| **R0 mount** | `viewState` always initialized to `'loading'` |
| **Every R0 entry** | 600ms artificial delay (`RIDER_LOAD_MS`) before `'default'` |
| **CTA** | `AlButton` spinner on “Add rider details” on every post-R10 entry |
| **Figma alignment** | Showed loading variant `713:2264` before default `375:37` on every visit |
| **Safe handoff** | R10 → E0 ✅ (plan === `safe`) |
| **Secure + riderCount 0** | R10 → R0 → brief redirect → E0 ⚠️ |
| **Secure/Shield/Shield+ + addon** | R10 → R0 (correct destination, wrong initial UX) |

---

## After behavior

| Area | Behavior |
|------|----------|
| **R0 mount (session entitlement known)** | `viewState` initializes to `'default'` when `purchase.selectedPlanId` and `purchase.riderCount` are set |
| **R0 mount (session incomplete)** | Falls back to `'loading'` + async resolve (edge / deep link) |
| **R0 retry (“Try again”)** | `loadAttempt > 0` → `'loading'` for 600ms → `'default'` or `'error'` |
| **CTA on normal entry** | Enabled immediately — no spinner flash |
| **Safe handoff** | R10 → E0 (via `shouldEnterRiderPrompt` → false) |
| **Addon plans with riders** | R10 → R0 default frame immediately |
| **Addon plans, riderCount 0** | R10 → E0 directly (no R0 flash) |

---

## Changes made

| File | Change |
|------|--------|
| `apps/qr/src/journey/activation-routing.ts` | `getEmergencyHandoffPath()` uses `shouldEnterRiderPrompt(planId, riderCount)` instead of `planId === 'safe'` only |
| `apps/qr/src/journey/routes/EmergencyRoutes.tsx` | `resolveR0InitialViewState()` + `hasRiderEntitlementInPurchaseSession()`; skip async delay when session entitlement is known and `loadAttempt === 0` |

**Unchanged:** `E01RiderPromptScreen`, `FlowStepShell`, route paths, emergency limits math, Figma copy.

---

## Plan routing matrix

`getEmergencyHandoffPath(session)` after R10 Continue:

| Plan | `riderCount` | Entitled slots | Handoff path | First screen |
|------|--------------|----------------|--------------|--------------|
| **Safe** | any | 0 | `/journey/emergency/contacts-empty` | **E0** |
| **Secure** | 0 | 0 | `/journey/emergency/contacts-empty` | **E0** |
| **Secure** | 1 | 1 | `/journey/emergency/rider-prompt` | **R0** |
| **Secure** | 2 | 2 | `/journey/emergency/rider-prompt` | **R0** |
| **Shield** | 0 | 0 | `/journey/emergency/contacts-empty` | **E0** |
| **Shield** | 1 | 1 | `/journey/emergency/rider-prompt` | **R0** |
| **Shield** | 2 | 2 | `/journey/emergency/rider-prompt` | **R0** |
| **Shield+** | 0 | 0 | `/journey/emergency/contacts-empty` | **E0** |
| **Shield+** | 1 | 1 | `/journey/emergency/rider-prompt` | **R0** |
| **Shield+** | 2 | 2 | `/journey/emergency/rider-prompt` | **R0** |

**Rules:**
- **Safe** → always E0 (no rider addon product cap).
- **Secure / Shield / Shield+** → R0 only when `riderCount > 0` and entitled slots > 0.
- **Secure / Shield / Shield+** with skipped rider cover (`riderCount: 0`) → E0 (no R0 hop).

---

## Loader behavior matrix

| Scenario | Before | After | Figma frame |
|----------|--------|-------|-------------|
| R10 → R0 (Secure, riderCount ≥ 1) | Loading 600ms → default | **Default immediately** | `375:37` |
| R10 → E0 (Safe) | N/A (never mounts R0) | E0 directly | `373:37` |
| R10 → E0 (Secure, riderCount 0) | R0 flash → redirect | **E0 directly** | `373:37` |
| R0 “Try again” after error | Loading 600ms → default/error | Loading 600ms → default/error | `713:2264` |
| R0 offline on mount | Offline, CTA disabled | Unchanged | `713:2311` |
| R0 error on mount (`riderPromptLoadFailed`) | Error | Unchanged | `713:2288` |
| Deep link / missing purchase session | Loading 600ms → default | Loading 600ms → default | `713:2264` |
| Shield + 2 riders, first visit | Loading → error (demo) | **Default immediately** (demo error only on retry) | `375:37` / `713:2288` on retry |

**Loading variant (`713:2264`) is preserved** for:
- Explicit retry (`loadAttempt > 0`)
- Session without both `selectedPlanId` and `riderCount`

**Removed** for:
- Normal post-R10 entry when purchase session is complete

---

## Runtime verification

### Static trace (code + limits)

| Check | Result |
|-------|--------|
| `shouldEnterRiderPrompt('safe', 1)` | `false` → E0 |
| `shouldEnterRiderPrompt('secure', 1)` | `true` → R0 |
| `shouldEnterRiderPrompt('secure', 0)` | `false` → E0 |
| `shouldEnterRiderPrompt('shield', 2)` | `true` → R0 |
| `shouldEnterRiderPrompt('shield-plus', 0)` | `false` → E0 |
| `hasRiderEntitlementInPurchaseSession({ selectedPlanId: 'secure', riderCount: 1 })` | `true` → initial `default` |
| `loadAttempt === 0` + entitlement known | Effect returns early, no timer |
| `loadAttempt > 0` on Try again | Effect sets `loading`, runs 600ms timer |

### Build verification

```
pnpm --filter @autolokate/qr build
✓ tsc + vite build (2026-06-18)
```

### Manual QA checklist

| # | Flow | Expected |
|---|------|----------|
| 1 | **Safe** → R10 Continue | Land **E0**; never see R0 |
| 2 | **Secure** + 1 rider → R10 Continue | Land **R0**; CTA enabled **immediately** (no spinner) |
| 3 | **Shield** + 1 rider → R10 Continue | Land **R0**; CTA enabled immediately |
| 4 | **Shield+** + 1 rider → R10 Continue | Land **R0**; CTA enabled immediately |
| 5 | **Secure** + skip rider (count 0) → R10 Continue | Land **E0** directly |
| 6 | R0 error → Try again | CTA shows **loading** spinner during retry |

---

## Out of scope (unchanged)

- R0 back target (still → R10)
- E5 back target (still → E0)
- Figma copy / screen components
- Simulated Shield+2 auto-error on first mount (deferred to retry path only)
- Native contact picker stub on E0

---

*Fix complete.*
