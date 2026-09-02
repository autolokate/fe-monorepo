# Plan Card Audit — Phase 2.6

**Figma source:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/)  
**Component master:** `231:80` · **AlPlanCardW**  
**Screen reference:** `232:102` · Secure tier · **R06 · Choose plan**  
**Light DS instance:** `504:185` · Foundations (Light)  
**Date:** 2026-06-17

---

## Figma spec (latest)

| Property        | Dark                                                                   | Light             |
| --------------- | ---------------------------------------------------------------------- | ----------------- |
| Width           | 270px fixed                                                            | 270px fixed       |
| Padding         | 18px 20px                                                              | 18px 20px         |
| Radius          | 20px                                                                   | 20px              |
| Gap (stack)     | 14px                                                                   | 14px              |
| Surface         | `#1A1A1A`                                                              | `#FFFFFF`         |
| Border          | 1px `#4A4A4A`                                                          | 1px `#C4C4C4`     |
| Name            | Inter 20px / 600                                                       | Inter 20px / 600  |
| Price           | Inter 30px / 700                                                       | Inter 30px / 700  |
| Feature text    | Inter 13px / 400                                                       | Inter 13px / 400  |
| Feature row gap | 9px                                                                    | 9px               |
| Check icon      | 15×15 · `#1FA24A`                                                      | 15×15 · `#1FA24A` |
| Badge           | 11px / 600 · 6% tracking · green on `rgba(31,162,74,0.16)`             | same              |
| Includes pill   | 12px / 600 · 6×10 padding · 8px radius · `#4A4A4A` bg                  | theme variant     |
| Addon row       | 12px / 600 amber · `+` 15px / 600                                      | same              |
| Selected tick   | 24×24 · abs top 14px right 16px                                        | same              |
| Selected border | `onSurface` 1px                                                        | `onSurface` 1px   |
| CTA             | **Screen-level** (`AlButton/Primary` below carousel) — not inside card | same              |

---

## Issues found (before)

| #   | Issue                                     | Root cause                                          |
| --- | ----------------------------------------- | --------------------------------------------------- |
| 1   | Card felt generic / dashboard-like        | Missing badge, includes pill, addon, selected state |
| 2   | Name typography 22px (title token)        | Used `--al-text-title-size` instead of Figma 20px   |
| 3   | Feature labels 500 weight                 | Used label token weight; Figma is 400 regular       |
| 4   | No selected / hover interaction           | Component was static `<article>` only               |
| 5   | No MOST POPULAR badge                     | Prop not implemented                                |
| 6   | No includes pill                          | Prop not implemented                                |
| 7   | No rider addon section                    | Prop not implemented                                |
| 8   | No selected checkmark                     | Prop not implemented                                |
| 9   | Price missing `/yr` suffix in composition | Composition data only, not component                |
| 10  | Border radius token mismatch risk         | Used generic xl without explicit 20px token         |

---

## Fixes applied (core — `AlPlanCard`)

| Fix                                                                   | File                                      |
| --------------------------------------------------------------------- | ----------------------------------------- |
| Full Figma structure: badge, includes, features, addon, selected mark | `PlanCard.tsx`                            |
| Pixel tokens: 270w, 18/20 pad, 14 gap, 20 radius, 9 feature gap       | `PlanCard.css`, `spacing.ts`, `theme.css` |
| Name 20/600, price 30/700, feature 13/400                             | `PlanCard.css`                            |
| Interactive `button` with hover border + press scale                  | `PlanCard.css`                            |
| Selected: `onSurface` border + absolute 24px tick slot                | `PlanCard.css`                            |
| Badge gradient `rgba(31,162,74,0.16)`                                 | `colors.ts`, `theme.css`                  |
| Addon separator + amber `+` row                                       | `PlanCard.css`                            |

---

## Visual QA (after)

| Check          | 320 | 360 | 375 | 390 | 414 | Result                                  |
| -------------- | --- | --- | --- | --- | --- | --------------------------------------- |
| Overflow       | ✓   | ✓   | ✓   | ✓   | ✓   | Feature text wraps; no horizontal clip  |
| Icon alignment | ✓   | ✓   | ✓   | ✓   | ✓   | 15px checks vertically centered         |
| Selected tick  | ✓   | ✓   | ✓   | ✓   | ✓   | Top-right 14/16px inset                 |
| Light theme    | ✓   | ✓   | ✓   | ✓   | ✓   | White surface, dark text                |
| Dark theme     | ✓   | ✓   | ✓   | ✓   | ✓   | `#1A1A1A` surface, white text           |
| Touch target   | ✓   | ✓   | ✓   | ✓   | ✓   | Full card is button when `onSelect` set |
| Theme switch   | ✓   | —   | —   | —   | —   | Semantic surface/outline tokens         |

---

## Before vs after

| Aspect         | Before                           | After                                                     |
| -------------- | -------------------------------- | --------------------------------------------------------- |
| Structure      | Name + price + flat feature list | Badge → name → price → includes → features → addon → tick |
| Premium feel   | Generic bordered card            | Figma carousel card with badge, tier pill, addon          |
| Selected state | None                             | Border highlight + 24px check                             |
| Hover          | None                             | Outline-strong border on interactive card                 |
| Typography     | 22px name, 500 features          | 20px name, 400 features, 30px price                       |
| CTA            | N/A in component                 | Documented as screen-level per Figma R06                  |

---

## Remaining notes

- **CTA placement:** Figma places Continue/primary CTA below the plan carousel, not inside `AlPlanCardW`. Component does not embed CTA by design.
- **Carousel peek:** Horizontal scroll/peek is a screen layout concern (flows phase), not card component scope.
