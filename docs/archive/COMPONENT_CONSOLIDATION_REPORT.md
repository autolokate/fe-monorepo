# Component Consolidation Report

**Date:** 2026-06-20

---

## Ownership Rules Applied

| Layer               | Package                                | Rule                        |
| ------------------- | -------------------------------------- | --------------------------- |
| Reusable UI         | `@autolokate/ui`                       | 2+ uses → promoted          |
| Icons               | `@autolokate/icons`                    | All icon glyphs             |
| Tokens              | `@autolokate/design-system`            | Colors, spacing, typography |
| Domain compositions | `apps/qr/src/components/compositions/` | Business logic allowed      |

---

## @autolokate/ui — Verified ✅

All Figma-derived reusable primitives correctly live in UI package:

- `AlScannedVehicleCard`, `AlVehicleConfirmationCard`
- `AlDispatchTimeline`, `AlStatusTracker`
- `AlPhotoGrid`, `AlScenePhotoCard`, `AlSosHoldButton`
- `AlPermissionSheet`, `AlScannerHubCard`, `AlIncidentStatusHero`
- `AlScreenSpinner`, `AlPlateInput`, `AlVehicleRcCard`

**No screen-local clones** of these components in production routes.

---

## Removed Screen-Local / Orphan Components

| Removed               | Was                  | Reason                 |
| --------------------- | -------------------- | ---------------------- |
| `LanguagePickerSheet` | Unwired experiment   | Never in route graph   |
| `LanguageSwitcher`    | Unwired experiment   | Never in route graph   |
| `PermissionRow`       | R14-only             | R14 archived + deleted |
| P01–P06 screens       | Legacy purchase UI   | Superseded by R06–R10  |
| QrScanScreen          | Pre-auth placeholder | Routes redirect        |

---

## App Compositions — Correctly Scoped

These remain in app layer (domain-specific, not generic UI):

| Component             | Usages              | Decision                 |
| --------------------- | ------------------- | ------------------------ |
| `PurchaseStatusShell` | 16                  | Journey purchase context |
| `EmptyStateHero`      | 12                  | Onboarding copy/layout   |
| `FlowStepShell`       | All journey screens | Phase-aware back nav     |
| `EmergencyContactRow` | Emergency summaries | Wraps AlContactCard      |
| `PwaScanShell`        | PWA routes          | Isolated PWA chrome      |

---

## P2 Icon Consolidation (documented, not changed)

| Inline in UI                   | Icons package equivalent                 |
| ------------------------------ | ---------------------------------------- |
| `CarIconGlyph`                 | `CarIcon` / `AlIcon name="car"`          |
| `CircleCheckIconGlyph`         | `TimelineCompleteCheckIcon`              |
| `RetakeIcon`                   | `icon-rotate-ccw.svg` (needs generation) |
| IncidentStatusHero inline SVGs | Halo icons in generated/                 |

No UX change — deferred to avoid Figma stroke/color regressions.

---

## Verdict

**PASS** — Component ownership enforced. Orphan/local duplicates removed. Shared primitives centralized in `@autolokate/ui`.
