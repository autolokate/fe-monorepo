# Architecture Principles

**Status:** **BASELINE LOCKED** (2026-06-17)  
**Scope:** `autolokate-web` monorepo — QR + post-activation PWA

This document describes the **locked reference architecture**. Do not alter these principles without explicit architecture approval and a documented migration plan.

---

## 1. Monorepo Structure

```
autolokate-web/
├── apps/
│   ├── qr/           ← Production QR PWA (reference app)
│   ├── admin/        ← Internal admin dashboard
│   ├── website/      ← Marketing site
│   └── ui-preview/   ← Component preview harness
├── packages/
│   ├── ui/                  ← Shared UI primitives
│   ├── icons/               ← Icon set
│   ├── design-system/       ← Design tokens
│   ├── brand/               ← Brand assets
│   └── config/              ← Shared ESLint/TS config
├── docs/                    ← Active reference docs
├── docs/archive/            ← Historical reports only
└── memory/                  ← Agent memory index
```

---

## 2. Application Layers

```
apps/qr/src/
├── journey/                 ← Orchestration, routing, guards, persistence
├── features/                ← Flow-specific screens and logic
│   ├── shared-auth/
│   ├── qr-purchase/
│   ├── qr-prepaid/
│   ├── qr-b2b2c/
│   ├── emergency/
│   └── post-activation-pwa/
├── platform/                ← QR dispatch, flow entry registry, root provider
├── pwa/                     ← PWA shell, install, offline, permissions
├── components/compositions/ ← App-level layout wrappers (not primitives)
└── dev/                     ← Dev/capture harness (not in prod graph)
```

**Rule:** Primitives live in `packages/ui`. App compositions wrap primitives for flow-specific layout only.

---

## 3. Provider Architecture (Locked)

```tsx
// JourneyOrchestrator.tsx
BrowserRouter
└── AutolokateRootProvider
    ├── JourneyProvider          // al-journey-v1
    └── PwaScanProvider          // al-pwa-scan-v1
        └── PwaAppShell
            ├── /pwa/scan/*  →  PwaScanRoutes
            └── *            →  JourneyRoutes
```

| Provider | Responsibility | Storage |
|----------|----------------|---------|
| `JourneyProvider` | Auth, purchase, prepaid, B2B2C, emergency, phase | `sessionStorage` key `al-journey-v1` |
| `PwaScanProvider` | Post-activation scan, SOS, Park Me | `sessionStorage` key `al-pwa-scan-v1` |

**Locked behaviour:**

- PWA scan session is **separate** from journey purchase/emergency state
- Both segments share the **same root provider shell** (`AutolokateRootProvider`)
- Do not merge session stores without a versioned migration

---

## 4. Session & Storage Keys (Locked)

| Key | Storage | Purpose |
|-----|---------|---------|
| `al-journey-v1` | `sessionStorage` | Full journey persisted state |
| `al-selected-flow` | `localStorage` | Selected activation flow |
| `al-qr-theme` | `localStorage` | Dark/light theme |
| `al-pwa-scan-v1` | `sessionStorage` | PWA scan session |
| `al-pwa-install-dismissed-at` | `localStorage` | Install prompt dismiss |
| `al-pwa-update-dismissed-at` | `sessionStorage` | Update prompt dismiss |
| `al-pwa-photo-diagnostics` | `sessionStorage` | Photo capture diagnostics |

**Schema sources:**

- `JourneySession` → `apps/qr/src/journey/types.ts`
- `EmergencySession` → `apps/qr/src/features/emergency/types.ts`
- `PwaScanSession` → `apps/qr/src/features/post-activation-pwa/context/`

Any schema change requires:

1. New storage key version (e.g. `al-journey-v2`)
2. Migration function in persistence layer
3. Documented rollback path

---

## 5. Journey Phase Order (Locked)

```
home → flow-select → shared-auth → activation → emergency → completed
```

Managed by `JourneyProvider.setPhase()` and route guards.

---

## 6. Flow Architecture (Locked)

### Auth (shared)

`/journey/auth/mobile` → `/otp` → `/vehicle-owner` → flow activation entry

### Purchase

R03 → R04 → R05 → R06 → R07 → R08 → R09 → R10 → Emergency at `contacts-empty`

Post-payment: **skips rider prompt** (`getPurchasePostPaymentEmergencyPath()`).

### Prepaid / B2B2C

Welcome → Auth → Emergency (no purchase, no payment, no vehicle activation)

### Emergency

| Step | Route | Notes |
|------|-------|-------|
| R0 | `rider-prompt` | If rider entitled |
| R1–R4 | rider setup | Optional |
| E0 | `contacts-empty` | Entry from R10 |
| E1–E3 | contact setup | Mandatory (min 1) unless rider skipped |
| E5 | `contacts-summary` | → Completed |

**Locked P0 behaviours:**

- Rider skip: confirmation → `riderSkipped: true` → `/journey/completed` (bypasses emergency)
- iOS E0: no Contact Picker CTA — manual entry only
- Android E0: native Contact Picker when supported
- Plan limits: single source in `emergency-limits.ts`

### Post-Activation PWA

`/pwa/scan/*` — SOS (4000ms hold required) + Park Me (auth + real location)

---

## 7. QR Entry Architecture (Locked)

Four entry flows via query dispatch on `/journey`:

| Type | Params | Handler |
|------|--------|---------|
| `purchase` | `token`, optional `orgId` | `dispatch-qr-payload.ts` |
| `prepaid` | `voucherId` | Same |
| `b2b2c` | `partnerId`, `variant` | Same |
| `activated` | `vehicleId`, `plate`, optional `planLabel` | Routes to PWA scan |

Parser: `platform/qr/parse-qr-url.ts`  
URL builder: `platform/qr/qr-entry-urls.ts`  
Registry: `platform/entry/flow-entry-registry.ts`

---

## 8. Routing Principles

- **Route modules own composition** — large route files (`EmergencyRoutes.tsx`, `PurchaseRoutes.tsx`) are intentional
- **Guards at mount** — `RequireAuthCompleted`, `RequireSelectedFlow`, `RequireSelectedFlowMatch`
- **No orphan restoration** — R14, R15, P01–P06 are catalog-only; do not remount without approval
- **Redirects over dead routes** — `/journey/home`, `/journey/qr-scan` redirect to `/journey`

---

## 9. Component Ownership Boundaries

| Layer | Owns |
|-------|------|
| `@autolokate/design-system` | Tokens, typography scale, color modes |
| `@autolokate/icons` | SVG icon components |
| `@autolokate/ui` | Buttons, fields, OTP, cards, chips, sheets, timelines, SOS hold, scanner cards |
| `apps/qr/components/compositions/` | Flow shells, consent blocks, contact rows |
| `apps/qr/features/*/screens/` | Screen-level composition |

**Never duplicate** a primitive that exists in `@autolokate/ui`.

---

## 10. PWA Architecture (Locked)

| Concern | Implementation |
|---------|----------------|
| Manifest | Vite PWA plugin — `vite.config.ts` |
| Service worker | Workbox generated SW |
| Offline | `PwaOfflineScreen`, `use-online-status` |
| Install | `PwaInstallPrompt`, `PwaIosInstallSheet`, `use-pwa-install` |
| Safe areas | CSS env(safe-area-inset-*) in PWA shell |
| Camera | `use-camera-capture`, `use-pwa-photo-capture` |
| Location | `use-geolocation`, reverse geocode utils |
| Permissions | `AlPermissionSheet`, `PwaPermissionRecoveryActions` |
| Theme | `localStorage` `al-qr-theme`, applied at boot in `main.tsx` |
| Updates | `use-pwa-update`, `PwaUpdatePrompt` |

---

## 11. Truth Hierarchy

1. **Figma** — UI source of truth
2. **`VISUAL_TRUTH_MATRIX_V2.md`** + `docs/visual-truth/samples/` — verified runtime parity
3. **`PROJECT_STATUS.md`** / signoff docs — live status
4. **`docs/archive/`** — historical only, not authoritative

---

## 12. Archived — Do Not Restore

- R14 Permissions screen
- R15 Activation Complete screen
- Splash screen (redirects to Mobile)
- iOS contact pick fallback sheet (removed)
- Legacy P01–P06 purchase screens (catalog only)

---

## 13. Extension Guidelines

When adding new functionality:

1. Identify which locked layer it touches (UI / flow / session / component)
2. If touching a locked layer → architecture approval first
3. Add screens as new routes under existing flow modules — do not reorder existing steps
4. Promote reusable UI to `@autolokate/ui` after 2+ uses
5. Update `PROJECT_STATUS.md` and capture visual truth if UI changes

**This architecture is the reference for all future Autolokate projects.**
