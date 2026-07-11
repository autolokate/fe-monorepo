# React Architecture Signoff

**Date:** 2026-06-17  
**App:** `apps/onboarding`  
**Verdict:** **PASS** (with documented large-file and effect-count notes)

---

## Provider Architecture

Verified in `JourneyOrchestrator.tsx` and `AutolokateRootProvider.tsx`:

```tsx
// JourneyOrchestrator.tsx — both segments share root provider
<AutolokateRootProvider>
  <PwaAppShell>
    <Routes>
      <Route path="/pwa/scan/*" element={<PwaScanRoutes />} />
      <Route path="*" element={<JourneyRoutes />} />
    </Routes>
  </PwaAppShell>
</AutolokateRootProvider>
```

```tsx
// AutolokateRootProvider.tsx
<JourneyProvider>
  <PwaScanProvider>{children}</PwaScanProvider>
</JourneyProvider>
```

| Provider | Scope | Storage key |
|----------|-------|-------------|
| `JourneyProvider` | Journey session, auth, purchase, emergency | `al-journey-v1` (sessionStorage) |
| `PwaScanProvider` | Post-activation scan session | `al-pwa-scan-v1` |

**No provider architecture changes made.**

---

## Context Usage

| Hook | Provider | Misuse check |
|------|----------|--------------|
| `useJourney()` | `JourneyProvider` | Used in journey routes/screens only |
| `useEmergencySession()` | Emergency sub-context | Patches via `patchEmergency` — single source |
| `usePwaScan()` | `PwaScanProvider` | PWA routes only |

No duplicated journey state found outside providers.

---

## Routing Composition

Route modules own screen wiring (intentional pattern):

| Module | Lines | `useEffect` count |
|--------|------:|------------------:|
| `EmergencyRoutes.tsx` | 918 | 7 |
| `PurchaseRoutes.tsx` | 861 | 18 |
| `pwa-sos-routes.tsx` | 749 | 10 |
| `AuthRoutes.tsx` | 403 | 7 |

Effects reviewed for necessity — majority are navigation guards, payment timers, geolocation, and session restore. No setState-in-render patterns found.

---

## Memoization

| Pattern | Usage |
|---------|-------|
| `useMemo` | Plate formatting (`JourneyCompletedScreen`), journey context value |
| `useCallback` | Journey context setters, emergency patch handlers |
| `React.memo` | Used in `@autolokate/ui` primitives |

No excessive memoization anti-patterns identified.

---

## Rerender / Stale Closure Risks

| Area | Assessment |
|------|------------|
| Emergency contact save timers | `setTimeout` cleared on unmount in E3/E4 routes |
| Purchase payment polling | Guards use refs + `redirectIfPaymentSucceeded` |
| PWA geolocation | `use-geolocation.ts` — stable deps after prior hardening pass |
| Rider skip | Synchronous state patch + navigate — no stale closure |

**Fix this pass:** Removed unused `selectedFlow` destructure in `E5Route` (lint + dead binding).

---

## Component Ownership

| Layer | Responsibility |
|-------|----------------|
| `@autolokate/ui` | Buttons, fields, OTP, chips, cards, sheets |
| `@autolokate/icons` | Iconography |
| `apps/onboarding/components/compositions/` | Flow-specific layout shells |
| `apps/onboarding/features/*/screens/` | Screen compositions |

No duplicate primitive UI components in app layer.

---

## Prop Drilling

Flow shells (`AuthStepShell`, `FlowStepShell`, `WelcomeActivationShell`) accept props for navigation callbacks — appropriate. Shared session data flows through context, not deep prop chains.

---

## Dev-Only Surface

`ScreenDevApp.tsx` (1017 lines) — dev/capture harness only; not in production route graph.

---

## Signoff Checklist

- [x] Provider nesting unchanged
- [x] No duplicated session state
- [x] Route graph unchanged
- [x] Large route files documented and justified
- [x] No unnecessary effects added
- [x] Lint-clean after unused var fix

**Signed:** Engineering hardening pass 2026-06-17
