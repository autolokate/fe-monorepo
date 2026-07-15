# Vehicle Info Audit — Phase 2.6

**Figma source:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/)  
**Screen:** `170:71` · **R05 · Confirm vehicle**  
**RC card node:** `170:79`  
**AlField master:** `83:38`  
**Date:** 2026-06-17

---

## Figma spec (latest)

### RC card shell (`170:79`)

| Property   | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Layout     | Column · stretch · gap 16px · padding 16px                 |
| Radius     | 16px                                                       |
| Border     | 1px `#4A4A4A`                                              |
| Background | `linear-gradient(180deg, #252525 0%, #1A1A1A 100%)`        |
| Width      | Full bleed inside 16px screen margin (361px content @ 393) |

### Header row

| Element  | Spec                                                            |
| -------- | --------------------------------------------------------------- |
| RC badge | 30×30 · radius 7px · `#4A4A4A` bg · "RC" 12px/700               |
| Title    | "Registration Certificate" · Label 13px/500 muted               |
| Status   | Verified chip · icon 14px circle-check · Label · pill `#4A4A4A` |

### Registration number

| Property | Value                                            |
| -------- | ------------------------------------------------ |
| Text     | `MH 12 AB 3456`                                  |
| Style    | Inter 29px / 700 · letter-spacing 1% · uppercase |

### Divider

1px horizontal rule · `#4A4A4A` · full width

### Field grid

| Property    | Value                                   |
| ----------- | --------------------------------------- |
| Row gap     | 13px                                    |
| Column gap  | 16px                                    |
| Columns     | 2 per row (Owner/Class, Maker/Model, …) |
| AlField gap | 2px label-to-value                      |
| Label       | Inter 13px / 500 / 18px · `#8A8A8A`     |
| Value       | Inter 16px / 600 / 24px · on-surface    |

---

## Issues found (before)

| #   | Issue                          | Root cause                                                                   |
| --- | ------------------------------ | ---------------------------------------------------------------------------- |
| 1   | Wrong composition pattern      | Preview used Heading + StatusPill + single-column fields — not Figma RC card |
| 2   | Wrong status control           | `AlStatusPill` "Protected" vs Figma `Verified` green chip with icon          |
| 3   | No registration emphasis       | Missing 29px/700 plate line                                                  |
| 4   | Single-column layout           | Figma uses 2-column paired field rows                                        |
| 5   | No RC card gradient shell      | Missing premium card container                                               |
| 6   | AlField value line-height 20px | Used button line-height token instead of body 24px                           |
| 7   | Chip showed dot + icon         | AlChip always rendered dot even with icon                                    |

---

## Fixes applied (core)

| Component                 | Fix                                                     |
| ------------------------- | ------------------------------------------------------- |
| **AlVehicleRcCard** (new) | Full RC card: header, registration, divider, 2-col grid |
| **AlField**               | Value typography → 16px / 600 / 24px line-height        |
| **AlChip**                | Icon-only when `icon` prop provided (no dot)            |
| **AlChip**                | Icon container → 14×14 for verified chip parity         |
| **Tokens**                | Vehicle RC dimensions + dark/light gradients            |

---

## Responsive validation

| Width | Registration        | Field grid | Overflow | Wrapping          |
| ----- | ------------------- | ---------- | -------- | ----------------- |
| 320px | ✓ 29px scales/wraps | ✓ 2-col    | ✓ none   | ✓ long names wrap |
| 360px | ✓                   | ✓          | ✓        | ✓                 |
| 375px | ✓                   | ✓          | ✓        | ✓                 |
| 390px | ✓                   | ✓          | ✓        | ✓                 |
| 414px | ✓                   | ✓          | ✓        | ✓                 |

---

## Visual QA (after)

| Check                   | Result                                       |
| ----------------------- | -------------------------------------------- |
| Field alignment         | 2-column rows align to Figma 16px column gap |
| Label hierarchy         | 13px muted above 16px semibold values        |
| Status pill placement   | Verified chip top-right of header row        |
| Spacing rhythm          | 16px card gap · 13px row gap · 2px field gap |
| Vehicle number emphasis | 29px/700 uppercase registration line         |
| Light theme             | `#F5F5F5 → #FFFFFF` gradient, dark text      |
| Dark theme              | `#252525 → #1A1A1A` gradient, white text     |
| Icon alignment          | 14px check centered in chip                  |
| Touch targets           | Display-only — N/A                           |
| Theme switching         | Gradients swap via `[data-theme='light']`    |

---

## Before vs after

| Aspect       | Before                          | After                              |
| ------------ | ------------------------------- | ---------------------------------- |
| Layout       | Vertical list with page heading | RC card with header + plate + grid |
| Status       | AlStatusPill "Protected"        | AlChip "Verified" with check icon  |
| Registration | AlField row                     | Dedicated 29px/700 emphasis line   |
| Fields       | 4 single-column rows            | 8 fields in 4×2 grid               |
| Surface      | Flat stack on background        | Gradient card with 16px radius     |
| Typography   | Value 16/600/20                 | Value 16/600/24 per Figma          |

---

## Figma fields (R05)

| Label      | Value            |
| ---------- | ---------------- |
| Owner      | Shibu Shrivastva |
| Class      | LMV · Car        |
| Maker      | Maruti Suzuki    |
| Model      | Swift VXi        |
| Fuel       | Petrol           |
| Colour     | Pearl White      |
| Registered | 14 Mar 2021      |
| Valid till | 13 Mar 2036      |
