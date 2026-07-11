# R06 · Choose Plan — Visual Parity Report

**Figma file:** `FtHCUnE0HH586PtG5yJyG0` · Section `167:434` · Consumer · QR Activation + Purchase  
**Primary reference:** `183:25` · R06 · Choose plan · Secure centered  
**Variant references:** `243:49` Safe · `243:76` Shield · `243:103` Shield+  
**Component reference:** `231:80` · AlPlanCardW  
**Audit date:** 2026-06-18  
**Scope:** Visual/CSS only — no routing, session, or business logic changes

---

## Executive summary

R06 was audited against Figma frame measurements (not design-token estimates). The implementation had heading clipping, incorrect carousel centering/snap, mismatched card dimensions, and token drift on internal card typography. All fixes are scoped to `plan-carousel.css`, `auth-step-shell.css` (`.ob-auth-shell--plan-screen`), and carousel scroll positioning in `PlanCarousel.tsx`.

---

## Screenshot comparison

| View | Figma reference | Implementation (post-fix) |
|------|-----------------|---------------------------|
| Secure centered | `183:25` — 393×852, Secure at x≈62 | Dev preview @ 390px dark — Secure centered with Safe/Shield peek |
| Shield centered | `243:76` — selection ring 270×366 | Selected slide 366px, ring matches card bounds |
| Shield+ centered | `243:103` — card 270×366, row offset −806.5 | Selected slide 366px, card fill `#1A1A1A` to full height |

### Rendered screenshots

| State | Asset |
|-------|-------|
| Before (heading clip, left-aligned card) | Dev preview @ 390px — heading partially clipped, carousel not centered |
| After (this audit) | [`docs/assets/r06-parity/r06-post-fix-390px.png`](assets/r06-parity/r06-post-fix-390px.png) |

Post-fix verification (390px dark, Secure selected):
- Heading `Choose your plan` fully visible at y≈12px in phone frame (28/36/700)
- Secure card centered; Safe left edge + Shield right edge partially visible
- Selection ring flush with 366px selected slide
- CTA `Choose Secure` pinned bottom, 58px height

---

## Figma frame measurements (source of truth)

### Screen shell — `183:25`

| Element | Figma measurement |
|---------|-------------------|
| Frame | 393 × 852 px |
| Background | `#0A0A0C` |
| Content frame (`183:27`) | y: 66, width: 393, padding: 0 16px, gap: **14px** |
| Carousel (`232:62`) | height: **366px**, horizontal fill |
| CTA (`183:33`) | x: 16, y: **762**, **361 × 58**, radius **16px** |
| Selection ring (`309:270`) | **270 × 366**, x: 62, y: 186, stroke **2px #1FA24A**, shadow `0 0 18 rgba(31,163,74,0.28)` |

### Typography — content frame

| Role | Figma style | Size / line / weight | Color |
|------|-------------|----------------------|-------|
| Headline | `Headline` | **28 / 36 / 700** | `#FFFFFF` |
| Subtitle | `Body` | **16 / 24 / 400** | `#8A8A8A` |
| Carousel hint | `Body (3:6)` | **16 / 24 / 400**, centered | `#8A8A8A` |
| CTA label | `style_SOAAXE` | **16 / 20 / 600** | `#0A0A0A` on `#FFFFFF` button |

### Carousel row — `232:63` / `layout_8MYIF9`

| Property | Figma value |
|----------|-------------|
| Direction | row |
| alignItems | **center** |
| gap | **14px** |
| Secure centered offset | x: **−238px** (361px content → centers 270px card) |

### Plan card — AlPlanCardW (`231:80` / instances)

| Property | Unselected (`layout_2QDEI1`) | Selected (`layout_S331VM`) |
|----------|------------------------------|----------------------------|
| Width | **270px** | **270px** |
| Height | **340px** | **366px** |
| Padding | **18px 20px** | **18px 20px** |
| Internal gap | **14px** | **14px** |
| Border | **1px #4A4A4A** | **1px #4A4A4A** |
| Radius | **20px** | **20px** |
| Fill | **#1A1A1A** | **#1A1A1A** |

### Card internals (Secure instance `232:102`)

| Element | Figma measurement |
|---------|-------------------|
| Plan name (`style_J1E7GQ`) | **20px / 600** |
| Price (`style_NJKFG3`) | **30px / 700** |
| MOST POPULAR chip | padding **4×10**, radius **20**, bg `rgba(31,163,74,0.16)` |
| Includes pill | padding **6×10**, radius **8**, fill **#4A4A4A** |
| Features list | gap **9px**, padding-top **2px** |
| Feature row | gap **9px**, icon **15×15** |
| Feature text (`style_E1RQ91`) | **13px / 400** |
| Addon block | gap **9px**, padding-top **3px** |
| Selection tick | **24×24**, position **x:230 y:14** (→ top **14**, right **16** on 270 card) |

---

## Differences found (before → after)

### 1. Heading visibility

| | Before | Figma | After |
|---|--------|-------|-------|
| Stack overflow | `overflow-y: hidden` clipped content | hug layout, no clip | `overflow-y: visible` |
| Top inset | Generic purchase padding conflicted | y: 66 → **22px** below status | `max(22px, safe-area-inset-top)` |
| Headline size | Token `1.75rem` (28px) ✓ but letter-spacing −0.01em | **28/36/700**, letter-spacing 0 | Explicit **28px/36px/700** on plan screen |

### 2. Carousel viewport & centering

| | Before | Figma | After |
|---|--------|-------|-------|
| Viewport height | `22.875rem` (366px) ✓ | **366px** | **366px** explicit |
| Card width | `16.875rem` (270px) ✓ | **270px** | **270px** explicit |
| Center padding | Missing / negative margins | offset −238 for Secure | `padding-inline: calc((100% - 270px) / 2)` + `scroll-padding-inline` |
| Snap | `scroll-snap-align: center` ✓ | center selected | + `scrollTo` centering on select |
| alignItems | `stretch` (bug) | **center** | **center** |
| Neighbor peek | Broken / overflow | partial cards visible | Contained in 366px viewport |

### 3. Card dimensions

| | Before | Figma | After |
|---|--------|-------|-------|
| Unselected height | `min-height: 340px` on card only | slide **340px** | slide **340px**, card `height: 100%` |
| Selected height | Ring on wrong box; empty gap below content | slide **366px** | slide **366px**, card fills + `#1A1A1A` bg |
| Selected ring | `inset: -2px` on slide; misaligned | **270×366** overlay | `inset: 0` on card `::after`, radius **20px** |

### 4. Card internal layout

| Element | Before (token/estimate) | Figma | After |
|---------|-------------------------|-------|-------|
| Name | 20px ✓ | 20/600 | **20px/600/24** |
| Price | 30px ✓ | 30/700 | **30px/700/36** |
| Badge padding | `4px 10px` approx | **4×10** | **4×10**, radius **20** |
| Includes pill | token surface-variant | **6×10, 8px, #4A4A4A** | exact px |
| Feature gap | `0.5625rem` (9px) ✓ | **9px** | **9px** |
| Feature weight | label token **500** | **400** | **400** |
| Feature size | 13px ✓ | **13px** | **13px** |
| Addon color | `--al-color-warning` | **#F5A623** | **#F5A623** |
| Tick position | `0.875rem / 1rem` | **top 14, right 16** | **14px / 16px** |

### 5. CTA vertical rhythm

| Segment | Figma (y from screen top) | Implementation |
|---------|---------------------------|----------------|
| Content frame start | **66** | stack padding-top **22px** (+ safe area) |
| Back → heading gap | **14** | stack gap **14px** |
| Heading block | ~68px (36+8+24) | h2 + 8px gap + body |
| Heading → carousel | **14** | stack gap **14px** |
| Carousel | **366** | viewport **366px** |
| Carousel → hint | **14** | carousel gap **14px** |
| Hint → CTA | ~172px (762 − ~590) | footer `margin-block-start: auto` |
| CTA | **762**, h **58** | `min-height: 58px`, radius **16px**, full width |

### 6. Helper text copy

| | Before | Figma (`576:1638`) |
|---|--------|---------------------|
| String | `‹ Tap a card…` | `‹  Tap a card to compare · 4 plans  ›` (extra spaces) |

---

## Fixes applied (files)

| File | Changes |
|------|---------|
| `apps/qr/src/components/compositions/plan-carousel/plan-carousel.css` | Figma px values for viewport, slides, card, ring, typography, colors |
| `apps/qr/src/components/compositions/plan-carousel/PlanCarousel.tsx` | Viewport wrapper; `scrollTo` center math (`offsetLeft − (clientWidth − slideWidth) / 2`); hint copy spacing |
| `apps/qr/src/components/auth-step-shell/auth-step-shell.css` | `.ob-auth-shell--plan-screen` heading, stack, footer, CTA spacing |

**Not modified:** `PurchaseRoutes.tsx`, session types, pricing logic, plan data.

---

## Verification checklist

- [x] Heading fully visible (no clip/overflow on plan screen stack)
- [x] Selected card centered with neighbor peek
- [x] Carousel viewport **366px** fixed
- [x] Card **270×340** unselected / **270×366** selected
- [x] Card padding **18×20**, gap **14**, radius **20**
- [x] Selection ring **2px #1FA24A** matches card bounds
- [x] Internal card layout matches AlPlanCardW measurements
- [x] Helper text → CTA vertical rhythm via fixed carousel + auto footer
- [x] Build passes (`pnpm --filter @autolokate/qr build`)

---

## Residual notes

1. **Dev preview** (`?dev=1`) uses a narrow phone chrome; journey URL requires auth — use dev preview at **390px dark** for R06 sign-off.
2. **iOS status bar** (44px) is not rendered in web shell; top inset uses **22px** (Figma y:66 − status 44) plus `safe-area-inset-top`.
3. **Shield+ frame** (`243:103`) confirms selected height **366px** even with fewer features — empty space is intentional (Figma `justifyContent: center` on card column).

---

## Figma links

- [R06 Secure centered — 183:25](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=183-25)
- [R06 Shield+ centered — 243:103](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=243-103)
- [AlPlanCardW — 231:80](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=231-80)

**Verdict:** R06 visual parity aligned to Figma frame measurements. Re-verify Shield+ and Shield selections in live journey after refresh.
