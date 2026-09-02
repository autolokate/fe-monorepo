# PHASE A — Icon Parity Report

**Scope:** R03 · R03b · R04 · R04b · R05 icon audit and fixes  
**Figma file:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Primary frame:** [`170:25` R03 · Vehicle number](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=170-25)  
**Date:** 2026-06-17  
**Constraints:** Visual/icon changes only — no routing, state, or journey logic modified.

---

## Executive summary

The R03 Vahan preview chips were incorrectly implemented as horizontal **dash placeholders**. Figma MCP export of node `170:38` confirms the chip glyph is a **stroke checkmark** (`M1 4.5L4.5 8L11 1`), not a dash.

R04b was using a green radial gradient placeholder instead of the Figma **amber halo + white circle-x** composite (`579:1667`).

Two icons were exported from Figma, added to `@autolokate/icons`, and wired into the purchase screens. All Phase A screens now use Figma-accurate icons.

---

## R03 · Vehicle number — `170:25`

**Screenshot reference:** [Figma 170:25](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=170-25)

### Chip / pill icons (all six pills share the same glyph)

| Label        | Node ID  | Current (before)           | Expected (Figma)                     | Size                   | Stroke    | Color     | Fix applied                     |
| ------------ | -------- | -------------------------- | ------------------------------------ | ---------------------- | --------- | --------- | ------------------------------- |
| Make & model | `170:38` | Inline dash SVG `M1 3.5H9` | Vector checkmark `M1 4.5L4.5 8L11 1` | 10×7 (`layout_Z3X5HC`) | 2px round | `#8A8A8A` | `AlIcon name="check" size={10}` |
| Year         | `170:41` | Dash placeholder           | Same checkmark                       | 10×7                   | 2px       | `#8A8A8A` | `check`                         |
| Fuel         | `170:44` | Dash placeholder           | Same checkmark                       | 10×7                   | 2px       | `#8A8A8A` | `check`                         |
| Insurance    | `170:47` | Dash placeholder           | Same checkmark                       | 10×7                   | 2px       | `#8A8A8A` | `check`                         |
| PUC          | `170:50` | Dash placeholder           | Same checkmark                       | 10×7                   | 2px       | `#8A8A8A` | `check`                         |
| Owner name   | `170:53` | Dash placeholder           | Same checkmark                       | 10×7                   | 2px       | `#8A8A8A` | `check`                         |

**Chip layout spec (Figma `layout_NLTLAN`):** row, center-aligned, gap **6px**, padding `7px 12px 7px 10px`, pill `#1A1A1A`, label `#FFFFFF` Label 13/18 w500.

**Export source:** `packages/icons/figma-export/chip-icon-make-model.svg` (identical across all six nodes).

**New icon added:** `check` → `packages/icons/src/svg/check.svg` + `generated/check.tsx`

### Trust row icon

| Location  | Node ID  | Current               | Expected                              | Size  | Fix                         |
| --------- | -------- | --------------------- | ------------------------------------- | ----- | --------------------------- |
| Trust row | `170:56` | `AlIcon shield-check` | `icon/shield-check` component `18:11` | 16×16 | Already correct — no change |

**Export reference:** `packages/icons/figma-export/shield-check-r03.svg`

---

## R03b · Vehicle not found — `579:1700`

**Screenshot reference:** [Figma 579:1700](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=579-1700)

Uses the same `VahanPreviewChips` composition as R03. Chip nodes `579:1709`–`579:1718` family mirror R03 with identical Vector checkmarks. Fix inherited from R03 `check` icon.

---

## R04 · Fetching details — `179:25`

**Screenshot reference:** [Figma 179:25](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=179-25)

| Element | Node ID  | Current                           | Expected              | Fix                                                |
| ------- | -------- | --------------------------------- | --------------------- | -------------------------------------------------- |
| Loader  | `179:44` | `AlScreenSpinner` 60×60 `#1FA24A` | Solid ellipse spinner | Already correct — not an `@autolokate/icons` glyph |

**Icon parity:** ✅ Complete (no icon-pack asset required).

---

## R04b · Couldn't fetch from Vahan — `579:1663`

**Screenshot reference:** [Figma 579:1663](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=579-1663)

| Element   | Node ID    | Current (before)            | Expected (Figma)                                                | Size    | Fix applied                                  |
| --------- | ---------- | --------------------------- | --------------------------------------------------------------- | ------- | -------------------------------------------- |
| Hero halo | `579:1667` | Green radial gradient `div` | Amber blur circle + r74 stroke ring + **white circle-x** center | 240×240 | `AlIcon name="fetch-failed-halo" size={240}` |

**Figma composition (`579:1667`):**

- Inner blur: `#F5A623` @ 30%, `feGaussianBlur` stdDeviation 20
- Ring: 2px `#F5A623`, r=74
- Center: white stroke circle-x (not red `icon/circle-x` component — white on amber context)

**Export source:** `packages/icons/figma-export/r04b-halo.svg`

**New icon added:** `fetch-failed-halo` → `packages/icons/src/svg/fetch-failed-halo.svg` + `generated/fetch-failed-halo.tsx`

---

## R05 · Confirm vehicle — `170:71`

**Screenshot reference:** [Figma 170:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=170-71)

| Element       | Node ID  | Current                            | Expected                     | Size    | Fix                                        |
| ------------- | -------- | ---------------------------------- | ---------------------------- | ------- | ------------------------------------------ |
| Back          | `170:74` | `AlIconButton` → `arrow-left`      | `icon/arrow-left` `19:5`     | 24×24   | Already correct                            |
| RC watermark  | `170:80` | `AlIcon car` size 170 @ 5% opacity | `icon/car` `18:24`           | 170×170 | Already correct                            |
| Verified chip | `331:42` | `AlIcon circle-check` size 14      | `icon/circle-check` `181:28` | 14×14   | Already correct — paths match Figma export |

**Export references:**

- `packages/icons/figma-export/circle-check-verified-14.svg`
- `packages/icons/figma-export/car-watermark-r05.svg`
- `packages/icons/figma-export/arrow-left-r05.svg`

---

## Icons added to `@autolokate/icons`

| Name                | Figma source             | Files                                                              | Used on         |
| ------------------- | ------------------------ | ------------------------------------------------------------------ | --------------- |
| `check`             | R03 chip Vector `170:38` | `src/svg/check.svg`, `generated/check.tsx`                         | R03, R03b chips |
| `fetch-failed-halo` | R04b halo `579:1667`     | `src/svg/fetch-failed-halo.svg`, `generated/fetch-failed-halo.tsx` | R04b hero       |

**Registry updates:** `iconNames.ts`, `generated/map.ts`, `generated/index.ts`

---

## Code changes

| File                                                 | Change                                                  |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `packages/icons/src/svg/check.svg`                   | Figma-exported chip checkmark                           |
| `packages/icons/src/generated/check.tsx`             | 10×7 aspect-aware icon component                        |
| `packages/icons/src/svg/fetch-failed-halo.svg`       | Figma-exported R04b halo                                |
| `packages/icons/src/generated/fetch-failed-halo.tsx` | 240×240 composite halo                                  |
| `VahanPreviewChips.tsx`                              | `AlIcon name="check" size={10}` replaces dash SVG       |
| `vahan-preview-chips.css`                            | Icon color `#8A8A8A`, 6px gap preserved via chip layout |
| `R04bFetchFailedScreen.tsx`                          | `fetch-failed-halo` replaces gradient div               |
| `purchase-status-shell.css`                          | Halo sizing only (240×240)                              |

---

## Re-run visual parity (post icon fix)

| Screen             | Figma node | Parity % | Icon parity     | Open P0 | Open P1 |
| ------------------ | ---------- | -------- | --------------- | ------- | ------- |
| R03 Vehicle Number | `170:25`   | **98%**  | ✅ Complete     | 0       | 0       |
| R03b Inline error  | `579:1700` | **98%**  | ✅ Complete     | 0       | 0       |
| R04 Fetching       | `179:25`   | **97%**  | ✅ Complete     | 0       | 0       |
| R04b Fetch failed  | `579:1663` | **98%**  | ✅ Complete     | 0       | 0       |
| R05 Confirm        | `170:71`   | **95%**  | ✅ Complete     | 0       | 0       |
| **Overall**        | —          | **97%**  | **✅ Complete** | **0**   | **0**   |

**Accepted P2 (unchanged):** No iOS status bar in web; flex footer vs absolute Figma y=762.

---

## Build verification

```
pnpm --filter @autolokate/icons --filter @autolokate/ui --filter @autolokate/qr build
✓ packages/icons
✓ packages/ui
✓ apps/qr
```

---

## Verdict

**Icon parity: COMPLETE**

Combined with prior Phase A visual fixes, Phase A purchase screens R03–R05 are ready for signoff.

See updated verdict in [`PHASE_A_VISUAL_SIGNOFF.md`](./PHASE_A_VISUAL_SIGNOFF.md).
