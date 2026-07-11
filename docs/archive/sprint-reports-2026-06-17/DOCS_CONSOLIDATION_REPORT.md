# Docs Consolidation Report

**Date:** 2026-06-20  
**Goal:** Reduce documentation noise; keep long-term source-of-truth only.

---

## Files kept (`docs/` root)

| File | Role |
|------|------|
| `PROJECT_STATUS.md` | Current project status |
| `CLAUDE_PROJECT_INDEX.md` | Architecture + route index |
| `VISUAL_TRUTH_MATRIX_V2.md` | Visual verification matrix |
| `FINAL_THEME_SIGNOFF.md` | Theme signoff |
| `FINAL_PRODUCTION_READINESS.md` | Production readiness |
| `DOCS_CONSOLIDATION_REPORT.md` | This report |

## Memory kept (`memory/`)

| File | Role |
|------|------|
| `MEMORY.md` | Agent memory index (created/updated) |

> `project-*.md` and `feedback-pre-edit-protocol.md` were not present in repo; indexed in `memory/MEMORY.md` for future maintenance.

---

## Visual evidence retained

| Path | Count | Purpose |
|------|-------|---------|
| `docs/visual-truth/samples/` | 10 PNG | Representative 393px runtime shots |
| `docs/visual-truth/completed/before/` | 2 PNG | Pre-reconstruction Completed |
| `docs/visual-truth/completed/after/` | 2 PNG | Post-reconstruction Completed |
| `docs/visual-truth/completed/figma/` | 1 PNG | Figma 171:59 export |

Capture metadata archived (not deleted): `docs/archive/visual-truth-metadata/`  
(capture-manifest.json, measurements.json, regression-checks.json)

---

## Files archived

**76 intermediate `.md` files** moved from `docs/` → `docs/archive/` this pass.

Categories archived include: AUDIT, PARITY, RECOVERY, RECONSTRUCTION, FIX, REPORT, SIGNOFF (V1–V4), VERIFICATION, MATRIX, and consolidation intermediates (`COMPLETED_SCREEN_*`, `UPDATED_VISUAL_TRUTH_DELTA`, `THEMING.md`, etc.).

**Total in `docs/archive/`:** 185 markdown files (+ subfolders below).

| Archive subfolder | Contents |
|-------------------|----------|
| `docs/archive/` (root) | All historical `.md` reports |
| `docs/archive/visual-truth-metadata/` | JSON capture/measurement artifacts |
| `docs/archive/audit-screenshots-tools/` | layout-audit.mjs, capture-live.mjs, recapture-fixes.mjs, results JSON |
| `docs/archive/emergency-parity-screenshots/` | Emergency parity PNG samples |

---

## Files deleted

| Target | Count / size | Notes |
|--------|--------------|-------|
| `docs/visual-truth/screens/` | **1308 PNG · ~85 MB** | Full capture matrix |
| `docs/audit-screenshots/` | **~118 MB** | live/, figma/, compare/, node_modules/, PNG dirs |
| `docs/emergency-parity-screenshots/` | **~552 KB** | Moved to archive (preserved, not deleted) |

**Estimated disk space recovered:** **~201 MB** (205,548 KB)

---

## Broken links fixed

| File | Fix |
|------|-----|
| `docs/VISUAL_TRUTH_MATRIX_V2.md` | Evidence dir → `samples/` + `completed/`; screenshot columns → sample paths or `—` |
| `docs/PROJECT_STATUS.md` | Active docs table; archive pointers; memory path |
| `docs/CLAUDE_PROJECT_INDEX.md` | §15 rewritten for new doc structure |
| `memory/MEMORY.md` | Created — central index for doc locations |

---

## Final docs structure

```
docs/
├── PROJECT_STATUS.md
├── CLAUDE_PROJECT_INDEX.md
├── VISUAL_TRUTH_MATRIX_V2.md
├── FINAL_THEME_SIGNOFF.md
├── FINAL_PRODUCTION_READINESS.md
├── DOCS_CONSOLIDATION_REPORT.md
├── assets/                          # design assets (retained)
├── product-architecture/              # product docs (retained)
├── visual-truth/
│   ├── samples/                     # 10 representative PNG
│   └── completed/                   # before / after / figma
└── archive/
    ├── *.md                         # 185 historical reports
    ├── visual-truth-metadata/
    ├── audit-screenshots-tools/
    └── emergency-parity-screenshots/

memory/
└── MEMORY.md

apps/qr/scripts/
├── visual-truth-capture.mjs           # re-generate full matrix
└── recapture-completed-screens.mjs    # Completed-only captures
```

---

## Verdict

Consolidation **complete**. Long-term truth docs remain at `docs/` root; history preserved in `docs/archive/`; bulk screenshot evidence removed with representative samples retained.
