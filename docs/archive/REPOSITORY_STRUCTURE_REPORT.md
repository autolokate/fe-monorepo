# Repository Structure Report

**Date:** 2026-06-20

---

## Target Structure — Verified ✅

```
apps/qr/src/
├── app/                    # App bootstrap
├── components/
│   ├── compositions/       # Domain-specific reusable UI
│   ├── flow-step-shell/    # Journey step chrome
│   └── auth-step-shell/    # Auth step chrome
├── dev/                    # ScreenDevApp (dev preview only)
├── features/               # Feature-owned modules
│   ├── emergency/          # screens · hooks · data · types
│   ├── post-activation-pwa/
│   ├── qr-purchase/
│   ├── qr-prepaid/
│   ├── qr-b2b2c/
│   ├── shared-auth/
│   ├── shared-legal/
│   └── purchase-activation/  # demo-data + deprecated dev screens
├── flow/                   # Registry config (metadata)
├── journey/                # Orchestrator · routes · guards · session
├── router/                 # Route schema catalog
├── shared/                 # NEW — cross-feature utilities
│   └── format-mobile.ts
├── styles/                 # Global CSS
└── types/                  # App-level types

packages/
├── design-system/          # Tokens
├── icons/                  # Icon glyphs
├── ui/                     # Core components
└── utils/                  # Reserved for API layer
```

---

## Feature Ownership ✅

Each feature owns:

- `screens/` — route-mounted components
- `data/` — demo data + domain helpers
- `types.ts` — feature types
- Route files live in `journey/routes/` or `features/*/routes/`

No mixed-responsibility dumping grounds after cleanup.

---

## Removed Structure

| Removed                                   | Was                   |
| ----------------------------------------- | --------------------- |
| `features/qr-activation/`                 | Dead QR scan feature  |
| `features/qr-purchase/screens/p01–p06/`   | Legacy purchase phase |
| `features/qr-purchase/screens/r14–r15/`   | Archived screens      |
| `components/compositions/language-*`      | Unwired experiments   |
| `components/compositions/permission-row/` | R14-only              |

---

## New Structure

| Added           | Purpose                                 |
| --------------- | --------------------------------------- |
| `src/shared/`   | Cross-feature utilities (format-mobile) |
| `@/` path alias | Clean imports from src root             |

---

## Cohesive Large Files (retained)

| File                  | Lines | Justification                            |
| --------------------- | ----: | ---------------------------------------- |
| `PurchaseRoutes.tsx`  |  ~861 | Route orchestration + guards             |
| `EmergencyRoutes.tsx` |  ~861 | Multi-path emergency graph               |
| `ScreenDevApp.tsx`    |  ~930 | Dev preview harness (reduced from ~1043) |

Not split — readable and maintainable per user guidance.

---

## Verdict

**PASS** — Predictable feature-owned structure. Dead folders removed. Shared utilities extracted to `src/shared/`.
