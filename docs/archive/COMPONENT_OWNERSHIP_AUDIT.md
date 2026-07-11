# Component Ownership Audit

**Date:** 2026-06-20  
**Scope:** @autolokate/ui, @autolokate/icons, @autolokate/design-system — component placement, promotion, duplication

---

## 1. Promoted Components (packages/ui) — Status ✅

All components that should be in `@autolokate/ui` per the inventory are present:

| Component | Package | Status |
|-----------|---------|--------|
| `AlVehicleConfirmationCard` | `@autolokate/ui` | ✅ |
| `AlScannedVehicleCard` | `@autolokate/ui` | ✅ |
| `AlDispatchTimeline` | `@autolokate/ui` | ✅ |
| `AlStatusTracker` | `@autolokate/ui` | ✅ |
| `AlIncidentStatusHero` | `@autolokate/ui` | ✅ |
| `AlPhotoGrid` | `@autolokate/ui` | ✅ |
| `AlScenePhotoCard` | `@autolokate/ui` | ✅ |
| `AlSosHoldButton` | `@autolokate/ui` | ✅ |
| `AlPermissionSheet` | `@autolokate/ui` | ✅ |
| `AlScannerHubCard` | `@autolokate/ui` | ✅ |

---

## 2. App-Level Compositions — Status ✅ (by design)

The following components live in `apps/qr/src/components/compositions/` and are used across 2+ screens within the same app. These are app-specific compositions, NOT promoted to `@autolokate/ui` because they are specific to this onboarding flow and contain business/domain logic that should not live in a generic UI package:

| Component | Usages | Decision |
|-----------|--------|----------|
| `PurchaseStatusShell` | 16 | App-specific — contains journey phase logic |
| `EmptyStateHero` | 12 | App-specific — onboarding empty states |
| `InlineStatusBanner` | 11 | App-specific — journey status feedback |
| `FormFieldStack` | 9 | Thin wrapper over `AlStack` — acceptable at app level |
| `WelcomeActivationShell` | 2 | B2B flow specific |
| `PlanActivationCard` | 2 | B2B plan display — domain-specific |
| `PartnerActivationCard` | 2 | B2B partner display — domain-specific |
| Others (AddContactRow, AlOfflineChip, etc.) | 2+ | App-specific compositions, correctly placed |

**Rule applied:** Promotion to `@autolokate/ui` is for generic UI primitives. App-specific compositions with business logic stay in the app layer. ✅

---

## 3. Icon Ownership

### Violation Found: `RetakeIcon`

**File:** `packages/ui/src/components/icons/RetakeIcon.tsx`

An inline SVG icon is defined directly in `packages/ui/` instead of being generated through the `packages/icons/` pipeline.

**Consumers:**
- `packages/ui/src/components/primitives/PhotoGrid/PhotoGrid.tsx` (×2)
- `packages/ui/src/components/primitives/ScenePhotoCard/ScenePhotoCard.tsx` (×1)

**Source exists:** `packages/icons/src/assets/pwa-reconstruction/icon-rotate-ccw.svg`

**Recommended fix:**
1. Run icon generator over `icon-rotate-ccw.svg`
2. Export from `@autolokate/icons` as `AlIcon name="rotate-ccw"` or named component
3. Replace `RetakeIcon` import in PhotoGrid and ScenePhotoCard
4. Delete `packages/ui/src/components/icons/RetakeIcon.tsx`

**Current risk:** Low (functional, not a runtime issue). The icon renders correctly. No urgency.

---

## 4. Design Token Compliance

### Remaining Violations

| File | Value | Should be |
|------|-------|-----------|
| `plan-carousel.css:126,132` | `rgba(31,163,74,0)` / `rgba(31,163,74,0.45)` in keyframes | Use `var(--al-color-success)` at both endpoints |
| `rider-cover-options.css:159` | `rgba(31,162,74,0.16)` selected badge | `color-mix(in srgb, var(--al-color-success) 16%, transparent)` |
| `language-picker-sheet.css:14` | `rgba(0,0,0,0.55)` scrim | Low priority — LanguagePicker is dead code; files should be deleted |

### Fixed This Session
- `pwa-scan.css:142` — `#ff4a3d` → `var(--al-signal-red-bright)` ✅
- `PlateInput.css:40` — `#8c8f94` → `var(--al-color-on-surface-muted)` ✅

### Dark-Palette Components (Systemic — Not Fixed)

The following `packages/ui` components use hardcoded dark-palette colors. The PWA is designed dark-first and these components are exclusively used in the PWA dark context. Full light-mode support would require a systematic token migration pass:

| Component | Status |
|-----------|--------|
| `ScannedVehicleCard.css` | Dark-only — no `[data-theme='light']` rules |
| `VehicleConfirmationCard.css` | Dark-only — no `[data-theme='light']` rules |
| `StatusTracker.css` | Dark-only — no `[data-theme='light']` rules |
| `DispatchTimeline.css` | Dark-only — no `[data-theme='light']` rules |
| `SosHoldButton.css` | Brand reds hardcoded — intentional but no light-dim variant |
| `PhotoGrid.css` | Dark overlay hardcoded |
| `ScannerHubCard.css` | Emergency red hardcoded |

**Decision:** Accept for MVP. Systematic light-mode pass for PWA components is a separate sprint.

---

## 5. No Cross-Package Relative Imports

All imports from shared packages use package names (`@autolokate/ui`, `@autolokate/icons`, `@autolokate/design-system`). Zero relative-path imports crossing the apps → packages boundary. ✅

---

## 6. No Duplicate Inline SVGs in App Code

Zero inline SVG definitions found in `apps/qr/src/`. All icon usages import from `@autolokate/icons`. ✅
