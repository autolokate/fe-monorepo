# Post-Activation PWA — Component Parity

**Audit date:** 2026-06-18  
**Method:** Source review + live render + Figma MCP node comparison  
**Standard:** 100% Figma parity required for signoff (excluding StatusBar, language picker)

---

## Promoted components vs Figma

| Component              | Figma reference nodes                 | Used on frames    | Parity % | Signoff |
| ---------------------- | ------------------------------------- | ----------------- | -------- | ------- |
| `AlScannerHubCard`     | `843:2080` (845:292, 845:299)         | 02                | **88%**  | ❌      |
| `AlDispatchTimeline`   | `982:2339`, `849:321`, `870:2145`     | 10–12, 19–21, 23  | **45%**  | ❌      |
| `AlStatusTracker`      | `1063:2427`, `1070:2461` + CC tracker | 10–12, 19–21, 23  | **68%**  | ❌      |
| `AlScenePhotoCard`     | `1146:2503–2518`, `847:295`           | 09, 15, 15b       | **78%**  | ❌      |
| `AlPhotoGrid`          | `847:278`, `928:2267`                 | 09, 15, 15b       | **52%**  | ❌      |
| `AlSosHoldButton`      | `848:278`, `1092:2499`                | 14, 14b, 14c, 14d | **85%**  | ❌      |
| `AlPermissionSheet`    | `1049:2422`, `1110:2471`, `1113:2486` | 09a, 14c, 14d     | **90%**  | ❌      |
| `AlIncidentStatusHero` | `875:2189`, `875:2215`, `876:2208`    | 16, 18, 22        | **80%**  | ❌      |

**Average component parity: ~73%**  
**Components at 100%: 0 / 8**

---

## AlScannerHubCard

**Figma node:** `843:2080` · action rows `845:292`, `845:299`

| Aspect            | Figma                                        | Implementation                 | Match |
| ----------------- | -------------------------------------------- | ------------------------------ | ----- |
| Structure         | Icon tile 44×12 + title + subtitle + chevron | Same                           | ✅    |
| Park Me styling   | Neutral surface, dark icon tile              | `variant="park-me"`            | ✅    |
| Emergency styling | Red tint bg, red border, red icon tile       | `variant="emergency"`          | ✅    |
| Icon              | `icon/square-parking` / `icon/bell`          | `square-parking` / **`heart`** | ❌    |
| Typography        | 17px semibold title, 13px subtitle           | CSS tokens                     | ✅    |
| Press motion      | Implicit                                     | Framer `PwaSpringPress`        | ✅    |
| Height            | 92px                                         | min-height 92px                | ✅    |

**Gaps:** Wrong emergency icon. Chevron uses inline SVG vs `icon/chevron-right`.

---

## AlDispatchTimeline

**Figma nodes:** `982:2339` (Park Me 6-step), `849:321` (SOS 10-step)

| Aspect            | Figma                                           | Implementation               | Match |
| ----------------- | ----------------------------------------------- | ---------------------------- | ----- |
| Step count        | 6 (Park Me), 10 (SOS)                           | 4 generic steps              | ❌    |
| Subtitle per step | Yes (13px muted)                                | None                         | ❌    |
| Completed glyph   | `icon/circle-check` 24px                        | 14px SVG check               | ⚠️    |
| Active glyph      | Amber filled + blur halo + shield/activity icon | Amber border + optional icon | ❌    |
| Pending glyph     | 24px stroke circle                              | Numbered index               | ❌    |
| Rail              | 2px segments, green when complete               | 2px connector                | ⚠️    |
| Active step copy  | e.g. "Checking the photo"                       | "Reaching owner"             | ❌    |

**Verdict:** Component is a simplified stepper, not the Figma CC tracker. **Must be rebuilt** for signoff.

---

## AlStatusTracker

**Figma nodes:** Vehicle chip `1063:2427`, `1070:2461`

| Aspect               | Figma                                 | Implementation                | Match |
| -------------------- | ------------------------------------- | ----------------------------- | ----- |
| Vehicle chip         | 361×60, car tile 40×40, plate + model | Similar structure             | ✅    |
| Plate typography     | 15px semibold                         | 16px bold                     | ⚠️    |
| Model typography     | 13px regular muted                    | 13px muted                    | ✅    |
| Timeline integration | Chip above CC tracker                 | Composes `AlDispatchTimeline` | ⚠️    |
| Position             | Chip at y186, tracker below           | Stacked in flex               | ✅    |

**Verdict:** Chip ~85% OK; fails because child timeline is wrong.

---

## AlScenePhotoCard

**Figma nodes:** `1146:2503` (140×174.5), `847:295` (160×361 stacked)

| Aspect        | Figma                       | Implementation                              | Match |
| ------------- | --------------------------- | ------------------------------------------- | ----- |
| Dashed border | 1.5px dash 6,6              | 1.5px dashed                                | ✅    |
| Radius        | 16px                        | 16px                                        | ✅    |
| Icon          | `icon/camera` 28–32px       | Generic camera SVG / **`scan-line` in app** | ❌    |
| Label         | Centered below icon         | Centered                                    | ✅    |
| Filled state  | Photo cover                 | `object-fit: cover`                         | ✅    |
| Aspect        | 140h (SOS) / 160h (Park Me) | `aspect-ratio: 1`                           | ❌    |

**Verdict:** Cell chrome OK; proportions and icon wrong in usage.

---

## AlPhotoGrid

**Figma nodes:** `847:278` (stacked), `928:2267` (2×2)

| Aspect         | Figma                                            | Implementation                    | Match |
| -------------- | ------------------------------------------------ | --------------------------------- | ----- |
| Park Me layout | **Single column**, 2× 361×160 boxes              | **`layout="dual"`** 2-column grid | ❌    |
| SOS layout     | 2×2 grid 174.5×140                               | `layout="quad"` 2×2 square cells  | ⚠️    |
| Labels         | "The vehicle blocking you" / "Your car, blocked" | "Front" / "Rear"                  | ❌    |
| Location slot  | Separate GPS box below                           | `locationPreview` slot            | ✅    |
| Gap            | 16px between stacked boxes                       | 12px grid gap                     | ⚠️    |

**Verdict:** **Fails** Park Me frame 09 — wrong layout primitive entirely.

---

## AlSosHoldButton

**Figma nodes:** `848:278`, `1092:2499`

| Aspect       | Figma                          | Implementation                                  | Match |
| ------------ | ------------------------------ | ----------------------------------------------- | ----- |
| Disc size    | 200px                          | ~200px (inset 14px in 228 ring)                 | ✅    |
| Aura         | Blur 27.5px, 30% opacity       | CSS blur aura                                   | ✅    |
| Ring track   | 228px, 4px stroke, 55% opacity | Present                                         | ✅    |
| Progress arc | On hold                        | SVG stroke-dashoffset                           | ✅    |
| Label        | "Hold to\nsend help"           | Same                                            | ✅    |
| Hint         | "Press and hold to confirm"    | Same                                            | ✅    |
| Touch target | 216px hit area                 | pointer events on disc                          | ✅    |
| Hold UX      | In-place on frame 14           | **Navigates to `/sos/holding`** on pointer down | ⚠️    |

**Verdict:** Visual ~90%; interaction split across routes differs from Figma single-frame hold.

---

## AlPermissionSheet

**Figma nodes:** `1049:2422`, `1110:2471`, `1113:2486`

| Aspect            | Figma           | Implementation           | Match |
| ----------------- | --------------- | ------------------------ | ----- |
| Scrim             | Dim overlay     | rgba scrim + button      | ✅    |
| Sheet radius      | Top 24px        | 24px                     | ✅    |
| Handle            | 40×4 pill       | Present                  | ✅    |
| Primary CTA       | Full-width 58px | `AlButton` primary       | ✅    |
| Secondary         | Text link below | Text button              | ✅    |
| Title/description | Frame-specific  | Passed as props          | ✅    |
| Motion            | Slide up        | CSS transform transition | ✅    |

**Verdict:** Closest to Figma. Still ~90% — copy strings not audited word-for-word on all sheets.

---

## AlIncidentStatusHero

**Figma nodes:** `875:2189`, `875:2215`, `876:2208`

| Aspect       | Figma                           | Implementation                   | Match |
| ------------ | ------------------------------- | -------------------------------- | ----- |
| Role         | Centered halo + icon area       | Wrapper div                      | ✅    |
| Variants     | attention / emergency / neutral | CSS modifier classes             | ✅    |
| Visual asset | Frame-specific halo artwork     | **`FetchFailedHaloIcon`** reused | ⚠️    |
| Size         | ~200px hero                     | 200px passed                     | ✅    |

**Verdict:** Functional wrapper; wrong halo assets for SOS-specific frames.

---

## Onboarding reuse — regression check

Components reused without forking:

| Screen  | Component                  | PWA override                                     | Onboarding default | Regression |
| ------- | -------------------------- | ------------------------------------------------ | ------------------ | ---------- |
| Verify  | `A1MobileScreen`           | title, description, hideProgress, consentVariant | Unchanged          | **None**   |
| Verify  | `A2OtpScreen`              | (defaults)                                       | Unchanged          | **None**   |
| Verify  | `A3VehicleOwnerScreen`     | title, description, footerLabel                  | Unchanged          | **None**   |
| Park Me | `R03VehicleNumberScreen`   | title, description                               | Unchanged          | **None**   |
| Park Me | `R04FetchingVehicleScreen` | (none)                                           | Unchanged          | **None**   |
| Park Me | `R05ConfirmVehicleScreen`  | protectedPlan, planLabel                         | Unchanged          | **None**   |
| Status  | `PurchaseStatusShell`      | SOS error screens                                | Unchanged          | **None**   |
| Verify  | `InlineConsentBlock`       | variant=bystander                                | owner default      | **None**   |

**Onboarding regression signoff: PASS**

---

## Reuse vs promotion decision audit

| Pattern                | Promoted?                         | Correct?                             |
| ---------------------- | --------------------------------- | ------------------------------------ |
| Hub action cards       | ✅ AlScannerHubCard               | ✅                                   |
| CC tracker             | ✅ AlDispatchTimeline             | ⚠️ Promoted too early — wrong design |
| Vehicle chip + tracker | ✅ AlStatusTracker                | ⚠️                                   |
| Photo cells            | ✅ AlScenePhotoCard + AlPhotoGrid | ⚠️ Grid layout wrong for Park Me     |
| SOS hold               | ✅ AlSosHoldButton                | ✅                                   |
| Permission sheets      | ✅ AlPermissionSheet              | ✅                                   |
| Error halos            | ✅ AlIncidentStatusHero           | ⚠️                                   |

**Recommendation:** Do not treat promotions as complete until CC tracker and PhotoGrid match Figma.

---

## Component signoff summary

| Category                                              | Result                 |
| ----------------------------------------------------- | ---------------------- |
| Promoted once, used everywhere                        | ✅ No duplicates found |
| Documented in POST_ACTIVATION_COMPONENT_PROMOTIONS.md | ✅                     |
| Figma parity                                          | ❌ **0/8 at 100%**     |
| **Component signoff**                                 | **NOT APPROVED**       |

---

## Path to 100%

1. **AlDispatchTimeline** — Add `subtitle`, `stepCount` presets for Park Me (6) and SOS (10), amber active blur, correct glyphs.
2. **AlPhotoGrid** — Add `layout="stacked-dual"` for frame 09; preserve `quad` for SOS.
3. **AlScenePhotoCard** — Support fixed heights (160 / 140); use `icon/camera`.
4. **AlScannerHubCard** — Swap emergency icon to `bell`.
5. **AlSosHoldButton** — Consider in-place hold without route change for frame 14/14b parity.
6. **AlIncidentStatusHero** — Add SOS-specific halo assets from Figma export.

**Estimated effort:** CC tracker + Park Me photos are the critical path (~2–3 days design-system work).
