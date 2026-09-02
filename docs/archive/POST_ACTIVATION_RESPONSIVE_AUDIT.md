# Post-Activation PWA — Responsive Audit

**Date:** 2026-06-18  
**Method:** Live DOM layout inspection at 6 widths × 2 themes × 30 screens  
**Data:** `docs/audit-screenshots/layout-audit-results.json`

---

## Test matrix

| Width     | Height | Themes      | Screens | Configurations |
| --------- | ------ | ----------- | ------- | -------------- |
| 320       | 852    | dark, light | 30      | 60             |
| 360       | 852    | dark, light | 30      | 60             |
| 375       | 852    | dark, light | 30      | 60             |
| 390       | 852    | dark, light | 30      | 60             |
| 393       | 852    | dark, light | 30      | 60             |
| 414       | 852    | dark, light | 30      | 60             |
| **Total** |        |             |         | **360**        |

Theme applied via `document.documentElement.setAttribute('data-theme', …)` before navigation.

---

## Responsive failure heatmap

Legend: ✅ no layout issues · ⚠️ P1 degraded · ❌ P0 broken

### Dark theme

| Screen      | 320 | 360 | 375 | 390 | 393 | 414 |
| ----------- | --- | --- | --- | --- | --- | --- |
| 09 empty    | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 09 filled\* | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| 09b         | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| 10          | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 11          | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 12          | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 13          | ⚠️† | ✅  | ✅  | ✅  | ✅  | ✅  |
| 14          | ⚠️  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 14b–14d     | ⚠️  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 15          | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 19          | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| 20          | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| 21          | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| 23          | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  |
| 08 / 08b    | ⚠️  | ⚠️  | ⚠️  | ⚠️  | ⚠️  | ⚠️  |

\*Filled = photos + location in session (real completion path). Empty audit seed passes all widths.

†13 @320: 4px timeline–footer gap only (P2), CTA visible.

### Light theme

Same pattern as dark — **no theme-specific layout escapes**. Breakage is width/content driven, not color-scheme driven.

---

## Width-specific findings

### 320px (smallest)

| Issue                             | Screens               | Severity |
| --------------------------------- | --------------------- | -------- |
| Footer CTA below fold             | 09 filled, 19, 20, 21 | P0       |
| Review map +16px horizontal bleed | 09b                   | P0       |
| SOS aura +6px bleed               | 14, 14b, 14c, 14d     | P1       |
| RC card watermark bleed           | 08, 08b               | P1       |
| Timeline/footer 4px gap           | 13                    | P2       |

**320 is the stress viewport** but **393 and 414 fail the same P0 screens** — not a narrow-only problem for timelines.

### 393px (Figma reference)

| Metric              | 19 Help received | 09 filled         | 09b             |
| ------------------- | ---------------- | ----------------- | --------------- |
| scrollHeight        | 930              | 1055              | 852             |
| CTA bottom          | 914 (off-screen) | 1039 (off-screen) | 836 (on-screen) |
| Timeline bottom     | 840              | —                 | —               |
| Horizontal overflow | No               | No                | Yes (+16px)     |

### 414px (largest phone)

Same P0 set as 393 for timelines and 09 filled. Extra width does **not** fix vertical overflow — content grows with width (full-width grids).

---

## Scroll behavior by screen class

| Shell type                   | Screens                        | Vertical scroll @393 | Expected                       |
| ---------------------------- | ------------------------------ | -------------------- | ------------------------------ |
| `PwaScanShell` short content | 01–08, 09 empty, 10–12, 15, 23 | No                   | ✅                             |
| `PwaScanShell` tall content  | 09 filled, 19–21               | Yes (78–203px)       | ❌ Should scroll inside `main` |
| `PurchaseStatusShell`        | 16–18, 22                      | No                   | ✅                             |
| Permission overlay           | 09a, 14c, 14d                  | No                   | ✅                             |

---

## Light vs dark

| Check                           | Result        |
| ------------------------------- | ------------- |
| Footer overlap differs by theme | No            |
| Overflow offenders differ       | No            |
| CTA visibility differs          | No            |
| Contrast-related layout shift   | None detected |

Light theme **does not introduce** additional layout breakage. Non-identical colors are out of scope for this audit.

---

## Special-focus responsive summary

| Frame | Broken at 393? | Broken at 320? | Notes                     |
| ----- | -------------- | -------------- | ------------------------- |
| 09    | Yes (filled)   | Yes (filled)   | Empty state OK all widths |
| 09b   | Yes            | Yes            | Map lines all widths      |
| 10    | No             | No             | 6-step timeline fits      |
| 11    | No             | No             |                           |
| 12    | No             | No             | Done visible              |
| 13    | No             | Tight only     |                           |
| 14    | No             | Aura bleed     | Functional @393           |
| 15    | No             | No             | Quad grid OK              |
| 19    | Yes            | Yes            | All widths                |
| 20    | Yes            | Yes            |                           |
| 21    | Yes            | Yes            |                           |
| 23    | No             | No             | 3-step timeline fits      |

---

## Recommendations by viewport strategy

1. **All widths:** Sticky footer in `PwaScanShell` (fixes 09 filled, 19–21).
2. **All widths:** Clip or rescale `.al-photo-grid__review-map-lines` (fixes 09b).
3. **≤320:** Clip SOS aura container (fixes 14 family).
4. **SOS timelines:** Cap `AlDispatchTimeline` max-height with internal scroll OR reduce step min-heights for `sos` variant (10 steps).

---

## Screens with zero responsive layout issues (360 configs)

01, 02, 03, 04, 05, 06, 07, 09a, 10, 11, 12, 15, 15b, 16, 17, 18, 22, 23 — plus **09 empty state**.

**19 screens** pass all 12 configurations with no detected layout defects.
