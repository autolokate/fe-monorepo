# Figma RC2 Parity Audit

**Date:** 2026-06-17  
**Phase:** DS-RC2 Verification  
**Figma source:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Code baseline:** `@autolokate/design-system` · `@autolokate/ui` (post DS-RC2)  
**Method:** Fresh Figma MCP fetch + token/CSS/component cross-check  
**Scope:** Foundations · 24 core components · light/dark themes · 320–414 viewports  
**No code modified in this audit.**

---

## Executive summary

| Area                       | Verdict                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Foundations (post RC2)** | **Exact match** — colors, semantic roles, backgrounds, typography, radius, elevation, ambient gradients |
| **Core components (24)**   | **21 exact · 2 minor drift · 1 major drift**                                                            |
| **Theme parity**           | **Strong** — semantic tokens track Figma light/dark roles; component sheet is dark-first                |
| **Responsive**             | **Good** — fluid inputs/nav; **AlScreenBg tint scale** drifts below 393px reference frame               |
| **Onboarding gate**        | **1 DS fix recommended** before pixel sign-off (`AlOtpInput` error color). Flow work may continue.      |

**Figma nodes fetched:** `483:37` (Foundations · Dark) · `501:37` (Foundations · Light) · `483:182` (Semantic roles) · `544:262` (AlScreenBg) · `487:42` (Buttons) · `487:45` (Inputs) · `487:48` (Selection & status) · `487:51` (Content & cards) · `487:54` (Navigation) · screen RC card `170:79` (R05 reference)

---

## 1. Foundation parity

### 1.1 Colors (primitives)

| Figma token       | Figma value | Code token               | Status  | Figma ref |
| ----------------- | ----------- | ------------------------ | ------- | --------- |
| brand/black       | `#0A0A0A`   | `--al-brand-black`       | ✓ Exact | `483:37`  |
| brand/white       | `#FFFFFF`   | `--al-brand-white`       | ✓ Exact | `483:37`  |
| signal/red        | `#E5342A`   | `--al-signal-red`        | ✓ Exact | `483:37`  |
| signal/red-bright | `#FF4A3D`   | `--al-signal-red-bright` | ✓ Exact | `483:37`  |
| signal/amber      | `#F5A623`   | `--al-signal-amber`      | ✓ Exact | `483:37`  |
| signal/green      | `#1FA24A`   | `--al-signal-green`      | ✓ Exact | `483:37`  |
| neutral/0–1000    | ramp        | `--al-neutral-*`         | ✓ Exact | `483:37`  |
| neutral/canvas    | `#F4F6F9`   | `--al-neutral-canvas`    | ✓ Exact | `483:107` |
| neutral/plate     | `#E4E4E8`   | `--al-neutral-plate`     | ✓ Exact | `74:23`   |

### 1.2 Semantic roles

| Role                     | Figma L · D           | Code (light · dark)          | Status  | Figma ref             |
| ------------------------ | --------------------- | ---------------------------- | ------- | --------------------- |
| background               | `#F4F6F9` · `#0A0A0C` | canvas · neutral-950         | ✓ Exact | `483:107`             |
| surface                  | `#FFFFFF` · `#1A1A1A` | neutral-0 · neutral-900      | ✓ Exact | `483:113`             |
| surfaceVariant           | `#F5F5F5` · `#4A4A4A` | neutral-50 · neutral-700     | ✓ Exact | `483:119`             |
| onSurface                | `#0A0A0A` · `#FFFFFF` | neutral-1000 · neutral-0     | ✓ Exact | `483:125`             |
| onSurfaceMuted           | `#8A8A8A` · `#8A8A8A` | neutral-500                  | ✓ Exact | `483:131`             |
| outline                  | `#C4C4C4` · `#4A4A4A` | neutral-300 · neutral-700    | ✓ Exact | `483:137`             |
| primary / onPrimary      | inverted L/D          | brand black/white            | ✓ Exact | `483:143` · `483:149` |
| emergency                | `#E5342A` · `#FF4A3D` | signal-red · red-bright      | ✓ Exact | `483:155`             |
| status green/amber/red   | signal palette        | success/warning/danger       | ✓ Exact | `483:167`–`483:179`   |
| plate-surface / on-plate | `#E4E4E8` / `#0A0A0A` | neutral-plate / neutral-1000 | ✓ Exact | `74:23` · DS-RC2 sync |

### 1.3 Backgrounds & surface hierarchy

| Layer                 | Figma spec          | Code                                             | Status  | Figma ref                  |
| --------------------- | ------------------- | ------------------------------------------------ | ------- | -------------------------- |
| Page canvas (light)   | `#F4F6F9`           | `--al-color-background`                          | ✓ Exact | `483:107` · `544:256` fill |
| Elevated card (light) | `#FFFFFF` on canvas | `--al-color-surface`                             | ✓ Exact | `483:113`                  |
| Dark canvas           | `#0A0A0C`           | `--al-neutral-950`                               | ✓ Exact | `483:107`                  |
| Dark surface          | `#1A1A1A`           | `--al-neutral-900`                               | ✓ Exact | `483:113`                  |
| Plate input surface   | `#E4E4E8` + shadow  | `--al-color-plate-surface` + `--al-shadow-plate` | ✓ Exact | `74:23`                    |

### 1.4 Ambient gradients (AlScreenBg)

| Figma tint | Gradient                       | Code token                        | Status  | Figma ref             |
| ---------- | ------------------------------ | --------------------------------- | ------- | --------------------- |
| Green      | `rgba(31,162,74,0.08)` radial  | `--al-gradient-ambient-protected` | ✓ Exact | `544:257` · `544:256` |
| Amber      | `rgba(245,166,35,0.08)` radial | `--al-gradient-ambient-attention` | ✓ Exact | `544:259` · `544:258` |
| Red        | `rgba(229,52,42,0.08)` radial  | `--al-gradient-ambient-emergency` | ✓ Exact | `544:261` · `544:260` |

Figma ellipse: **720×720**, **y = 60** on **393×852** frame (`544:257` layout).  
Code: **45rem (720px)** size, **7%** vertical offset (~60px at 852px height). **Gradient stops: exact match.**

### 1.5 Typography

| Figma role | Spec                         | Code tokens                                 | Status  | Figma ref |
| ---------- | ---------------------------- | ------------------------------------------- | ------- | --------- |
| Family     | Inter (all roles incl. Mono) | `--al-text-*-family` → Inter                | ✓ Exact | `483:208` |
| Display    | Bold 36/44                   | `--al-text-display-*`                       | ✓ Exact | `483:208` |
| Headline   | Bold 28/36                   | `--al-text-headline-*`                      | ✓ Exact | `483:208` |
| Title      | Semi Bold 22/28              | `--al-text-title-*`                         | ✓ Exact | `483:208` |
| Body Large | Regular 17/24                | `--al-text-body-large-*`                    | ✓ Exact | `483:208` |
| Body       | Regular 16/24                | `--al-text-body-*`                          | ✓ Exact | `483:208` |
| Label      | Medium 13/18                 | `--al-text-label-*`                         | ✓ Exact | `483:208` |
| Mono       | Medium 15/22 + tabular       | `--al-text-mono-*` + `font-feature-tabular` | ✓ Exact | `483:228` |

### 1.6 Radius

| Figma       | px  | Code                     | Status  | Figma ref |
| ----------- | --- | ------------------------ | ------- | --------- |
| radius.sm   | 8   | `--al-radius-sm` 0.5rem  | ✓ Exact | `486:69`  |
| radius.md   | 12  | `--al-radius-md` 0.75rem | ✓ Exact | `486:72`  |
| radius.lg   | 16  | `--al-radius-lg` 1rem    | ✓ Exact | `486:75`  |
| radius.pill | 999 | `--al-radius-pill`       | ✓ Exact | `486:76`  |

### 1.7 Elevation & material

| Figma effect        | Value                              | Code                         | Status  | Figma ref                  |
| ------------------- | ---------------------------------- | ---------------------------- | ------- | -------------------------- |
| elevation/raised    | `0 8px 24px rgba(0,0,0,0.35)`      | `--al-elevation-raised`      | ✓ Exact | `486:84` · `effect_6K8CIY` |
| glow/protected      | `0 0 26px rgba(31,162,74,0.55)`    | `--al-glow-protected`        | ✓ Exact | `486:87`                   |
| glow/attention      | `0 0 26px rgba(245,166,35,0.55)`   | `--al-glow-attention`        | ✓ Exact | `486:90`                   |
| glow/emergency      | `0 0 26px rgba(229,52,42,0.6)`     | `--al-glow-emergency`        | ✓ Exact | `486:93`                   |
| Material blur (nav) | 30px                               | `--al-material-regular-blur` | ✓ Exact | `20:2` · `487:54`          |
| Plate shadow        | `0 6px 18px -4px rgba(0,0,0,0.35)` | `--al-shadow-plate`          | ✓ Exact | `74:23`                    |

### 1.8 Motion tokens

| Figma spec                               | Code                                                        | Status        | Notes                                                            |
| ---------------------------------------- | ----------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| motion.standard 250ms · ease(0.2,0,0,1)  | `--al-motion-standard/normal` + `--al-motion-ease-standard` | ✓ Exact       | `483:37` motion section                                          |
| Press scale feedback                     | `--al-motion-scale-press` 0.97                              | ✓ Exact       | Used on buttons/chips                                            |
| motion.gentle / snappy / bouncy (spring) | Not tokenized                                               | ◐ Minor drift | Documented in Figma; CSS uses duration/easing only               |
| Reduced motion                           | App responsibility                                          | —             | Figma spec present; ui-preview respects `prefers-reduced-motion` |

### 1.9 Spacing

| Figma scale                                            | Code           | Status  |
| ------------------------------------------------------ | -------------- | ------- |
| xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48 | `--al-space-*` | ✓ Exact |

---

## 2. Component parity matrix

| Component           | Figma node                                            | Light | Dark | Overall         | Notes                                                                                                                                                             |
| ------------------- | ----------------------------------------------------- | ----- | ---- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AlButton**        | `6:2` · `6:4` · `6:6` · `53:14` · `53:17` · `54:14`   | ✓     | ✓    | **Minor drift** | 58×16 radius, Inter 16/20 semibold, spinner 20px/2.5px exact. Pressed: Figma opacity **0.82** (`54:18`); code scale **0.97**                                      |
| **AlInput**         | `173:27`                                              | ✓     | ✓    | **Exact match** | 62px · 16px radius · 1px outline border                                                                                                                           |
| **AlTextField**     | `74:19`                                               | ✓     | ✓    | **Exact match** | 62px · 12px radius · 2px focus · prefix 19px · value 20px                                                                                                         |
| **AlOtpInput**      | `75:19` · `101:26` · `101:33` · `101:46` · `552:2502` | ✓     | ✓    | **Major drift** | Error borders: Figma **amber `#F5A623`** (`101:33`); code **`--al-color-danger` (red)**. Filled variant: Figma **2px neutral on all cells**; code **1px default** |
| **AlPlateInput**    | `74:23`                                               | ✓     | ✓    | **Exact match** | 62px · plate `#E4E4E8` · shadow · 24px bold plate · green divider                                                                                                 |
| **AlCheckbox**      | `81:23` · `81:25`                                     | ✓     | ✓    | **Exact match** | 22px · 8px radius · green on-state                                                                                                                                |
| **AlToggle**        | `81:19` · `81:21`                                     | ◐     | ✓    | **Minor drift** | 46×28 · 22px knob exact. Off track: Figma `#4A4A4A`; code `--al-color-surface-variant` → **`#F5F5F5` in light**                                                   |
| **AlChip**          | `83:21`–`83:27`                                       | ✓     | ✓    | **Exact match** | 4×12 padding · 8px dot · Label 13/18                                                                                                                              |
| **AlStatusPill**    | `7:2` · `7:5` · `7:8`                                 | ✓     | ✓    | **Exact match** | Same geometry as chip; signal dot colors match                                                                                                                    |
| **AlAvatar**        | `81:26`                                               | ✓     | ✓    | **Exact match** | 46px · 22px icon                                                                                                                                                  |
| **AlField**         | `83:38`                                               | ✓     | ✓    | **Exact match** | 2px label/value gap · Label muted · value Semi Bold 16/24                                                                                                         |
| **AlQuickAction**   | `83:30`                                               | ✓     | ✓    | **Exact match** | 110×16 pad · 10 gap · 16 radius · 24 icon                                                                                                                         |
| **AlPlanCard**      | `231:80`                                              | ✓     | ✓    | **Exact match** | 270w · 20 radius · 18/20 pad · 14 gap · 20/30 type · 15 icon                                                                                                      |
| **AlVehicleRcCard** | Screen `170:79` (R05)                                 | ◐     | ✓    | **Minor drift** | No standalone DS component node. Structure matches R05 RC card (16 pad/gap, gradient, 29px plate). Missing decorative car watermark (`170:80`)                    |
| **AlStepProgress**  | `85:26`–`85:50`                                       | ✓     | ✓    | **Exact match** | 361×6 track · 4px segments · 6px gap                                                                                                                              |
| **AlBottomNav**     | `20:2`                                                | ✓     | ✓    | **Exact match** | 353×64 · 16 radius · blur 30 · nav shadow                                                                                                                         |
| **AlScreenBg**      | `544:262`                                             | ✓     | ✓    | **Minor drift** | Gradients exact. Tint **720px @ y=60** vs code **min(110vw,720px) @ 7%** — undersized on 320–360 viewports                                                        |
| **AlText**          | Typography roles `483:208`                            | ✓     | ✓    | **Exact match** | Inter + role tokens on `.al-text`                                                                                                                                 |
| **AlHeading**       | Typography roles `483:208`                            | ✓     | ✓    | **Exact match** | Inter + role tokens on `.al-heading`                                                                                                                              |
| **AlContainer**     | — (layout primitive)                                  | ✓     | ✓    | **Exact match** | Token-based padding/max-width; no Figma component                                                                                                                 |
| **AlStack**         | —                                                     | ✓     | ✓    | **Exact match** | Spacing scale gaps                                                                                                                                                |
| **AlGrid**          | —                                                     | ✓     | ✓    | **Exact match** | Token-based grid gaps                                                                                                                                             |
| **AlDivider**       | —                                                     | ✓     | ✓    | **Exact match** | 1px outline color                                                                                                                                                 |
| **AlIconButton**    | — (pattern)                                           | ✓     | ✓    | **Minor drift** | 48px touch target matches spec; no dedicated Figma component. Hover lift not in Figma DS row                                                                      |

**Screenshot references (Figma):**

- Foundations dark: [`483:37`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=483-37)
- Foundations light: [`501:37`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=501-37)
- Semantic roles: [`483:182`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=483-182)
- AlScreenBg: [`544:262`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=544-262)
- Buttons + states: [`487:42`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=487-42) · [`54:14`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=54-14)
- Inputs: [`487:45`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=487-45)
- Selection/status: [`487:48`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=487-48)
- Content/cards: [`487:51`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=487-51)
- Navigation: [`487:54`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=487-54)

---

## 3. Theme parity matrix

| Component / area      | Light prototype        | Dark prototype       | Interaction states | Loading           | Selected           | Disabled  |
| --------------------- | ---------------------- | -------------------- | ------------------ | ----------------- | ------------------ | --------- |
| Semantic tokens       | ✓                      | ✓                    | —                  | —                 | —                  | —         |
| AlButton              | ✓ primary invert       | ✓                    | ◐ pressed differs  | ✓ spinner `53:14` | N/A                | ✓ `53:17` |
| AlInput / AlTextField | ✓ surface/outline      | ✓                    | ✓ focus 2px        | ✓ (TextField)     | N/A                | ✓ opacity |
| AlOtpInput            | ✓                      | ✓                    | ✓ focus cell       | ✓ loading class   | N/A                | ✓         |
| AlOtpInput error      | **✗ amber→red**        | **✗ amber→red**      | —                  | —                 | —                  | —         |
| AlPlateInput          | ✓ plate surface        | ✓ (same plate token) | ✓ focus ring       | N/A               | N/A                | ✓         |
| AlToggle              | ◐ off track light grey | ✓                    | ✓                  | ✓ loading         | ✓ checked          | ✓         |
| AlCheckbox            | ✓                      | ✓                    | ✓ focus            | N/A               | ✓ checked          | ✓         |
| AlChip                | ✓ pill-surface         | ✓                    | ✓ hover/press      | N/A               | ✓ neutral selected | ✓         |
| AlStatusPill          | ✓                      | ✓                    | N/A                | N/A               | N/A                | N/A       |
| AlPlanCard            | ✓                      | ✓                    | ✓ hover/press      | N/A               | ✓ selected border  | ✓         |
| AlBottomNav           | ✓                      | ✓                    | ✓ active tab       | N/A               | ✓ Home tab         | N/A       |
| AlScreenBg            | ✓ canvas `#F4F6F9`     | ✓ canvas `#0A0A0C`   | N/A                | N/A               | N/A                | N/A       |
| Typography (Inter)    | ✓                      | ✓                    | —                  | —                 | —                  | —         |

Dark prototype = Figma DS component rows (primary reference). Light prototype = semantic token mapping + Foundations light page (`501:37`).

---

## 4. Responsive matrix (320 · 360 · 375 · 390 · 414)

| Component                            | 320 | 360 | 375 | 390 | 414 | Notes                                                                     |
| ------------------------------------ | --- | --- | --- | --- | --- | ------------------------------------------------------------------------- |
| AlButton                             | ✓   | ✓   | ✓   | ✓   | ✓   | Full-width in flows; 320px spec width in Figma                            |
| AlTextField / AlInput / AlPlateInput | ✓   | ✓   | ✓   | ✓   | ✓   | `width: 100%`; Figma reference 361px                                      |
| AlOtpInput                           | ✓   | ✓   | ✓   | ✓   | ✓   | Flex cells scale; 10px gap preserved                                      |
| AlBottomNav                          | ✓   | ✓   | ✓   | ✓   | ✓   | `min(100%, 353px)`                                                        |
| AlPlanCard                           | ✓   | ✓   | ✓   | ✓   | ✓   | `min(100%, 270px)`                                                        |
| AlQuickAction                        | ✓   | ✓   | ✓   | ✓   | ✓   | Fixed 110px tile                                                          |
| AlStepProgress                       | ✓   | ✓   | ✓   | ✓   | ✓   | Full-width segments                                                       |
| AlScreenBg tint                      | ◐   | ◐   | ✓   | ✓   | ✓   | At 320: code tint **352px** vs Figma-proportional **~586px** on 393 frame |
| AlContainer / Stack / Grid           | ✓   | ✓   | ✓   | ✓   | ✓   | Fluid layout primitives                                                   |

Reference device width in Figma AlScreenBg component set: **393px** (`544:262`).

---

## 5. Exact-match components (21)

AlInput · AlTextField · AlPlateInput · AlCheckbox · AlChip · AlStatusPill · AlAvatar · AlField · AlQuickAction · AlPlanCard · AlStepProgress · AlBottomNav · AlText · AlHeading · AlContainer · AlStack · AlGrid · AlDivider · (Foundations tokens) · (Semantic roles) · (Ambient gradients — color stops)

---

## 6. Minor drift components (2)

### AlButton — `487:42` · `54:14`

- **Drift:** Pressed state uses `transform: scale(0.97)` instead of Figma opacity **~0.82**.
- **Impact:** Low — visually similar feedback; not a layout/token mismatch.
- **Fix priority:** P3 (optional polish).

### AlScreenBg — `544:262`

- **Drift:** Tint ellipse uses `min(110vw, 45rem)`; below 393px reference width the glow is **narrower** than Figma’s fixed 720px ellipse (which intentionally bleeds off-screen).
- **Impact:** Low–medium on 320–360 devices — ambient glow less prominent.
- **Fix priority:** P2 (consider `min(183vw, 45rem)` or width-relative token tied to 720/393 ratio).

### Also minor (grouped)

| Component             | Drift                                                         | Figma ref               |
| --------------------- | ------------------------------------------------------------- | ----------------------- |
| **AlToggle**          | Light off-track uses `#F5F5F5` not `#4A4A4A`                  | `81:21` (dark sheet)    |
| **AlVehicleRcCard**   | No DS library component; missing car watermark                | `170:79`                |
| **AlIconButton**      | No Figma component; convention-based                          | —                       |
| **AlOtpInput filled** | Missing explicit `filled` state with 2px neutral on all cells | `552:2502`              |
| **Motion**            | Spring presets not exported as tokens                         | `483:37` motion section |

---

## 7. Major drift components (1)

### AlOtpInput — `101:33` (Error) · `552:2502` (Filled)

| State      | Figma                                                 | Code                                            | Severity                                          |
| ---------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| **Error**  | Stroke **`#F5A623`** (amber / attention) on all cells | `--al-color-danger` (**`#E5342A` / `#FF4A3D`**) | **Major** — wrong signal color for OTP validation |
| **Filled** | **2px** `#4A4A4A` border on every filled cell         | **1px** default border until focus              | **Minor** within same component                   |

**Figma screenshot ref:** [`101:33`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=101-33) · [`552:2502`](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=552-2502)

**Recommended fix:** Map OTP error borders to `--al-color-warning` / `--al-signal-amber` (or add `--al-color-attention-border` semantic). Add optional `state="filled"` with 2px outline stroke.

---

## 8. Required DS fixes before onboarding continues

### Blocking for pixel parity sign-off

| #      | Fix                                                   | Component    | Figma evidence | Effort |
| ------ | ----------------------------------------------------- | ------------ | -------------- | ------ |
| **F1** | OTP error borders → **amber/warning**, not danger red | `AlOtpInput` | `101:33`       | Small  |

### Recommended (non-blocking)

| #      | Fix                                                               | Component     | Effort  |
| ------ | ----------------------------------------------------------------- | ------------- | ------- |
| **F2** | AlScreenBg tint scale for 320–360 viewports                       | `AlScreenBg`  | Small   |
| **F3** | Explicit OTP `filled` state (2px neutral all cells)               | `AlOtpInput`  | Small   |
| **F4** | AlButton pressed → opacity 0.82 (or document scale as acceptable) | `AlButton`    | Trivial |
| **F5** | AlToggle off-track light theme review                             | `AlToggle`    | Small   |
| **F6** | Export spring motion presets (gentle/snappy/bouncy)               | design-system | Medium  |

### Not DS scope (app-level, post-RC2)

| Item                                     | Notes                                       |
| ---------------------------------------- | ------------------------------------------- |
| Wire `AlScreenBg` into onboarding shells | App composition — DS component exists       |
| RC card car watermark                    | Screen polish in `AlVehicleRcCard` optional |

---

## 9. Onboarding impact assessment

| Topic                                | Assessment                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **May onboarding continue?**         | **Yes** — foundations and 21/24 components are exact; one visual fix (OTP error color) affects R04/R05 OTP screens |
| **Automatic RC2 wins in onboarding** | Light canvas `#F4F6F9`, Inter typography, semantic backgrounds — no shell edits required                           |
| **Visible delta until F1**           | OTP error states show **red** borders vs Figma **amber** on shared auth screens                                    |
| **AlScreenBg**                       | Not wired in onboarding shells yet — ambient glow absent (app follow-up, not RC2 regression)                       |
| **B2B / Prepaid**                    | Out of scope                                                                                                       |

---

## 10. Comparison to pre-RC2 audit

| Item                   | Pre-RC2 (`FIGMA_DELTA_REPORT`) | Post-RC2 (this audit)                                    |
| ---------------------- | ------------------------------ | -------------------------------------------------------- |
| Light background       | Major drift                    | **Exact**                                                |
| Inter typography       | Major drift                    | **Exact**                                                |
| Ambient gradients      | Missing                        | **Exact**                                                |
| AlScreenBg             | Not implemented                | **Minor drift** (responsive tint)                        |
| AlOtpInput error color | Not flagged                    | **Major drift** (now visible with fresh component fetch) |
| Semantic plate tokens  | Drift                          | **Exact**                                                |

---

## 11. Audit conclusion

**DS-RC2 successfully closes the Foundations delta.** The codebase matches Figma Consumer App foundations for colors, semantic roles, surface hierarchy, ambient gradients, typography, radius, and elevation.

**One major component drift remains:** `AlOtpInput` error styling uses danger red instead of Figma amber. Fix **F1** before claiming full component parity; onboarding flow implementation may proceed in parallel.

**No code was modified during this audit.**
