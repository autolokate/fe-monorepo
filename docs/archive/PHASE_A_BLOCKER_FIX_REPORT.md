# Phase A Blocker Fix Report

**Date:** 2026-06-17  
**Scope:** Stabilize Phase A — progress, routing, Figma parity audit  
**No new screens · No Phase B**

---

## 1. Progress fix report

### Problem

- **A3 Name** had `hideProgress` — no step indicator after OTP.
- Mobile (1) and OTP (2) used hardcoded `AUTH_MOBILE_STEP` / `AUTH_OTP_STEP` constants in screen files.
- `AlStepProgress` had `showMeta={false}` everywhere — no “Step X of 5” label.

### Required (Figma)

| Route | Step | Label |
|-------|------|-------|
| `/journey/auth/mobile` | 1 | Step 1 of 5 |
| `/journey/auth/otp` | 2 | Step 2 of 5 |
| `/journey/auth/vehicle-owner` | 3 | Step 3 of 5 |

### Fix

**Route-driven progress registry** (single source of truth):

| File | Role |
|------|------|
| `journey/progress/auth-route-progress.ts` | Path → `{ step, total, showProgress, showMeta }` |
| `journey/progress/purchase-route-progress.ts` | Purchase paths → `null` (no bar per Figma R03–R05) |
| `journey/progress/useRouteProgress.ts` | `useAuthRouteProgress()` / `usePurchaseRouteProgress()` |

**Screens updated:**

- `A1MobileScreen` — `useAuthRouteProgress()` → `AuthStepShell progressConfig`
- `A2OtpScreen` — same
- `A3VehicleOwnerScreen` — removed `hideProgress`; shows **Step 3 of 5** with **3 filled segments**

**Shell updated:**

- `AuthStepShell` accepts `progressConfig` from route registry
- Renders `AlStepProgress` with `label="Step {n} of {total}"`, `showMeta={true}`, `showCount={false}`
- Deprecated hardcoded `step` + `hideProgress` fallback kept for legacy callers only

**Purchase audit:**

| Screen | Progress | Source |
|--------|----------|--------|
| R03, R04, R04b, R05 | Hidden | `purchaseRouteProgressByPath` → `null` |
| P01–P06 | FlowStepShell (6-step) | Unchanged — Phase B scope |

**Deprecated:** `features/shared-auth/constants.ts` step constants re-export registry; screens no longer import them.

---

## 2. Route bug root cause

### Symptom

```
/journey/purchase/r03-vehicle/r04-fetching/r03-vehicle/r03-vehicle/...
```

### Root cause

**Relative navigation inside nested `<Routes>`** under `/journey/purchase/*`.

`useNavigate('r04-fetching')` from `/journey/purchase/r03-vehicle` resolves to:

```
/journey/purchase/r03-vehicle/r04-fetching   ← appended, not replaced
```

Each subsequent relative `navigate('r03-vehicle')` or catch-all `<Navigate to="r03-vehicle" />` **appended another segment** instead of resetting to the purchase root.

### Contributing factors

| Factor | Impact |
|--------|--------|
| Relative `navigate('…')` in `PurchaseRoutes.tsx` | Path stacking |
| Relative `<Navigate to="r03-vehicle" />` on index + catch-all | Loop amplification |
| Nested route context | React Router resolves relative to current URL tail |

### Not the cause

- Route guards (`RequireAuthCompleted`) — path-neutral
- `useEffect` redirect logic — correct targets, wrong path resolution
- Vahan fetch returning `not-found` — triggers redirect once; stacking caused the loop

---

## 3. Route fix validation

### Fix applied

All purchase navigation now uses **absolute paths** from `purchaseJourneyPaths`:

```ts
navigate(purchaseJourneyPaths.r04Fetching)      // /journey/purchase/r04-fetching
navigate(purchaseJourneyPaths.r03Vehicle, { replace: true })
navigate(purchaseJourneyPaths.r05Confirm, { replace: true })
// … all P01–P06 routes likewise
```

Index + catch-all:

```tsx
<Navigate to={purchaseJourneyPaths.r03Vehicle} replace />
```

`R04Route` adds `fetchStarted` ref to prevent double-fetch on Strict Mode remount.

### Route trace — happy path

```
GET  /journey/auth/mobile
→    /journey/auth/otp
→    /journey/auth/vehicle-owner          (Step 3 of 5)
→    /journey/purchase/r03-vehicle
→    /journey/purchase/r04-fetching      (replace-style navigation)
→    /journey/purchase/r05-confirm        (replace: true)
```

**URL depth:** always 4 segments max under purchase (`/journey/purchase/{screen}`).

### Route trace — not found

```
/journey/purchase/r03-vehicle
→ /journey/purchase/r04-fetching
→ /journey/purchase/r03-vehicle   (replace: true, error state on R03)
```

### Route trace — fetch failed

```
/journey/purchase/r03-vehicle
→ /journey/purchase/r04-fetching
→ /journey/purchase/r04b-fetch-failed   (replace: true)
→ /journey/purchase/r04-fetching        (Try again, absolute)
```

### Validation checklist

| Check | Status |
|-------|--------|
| No duplicate path segments | ✅ |
| No redirect chains > 1 hop | ✅ |
| R03 → R04 → R05 linear | ✅ |
| Auth uses absolute paths already | ✅ (unchanged) |
| Build passes | ✅ |

---

## 4. Figma parity audit

Compared implementation against Figma nodes **170:25** (R03), **179:25** (R04), **170:71** (R05).

### R03 · Vehicle number — `170:25`

| Area | Figma spec | Before | After fix | Priority |
|------|------------|--------|-----------|----------|
| Title / body copy | Add your vehicle / Type your plate… | ✅ | ✅ | — |
| Plate input 62px, r12, `#E4E4E8` | ✅ | ✅ | — |
| Column gap 20px | Partial (nested 20+20) | ✅ flat stack | **Fixed** | P1 |
| Trust row alignment | hug / start | centered | start | **Fixed** | P1 |
| Vahan chips label + 6 pills | ✅ | ✅ | — |
| ctaHelper + disabled CTA | ✅ | ✅ | — |
| R03b error Body 16/24 amber | ✅ | ✅ | — |
| Progress bar | None | hidden | hidden | ✅ |
| Chip icon stroke (10×7 vector) | stroke icon | circle-check 14px | circle-check | **Open** | P2 |

### R04 · Fetching — `179:25`

| Area | Figma spec | Before | After fix | Priority |
|------|------------|--------|-----------|----------|
| Spinner 60×60 `#1FA24A` solid | static ellipse | pulse animation | static | **Fixed** | P1 |
| Center block y=180, gap 18, w=330 | ~180px padding | ~180px | ✅ | — |
| Display 36/44 centered title | h1 token | ✅ | — |
| Body 16/24 muted centered | ✅ | ✅ | — |
| No back / no CTA | ✅ | ✅ | — |
| Progress bar | None | hidden | hidden | ✅ |

### R05 · Confirm vehicle — `170:71`

| Area | Figma spec | Before | After fix | Priority |
|------|------------|--------|-----------|----------|
| Title / body / CTA Looks right | ✅ | ✅ | — |
| RC card bg `#1A1A1A` flat | gradient dark | flat `#1A1A1A` | **Fixed** | P0 |
| RC border `#4A4A4A` 1px | outline token | `#4A4A4A` | **Fixed** | P1 |
| Car watermark 5% opacity | missing | added | **Fixed** | P1 |
| Field grid gap 13px | token 13px | ✅ | — |
| Plate 29px bold | token | ✅ | — |
| Verified chip | ✅ | ✅ | — |
| Progress bar | None | hidden | hidden | ✅ |

---

## Screenshot diff checklist (P0 / P1 / P2)

### P0 — Must fix before Phase B sign-off

| # | Screen | Mismatch | Status |
|---|--------|----------|--------|
| P0-1 | All purchase | Infinite URL nesting / route loop | **Fixed** |
| P0-2 | A3 Name | Missing Step 3 of 5 progress | **Fixed** |
| P0-3 | R05 | RC card background gradient vs flat `#1A1A1A` | **Fixed** |

### P1 — Visible parity gaps (fix or accept)

| # | Screen | Mismatch | Status |
|---|--------|----------|--------|
| P1-1 | R03 | Trust row centered vs Figma start-aligned | **Fixed** |
| P1-2 | R03 | Double 20px gap around plate error | **Fixed** |
| P1-3 | R04 | Spinner pulse vs static Figma ellipse | **Fixed** |
| P1-4 | R05 | Missing car watermark at 5% opacity | **Fixed** |
| P1-5 | R05 | RC border color `#4A4A4A` | **Fixed** |
| P1-6 | A1–A3 | “Step X of 5” meta label not shown | **Fixed** |
| P1-7 | R04b | Halo SVG vs CSS gradient approximation | **Open** |
| P1-8 | R03 | Content vertical offset vs StatusBar (y=66 in Figma) | **Open** — shell padding approximate |

### P2 — Minor / acceptable for Phase A

| # | Screen | Mismatch | Status |
|---|--------|----------|--------|
| P2-1 | R03 | Chip icons: stroke vectors vs `circle-check` | Open |
| P2-2 | R04b | “Enter manually” hotspot — no target frame | Open (prototype only) |
| P2-3 | Dev preview | Auth progress requires router context | Open — journey flow correct |
| P2-4 | Light theme | RC card uses light gradient; Figma frames are dark-only | Open |
| P2-5 | P01–P06 | Legacy 6-step shell vs Figma 5-step consumer journey | Phase B |

---

## 5. Remaining gaps

| Gap | Notes |
|-----|-------|
| **R04b halo** | CSS radial gradient; Figma uses SVG `579:1667` |
| **R03 vertical rhythm** | Figma content frame at y=66 from top; shell uses padding-block not exact StatusBar offset |
| **Chip stroke icons** | Figma 10×7 stroke vectors; code uses filled `circle-check` |
| **Enter manually** | Figma prototype hotspot only — no screen in section |
| **flow.config.ts registry** | Step IDs not yet synced with `authRouteProgressByPath` |
| **Dev preview progress** | `ScreenDevApp` renders auth screens outside router — progress bar absent in dev panel (journey OK) |
| **Real Vahan API** | Still mock `fetchVahanDetails` |
| **Phase B screens** | P01–P06 not Figma-aligned — out of scope |

---

## Files changed (summary)

| Area | Files |
|------|-------|
| Progress registry | `journey/progress/*`, `auth-routing.ts`, `purchase-routing.ts` |
| Auth screens | `A1MobileScreen`, `A2OtpScreen`, `A3VehicleOwnerScreen` |
| Purchase routes | `PurchaseRoutes.tsx` (absolute paths) |
| Shell | `AuthStepShell.tsx`, `auth-step-shell.css` |
| Parity | `TrustRow`, `VehicleRcCard`, `ScreenSpinner`, `purchase-vehicle.css`, R03/R05 screens |
| DS | `AlStepProgress` (`showCount`), `AlVehicleRcCard` (`watermarkIcon`) |

---

## Recommendation

**Phase A blockers (P0) are resolved.** Route loop and Name progress are fixed. Core R03/R04/R05 parity improvements landed (P1 items marked Fixed).

**Do not start Phase B** until product review of open P1-7/P1-8 and P2 items above, or explicit sign-off that remaining gaps are acceptable.

**Verify manually:**

1. Auth flow → confirm **Step 3 of 5** on Name with 3 filled segments  
2. Purchase: `MH 12 AB 3456` → confirm URL stays `/journey/purchase/r04-fetching` then `/journey/purchase/r05-confirm`  
3. Invalid plate → single redirect to `/journey/purchase/r03-vehicle` (no stacking)

---

**Build:** `packages/ui` + `apps/qr` pass.
