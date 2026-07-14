# Development Standards

**Status:** **BASELINE LOCKED** (2026-06-17)  
**Applies to:** `autolokate-web` and all future Autolokate projects inheriting this baseline

---

## 1. Default Work Mode

Priority order — **never reverse**:

1. Preserve architecture
2. Preserve flow behavior
3. Preserve session behavior
4. Preserve component ownership
5. Preserve design system
6. Preserve Figma parity
7. Add new functionality

---

## 2. TypeScript Standards

| Rule | Requirement |
|------|-------------|
| Strict mode | Enabled via shared `@autolokate/config` |
| `any` | **Forbidden** unless justified in code review with comment |
| `@ts-ignore` / `@ts-expect-error` | **Forbidden** in application source |
| Route params | Typed via path constants and session types |
| Provider APIs | Fully typed exports; no implicit `unknown` |
| Exhaustive switches | Use `never` for discriminated unions (see `qr-entry-urls.ts`) |

**Gate before merge:** `pnpm exec tsc --noEmit` — 0 errors.

---

## 3. ESLint Standards

**Gate before merge:** `pnpm run lint` — 0 errors.

Allowed documented exceptions:

- Deprecated catalog entries in `routes.schema.ts` (intentional catalog retention)
- Playwright script globals (configured in root `eslint.config.js`)

---

## 4. Console Standards

| Allowed | Forbidden |
|---------|-----------|
| Intentional error boundary logging (`PwaScanErrorBoundary`) | `console.log` in feature code |
| Diagnostics wrapper (`pwa-photo-diagnostics.ts`) | Stray `console.warn` / `console.error` |

Target: **0 stray console calls** in application source.

---

## 5. React Standards

### Components

- **Small components** — single responsibility
- **Strict typing** — props interfaces for every exported component
- **No unnecessary abstractions** — inline logic preferred over one-line helpers
- **No unnecessary state** — derive from context/session where possible

### Hooks

- Extract reusable logic into hooks when used 2+ times
- Hooks live next to their domain (`features/*/hooks/`, `pwa/`, `journey/`)
- Name with `use` prefix; return stable references where consumed by effects

### Effects

- **Minimal `useEffect`** — prefer event handlers and derived state
- Navigation guards and timers are acceptable effect use cases
- Always clean up timers/subscriptions on unmount
- No setState during render

### Memoization

- `useMemo` / `useCallback` only when measurable rerender cost or effect stability requires it
- Context values must be memoized (`JourneyContext.tsx` pattern)

### Providers

- State ownership belongs in providers — not duplicated in route components
- Do not prop-drill session data when context exists
- Do not add new global providers without architecture review

---

## 6. Import Standards

| Pattern | Status |
|---------|--------|
| `@/` alias (`apps/onboarding/src/`) | **Preferred** for cross-feature imports |
| `@autolokate/ui`, `@autolokate/icons`, etc. | **Required** for shared packages |
| Relative `../` within same feature | Acceptable |
| `../../../../` deep relative | **Forbidden** |
| Circular imports | **Forbidden** |

---

## 7. Component Ownership

### Required sources

All UI must come from:

- `@autolokate/ui`
- `@autolokate/icons`
- `@autolokate/design-system`

### Never duplicate these primitives

| Primitive | Package component |
|-----------|-------------------|
| Buttons | `AlButton` |
| Text inputs | `AlTextField` |
| OTP | `AlOtp` |
| Cards | `AlVehicleConfirmationCard`, `AlScannedVehicleCard`, etc. |
| Chips | `AlChip` |
| Dialogs / sheets | `AlPermissionSheet`, `AlBottomSheet` |
| Timelines | `AlDispatchTimeline` |
| Status heroes | `AlScreenBg`, status hero compositions |
| Scanner cards | `AlScannedVehicleCard` |
| Permission sheets | `AlPermissionSheet` |
| SOS buttons | `AlSosHoldButton` (4000ms hold — tap must never trigger) |

### Promotion rule

If a UI pattern appears in **2+ screens** → promote to `@autolokate/ui` before copying.

App-level compositions (`AuthStepShell`, `EmergencyContactRow`, `InlineConsentBlock`) wrap primitives — they do not replace them.

---

## 8. UI / Figma Standards

| Rule | Detail |
|------|--------|
| Source of truth | Figma |
| Visual verification | `VISUAL_TRUTH_MATRIX_V2.md` + runtime captures |
| Status bar | Never render |
| Fake mobile chrome | Never render |
| Battery / network indicators | Never render |
| Theme toggle | `/journey` entry only |
| Spacing / typography / icon sizes | Locked unless Figma changes |

Do not change spacing, typography, icon sizes, layouts, button sizing, or screen structure without a Figma change and visual truth re-capture.

---

## 9. Flow Standards

Do not modify without explicit architecture approval:

- Purchase, Prepaid, B2B2C, Emergency, Post-Activation flow **order**
- Journey orchestration (`JourneyOrchestrator`)
- `selectedFlow` selection logic
- QR dispatch (`parseQrFromSearchParams`, `dispatchQrPayload`)
- Plan limits (`emergency-limits.ts` — single source of truth)
- Post-payment emergency entry (`contacts-empty`)
- Rider skip behaviour (`riderSkipped` → `/journey/completed`)

---

## 10. Session Standards

Do not modify without migration planning:

- `JourneySession` schema
- `PwaScanSession` schema
- Storage keys (see `ARCHITECTURE_PRINCIPLES.md` §4)
- Persistence layer (`journey/persistence.ts`, `pwa-scan-storage.ts`)

Migration requires new versioned storage key + migration function + rollback documentation.

---

## 11. PWA Release Standards

All future apps/modules must implement before release:

| Capability | Reference |
|------------|-----------|
| Web manifest | Vite PWA config |
| Service worker | Workbox generated |
| Offline shell | `PwaOfflineScreen` |
| Install prompt | Platform-specific (`PwaInstallPrompt`, `PwaIosInstallSheet`) |
| Safe areas | PWA shell CSS |
| Camera | Photo capture hooks |
| Location | Geolocation hooks |
| Permission recovery | `PwaPermissionRecoveryActions` |
| Theme persistence | `al-onboarding-theme` in `localStorage` |

---

## 12. Build & Quality Gates

| Gate | Command | Target |
|------|---------|--------|
| Lint | `pnpm run lint` | 0 errors |
| TypeScript | `pnpm exec tsc --noEmit` | 0 errors |
| Build | `pnpm run build` | Success |
| Console audit | grep `console.*` in src | Intentional only |

---

## 13. Documentation Standards

| When | Update |
|------|--------|
| Any flow behaviour change | `PROJECT_STATUS.md`, `CLAUDE_PROJECT_INDEX.md` |
| Architecture change | `ARCHITECTURE_PRINCIPLES.md` + charter review |
| New signoff | Add to `memory/MEMORY.md` index |
| Sprint reports | Archive to `docs/archive/` — do not accumulate at `docs/` root |
| UI change | Re-capture visual truth samples |

Permanent reference docs (do not archive):

- `PROJECT_CHARTER.md`
- `ARCHITECTURE_PRINCIPLES.md`
- `DEVELOPMENT_STANDARDS.md`
- `CLAUDE_PROJECT_INDEX.md`
- `PROJECT_STATUS.md`
- `VISUAL_TRUTH_MATRIX_V2.md`

---

## 14. File Size Guidance

Large route files (600–900 lines) are **accepted** when they follow the route-as-composition pattern. Do not split without functional reason.

Dev-only files (`ScreenDevApp.tsx`) are excluded from production bundle via entry graph.

---

## 15. Future Project Inheritance Checklist

New Autolokate projects should copy:

- [ ] Monorepo package structure (`apps/` + `packages/ui|icons|design-system`)
- [ ] Provider nesting pattern
- [ ] `@/` import alias
- [ ] Session versioning with named storage keys
- [ ] PWA plugin + offline/install/permission patterns
- [ ] Figma-first UI workflow
- [ ] This standards document as baseline

---

**These standards are locked with the baseline effective 2026-06-17.**
