# Checkbox Parity Report

**Date:** 2026-06-19  
**Figma source:** `91:268` · `AlCheckbox/Off` (`81:25`) · `AlCheckbox/On` (`81:23`)

---

## Figma Spec (MCP verified)

| Property        | Unchecked       | Checked                   |
| --------------- | --------------- | ------------------------- |
| Size            | 22×22           | 22×22                     |
| Radius          | 8px             | 8px                       |
| Border          | 1.5px `#4A4A4A` | none (fill)               |
| Background      | transparent     | `#1FA24A`                 |
| Checkmark       | —               | 6.5×5, 1.8px white stroke |
| Tap target      | 48×48           | 48×48                     |
| Label gap       | 12px            | 12px                      |
| Row padding-top | 8px             | 8px                       |

---

## Usages Audited

| Location           | Component                           | Status                    |
| ------------------ | ----------------------------------- | ------------------------- |
| Auth A1 mobile     | `InlineConsentBlock` → `AlCheckbox` | **Fixed**                 |
| Purchase R06 legal | `AlCheckbox` with label             | **Fixed** (inherits base) |
| PWA                | No standalone checkbox              | N/A                       |

---

## Root Causes

1. **Base `AlCheckbox`** — box used `var(--al-color-surface)` fill instead of transparent; checkmark position not aligned to Figma vector
2. **`InlineConsentBlock`** — shrunk control to 22×22, removing 48px tap target required by Figma hotspot `634:2049`

---

## Fixes

### `packages/ui/.../Checkbox/Checkbox.css`

- Box: 22×22, 8px radius, 1.5px `#4A4A4A`, transparent background
- Checked: `#1FA24A` fill + border
- Checkmark: repositioned to match Figma vector bounds

### `inline-consent-block.css`

- Control restored to 48×48 with centered 22px box
- `margin: -13px 0 0 -13px` aligns tap target with Figma x:3 hotspot
- Gap 12px to legal copy preserved

---

## States

| State     | Implementation                          |
| --------- | --------------------------------------- |
| Unchecked | Gray 1.5px border, transparent fill     |
| Checked   | Green fill, white checkmark             |
| Disabled  | Existing `.is-disabled` opacity rules   |
| Error     | `errorText` on `AlCheckbox` (R06 legal) |
| Focus     | `:focus-visible` outline on box         |

---

## Verdict

**READY** for checkbox component scope. Re-verify visually on A1 mobile empty + ready states after refresh.
