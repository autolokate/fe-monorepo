# Repository Cleanup Report

**Date:** 2026-06-17  
**Scope:** `apps/`, `packages/`, `docs/`, `scripts/`

---

## Documentation Consolidation

### Before

- `docs/*.md` at root: **56 files**
- `docs/archive/`: **185 files**

### After

- `docs/*.md` at root: **10 active files**
- `docs/archive/sprint-reports-2026-06-17/`: **46 files moved**
- `docs/archive/` total: **231+ files**

### Active docs retained

| File                                | Reason                      |
| ----------------------------------- | --------------------------- |
| `CLAUDE_PROJECT_INDEX.md`           | Architecture index          |
| `PROJECT_STATUS.md`                 | Live status                 |
| `MEMORY.md` pointer docs            | See `memory/MEMORY.md`      |
| `FINAL_PRODUCTION_READINESS.md`     | Ship readiness baseline     |
| `VISUAL_TRUTH_MATRIX_V2.md`         | Visual source of truth      |
| `FINAL_THEME_SIGNOFF.md`            | Theme signoff               |
| `QR_ENTRY_STRATEGY.md`              | QR encoding reference       |
| `IOS_CONTACT_SUPPORT_REPORT.md`     | Latest P0 contact behaviour |
| `RIDER_SKIP_CONFIRMATION_REPORT.md` | Latest P0 rider skip        |
| `REAL_DEVICE_EVIDENCE_REPORT.md`    | Device matrix status        |
| `PLATFORM_MODULE_MAP.md`            | Module reference            |

### Archived (examples)

Moved to `docs/archive/sprint-reports-2026-06-17/`:

- `FINAL_SIGNOFF.md`, `FINAL_RELEASE_SIGNOFF.md`, `FINAL_UX_FIX_SIGNOFF.md`
- `IOS_CONTACT_PICKER_REPORT.md` (superseded by `IOS_CONTACT_SUPPORT_REPORT.md`)
- `CONTACT_PICKER_*`, `INPUT_*`, `OTP_*`, `PWA_*` intermediate audits
- `UNIFIED_PWA_*` migration planning docs (implementation complete)
- `REAL_DEVICE_SIGNOFF*.md`, `REAL_DEVICE_TEST_MATRIX.md`

---

## Dead Code Inventory (Not Deleted — Documented)

| Category                | Path / symbol                   | Evidence                        | Action                 |
| ----------------------- | ------------------------------- | ------------------------------- | ---------------------- |
| Orphan purchase screens | `features/purchase-activation/` | Not imported in `JourneyRoutes` | Retain for catalog/dev |
| Deprecated P01–P06      | `steps.config.ts`               | `@deprecated` comments          | Catalog only           |
| Removed iOS sheet       | `ios-contact-pick-sheet/`       | 0 files on disk                 | Already deleted        |
| Archived R14/R15        | `routes.schema.ts`              | Deprecated catalog entries      | Intentional            |

---

## Dead Routes

Verified against `JourneyRoutes.tsx` + `PwaScanRoutes.tsx`:

| Route pattern                      | Status                  |
| ---------------------------------- | ----------------------- |
| `/journey/purchase/r14-*`, `r15-*` | Not mounted             |
| `/journey/purchase/p01–p06`        | Not in route graph      |
| `/journey/qr-scan`                 | Redirects to `/journey` |
| `/journey/home`                    | Redirects to `/journey` |

All active journey + PWA routes match `CLAUDE_PROJECT_INDEX.md` §2.

---

## Dead Exports / Hooks

| Item                           | Status                   |
| ------------------------------ | ------------------------ |
| `shouldUseContactPickFallback` | Removed — grep 0 matches |
| `normalizePickedContactInput`  | Removed — grep 0 matches |
| `IosContactPickSheet`          | Removed — grep 0 matches |

---

## Scripts Audit

| Script                              | Purpose                  | Status                     |
| ----------------------------------- | ------------------------ | -------------------------- |
| `visual-truth-capture.mjs`          | Screenshot capture       | Active                     |
| `visual-truth-analyze.mjs`          | Measurement pass         | Active                     |
| `generate-visual-truth-matrix.mjs`  | Matrix generation        | Active (dead code removed) |
| `recapture-completed-screens.mjs`   | Completed screen capture | Active                     |
| `generate-pwa-icons.mjs`            | PWA icon generation      | Active                     |
| `generate-pwa-icon-comparisons.mjs` | Icon QA                  | Active                     |
| `visual-truth-manifest.mjs`         | Screen manifest          | Active                     |
| `deploy-vercel.sh`                  | Deploy helper            | Active                     |

**Lint fix:** Added ESLint browser globals override for Playwright scripts in root `eslint.config.js`.

---

## Unused Assets

| Asset class               | Finding                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| Bundled images            | Only logo PNG in production dist                                        |
| Bundled audio             | SOS wav — used                                                          |
| `docs/visual-truth/` PNGs | 61 files — evidence, not shipped                                        |
| Icons                     | All via `@autolokate/icons` — no orphan SVG imports found in onboarding |

---

## Duplicate Implementations

| Area                   | Finding                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Buttons / inputs / OTP | Single source: `@autolokate/ui`                                                         |
| OTP screens            | Flow-specific wrappers (`A2OtpScreen`, `EmergencyOtpScreen`) — not duplicate primitives |
| Purchase flows         | `qr-purchase/` (active) vs `purchase-activation/` (legacy orphan)                       |

---

## Screenshots / Reports

- Full 1308-screenshot capture set previously removed per `MEMORY.md` (2026-06-20 consolidation)
- Retained: `docs/visual-truth/samples/` (10 PNG) + `docs/visual-truth/completed/` (5 PNG)

---

## Summary

Repository documentation reduced from 56 → 10 active root markdown files. No production source files deleted. Orphan legacy screens documented but retained for dev/catalog compatibility.
