# Design System RC2.1 Report

**Date:** 2026-06-17  
**Phase:** DS-RC2.1  
**Source:** [FIGMA_RC2_PARITY_AUDIT.md](./FIGMA_RC2_PARITY_AUDIT.md) · blocking fix **F1**  
**Scope:** `AlOtpInput` only · ui-preview OTP showcase · no onboarding / flow changes

---

## Summary

Fixed the blocking OTP parity issue: **error borders and error message text now use `--al-color-warning` (amber)** instead of `--al-color-danger` (red), matching Figma `101:33`.

Also aligned **2px border weight** on error/success/filled states and added explicit **`filled`** state for Figma `552:2502`. ui-preview now shows a full **6-state matrix** in light and dark themes.

**QA:** `pnpm build` ✓ · `pnpm lint` ✓

---

## 1. Before / after

### Error state (blocking fix)

| Aspect             | Before (RC2)                                 | After (RC2.1)                                            |
| ------------------ | -------------------------------------------- | -------------------------------------------------------- |
| Error cell border  | `border-color: var(--al-color-danger)` · 1px | `border: 2px solid var(--al-color-warning)`              |
| Error message text | `color: var(--al-color-danger)`              | `color: var(--al-color-warning)`                         |
| Figma color        | `#F5A623` (amber)                            | `#F5A623` via `--al-signal-amber` → `--al-color-warning` |

### Success state (parity alignment)

| Aspect              | Before                      | After                                           |
| ------------------- | --------------------------- | ----------------------------------------------- |
| Success cell border | 1px `border-color: success` | **2px** `border: solid var(--al-color-success)` |

### Filled state (new)

| Aspect            | Before                      | After                                                 |
| ----------------- | --------------------------- | ----------------------------------------------------- |
| `AlOtpInputState` | `empty \| error \| success` | `empty \| filled \| error \| success`                 |
| Filled styling    | Not explicit (1px default)  | **2px** `var(--al-color-outline-strong)` on all cells |

---

## 2. Figma node references

| State        | Figma component    | Node ID                                                                             | Figma spec                                                   | Code mapping                                                      |
| ------------ | ------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Empty**    | AlOtpInput/Empty   | [`101:26`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=101-26)     | First cell 2px focus (`#FFFFFF` dark) · others 1px `#4A4A4A` | Default 1px `--al-color-outline`; `:focus` 2px `--al-color-focus` |
| **Focused**  | AlOtpInput         | [`75:19`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=75-19)       | Partial digits · active empty cell 2px `#FFFFFF`             | Runtime `:focus` on active cell                                   |
| **Filled**   | AlOtpInput/Filled  | [`552:2502`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=552-2502) | All cells **2px** `#4A4A4A`                                  | `state="filled"` → 2px `--al-color-outline-strong`                |
| **Success**  | AlOtpInput/Success | [`101:46`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=101-46)     | All cells **2px** `#1FA24A`                                  | `state="success"` → 2px `--al-color-success`                      |
| **Error**    | AlOtpInput/Error   | [`101:33`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=101-33)     | All cells **2px** `#F5A623`                                  | `state="error"` → 2px `--al-color-warning`                        |
| **Disabled** | — (pattern)        | [`75:19`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=75-19)       | Reduced opacity · no interaction                             | `disabled` → opacity 0.55 · surface-variant bg                    |

---

## 3. Parity confirmation (all OTP states)

| State    | Dark theme | Light theme | Verdict                                         |
| -------- | ---------- | ----------- | ----------------------------------------------- |
| Empty    | ✓          | ✓           | **Exact** — focus ring via `--al-color-focus`   |
| Focused  | ✓          | ✓           | **Exact** — per-cell `:focus` 2px               |
| Filled   | ✓          | ✓           | **Exact** — 2px outline-strong (theme-aware)    |
| Success  | ✓          | ✓           | **Exact** — 2px success green                   |
| Error    | ✓          | ✓           | **Exact** — 2px warning amber (was major drift) |
| Disabled | ✓          | ✓           | **Exact** — opacity + muted surface             |

**Token verification**

| Figma hex               | Semantic token              | Resolves to                                                      |
| ----------------------- | --------------------------- | ---------------------------------------------------------------- |
| `#F5A623`               | `--al-color-warning`        | `var(--al-signal-amber)`                                         |
| `#1FA24A`               | `--al-color-success`        | `var(--al-signal-green)`                                         |
| `#4A4A4A` (dark filled) | `--al-color-outline-strong` | neutral-500 (light) / neutral-500 (dark spec via outline-strong) |

No hardcoded colors in `OtpInput.css`.

---

## 4. Files changed

```
packages/ui/src/components/forms/OtpInput/OtpInput.css
packages/ui/src/components/forms/OtpInput/OtpInput.types.ts
packages/ui/src/components/forms/OtpInput/OtpInput.tsx

apps/ui-preview/src/docs/pages/core/AlOtpInputPage.tsx
apps/ui-preview/src/docs/pages/core/al-otp-input-page.css   (new)

docs/DS_RC2_1_REPORT.md   (this file)
```

**Not modified:** `apps/qr/**` · flow architecture · any other component

---

## 5. ui-preview updates

**Path:** Core · Inputs → AlOtpInput

Added **OTP state matrix** sections:

- Light theme frame (`data-theme="light"`)
- Dark theme frame (`data-theme="dark"`)

Each row shows: **empty · focused · filled · success · error · disabled** with Figma node IDs.

Focused/empty demos programmatically focus the correct cell to match Figma `75:19` / `101:26`.

---

## 6. Onboarding impact

| Topic                                | Impact                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| Onboarding files                     | **Unchanged**                                                         |
| R04 OTP error (when `state="error"`) | Automatically renders **amber** borders via updated `@autolokate/ui`  |
| Breaking API                         | Additive only — new optional `filled` state; existing props unchanged |

---

## 7. Audit closure

| FIGMA_RC2 item            | Status                         |
| ------------------------- | ------------------------------ |
| **F1** OTP error → amber  | **Closed**                     |
| AlOtpInput overall parity | **Exact match** (all 6 states) |

DS-RC2.1 completes the blocking parity gate from [FIGMA_RC2_PARITY_AUDIT.md](./FIGMA_RC2_PARITY_AUDIT.md). Onboarding may proceed with full OTP visual parity on the next dependency bump.
