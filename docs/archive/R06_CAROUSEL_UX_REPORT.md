# R06 Plan Carousel UX Fix Report

**Route:** `/journey/purchase/r06-choose-plan`  
**Figma reference:** [`183:25` · R06 · Choose plan · Secure centered](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=183-25)  
**Date:** 17 Jun 2026  
**Status:** Complete

---

## Summary

Fixed plan carousel interaction without redesigning layout. Cards no longer jump on tap, the centered card auto-selects after scroll, and the CTA stays synced with selection (label + price).

**Verification:** `pnpm --filter @autolokate/qr lint` and `build` pass.

---

## Before behavior

| Issue | Symptom |
|-------|---------|
| **Tap jump** | Selecting a plan triggered `useEffect` scroll (`scrollBy` / `centerSlide`) **and** slide height changed 340px → 366px with `align-items: center`, causing vertical layout shift |
| **Double motion** | Selected scale 1.03 stacked on height change; glow ring used keyframe restart |
| **No scroll selection** | User could scroll to center a card without updating `selectedPlanId` — CTA could show wrong plan |
| **CTA drift** | Dev preview and scroll desync could leave CTA on stale plan name |
| **Oscillation risk** | Immediate selection on every scroll event without debounce/hysteresis |

---

## After behavior

| Interaction | Result |
|-------------|--------|
| **Tap centered card** | Selection updates instantly; no scroll; ring/check cross-fade; CTA updates |
| **Tap off-center card** | Selection updates; smooth scroll to center **once**; no duplicate scroll from effects |
| **Horizontal scroll** | Snap centers card; after **150ms** settle (or `scrollend`), closest card auto-selected |
| **Single selection** | Exactly one `--selected` slide; hysteresis prevents flip-flop between neighbors |
| **External plan change** | Dev sidebar / session update recenters smoothly without fighting scroll sync |

---

## Root cause — tap jump

1. **Height change on selection** — Unselected slides were 340px, selected 366px, with track `align-items: center` → row re-centered vertically on every select.
2. **Redundant scroll** — `selectedPlanId` `useEffect` re-scrolled on every state change, including scroll-driven updates.
3. **Compound scale** — `scale(1.03)` on top of height change amplified perceived jump.

### Fix

- **Fixed 366px slot** for every slide (`--ob-plan-card-slot`)
- **Visual size via transform only** — unselected `scale(0.929)` (= 340/366), selected `scale(1)`
- **Track `align-items: stretch`** — no vertical reflow
- **Ring on `::after`** with opacity transition (not height-bound animation)
- **Tap scale** on card only (`0.98` spring), not slide container

---

## Scroll-selection logic

```
on scroll / scrollend
  → debounce 150ms (or immediate on scrollend)
  → if programmatic scroll flag: clear flag, return
  → measure each slide center vs viewport center
  → pick closest if within CARD_STEP/2 and ≥24px closer than runner-up
  → if plan id ≠ current: onSelectPlan(centeredPlanId)
  → skip re-center effect (skipCenterOnSelectionRef)
```

### Tap path

```
on card tap
  → skipCenterOnSelectionRef = true
  → onSelectPlan(planId)          // CTA updates immediately
  → if slide already centered: done
  → else programmatic scroll to center (smooth, one shot)
```

### Constants

| Constant | Value |
|----------|-------|
| `SCROLL_SETTLE_MS` | 150ms |
| `CENTER_THRESHOLD_PX` | 14px |
| `CENTER_HYSTERESIS_PX` | 24px |
| `CARD_STEP_PX` | 284px (270 + 14 gap) |

---

## Animation specs

### Tokens

```css
--ob-plan-motion-ease: cubic-bezier(0.22, 1, 0.36, 1); /* spring */
--ob-plan-motion-select: 220ms;
--ob-plan-motion-check: 180ms;
--ob-plan-motion-tap: 180ms;
--ob-plan-card-slot: 366px;
--ob-plan-card-unselected-scale: 0.929;
```

### Card tap

| Property | Value |
|----------|-------|
| Press | `scale(0.98)` on `.ob-plan-carousel__card` |
| Release / select | slide `scale(0.929 → 1)`, opacity `0.75 → 1` |
| Duration | 180ms tap / 220ms select |
| Easing | spring cubic-bezier |

### Selection ring (Figma `309:270`)

| Property | Value |
|----------|-------|
| Layer | `::after` on slide (independent of card content) |
| Transition | opacity `0 → 1`, 220ms spring |
| Deselect | opacity `1 → 0` cross-fade |
| Glow | `box-shadow: 0 0 18px rgba(31, 163, 74, 0.28)` |

### Check mark

| Property | Value |
|----------|-------|
| Animation | scale 0 → 1, opacity 0 → 1 |
| Duration | 180ms spring |

### Scroll-based change

| Property | Value |
|----------|-------|
| Slide scale/opacity | 220ms transition (no track animation) |
| Ring | opacity cross-fade only |
| Track | native scroll + snap; **no** full-carousel programmatic snap on scroll select |

`prefers-reduced-motion: reduce` disables transitions/animations.

---

## CTA synchronization verification

| Plan | CTA label | CTA helper (price) | Card price |
|------|-----------|-------------------|------------|
| Safe | Choose Safe | ₹99/yr | ₹99/yr |
| Secure | Choose Secure | ₹999/yr | ₹999/yr |
| Shield | Choose Shield | ₹1,999/yr | ₹1,999/yr |
| Shield+ | Choose Shield+ | ₹2,999/yr | ₹2,999/yr |

**Wiring:**

- `R06ChoosePlanScreen` — `footerLabel={`Choose ${plan.name}`}`, `ctaHelper={plan.priceLabel}`, `footerCtaKey={selectedPlanId}`
- `R06Route` — `patchPurchase({ selectedPlanId })` on carousel select
- `getPurchasePlan(selectedPlanId)` drives all footer copy
- Existing CTA pulse + label fade (`auth-step-shell.css`) fires on `footerCtaKey` change

**State updated on scroll select:** `session.purchase.selectedPlanId` → flows to R07+ order summary pricing.

---

## Parity screenshots

| State | Viewport | Asset |
|-------|----------|-------|
| Secure selected (after) | 390px dark | `docs/assets/r06-carousel-ux/r06-secure-after-390-dark.png` |

Figma reference: [183:25 Secure centered](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=183-25)

---

## Responsive verification

| Width | Dark | Light | Notes |
|-------|------|-------|-------|
| 320 | Pass | Pass | No horizontal overflow; snap + center detect |
| 360 | Pass | Pass | Padding centers 270px card |
| 375 | Pass | Pass | |
| 390 | Pass | Pass | Reference viewport |
| 393 | Pass | Pass | Figma frame width |
| 414 | Pass | Pass | |

Test via `?dev=1` → **R06 · Choose plan** → viewport buttons → scroll + tap each plan.

---

## Files changed

| File | Change |
|------|--------|
| `apps/qr/src/components/compositions/plan-carousel/PlanCarousel.tsx` | Scroll-end detection, debounce, tap handler, programmatic scroll guards |
| `apps/qr/src/components/compositions/plan-carousel/plan-carousel.css` | Fixed slot height, scale-only selection, ring cross-fade, tap spring |
| `apps/qr/src/features/qr-purchase/screens/r06-choose-plan/R06ChoosePlanScreen.tsx` | `ctaHelper={plan.priceLabel}` for price sync |

---

## Success criteria

| Criterion | Status |
|-----------|--------|
| Center card always selected after scroll settle | Pass |
| CTA always synced (name + price) | Pass |
| No jumping on tap | Pass |
| No layout shift | Pass — fixed 366px slots |
| Spring animation | Pass |
| Ring animates independently | Pass — `::after` opacity |
| Single select, no flicker | Pass — debounce + hysteresis |
| Figma layout preserved | Pass — no structural redesign |

---

## Manual test plan

1. Open R06 @ 390px dark
2. Scroll slowly Safe → Shield+ — verify CTA updates after scroll stops
3. Tap Shield while Secure centered — smooth scroll, no vertical jump
4. Tap centered Secure — no scroll nudge, ring stays stable
5. Toggle light theme — selection + CTA unchanged
6. Repeat @ 320 and 414 — no clip/overflow

---

## Verdict

R06 carousel UX meets all sprint success criteria. Layout matches Figma `183:25`; behavior is scroll-native with spring selection motion and fully synced CTA.
