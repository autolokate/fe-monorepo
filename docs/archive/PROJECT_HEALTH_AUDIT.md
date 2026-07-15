# Project Health Audit

**Date:** 2026-06-19  
**Scope:** All 16 active docs + 9 memory files  
**Method:** Cross-reference — broken links, conflicting route graphs, outdated statements, knowledge gaps  
**No code was modified.**

---

## Audit Summary

| Category                                                        | Status | Issue count |
| --------------------------------------------------------------- | ------ | ----------- |
| Broken links to archived docs                                   | FAIL   | 23          |
| Route graph contradiction (PURCHASE_FINAL_SIGNOFF vs decisions) | FAIL   | 1 critical  |
| Session model inconsistency                                     | WARN   | 1           |
| Doc count discrepancy (DOCS_CLEANUP_REPORT)                     | WARN   | 1           |
| Memory gap (rider limits missing)                               | WARN   | 1           |
| Component ownership                                             | PASS   | 0           |
| Signoff status                                                  | PASS   | 0           |
| Journey architecture                                            | PASS   | 0           |
| PWA route graph                                                 | PASS   | 0           |
| Design rules                                                    | PASS   | 0           |

---

## 1. Broken Links — Archived Docs Referenced Without `archive/` Prefix

All files below exist in `docs/archive/` — they were moved during the docs cleanup on 2026-06-19. The active docs that link to them use their original paths (e.g. `./AUTH_FLOW_SIGNOFF.md`), which are now broken.

### `CONSUMER_APP_FINAL_SIGNOFF.md`

| Line | Broken reference                           | Now at                                           |
| ---- | ------------------------------------------ | ------------------------------------------------ |
| 183  | `./SCREEN_PARITY_MATRIX.md`                | `archive/SCREEN_PARITY_MATRIX.md`                |
| 183  | `./CONSUMER_APP_100_PARITY_REPORT.md`      | `archive/CONSUMER_APP_100_PARITY_REPORT.md`      |
| 307  | `./MISSING_ASSET_RECOVERY_REPORT.md`       | `archive/MISSING_ASSET_RECOVERY_REPORT.md`       |
| 308  | `./SCREEN_PARITY_MATRIX.md`                | `archive/SCREEN_PARITY_MATRIX.md`                |
| 309  | `./CONSUMER_APP_100_PARITY_REPORT.md`      | `archive/CONSUMER_APP_100_PARITY_REPORT.md`      |
| 310  | `./CONSUMER_APP_FINAL_HARDENING_REPORT.md` | `archive/CONSUMER_APP_FINAL_HARDENING_REPORT.md` |

### `AUTH_FIGMA_PARITY_SIGNOFF.md`

| Line | Broken reference                  | Now at                                  |
| ---- | --------------------------------- | --------------------------------------- |
| 521  | `./AUTH_FLOW_SIGNOFF.md`          | `archive/AUTH_FLOW_SIGNOFF.md`          |
| 522  | `./FIGMA_RC2_PARITY_AUDIT.md`     | `archive/FIGMA_RC2_PARITY_AUDIT.md`     |
| 523  | `./SHARED_FLOW_IMPLEMENTATION.md` | `archive/SHARED_FLOW_IMPLEMENTATION.md` |
| 524  | `./VEHICLE_INFO_AUDIT.md`         | `archive/VEHICLE_INFO_AUDIT.md`         |

### `PHASE_A_VISUAL_SIGNOFF.md`

| Line | Broken reference                  | Now at                                  |
| ---- | --------------------------------- | --------------------------------------- |
| 5    | `./PHASE_A_ICON_PARITY_REPORT.md` | `archive/PHASE_A_ICON_PARITY_REPORT.md` |
| 176  | `./PHASE_A_ICON_PARITY_REPORT.md` | `archive/PHASE_A_ICON_PARITY_REPORT.md` |

### `PURCHASE_FINAL_SIGNOFF.md`

| Line | Broken reference                 | Now at                              |
| ---- | -------------------------------- | ----------------------------------- |
| 402  | `docs/PHASE_B_IMPLEMENTATION.md` | `archive/PHASE_B_IMPLEMENTATION.md` |
| 402  | `docs/PHASE_C_IMPLEMENTATION.md` | `archive/PHASE_C_IMPLEMENTATION.md` |
| 403  | `docs/PURCHASE_FIGMA_AUDIT.md`   | `archive/PURCHASE_FIGMA_AUDIT.md`   |

### `PURCHASE_FINAL_FIGMA_GAP_REPORT.md`

| Line | Broken reference                 | Now at                              |
| ---- | -------------------------------- | ----------------------------------- |
| 6    | `docs/PURCHASE_FIGMA_AUDIT.md`   | `archive/PURCHASE_FIGMA_AUDIT.md`   |
| 429  | `docs/PHASE_B_IMPLEMENTATION.md` | `archive/PHASE_B_IMPLEMENTATION.md` |
| 430  | `docs/PHASE_C_IMPLEMENTATION.md` | `archive/PHASE_C_IMPLEMENTATION.md` |

### `FINAL_BUGFIX_REPORT.md`

| Line | Broken reference                    | Now at                                      |
| ---- | ----------------------------------- | ------------------------------------------- |
| 6    | `FINAL_UX_POLISH_REPORT.md`         | `archive/FINAL_UX_POLISH_REPORT.md`         |
| 70   | `SOS_INTERACTION_REPORT.md`         | `archive/SOS_INTERACTION_REPORT.md`         |
| 71   | `DIALOG_RENDERING_REPORT.md`        | `archive/DIALOG_RENDERING_REPORT.md`        |
| 72   | `ANIMATION_REFINEMENT_REPORT.md`    | `archive/ANIMATION_REFINEMENT_REPORT.md`    |
| 73   | `SCREENSHOT_VERIFICATION_REPORT.md` | `archive/SCREENSHOT_VERIFICATION_REPORT.md` |

### `P0_FINAL_BUGFIX_REPORT.md`

| Line | Broken reference                      | Now at                                        |
| ---- | ------------------------------------- | --------------------------------------------- |
| 112  | `PHOTO_FLOW_SIMPLIFICATION_REPORT.md` | `archive/PHOTO_FLOW_SIMPLIFICATION_REPORT.md` |
| 163  | `IOS_SOS_LOADER_REPORT.md`            | `archive/IOS_SOS_LOADER_REPORT.md`            |

---

## 2. Route Graph Contradiction — R14 / R15

**Severity: CRITICAL**

`PURCHASE_FINAL_SIGNOFF.md` was written on 2026-06-17, before the decision to archive R14/R15. It treats both routes as **active, functional, and passing**:

- Scope line: _"End-to-end audit · Mobile → OTP → Name → R03–R15 → Activation Complete"_
- Route graph shows: `r10 → r14-permissions → r15-activation-complete`
- Test matrix shows R14 and R15 as `✅ terminal`
- Session fields `purchase.permissions.*`, `purchase.permissionOutcome`, `purchase.activationComplete` are documented as live

**Current known decision (locked):**

- R14 Permissions: **ARCHIVED** — not in active route graph, do not reference or restore
- R15 Activation Complete: **ARCHIVED** — not in active route graph, do not reference or restore
- Purchase flow ends at **R10 / R10b / R10c**

**`PURCHASE_FINAL_FIGMA_GAP_REPORT.md` (2026-06-18, one day newer) correctly documents the contradiction:**

> "R14 components exist but are not reachable in prod — their routes redirect immediately to R10."
> "P0-2: R14 route stub redirects to R10; screen never renders"
> "P0-3: R15 route stub redirects to R10; activation complete never shown"

**Impact:** A reader following `PURCHASE_FINAL_SIGNOFF.md` in isolation would believe the purchase flow ends at R15, which is wrong. This is the most important documentation discrepancy in the project.

**Recommendation:** Add a deprecation banner to `PURCHASE_FINAL_SIGNOFF.md` before the title identifying R14/R15 sections as superseded. Refer to `PURCHASE_FINAL_FIGMA_GAP_REPORT.md` for current state.

---

## 3. Session Model Inconsistency — R14/R15 Fields

**Severity: WARN**

`PURCHASE_FINAL_SIGNOFF.md` (Section: Session coverage) documents these session fields as active:

```
purchase.permissions.*       — R14 toggles
purchase.permissionOutcome   — R14 Allow/Skip
purchase.activationComplete  — R15 CTA
```

`CLAUDE_PROJECT_INDEX.md` Section 4.2 does **not** include these fields in `JourneySession.purchase`. This is correct — they belong to archived routes. But the inconsistency means a reader of the signoff doc would expect them in the session shape.

These fields either do not exist in code or exist only in dead R14/R15 components that never mount.

**Recommendation:** Note in `PURCHASE_FINAL_SIGNOFF.md` that these session fields are part of the archived R14/R15 implementation and are not present in the active session model.

---

## 4. DOCS_CLEANUP_REPORT.md Count Discrepancy

**Severity: WARN**

The report header says:

|                  | Count  |
| ---------------- | ------ |
| Active docs kept | **14** |
| New docs created | **3**  |

But the "Files Kept" table lists **15 files** (14 signoffs + reports + THEMING.md). The discrepancy is `THEMING.md` being listed but not counted.

Additionally, the "New docs created" entry counts `CLAUDE_PROJECT_INDEX.md` as new — it was updated (not created). The two truly new files are `PROJECT_STATUS.md` and `DOCS_CLEANUP_REPORT.md` itself.

**Correct counts:**

- 15 files kept active
- 2 files newly created
- 110 files archived

This is cosmetic and does not affect the project, but introduces noise if the report is used to verify completeness.

---

## 5. Memory Gap — Emergency Rider Limits in `project-known-decisions.md`

**Severity: WARN**

`project-known-decisions.md` Emergency section:

```
- safe: 1 contact
- secure: 2 contacts
- shield: 3 contacts
- shield+: 3 contacts
```

Rider limits are **not listed**. All other sources (`CLAUDE_PROJECT_INDEX.md`, `project-route-map.md`, `PROJECT_STATUS.md`) correctly include:

| Plan    | Max Contacts | Max Riders |
| ------- | ------------ | ---------- |
| safe    | 1            | 0          |
| secure  | 2            | 2          |
| shield  | 3            | 2          |
| shield+ | 3            | 2          |

If `project-known-decisions.md` is consulted in isolation (as the most focused decisions file), the rider limits are invisible. Since riders directly affect Emergency flow entry logic (`shouldEnterRiderPrompt`), this gap could lead to incorrect work.

**Recommendation:** Add rider limits to the Emergency section of `project-known-decisions.md`.

---

## 6. Archival Note Inconsistency — `VEHICLE_INFO_AUDIT.md`

**Severity: LOW**

`DOCS_CLEANUP_REPORT.md` line 172 notes:

> `VEHICLE_INFO_AUDIT.md` — R05 screen-specific audit, superseded by gap report

`AUTH_FIGMA_PARITY_SIGNOFF.md` line 524 references it as:

> R02 RC card spec (`170:79`)

The archival note says the document covers R05 (purchase confirm). The signoff uses it as an R02 (vehicle info) spec. Either the note is wrong about which screen it covers, or the signoff was using it for a different purpose. Since the file is now archived, this is low-impact, but the note in `DOCS_CLEANUP_REPORT.md` is potentially misleading.

---

## 7. Consistency Checks — PASS

The following were verified and found consistent across all active docs and memory files:

### Journey Architecture

All sources agree: `home → flow-select → shared-auth → activation → emergency → completed`. No contradictions.

### Component Ownership

All four sources (`CLAUDE_PROJECT_INDEX.md`, `PROJECT_STATUS.md`, `project-component-inventory.md`, `project-known-decisions.md`) agree:

- `AlVehicleConfirmationCard` — scanner confirmation only
- `AlScannedVehicleCard` — scan result display only
- `AlDispatchTimeline` — shared timeline primitive
- `AlSosHoldButton` — single implementation

### Signoff Verdicts

All signoff statuses are consistent across `PROJECT_STATUS.md`, `CLAUDE_PROJECT_INDEX.md`, and `project-signoff-status.md`:

- Auth: CONDITIONAL
- Purchase: FIXES REQUIRED
- Emergency: CONDITIONAL
- Post-Activation PWA: SIGNED OFF (V4)

### PWA Route Graph

30 routes confirmed. `pwa-scan-paths.ts` (code), `CLAUDE_PROJECT_INDEX.md` Section 3.6, and `project-route-map.md` all agree exactly. PWA isolation from JourneyProvider is consistent across all sources.

### Plan Limits

`emergency-limits.ts` is named as single source of truth in all documents. Emergency limits (safe/secure/shield/shield+) match across `CLAUDE_PROJECT_INDEX.md`, `PROJECT_STATUS.md`, `project-route-map.md`, and `EMERGENCY_FINAL_SIGNOFF.md`.

### Design Rules

All sources agree: status bar never render, fake chrome never render, Figma is source of truth, theme toggle at `/journey` only, language picker removed.

### Known Decision — R14/R15

All active docs except `PURCHASE_FINAL_SIGNOFF.md` (which predates the decision) correctly document R14/R15 as archived.

---

## 8. Recommendations

### Must fix (contradictions / misleading readers)

| #   | Action                                                | Doc                                 | Why                                                |
| --- | ----------------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| R1  | Add `> ⚠️ SUPERSEDED (2026-06-18)` banner above title | `PURCHASE_FINAL_SIGNOFF.md`         | R14/R15 route graph is wrong vs current decisions  |
| R2  | Update broken links to use `archive/` prefix          | All 7 docs with broken links        | 23 broken links, readers can't follow references   |
| R3  | Add rider limits to Emergency section                 | `memory/project-known-decisions.md` | Incomplete plan limits when file read in isolation |

### Should fix (cleanup)

| #   | Action                                            | Doc                      | Why                                 |
| --- | ------------------------------------------------- | ------------------------ | ----------------------------------- |
| R4  | Fix count: 15 kept, 2 new                         | `DOCS_CLEANUP_REPORT.md` | Count in header disagrees with list |
| R5  | Correct archival note for `VEHICLE_INFO_AUDIT.md` | `DOCS_CLEANUP_REPORT.md` | Screen number (R05 vs R02) is wrong |

### Consider (simplification)

| #   | Action                  | Docs                                                   | Why                                                                                                          |
| --- | ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| R6  | Merge into one document | `FINAL_BUGFIX_REPORT.md` + `P0_FINAL_BUGFIX_REPORT.md` | Both cover Post-Activation PWA final bugfix sprint; overlap in scope; separate files add navigation overhead |

### Do not change (no issues found)

- `CLAUDE_PROJECT_INDEX.md` — accurate and consistent
- `PROJECT_STATUS.md` — accurate and consistent
- `EMERGENCY_FINAL_SIGNOFF.md` — no broken refs, consistent with decisions
- `POST_ACTIVATION_FINAL_SIGNOFF_V4.md` — no issues identified
- `R06_CAROUSEL_FINAL_REPORT.md` — no issues identified
- `FIGMA_FINAL_QA_REPORT.md` — no issues identified
- `ICON_ALIGNMENT_FINAL_REPORT.md` — no issues identified
- `THEMING.md` — living reference, no issues
- All 9 memory files — consistent, except R3 above

---

## Appendix — Active Doc Inventory (verified 2026-06-19)

| Document                              | Refs broken | R14/R15 issue             | Notes                  |
| ------------------------------------- | ----------- | ------------------------- | ---------------------- |
| `PROJECT_STATUS.md`                   | 0           | None                      | Clean                  |
| `CLAUDE_PROJECT_INDEX.md`             | 0           | Correctly archived        | Clean                  |
| `DOCS_CLEANUP_REPORT.md`              | 0           | N/A                       | Count discrepancy (R4) |
| `AUTH_FIGMA_PARITY_SIGNOFF.md`        | 4           | None                      | See R2                 |
| `CONSUMER_APP_FINAL_SIGNOFF.md`       | 6           | Correctly archived        | See R2                 |
| `EMERGENCY_FINAL_SIGNOFF.md`          | 0           | None                      | Clean                  |
| `PURCHASE_FINAL_SIGNOFF.md`           | 3           | **CONTRADICTS decisions** | See R1, R2             |
| `PURCHASE_FINAL_FIGMA_GAP_REPORT.md`  | 3           | Correctly archived        | See R2                 |
| `PHASE_A_VISUAL_SIGNOFF.md`           | 2           | None                      | See R2                 |
| `POST_ACTIVATION_FINAL_SIGNOFF_V4.md` | 0           | N/A                       | Clean                  |
| `R06_CAROUSEL_FINAL_REPORT.md`        | 0           | None                      | Clean                  |
| `FIGMA_FINAL_QA_REPORT.md`            | 0           | None                      | Clean                  |
| `FINAL_BUGFIX_REPORT.md`              | 5           | None                      | See R2, R6             |
| `P0_FINAL_BUGFIX_REPORT.md`           | 2           | None                      | See R2, R6             |
| `ICON_ALIGNMENT_FINAL_REPORT.md`      | 0           | None                      | Clean                  |
| `THEMING.md`                          | 0           | N/A                       | Clean                  |
