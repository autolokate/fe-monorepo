# Figma Delta Report — Design System Audit

**Date:** 2026-06-17  
**Figma file:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Compared against:** `@autolokate/design-system` · `@autolokate/ui`  
**Scope:** Tokens · Themes · Core components only  
**Ignored:** Flow changes · Screen changes · Content changes · New screens

**Sources fetched:** `483:37` FOUNDATIONS · Dark · `501:37` FOUNDATIONS · Light · `487:42` BUTTONS · `487:45` INPUTS · `487:48` SELECTION & STATUS · `487:51` CONTENT & CARDS · `487:54` NAVIGATION · `483:182` semantic color roles · `544:262` AlScreenBg (new)

---

## Summary

The updated Figma Foundations page introduces **one new core component** (`AlScreenBg`), **splits light `background` from `surface`**, and **formalizes Inter as the single UI type family** (including the Mono role). Existing color primitives, spacing scale, motion spec, and the implemented Al\* component library remain largely aligned.

**Category 3 is not empty.** Design-system updates are recommended before claiming full Figma parity. **Onboarding flow work may continue** using current tokens/components; ambient background and light canvas parity will lag until Category 3 items land.

---

## 1. No Action Required

These areas match current Figma Foundations and implemented core components.

### Color primitives

| Figma token         | Figma value           | Code                             | Status |
| ------------------- | --------------------- | -------------------------------- | ------ |
| brand/black         | `#0A0A0A`             | `--al-brand-black`               | ✓      |
| brand/white         | `#FFFFFF`             | `--al-brand-white`               | ✓      |
| signal/red          | `#E5342A`             | `--al-signal-red`                | ✓      |
| signal/red-bright   | `#FF4A3D`             | `--al-signal-red-bright`         | ✓      |
| signal/amber        | `#F5A623`             | `--al-signal-amber`              | ✓      |
| signal/green        | `#1FA24A`             | `--al-signal-green`              | ✓      |
| neutral/0–1000 ramp | `#FFFFFF` … `#0A0A0A` | `--al-neutral-*`                 | ✓      |
| neutral/plate       | `#E4E4E8`             | `--al-neutral-plate` (colors.ts) | ✓      |

### Semantic roles (except light `background`)

| Role                       | Figma light · dark       | Code                          | Status |
| -------------------------- | ------------------------ | ----------------------------- | ------ |
| surface                    | `#FFFFFF` · `#1A1A1A`    | `--al-color-surface`          | ✓      |
| surfaceVariant             | `#F5F5F5` · `#4A4A4A`    | `--al-color-surface-variant`  | ✓      |
| onSurface                  | `#0A0A0A` · `#FFFFFF`    | `--al-color-on-surface`       | ✓      |
| onSurfaceMuted             | `#8A8A8A` · `#8A8A8A`    | `--al-color-on-surface-muted` | ✓      |
| outline                    | `#C4C4C4` · `#4A4A4A`    | `--al-color-outline`          | ✓      |
| primary / onPrimary        | L/D inverted black/white | `--al-color-primary`          | ✓      |
| emergency                  | `#E5342A` · `#FF4A3D`    | `--al-color-emergency`        | ✓      |
| status/green · amber · red | Signal palette           | success / warning / danger    | ✓      |

### Typography scale (sizes & weights)

| Figma role     | Spec                  | Code token                     | Status  |
| -------------- | --------------------- | ------------------------------ | ------- |
| Display        | Inter Bold 36/44      | `--al-text-display-*`          | ✓       |
| Headline       | Inter Bold 28/36      | `--al-text-headline-*`         | ✓       |
| Title          | Inter Semi Bold 22/28 | `--al-text-title-*`            | ✓       |
| Body Large     | Inter Regular 17/24   | `--al-text-body-large-*`       | ✓       |
| Body           | Inter Regular 16/24   | `--al-text-body-*`             | ✓       |
| Label          | Inter Medium 13/18    | `--al-text-label-*`            | ✓       |
| Mono (metrics) | Inter Medium 15/22    | sizes match `--al-text-mono-*` | ✓ sizes |

### Spacing, radius, elevation, motion

| Area                | Figma                                         | Code                                | Status |
| ------------------- | --------------------------------------------- | ----------------------------------- | ------ |
| Spacing             | 4dp base scale                                | `--al-space-xs` … `--al-space-xxxl` | ✓      |
| Radius              | sm 8 · md 12 · lg 16 · pill 999               | `--al-radius-*`                     | ✓      |
| Elevation / glow    | raised + protected/attention/emergency        | `--al-elevation-*` · `--al-glow-*`  | ✓      |
| Material blur tiers | 12/20/30/40px + opacity                       | `--al-material-*`                   | ✓      |
| Motion              | gentle · snappy · bouncy · standard · stagger | duration + easing tokens            | ✓      |

### Core components — spec parity

| Figma component      | Node            | Code component         | Status                                      |
| -------------------- | --------------- | ---------------------- | ------------------------------------------- |
| AlButton/Primary     | `6:2`           | `AlButton`             | ✓ 58px · 16px radius · Inter 16/20 semibold |
| AlButton/Secondary   | `6:4`           | `AlButton` secondary   | ✓ 1.5px border                              |
| AlButton/Destructive | `6:6`           | `AlButton` destructive | ✓                                           |
| AlTextField          | `74:19`         | `AlTextField`          | ✓ 62px · 12px radius                        |
| AlPlateInput         | `74:23`         | `AlPlateInput`         | ✓ 62px · plate surface · shadow             |
| AlInput              | `173:27`        | `AlInput`              | ✓ 62px · 16px radius                        |
| AlOtpInput           | `75:19`         | `AlOtpInput`           | ✓ 60px cells · 10px gap                     |
| AlToggle             | `81:19`/`81:21` | `AlToggle`             | ✓ 46×28 · 22px knob                         |
| AlCheckbox           | `81:23`/`81:25` | `AlCheckbox`           | ✓ 22px · 8px radius                         |
| AlChip               | `83:21`–`83:27` | `AlChip`               | ✓ green/amber/neutral                       |
| AlStatusPill         | `7:2`–`7:8`     | `AlStatusPill`         | ✓                                           |
| AlField              | `83:38`         | `AlField`              | ✓                                           |
| AlAvatar             | `81:26`         | `AlAvatar`             | ✓ 46px                                      |
| AlQuickAction        | `83:30`         | `AlQuickAction`        | ✓                                           |
| AlStepProgress       | `85:26`–`85:50` | `AlStepProgress`       | ✓ 6px track · 4px segments                  |
| AlPlanCardW          | `231:80`        | `AlPlanCard`           | ✓ 270w · 20 radius · structure              |
| AlBottomNav          | `20:2`          | `AlBottomNav`          | ✓ 353×64 · blur 30                          |
| StatusBar            | `9:2`           | `AlStatusBar`          | ✓ device chrome mock                        |
| Icon set (19)        | `487:55`        | `@autolokate/icons`    | ✓ same Lucide exports                       |

### Icons

All 19 Figma DS icons (`house`, `store`, `users`, `circle-user`, `scan-line`, `square-parking`, `receipt-text`, `shield-check`, `chevron-down`, `bell`, `car`, `phone`, `arrow-left`, `plus`, `user`, `map-pin`, `circle-check`, `circle-x`, `credit-card`) are present in the foundations page and implemented in `@autolokate/icons`.

---

## 2. App-Level Changes Only

These Figma updates affect **how apps compose** screens, not the underlying token/component contracts (or they consume DS work once Category 3 lands).

| Item                        | Figma change                                     | App impact                                                                                                                               | Recommended action                                                                                                           |
| --------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **AlScreenBg usage**        | New back-most layer on every screen (`549:1568`) | Onboarding shells (`OnboardingStepShell`, `PurchaseStepShell`) set `background-color: var(--al-color-background)` only — no ambient tint | After `AlScreenBg` exists: wrap shell content or replace root background div                                                 |
| **Ambient tint per flow**   | tint=Green (default) · Amber · Red               | Consumer purchase screens show green radial in Figma frames; error/emergency flows use amber/red                                         | Pass `tint` prop at flow/shell level — not a token-only change                                                               |
| **Light canvas feel**       | Page canvas `#F4F6F9` vs cards `#FFFFFF`         | Shell/content currently share one background token                                                                                       | Once light `background` token updates, shells pick it up automatically; elevated cards/surfaces stay on `--al-color-surface` |
| **AlHeading / AlText font** | Inter on all screen copy                         | Shell headings inherit body font (Manrope) until DS typography update                                                                    | No app CSS overrides needed after DS switches default sans to Inter                                                          |
| **Logo in DS nav row**      | `158:25` Logo component in foundations           | Brand asset — belongs in `@autolokate/brand`, not onboarding                                                                             | No onboarding change                                                                                                         |

---

## 3. Design System Changes Required

### 3.1 Tokens & themes

| #      | Delta                                | Figma reference                                            | Current code                                                                                                      | Required update                                                                                                                                                                                                                               |
| ------ | ------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1** | **Light `background` semantic role** | `483:107` · `L #F4F6F9 · D #0A0A0C`                        | `--al-color-background: var(--al-neutral-0)` (#FFFFFF) in light                                                   | Add primitive e.g. `--al-neutral-canvas: #F4F6F9`. Set light `--al-color-background` → canvas primitive. Keep `--al-color-surface` as `#FFFFFF`. **Files:** `packages/design-system/src/tokens/colors.ts`, `src/theme.css`, `docs/THEMING.md` |
| **T2** | **Ambient tint gradient tokens**     | `544:262` AlScreenBg · green/amber/red @ ~8% radial        | `--al-gradient-protected` uses 12% / 70% ellipse (different spec)                                                 | Add `--al-gradient-ambient-green`, `--al-gradient-ambient-amber`, `--al-gradient-ambient-red` matching Figma radial stops. **Files:** `colors.ts`, `theme.css`                                                                                |
| **T3** | **Primary typography family**        | `483:208` · “Inter — one family, headlines + body”         | `--al-text-sans-family: Manrope`; `body { font-family: var(--al-text-sans-family) }`                              | Set `--al-text-sans-family` and `--al-text-ui-family` to Inter. Update `typography.ts` comments. **Files:** `typography.ts`, `theme.css`                                                                                                      |
| **T4** | **Mono role font family**            | `483:228` · Mono · Inter Medium 15/22                      | `--al-text-mono-family: JetBrains Mono`                                                                           | Point mono family to Inter (keep tabular feature flags). **Files:** `typography.ts`, `theme.css`, `AlText.css`, `Input.css`                                                                                                                   |
| **T5** | **theme.css ↔ colors.ts sync**       | Semantic includes `plate-surface`, `on-plate`, tier tokens | `colors.ts` has plate/tier; `theme.css` light/dark blocks omit `--al-color-plate-surface` / `--al-color-on-plate` | Mirror all semantic roles from `colors.ts` into `theme.css` (pre-existing drift, now visible when auditing foundations). **Files:** `theme.css`                                                                                               |

### 3.2 Core components

| #      | Component                                   | Figma reference                                   | Status in `@autolokate/ui`                                                 | Required update                                                                                                                                                                                                                                                         |
| ------ | ------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1** | **AlScreenBg**                              | `544:262` · component set · tints Green/Amber/Red | **Not implemented**                                                        | New primitive: full-viewport background layer binding `--al-color-background` + ambient tint variant. Props: `tint?: 'green' \| 'amber' \| 'red'`. Export from `@autolokate/ui`. Add ui-preview page. **Files:** new `ScreenBg/` primitive, `core/index.ts`, ui-preview |
| **C2** | **AlHeading · AlText · AlStack typography** | All Figma text uses Inter                         | Inherit Manrope from `body` unless `--al-text-ui-family` set per-component | After T3: set `font-family: var(--al-text-ui-family)` on `.al-heading`, `.al-text`, layout primitives for consistent Inter without per-app overrides. **Files:** `Heading.css`, `Text.css`, optionally `Stack.css`                                                      |
| **C3** | **AlOtpInput / Filled variant**             | `552:2502` AlOtpInput/Filled                      | Runtime `state` covers empty/error/success; no named “filled” docs variant | **Low priority.** Verify 2px neutral stroke on all filled cells matches Figma; add ui-preview state label if missing. **Files:** `OtpInput.css`, ui-preview only                                                                                                        |

### Impacted packages summary

```
@autolokate/design-system
  tokens/colors.ts      → T1, T2
  tokens/typography.ts  → T3, T4
  theme.css             → T1–T5

@autolokate/ui
  ScreenBg/ (new)       → C1
  Heading.css, Text.css → C2
  Input.css             → T4 (mono usages)
  OtpInput (optional)   → C3

apps/ui-preview
  AlScreenBg page       → C1
  typography docs       → T3, T4
```

---

## Decision

| Category                   | Count                                                                                             | Action                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1 · No Action Required     | Majority of primitives, semantics (except light background), spacing, motion, 16+ core components | None                                                                              |
| 2 · App-Level Only         | AlScreenBg composition, flow tint selection                                                       | Defer to onboarding/shell work after C1                                           |
| 3 · Design System Required | **5 token/theme items · 1 new component · 2 typography/component follow-ups**                     | **Do not implement in this audit** — schedule DS patch before claiming RC2 parity |

---

## Recommended sequence (when implementing Category 3)

1. **T1 + T5** — Fix light background + theme.css semantic sync (lowest risk, unblocks visual QA)
2. **T2** — Ambient gradient tokens
3. **T3 + T4 + C2** — Inter typography alignment
4. **C1** — `AlScreenBg` component + ui-preview
5. **C3** — OtpInput filled parity (optional)

---

## Onboarding flows

Category 3 is **not empty**, but items are **parity improvements**, not blockers for presentational flow work. **Continue onboarding / B2B screen implementation** using existing `@autolokate/ui` components.

Schedule a **design-system patch** (T1 → C1) before the next RC or pixel-parity sign-off. Until then, expect these visual deltas vs updated Figma:

- Light mode page canvas slightly whiter than Figma (`#FFFFFF` vs `#F4F6F9`)
- No ambient green/amber/red screen glow
- Body/heading font may render Manrope where Figma shows Inter

**No design-system files were modified in this audit.**
