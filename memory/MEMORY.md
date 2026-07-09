# Agent Memory Index

**Last updated:** 2026-06-17 (project lockdown — **BASELINE LOCKED**)

This file is the entry point for long-lived project memory. Detailed historical reports live in `docs/archive/`.

---

## Permanent reference documents (read first)

| File | Use when |
|------|----------|
| **`PROJECT_CHARTER.md`** | Baseline lock, change control, priority order |
| **`ARCHITECTURE_PRINCIPLES.md`** | Locked provider, session, flow, PWA architecture |
| **`DEVELOPMENT_STANDARDS.md`** | TS, React, imports, components, PWA release gates |
| `CLAUDE_PROJECT_INDEX.md` | Routes, session model, components, Figma rules |
| `PROJECT_STATUS.md` | Current flow status, signoffs, open issues |

---

## Source-of-truth documents (`docs/`)

| File | Use when |
|------|----------|
| `VISUAL_TRUTH_MATRIX_V2.md` | Visual verification — **PIXEL PERFECT VERIFIED** |
| `FINAL_THEME_SIGNOFF.md` | Dark/light theme compliance |
| `FINAL_SANITY_REPORT.md` | Latest engineering verdict — READY WITH KNOWN GAPS |
| `FINAL_PRODUCTION_READINESS.md` | Ship readiness baseline |
| `QR_ENTRY_STRATEGY.md` | QR URL encoding for four entry flows |
| `IOS_CONTACT_SUPPORT_REPORT.md` | iOS: no Contact Picker CTA; manual entry only |
| `RIDER_SKIP_CONFIRMATION_REPORT.md` | Rider skip → `/journey/completed` |
| `REAL_DEVICE_EVIDENCE_REPORT.md` | Device matrix — **no evidence yet** |
| `MEMORY_UPDATE_REPORT.md` | Lockdown changelog |

---

## Engineering hardening deliverables (2026-06-17)

| Report | Purpose |
|--------|---------|
| `ENGINEERING_HARDENING_REPORT.md` | Full 9-phase audit summary |
| `REPOSITORY_CLEANUP_REPORT.md` | Dead code, doc archive, scripts |
| `REACT_ARCHITECTURE_SIGNOFF.md` | Providers, effects, ownership |
| `TYPESCRIPT_SIGNOFF.md` | 0 errors / 0 any |
| `PERFORMANCE_SIGNOFF.md` | Bundle + asset sizes |

---

## Visual evidence

| Path | Contents |
|------|----------|
| `docs/visual-truth/samples/` | 10 representative 393px runtime PNG |
| `docs/visual-truth/completed/` | Completed screen before/after + Figma 171:59 |
| `docs/archive/visual-truth-metadata/` | capture-manifest.json, measurements.json |

Full 1308-screenshot capture set was removed during consolidation (2026-06-20). Re-generate via `apps/qr/scripts/visual-truth-capture.mjs`.

---

## Historical reports

Intermediate sprint reports (46 files from 2026-06-17 cleanup):

→ **`docs/archive/sprint-reports-2026-06-17/`**

All other historical AUDIT · PARITY · RECOVERY · REPORT · SIGNOFF docs:

→ **`docs/archive/`** (231+ files)

---

## Locked baseline behaviour

| Area | Behaviour |
|------|-----------|
| iOS contacts | `shouldShowAddFromContactsCTA()` false — manual mobile entry only |
| Android contacts | Native Contact Picker API when supported |
| Rider skip | Confirmation sheet → `riderSkipped: true` → `/journey/completed` |
| QR entry | `/journey?type=purchase\|prepaid\|b2b2c\|activated&…` |
| Provider tree | `AutolokateRootProvider` = `JourneyProvider` + `PwaScanProvider` |
| UI | Figma parity locked — no spacing/typography/layout changes without Figma update |

---

## Default mode for future work

Priority order (never reverse):

1. Preserve architecture → 2. Flow behaviour → 3. Session behaviour → 4. Component ownership → 5. Design system → 6. Figma parity → 7. New functionality

See `PROJECT_CHARTER.md` for full change control rules.

---

## Project memory files (`memory/`)

| File | Status |
|------|--------|
| `MEMORY.md` | This index |
| `project-open-issues.md` | *See PROJECT_STATUS open issues* |
| `project-known-decisions.md` | *See ARCHITECTURE_PRINCIPLES.md + CLAUDE_PROJECT_INDEX §12* |
| `project-route-map.md` | *See CLAUDE_PROJECT_INDEX §2–3* |
| `project-component-inventory.md` | *See CLAUDE_PROJECT_INDEX §8* |
| `project-signoff-status.md` | *See PROJECT_STATUS signoff table* |

---

## Truth hierarchy

1. Figma
2. `VISUAL_TRUTH_MATRIX_V2.md` + `docs/visual-truth/samples/`
3. **`PROJECT_CHARTER.md`** · **`ARCHITECTURE_PRINCIPLES.md`** · **`DEVELOPMENT_STANDARDS.md`**
4. `PROJECT_STATUS.md` / `FINAL_SANITY_REPORT.md` / signoffs
5. `docs/archive/` (historical only)

---

## Status

# BASELINE LOCKED

Effective 2026-06-17. This repository is the reference implementation for all future Autolokate projects.
