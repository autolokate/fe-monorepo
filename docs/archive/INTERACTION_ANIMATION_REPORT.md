# Sprint 4.3 — Interaction Animation Report

**App:** `@autolokate/qr`  
**Goal:** Improve tactile feel with motion only — no layout changes.  
**Date:** June 2026  
**Status:** ✅ Complete

---

## Summary

Sprint 4.3 adds GPU-friendly CSS motion across cards, carousels, step shells, buttons, and loading states. All animations use `transform`, `opacity`, and `box-shadow` only (no layout-affecting properties). Every animated surface includes a `prefers-reduced-motion: reduce` fallback.

**Verification:** `pnpm --filter @autolokate/qr lint` and `build` pass.

---

## Design principles

| Rule | Implementation |
|------|----------------|
| One card at a time | Carousel uses scroll-snap + single `--selected` slide; selectors are mutually exclusive |
| No full-screen sliding | Step enter is 6px translate + fade, not page slide |
| No excessive motion | Scale range 0.94–1.03; durations 180–260ms |
| 60fps | `transform` / `opacity` / `box-shadow` only; no width/height/margin animation |
| Reduced motion | Global + per-component `@media (prefers-reduced-motion: reduce)` blocks |

### Shared motion tokens

Defined in `apps/qr/src/styles/interaction-motion.css` and imported from `main.tsx`:

| Token | Value | Use |
|-------|-------|-----|
| `--ob-motion-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | Spring-like ease-out |
| `--ob-motion-tap` | `180ms` | Press / active states |
| `--ob-motion-select` | `220ms` | Selection glow / scale settle |
| `--ob-motion-enter` | `260ms` | Step and list enter |

Existing design-system tokens (`--al-motion-fast`, `--al-motion-scale-press`, etc.) are reused where components already depend on them.

---

## Interaction surfaces

### 1. Step transitions

**Where:** All screens using `ob-step-chrome-screen` (FlowStepShell, AuthStepShell, WelcomeActivationShell, PurchaseStatusShell, legal readers).

**Motion:** `.ob-step-chrome__frame` fades in and translates **6px** upward on mount.

| Property | From → To |
|----------|-----------|
| Opacity | 0 → 1 |
| Translate Y | 6px → 0 |
| Duration | 260ms spring |

**Reduced motion:** Animation disabled; frame shown at full opacity with no transform.

---

### 2. Plan carousel (plan card selection)

**Files:** `plan-carousel.css`, `PlanCard.css`

**Behavior:**

| State | Motion |
|-------|--------|
| Unselected slide | `opacity: 0.75`, `scale(0.96)` |
| Selected slide | `opacity: 1`, `scale(1.03)`, green ring glow via `::after` |
| Tap (unselected) | `scale(0.94)` |
| Tap (selected) | `scale(1.01)` |
| Check mark | Pop-in scale + opacity (180ms) |
| Plan card selected | Spring scale 0.98 → 1 + success glow |

Carousel scroll remains snap-based (not animated slide transition). Only the focused card scales/glows — one card emphasized at a time.

**Reduced motion:** Slides fixed at `scale(1)`; transitions and check pop disabled.

---

### 3. Relationship selector (emergency flow)

**Files:** `RelationGrid.css`, `RelationshipSelector.tsx` (`className="ob-relationship-selector"`)

**Behavior:**

| State | Motion |
|-------|--------|
| Hover | `translateY(-2px)`, stronger border |
| Tap | `scale(0.96)` |
| Selected | Green border, glow shadow, spring scale 0.94 → 1 |

**Reduced motion:** No hover lift, tap scale, or select animation.

---

### 4. Rider selection (R07 cover options)

**File:** `rider-cover-options.css`

**Behavior:**

| State | Motion |
|-------|--------|
| Hover (unselected) | `translateY(-1px)`, border emphasis |
| Tap | `scale(0.98)` |
| Selected | Success glow, spring scale 0.97 → 1 |
| Radio icon | Pop scale 0.6 → 1 + fade-in |

**Reduced motion:** All transforms and animations disabled.

---

### 5. Emergency contact cards

**Files:** `ContactCard.css`, `EmergencyContactRow.tsx`, `emergency-contact-row.css`, `interaction-motion.css`

**Summary list enter (E09 / E10):** `.ob-contact-card-list > .al-contact-card` staggers fade-up (40ms delay per child, max 3).

| Property | From → To |
|----------|-----------|
| Opacity | 0 → 1 |
| Translate Y | 8px → 0 |
| Scale | 0.98 → 1 |

**Base card:** Transition on transform, border-color, box-shadow for future interactive use.

**Reduced motion:** List enter disabled; cards shown immediately.

---

### 6. Permission cards (R14)

**File:** `permission-row.css`

**Behavior:**

| State | Motion |
|-------|--------|
| Toggle on (`:has(input:checked)`) | Green-tinted border + soft glow |
| Toggle press (`:has(input:active)`) | Row `scale(0.99)` |

Uses `:has()` so the card reacts without changing toggle markup.

**Reduced motion:** Transitions and press scale disabled; enabled glow (static border/shadow) remains.

---

### 7. Add contact row

**File:** `add-contact-row.css`

**Behavior:**

| State | Motion |
|-------|--------|
| Hover | Border + subtle background fill |
| Tap | `scale(0.98)` |

**Reduced motion:** Press scale disabled.

---

### 8. Flow entry option cards

**File:** `flow-option-card.css`

**Behavior:** Existing hover border + active `scale(var(--al-motion-scale-press))`. Sprint 4.3 adds reduced-motion fallback.

---

### 9. Buttons

**File:** `packages/ui/.../Button.css`

**Behavior:**

| State | Motion |
|-------|--------|
| Hover | Opacity 0.94 |
| Active | `scale(var(--al-motion-scale-press))` |
| Loading | Spinner rotation (disabled under reduced motion) |

**Reduced motion:** Active press scale and spinner animation disabled.

---

### 10. Loading transitions

**Files:** `interaction-motion.css`, `ScreenSpinner.css`, `PurchaseStatusShell`

**Purchase status (R04 fetching):** Icon / spinner in `.ob-purchase-status-shell__body` uses a gentle **breathe** loop (opacity 1 ↔ 0.88, scale 1 ↔ 0.98, 1.8s).

**Screen spinner:** Rotation animation; disabled under reduced motion.

**Reduced motion:** Breathe and spinner rotation off.

---

### 11. Journey completion (Sprint 4.2 — unchanged, compatible)

**File:** `completion-experience.css`

Already respects `prefers-reduced-motion` (confetti hidden, hero/checklist/footer static). No conflicts with 4.3 tokens.

---

## Files changed

### New

| File | Purpose |
|------|---------|
| `apps/qr/src/styles/interaction-motion.css` | Shared tokens, step enter, list stagger, loading breathe |
| `apps/qr/src/components/compositions/emergency-contact-row/emergency-contact-row.css` | Contact row hook (width only; list motion in shared CSS) |

### Onboarding app

| File | Change |
|------|--------|
| `main.tsx` | Import `interaction-motion.css` |
| `RelationshipSelector.tsx` | `className="ob-relationship-selector"` on grid |
| `EmergencyContactRow.tsx` | `className="ob-emergency-contact-card"` + CSS import |
| `E09ContactsSummaryScreen.tsx` | `className="ob-contact-card-list"` on stack |
| `E10RidersSummaryScreen.tsx` | `className="ob-contact-card-list"` on stack |
| `plan-carousel.css` | Tap active scales + reduced-motion for `:active` |
| `rider-cover-options.css` | Hover, tap, select glow, radio pop |
| `permission-row.css` | Enabled glow, tap scale |
| `add-contact-row.css` | Hover, tap |
| `flow-option-card.css` | Reduced-motion block |

### UI package (`@autolokate/ui`)

| File | Change |
|------|--------|
| `RelationGrid.css` | Hover lift, tap scale, select spring + glow |
| `ContactCard.css` | Transition tokens |
| `PlanCard.css` | Select spring animation + reduced motion |
| `Button.css` | Reduced motion for press + spinner |
| `ScreenSpinner.css` | Reduced motion for rotation |

---

## Animation technique matrix

| Surface | Scale | Elevation / translate | Glow | Spring | Opacity | Translate |
|---------|:-----:|:---------------------:|:----:|:------:|:-------:|:---------:|
| Step frame | — | 6px up | — | ✓ | ✓ | ✓ |
| Plan carousel | ✓ | — | ✓ | ✓ | ✓ | — |
| Relation tiles | ✓ | hover −2px | ✓ | ✓ | — | ✓ |
| Rider options | ✓ | hover −1px | ✓ | ✓ | ✓ (radio) | ✓ |
| Contact list | ✓ | 8px up | — | ✓ | ✓ | ✓ |
| Permission rows | ✓ | — | ✓ | — | — | — |
| Add contact | ✓ | — | — | ✓ | — | — |
| Flow options | ✓ | — | — | — | — | — |
| Buttons | ✓ | — | — | — | ✓ (hover) | — |
| Loading | ✓ | — | — | — | ✓ | — |

---

## Manual test plan

Enable **Settings → Accessibility → Reduce motion** on macOS/iOS and repeat key flows.

| Flow | Screen | What to verify |
|------|--------|----------------|
| Purchase | R03 plan carousel | Unselected cards dim/smaller; center card scales up + glow; tap feedback; no jank while scrolling |
| Purchase | R07 riders | Option tap scale; selected glow + radio pop |
| Purchase | R14 permissions | Toggle on adds glow; row compresses slightly on press |
| Emergency | E03 relationship | Tile hover (desktop), tap scale, selected glow |
| Emergency | E09/E10 summary | Contact cards fade up with stagger (≤3) |
| Any step | Step shell | Subtle content fade-up on navigation (not full slide) |
| Purchase | R04 status | Loading icon gentle pulse; spinner rotates |
| Global | CTAs | Button press scale; loading spinner |
| Reduced motion | All above | Instant state changes, no pulse/spin/pop |

---

## Out of scope (intentional)

- Layout, spacing, typography, or color token changes
- Full-screen route transitions or shared-element hero animations
- Lottie / JS animation libraries
- Motion on non-interactive decorative elements beyond completion screen (Sprint 4.2)

---

## Conclusion

Sprint 4.3 delivers a consistent tactile layer across the onboarding consumer app: spring easing, subtle scale and glow on selection, staggered list enters, and restrained step transitions. All motion is CSS-only, compositor-friendly, and respects user accessibility preferences.
