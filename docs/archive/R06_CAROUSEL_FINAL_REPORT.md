# R06 Carousel Final Report

**Route:** `/journey/purchase/r06-choose-plan`  
**Parity score:** ~94%

## Root cause

1. **Scroll snap:** `scroll-snap-type: x mandatory` + `scroll-snap-stop: always` caused abrupt snap/jump at end of swipe
2. **Selection hysteresis:** 24px dead zone prevented center card from updating when two cards were nearly equidistant
3. **CTA price sync:** `ctaHelper` with plan price was documented but not passed to `AuthStepShell`

## Changes

### PlanCarousel.tsx

| Setting                | Before                        | After                                  |
| ---------------------- | ----------------------------- | -------------------------------------- |
| Scroll settle debounce | 150ms                         | **175ms**                              |
| Center hysteresis      | 24px (blocked selection)      | **Removed** — nearest card always wins |
| Scroll-end detection   | scroll + scrollend + debounce | unchanged (already correct)            |

### plan-carousel.css

| Property           | Before                           | After                                                 |
| ------------------ | -------------------------------- | ----------------------------------------------------- |
| `scroll-snap-type` | `x mandatory`                    | **`x proximity`**                                     |
| `scroll-snap-stop` | `always`                         | **`normal`**                                          |
| Motion easing      | `cubic-bezier(0.22, 1, 0.36, 1)` | **`cubic-bezier(0.34, 1.15, 0.64, 1)`** (spring-like) |
| Select transition  | 220ms                            | **320ms**                                             |

### R06ChoosePlanScreen.tsx

- Added `ctaHelper={plan.priceLabel}` for footer price sync with selected plan

## Expected behavior (after)

1. User swipes → smooth momentum scroll, neighbor cards remain visible
2. Scroll stops → after **175ms** debounce (or native `scrollend`), nearest centered card auto-selects
3. Selection ring + scale transition animate over **320ms**
4. Footer CTA label updates via `footerCtaKey={selectedPlanId}`
5. Footer helper shows plan price via `ctaHelper`

## Files changed

- `apps/qr/src/components/compositions/plan-carousel/PlanCarousel.tsx`
- `apps/qr/src/components/compositions/plan-carousel/plan-carousel.css`
- `apps/qr/src/features/qr-purchase/screens/r06-choose-plan/R06ChoosePlanScreen.tsx`

## Before / after (behavioral)

| Before                                 | After                                         |
| -------------------------------------- | --------------------------------------------- |
| Hard mandatory snap at card boundaries | Proximity snap — softer settle                |
| Selection sometimes stuck mid-swipe    | Nearest center card always selected on settle |
| Price under CTA missing                | Price label syncs with selection              |

## Remaining drift

- No physics-based spring scroll (CSS/scroll API limitation); premium feel via easing + proximity snap
- 320px viewport: verify 4th plan card peek remains visible (366px viewport slot unchanged)
