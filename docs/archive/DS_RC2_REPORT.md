# Design System RC2 Report

**Date:** 2026-06-17  
**Phase:** DS-RC2  
**Source delta:** [FIGMA_DELTA_REPORT.md](./FIGMA_DELTA_REPORT.md)  
**Packages:** `@autolokate/design-system` · `@autolokate/ui` · `apps/ui-preview`

---

## Summary

Phase DS-RC2 applies the Figma Foundations delta identified in the audit: light canvas background split, ambient tint gradient tokens, Inter-only typography, semantic role sync in `theme.css`, and the new `AlScreenBg` primitive. **No onboarding screens or flow architecture were modified.**

**QA status:** `pnpm build` ✓ · `pnpm lint` ✓ · ui-preview version bumped to `v4.0.0-rc2`

---

## 1. Token diff

### T1 — Light background semantic role

| Token                   | Before (light)                    | After (light)                          |
| ----------------------- | --------------------------------- | -------------------------------------- |
| `--al-color-background` | `var(--al-neutral-0)` → `#FFFFFF` | `var(--al-neutral-canvas)` → `#F4F6F9` |
| `--al-color-surface`    | `var(--al-neutral-0)` → `#FFFFFF` | unchanged — `#FFFFFF`                  |

**New primitive:**

| Token                 | Value     |
| --------------------- | --------- |
| `--al-neutral-canvas` | `#F4F6F9` |

Dark theme `--al-color-background` remains `var(--al-neutral-950)` → `#0A0A0C`.

### T2 — Ambient tint gradient tokens

New tokens (Figma `544:262` · ~8% radial at center):

| Token                             | Value                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `--al-gradient-ambient-protected` | `radial-gradient(circle at 50% 50%, rgba(31, 162, 74, 0.08) 0%, rgba(31, 162, 74, 0) 100%)`   |
| `--al-gradient-ambient-attention` | `radial-gradient(circle at 50% 50%, rgba(245, 166, 35, 0.08) 0%, rgba(245, 166, 35, 0) 100%)` |
| `--al-gradient-ambient-emergency` | `radial-gradient(circle at 50% 50%, rgba(229, 52, 42, 0.08) 0%, rgba(229, 52, 42, 0) 100%)`   |

Existing hero gradients (`--al-gradient-protected`, `--al-gradient-emergency`) are **unchanged** — they serve different use cases (12–18% ellipse for hero surfaces, not screen ambient).

### T5 — theme.css semantic role sync

Added to all three semantic blocks (`:root`/`[data-theme='light']`, `[data-theme='dark']`, `@media prefers-color-scheme: dark`):

| Token                      | Value                     |
| -------------------------- | ------------------------- |
| `--al-color-plate-surface` | `var(--al-neutral-plate)` |
| `--al-color-on-plate`      | `var(--al-neutral-1000)`  |

Also added missing primitives to `:root` in `theme.css`:

- `--al-neutral-canvas`
- `--al-neutral-plate`

### Component spacing tokens (AlScreenBg)

| Token                               | Value   |
| ----------------------------------- | ------- |
| `--al-comp-screen-bg-tint-size`     | `45rem` |
| `--al-comp-screen-bg-tint-offset-y` | `7%`    |

---

## 2. Typography migration

### T3 — Primary family unification

All font-family tokens now resolve to **Inter**:

| Token                   | Before         | After |
| ----------------------- | -------------- | ----- |
| `--al-font-family-sans` | Manrope        | Inter |
| `--al-font-family-ui`   | Inter          | Inter |
| `--al-font-family-mono` | JetBrains Mono | Inter |
| `--al-text-sans-family` | Manrope        | Inter |
| `--al-text-ui-family`   | Inter          | Inter |
| `--al-text-mono-family` | JetBrains Mono | Inter |

**Google Fonts import:** Manrope removed; Inter 400/500/600/700 only.

**Token names preserved** — no renames required in consuming code.

### T4 — Mono role cleanup

- Mono role sizes/weights unchanged (`15px / 22px / 500`).
- `.al-text--mono` and `.al-field__input--mono` now apply `font-feature-settings: var(--al-font-feature-tabular)` for numeric alignment.
- `.al-heading` and `.al-text` explicitly set `font-family: var(--al-text-ui-family)`.

### Removed font dependencies

| Font           | Status                           |
| -------------- | -------------------------------- |
| Manrope        | Removed from DS theme.css import |
| JetBrains Mono | Removed from mono family tokens  |

**Out of scope (unchanged):** `@autolokate/brand` SVG wordmarks still reference Manrope in embedded `<text>` — brand asset, not UI typography.

---

## 3. New components

### AlScreenBg

**Location:** `packages/ui/src/components/primitives/ScreenBg/`

**Export:** `@autolokate/ui` — `AlScreenBg`, `AlScreenBgProps`, `AlScreenBgVariant`

**Variants:**

| Variant     | Ambient token                     | Use                      |
| ----------- | --------------------------------- | ------------------------ |
| `default`   | none                              | Neutral canvas only      |
| `protected` | `--al-gradient-ambient-protected` | Secure / protected flows |
| `attention` | `--al-gradient-ambient-attention` | Caution / pending        |
| `emergency` | `--al-gradient-ambient-emergency` | Urgent / SOS             |

**Behavior:**

- Base layer: `background-color: var(--al-color-background)`
- Tint layer: radial gradient via semantic tokens — no hardcoded colors
- Responsive tint sizing: `min(110vw, 45rem)` mobile → `min(90vw, 45rem)` at `48rem+`
- Theme-aware via semantic background + gradient tokens

**Usage:**

```tsx
import { AlScreenBg, AlHeading } from '@autolokate/ui';

<AlScreenBg variant="protected">
  <AlHeading variant="h2">Protected session</AlHeading>
</AlScreenBg>;
```

---

## 4. Core primitive updates

| Component              | Change                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `AlHeading`            | `font-family: var(--al-text-ui-family)` on `.al-heading`                                |
| `AlText`               | `font-family: var(--al-text-ui-family)` on `.al-text`; tabular features on mono variant |
| `AlInput` (mono field) | Tabular font features on `.al-field__input--mono`                                       |

---

## 5. ui-preview

**Navigation:** Foundations → **Screen Backgrounds** (`screen-backgrounds`)

**Page:** `apps/ui-preview/src/docs/pages/ScreenBackgroundsPage.tsx`

Shows all four variants (`default`, `protected`, `attention`, `emergency`) in:

- Light theme frame (`data-theme="light"`)
- Dark theme frame (`data-theme="dark"`)
- Responsive viewport previews (320 / 375 / 414 px)

**Version:** `DOCS_VERSION` → `v4.0.0-rc2`

**Copy update:** Typography page description changed from Manrope to Inter.

---

## 6. Breaking changes

| Change                                    | Impact                                                                             | Mitigation                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Light `--al-color-background` → `#F4F6F9` | Any full-page background using the semantic token shifts from white to canvas grey | Cards/surfaces on `--al-color-surface` stay white; intentional Figma parity |
| Global sans → Inter                       | Headings/body render Inter instead of Manrope                                      | Visual glyph change only; token API unchanged                               |
| Mono → Inter tabular                      | OTP/plate/metric text loses monospace glyph distinction                            | Tabular nums preserve alignment; matches Figma Mono role                    |
| New export `AlScreenBg`                   | Additive — no existing imports break                                               | Opt-in at app/shell level                                                   |

**Non-breaking:** All existing CSS variable names retained. No component prop renames.

---

## 7. Onboarding impact assessment

**Files modified in onboarding:** none (per phase scope).

**Automatic effects when apps consume updated DS:**

| Area                                        | Effect                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Shell backgrounds (`--al-color-background`) | Light mode canvas becomes `#F4F6F9` without shell edits                                                 |
| Headings / body copy                        | Inter via updated global + primitive CSS                                                                |
| Ambient screen glow                         | **Not applied** — shells still use flat background; `AlScreenBg` wiring deferred to app-level follow-up |
| Purchase / shared flows                     | No flow architecture or screen changes                                                                  |

**Recommended follow-up (post DS-RC2, separate phase):**

1. Wrap `OnboardingStepShell` / `PurchaseStepShell` content in `AlScreenBg` with flow-appropriate variant
2. Pass `variant="protected"` for default consumer purchase tint per Figma
3. Re-run pixel QA on P01–P06 after shell integration

---

## 8. Files changed

```
packages/design-system/src/tokens/colors.ts
packages/design-system/src/tokens/typography.ts
packages/design-system/src/tokens/spacing.ts
packages/design-system/src/theme.css

packages/ui/src/components/primitives/ScreenBg/     (new)
packages/ui/src/components/primitives/Heading.css
packages/ui/src/components/primitives/Text.css
packages/ui/src/components/primitives/index.ts
packages/ui/src/components/forms/Input/Input.css

apps/ui-preview/src/docs/pages/ScreenBackgroundsPage.tsx   (new)
apps/ui-preview/src/docs/pages/screen-backgrounds.css        (new)
apps/ui-preview/src/docs/AppContent.tsx
apps/ui-preview/src/docs/types.ts
apps/ui-preview/src/sidebar/navigation.config.ts
apps/ui-preview/src/App.tsx

docs/DS_RC2_REPORT.md   (this file)
```

---

## 9. QA checklist

| Check                                                          | Result        |
| -------------------------------------------------------------- | ------------- |
| `pnpm build` (all 12 packages)                                 | ✓ Pass        |
| `pnpm lint` (all 12 packages)                                  | ✓ Pass        |
| Token usage — no hardcoded colors in AlScreenBg                | ✓             |
| Theme switching — light/dark frames on Screen Backgrounds page | ✓ Implemented |
| Responsive — viewport previews + fluid tint sizing             | ✓             |
| Onboarding screens untouched                                   | ✓             |
| B2B / Prepaid / new onboarding flows                           | Not in scope  |

---

## Decision

DS-RC2 closes Category 3 items **T1–T5** and **C1–C2** from the Figma delta audit. Onboarding flow work may resume; ambient background integration is the remaining app-level parity gap.
