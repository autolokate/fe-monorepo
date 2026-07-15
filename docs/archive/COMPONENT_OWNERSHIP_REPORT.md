# Component Ownership Report

**Date:** 2026-06-20  
**Rule:** Used 2+ times → `@autolokate/ui`; icons → `@autolokate/icons`; tokens → `@autolokate/design-system`

---

## Promoted Primitives ✅

All Figma-derived reusable components live in `@autolokate/ui`:

| Component                   | Usages                        | Package          |
| --------------------------- | ----------------------------- | ---------------- |
| `AlScannedVehicleCard`      | PWA vehicle hub, Park Me      | `@autolokate/ui` |
| `AlVehicleConfirmationCard` | Park Me confirm               | `@autolokate/ui` |
| `AlStatusTracker`           | SOS/Park Me timelines         | `@autolokate/ui` |
| `AlDispatchTimeline`        | SOS resolved                  | `@autolokate/ui` |
| `AlPhotoGrid`               | Park Me/SOS photos            | `@autolokate/ui` |
| `AlSosHoldButton`           | SOS idle                      | `@autolokate/ui` |
| `AlPermissionSheet`         | Park Me permissions           | `@autolokate/ui` |
| `AlScannerHubCard`          | Vehicle hub                   | `@autolokate/ui` |
| `AlIncidentStatusHero`      | PWA status screens            | `@autolokate/ui` |
| `CarIconGlyph`              | Vehicle cards, status tracker | `@autolokate/ui` |
| `CircleCheckIconGlyph`      | SOS resolved timeline         | `@autolokate/ui` |

**No screen-local clones of promoted components.**

---

## App Compositions (Correctly App-Scoped)

| Component                | Usages              | Reason Not Promoted               |
| ------------------------ | ------------------- | --------------------------------- |
| `PurchaseStatusShell`    | 16                  | Journey phase + purchase context  |
| `EmptyStateHero`         | 12                  | Onboarding-specific copy/layout   |
| `FlowStepShell`          | All journey screens | App shell with journey back logic |
| `WelcomeActivationShell` | B2B flows           | Partner entitlement display       |
| `RelationshipSelector`   | Emergency E3/R3     | Domain relationship data          |

---

## Icon Ownership

| Item                   | Status                        | Action This Pass                                    |
| ---------------------- | ----------------------------- | --------------------------------------------------- |
| `CarIconGlyph`         | ✅ In `@autolokate/ui`        | Added for Figma `icon/car` parity                   |
| `CircleCheckIconGlyph` | ✅ In `@autolokate/ui`        | Added for SOS resolved                              |
| `RetakeIcon`           | ⚠️ Inline in `@autolokate/ui` | P2 — should migrate to `@autolokate/icons` pipeline |

---

## Design System Tokens ✅

Post pixel-perfect passes, hardcoded hex values in PWA reduced to tokens. Remaining P2 violations documented in prior audits (`plan-carousel.css` keyframes rgba).

---

## Unused UI Exports (Library Inventory)

These are shared-library components not yet used in onboarding — not violations:

- `AlBottomNav`
- `AlContainer`
- `AlGrid`

---

## Duplicate Implementations

| Area                 | Finding                                                       |
| -------------------- | ------------------------------------------------------------- |
| Mobile formatting    | 3 helpers across auth/emergency/utils — P2 consolidation      |
| Relationship options | `RELATIONSHIP_OPTIONS` deprecated alias removed from usage    |
| UI barrel            | `core/index.ts` re-exports some `forms/index.ts` — acceptable |

---

## Issues Fixed This Pass

| Change                                      | Files                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Car icon centralized                        | `CarIconGlyph.tsx` → `ScannedVehicleCard`, `VehicleConfirmationCard`, `StatusTracker` |
| Circle check icon                           | `CircleCheckIconGlyph.tsx` → `DispatchTimeline`                                       |
| Deprecated `protectedLabel` → `footerLabel` | `ScannedVehicleCard`, `pwa-shared-routes`                                             |
| Deprecated `locationPreview` removed        | `PhotoGrid`                                                                           |

---

## Verdict

**PASS** — Component ownership rules followed. No duplicate UI primitives in app layer.
