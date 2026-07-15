# THEMING.md — Autolokate Design System

**The single source of truth for design principles, color, type, spacing, depth, motion, iconography, component theming, layout/navigation, states, and voice.** Implemented in `core/designsystem`; every app and feature consumes these tokens. **Rule: no hardcoded colors, dp, or durations anywhere outside `core/designsystem`** — if a value isn't a token, it's a bug a reviewer must flag.

Grounded in the Autolokate brand: **black + white foundation, traffic-signal accents** (the universal Indian-road language), high-contrast and low-light usable. This is a **daily vehicle companion** (marketplace, daily utility, community, driver-score, wallet, AI) — calm and premium most of the time — whose **safety pillar** must _also_ stay legible at a night-time accident scene. **Not only a safety app.** The bar is **Apple-grade craft** — the "wow" comes from precision, material, motion, and bespoke iconography, never from decoration or clutter.

---

## 0. Design principles (the bar everything is measured against)

1. **Content first, chrome last.** Hierarchy comes from type weight, size, and _space_ — not from borders and boxes. When in doubt, remove a line, add air.
2. **One screen, one job — one action at a time.** Each screen has a **single** obvious primary action; everything else recedes. **Flows are sequential:** ask one thing, let the user finish it, then advance (select → next → select → next) — never a dense screen of competing actions. Fewer decisions per screen = faster, calmer, mistake-proof for every age. (Apple Wallet/Health discipline.)
3. **Generous, rhythmic whitespace.** Layouts breathe on an 8pt rhythm. Density is earned, never default.
4. **Depth through material, not shadows.** Layering, translucency, and blur (see §8) signal hierarchy — soft, physical, restrained. No drop-shadow soup.
5. **Motion is physics, not decoration.** Spring-based, interruptible, purposeful. Every transition explains where something came from or went. Delight is choreographed at a few signature moments (see §10), not sprinkled everywhere.
6. **Tactile.** Haptics confirm meaningful actions (see §4b). The product should feel responsive in the hand.
7. **Restraint with color.** Black/white carries 95% of the UI; a single traffic-signal accent does the talking. Color always means something.
8. **Accessible = premium.** High contrast, large targets, reduced-motion, dynamic type and dark mode aren't compromises — they're what "high-grade" means for a daily app used by every age, at night, in stress, across India's device range.
9. **Built for every owner, 18 to 70+.** The widest audience sets the floor: comfortable legible defaults and an obvious primary action so a first-time or older user is never lost — _and_ premium craft so younger users feel the quality. Delight is **felt and clear** (haptic + an unmistakable moment), never hidden in a gesture or so subtle it's missed. No one is left behind to look clever.
10. **Tap, don't type.** Selecting is faster, friendlier, and far less error-prone than typing — especially across ages and regional scripts. Default to **select · tap · scan · pick**; the keyboard appears only for the few unavoidable cases (§16). If a flow feels like a form, it's a bug.

---

## 1. Color system

### Brand foundation

| Token         | Light     | Dark      | Meaning                 |
| ------------- | --------- | --------- | ----------------------- |
| `brand.black` | `#0A0A0A` | `#0A0A0A` | The brand. The road.    |
| `brand.white` | `#FFFFFF` | `#FFFFFF` | The crossing. The grid. |

### Traffic-signal semantics (the only accent colors)

| Token          | Hex       | Use                                              |
| -------------- | --------- | ------------------------------------------------ |
| `signal.red`   | `#E5342A` | Emergency, SOS, dispatch, danger, destructive    |
| `signal.amber` | `#F5A623` | Attention, partial protection, warnings, pending |
| `signal.green` | `#1FA24A` | Activated, fully protected, success, online      |

> Do **not** introduce blues, purples, or any non-signal hue for UI accents. Brand discipline = trust.

### Neutral ramp (greys — derive surfaces/text from these, not ad-hoc)

`neutral.0 #FFFFFF` · `neutral.50 #F5F5F5` · `neutral.100 #E8E8E8` · `neutral.300 #C4C4C4` · `neutral.500 #8A8A8A` · `neutral.700 #4A4A4A` · `neutral.900 #1A1A1A` · `neutral.1000 #0A0A0A`

### Semantic roles (what components actually reference)

| Role                         | Light          | Dark                                              |
| ---------------------------- | -------------- | ------------------------------------------------- |
| `background`                 | `neutral.0`    | `neutral.1000`                                    |
| `surface`                    | `neutral.0`    | `neutral.900`                                     |
| `surfaceVariant`             | `neutral.50`   | `neutral.700`                                     |
| `onBackground` / `onSurface` | `neutral.1000` | `neutral.0`                                       |
| `outline`                    | `neutral.300`  | `neutral.700`                                     |
| `primary` (actions)          | `brand.black`  | `brand.white`                                     |
| `onPrimary`                  | `brand.white`  | `brand.black`                                     |
| `emergency`                  | `signal.red`   | `signal.red` (raised luminance variant `#FF4A3D`) |
| `onEmergency`                | `brand.white`  | `brand.white`                                     |

**Dark mode is first-class** — the emergency/scan flows must be legible at night, at an accident scene. Both palettes ship from day one; never light-only. **Dark is the hero theme** for marketing/first-open: deep near-black canvas makes the white type and single accent feel premium (Apple's approach).

### Hero gradients & material tints (used sparingly, on signature surfaces only)

| Token                | Spec                           | Where                                                                       |
| -------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `gradient.canvas`    | `#0A0A0A → #141414` vertical   | app background in dark — subtle, almost imperceptible depth                 |
| `gradient.protected` | `signal.green` 12% → 0% radial | "fully protected" status halo behind the vehicle card                       |
| `gradient.emergency` | `signal.red` 18% → 0% radial   | pulsing aura behind the SOS button (decorative only — never gates dispatch) |
| `tint.glass`         | surface @ 64% + blur (see §8)  | frosted sheets, nav bars, modals                                            |

Gradients are **whisper-quiet** (low opacity, large radius). If a gradient is the first thing you notice, it's wrong.

### Tier accent mapping (pricing tiers → signal colors)

| Tier           | Accent                              |
| -------------- | ----------------------------------- |
| Safe ₹99       | `signal.amber` (partial protection) |
| Secure ₹999    | `signal.amber`                      |
| Shield ₹1,999  | `signal.green` (fully protected)    |
| Shield+ ₹2,999 | `signal.red` (top emergency tier)   |

---

## 2. Typography

**Locked family: Manrope** (headlines + body, one family). Regional fallback remains `system-ui, sans-serif` for broad platform support. No serif (too corporate), no display (too playful).

| Token       | Size / Line | Weight | Use                            |
| ----------- | ----------- | ------ | ------------------------------ |
| `display`   | 36 / 44     | 700    | Splash, celebration moments    |
| `headline`  | 28 / 36     | 700    | Screen titles                  |
| `title`     | 22 / 28     | 600    | Card headers, section titles   |
| `bodyLarge` | 17 / 24     | 400    | Primary reading text           |
| `body`      | 16 / 24     | 400    | Default reading text           |
| `label`     | 13 / 18     | 500    | Buttons, chips, captions       |
| `mono`      | 15 / 22     | 500    | Vehicle reg numbers, OTP codes |

- **Dynamic type:** respect the OS font-scale; layouts must not clip up to 200%.
- **Numerals:** tabular figures for plan prices, OTP, scores.
- **All ages (18 → 70+):** comfortable legibility is the **default, not a setting**. Primary reading text is `body` (16) or larger; `label` (13) is for chips/captions only — never body copy a user must read. **Dynamic type is first-class** — every layout works from the OS minimum up to 200% without clipping or truncation. Hierarchy comes from size + weight + space, so nothing critical depends on tiny type.

---

## 3. Spacing, radius, elevation

- **Spacing scale (4dp base):** `xs 4` · `sm 8` · `md 12` · `lg 16` · `xl 24` · `xxl 32` · `xxxl 48`.
- **Radius:** `sm 8` · `md 12` · `lg 16` · `pill 999` (buttons/chips) · SOS button = circular.
- **Elevation:** flat by default (no skeuomorphic shadows); use `surfaceVariant` + `outline` for separation. Reserve a single soft shadow token `elevation.raised` for sheets/dialogs and the SOS button only.

---

## 4. Motion tokens (liveliness lives here — but never on a critical path)

| Token             | Spec                                    | Use                             |
| ----------------- | --------------------------------------- | ------------------------------- |
| `motion.gentle`   | spring, dampingRatio .9, stiffness 200  | entrances, list stagger         |
| `motion.snappy`   | spring, dampingRatio .8, stiffness 500  | press feedback, toggles         |
| `motion.bouncy`   | spring, dampingRatio .55, stiffness 350 | celebration (sticker activated) |
| `motion.standard` | 250ms, easing(0.2,0,0,1)                | navigation transitions          |
| `stagger.list`    | 40ms per item                           | dashboard card entrance         |

- **Shared-element transitions** for card → detail (home vehicle card → vehicle detail).
- **Compottie (Lottie)** for the "sticker activated 🎉" celebration; **Rive-CMP for delight only**.
- **`LocalReducedMotion`**: when set, every animated component renders a static equivalent — animation, parallax, and auto-play stop cleanly. **Non-negotiable (safety app).**
- **The SOS dispatch call never waits on any motion.** Animation may decorate the press; the network call fires on a separate non-cancellable scope.

### 4a. Animation implementation (which API for what — verify each against official docs before use)

Build motion from the standard Compose animation toolbox; reach for a library only where noted. Confirm current signatures at `developer.android.com/develop/ui/compose/animation` before coding.

| Need                                              | API                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Single value (color, alpha, dp, scale)            | `animate*AsState`                                                          |
| Press/gesture-driven, interruptible               | `Animatable` (+ `snapTo`/`animateTo`)                                      |
| Coordinated multi-property                        | `updateTransition`                                                         |
| Enter/exit of changing content                    | `AnimatedContent`, `AnimatedVisibility`                                    |
| Auto-size on content change                       | `Modifier.animateContentSize`                                              |
| List reordering / item entrance                   | `Modifier.animateItem` + `stagger.list`                                    |
| Card → detail "becomes header"                    | **`SharedTransitionLayout`** (shared-element) — the signature premium move |
| Hero vector celebration (sticker activated, scan) | **Compottie** (Lottie)                                                     |
| Rich interactive delight                          | **Rive-CMP** — delight only, never a critical path                         |
| Backdrop blur / glass materials                   | **Haze** (see §8)                                                          |
| Fast motion iteration                             | **Compose Hot Reload** (bundled, CMP 1.10+)                                |

All of the above honor `LocalReducedMotion`: when set, animations resolve instantly (or a single cross-fade) and Lottie/Rive auto-play is disabled. Spring specs come from §4 tokens — don't inline raw `spring()` calls in features.

### 4b. Haptics map (`core/platform` Haptics — tactile = premium)

| Event                          | Haptic                                         |
| ------------------------------ | ---------------------------------------------- |
| Button / toggle press          | light tick                                     |
| Success (activation, payment)  | success notification + `bouncy` visual         |
| Pull-to-refresh release        | medium tick                                    |
| SOS armed (long-press confirm) | strong impact (so it's _felt_ without looking) |
| Error / invalid OTP            | error notification                             |

Respect the OS "system haptics off" setting. Haptics never substitute for a visible/audible confirmation.

---

## 5. Component theming specs

**Naming + base:** every shared component is prefixed **`Al`** (`AlButton`, `AlScaffold`, `AlStatusPill`…) and **wraps Material 3** — it inherits Material's behaviour and defaults, overriding only what this spec demands (color roles, radius, motion, haptics). Don't re-implement what Material already gives you.

**AlProtectionHero (the consumer home centerpiece).** A calm, premium hero: concentric "guardian" rings (the outer ring a `signal.green` gradient arc) around the vehicle, a live "crash detection active" pulse chip, and "You're protected" + plan. This — not a panic button — is the emotional anchor of the consumer app. The bottom nav is **4 tabs (Home · Services · Community · Profile)**; there is **no SOS button in the nav** (consumer emergency is automatic; the bystander one-tap SOS is the QR-scan PWA, a separate web surface).

**AlEmergencyState / "Help is on the way".** Shown when the Telematics SDK detects a crash (or via a secondary in-app "I need help" on the Safety detail screen — never in the nav). Full-screen, high-contrast, `signal.red` focal mark, a live dispatch-status timeline. Tone = reassurance, not spectacle. Any dispatch/confirm call fires on a non-cancellable scope, fully decoupled from animation — visuals never gate the call.

**AlButton.** `pill` radius, `primary`/`onPrimary`, `label` type, `motion.snappy` press, min 48dp height. Variants: primary (filled), secondary (outline `outline`), destructive (`signal.red`).

**AlStatusPill.** Maps state → signal color: active/protected → `green`, pending/attention → `amber`, expired/alert → `red`. Always pairs color with an icon + text (never color alone — accessibility).

**AlPlanCard / AlVehicleCard.** `surface` bg, `radius.lg`, `outline` border, tier accent stripe from the tier mapping, `gentle` entrance, shared-element to detail.

**AlTextField (OTP, vehicle no.).** The **exception, not the default** — used only for the §16 whitelist. `mono` for codes, large hit area, correct keyboard type (number pad for codes), autofill on, clear focus ring using `primary`, inline error in `signal.red` with text (not color-only).

---

## 6. Accessibility (WCAG 2.1 AA — enforced at the release gate)

- **Contrast:** body text ≥ 4.5:1, large text/UI ≥ 3:1 against its background — verify both themes. Signal colors on their `on*` pairs must pass.
- **Touch targets:** ≥ 48dp (SOS ≥ 72dp).
- **Never color-only:** every state (status, error, success) carries an icon or text too — critical for color-blind users and for an emergency context.
- **Screen reader:** labels on SOS, scan, payment, and all icon-only controls; sensible focus order.
- **Reduced motion + dynamic type:** both fully supported; no clipping to 200%.
- **Low-light:** dark theme legible at an accident scene; emergency surfaces use max contrast.
- **Every age (18 → 70+):** comfortable for older eyes (legible defaults, high contrast, ≥48dp targets) and obvious for first-time / low-tech users — **no gesture-only paths**; every action has a visible, labelled control, and the primary action on each screen is unmissable.

---

## 7. How this maps to code (`core/designsystem`)

```
core/designsystem/commonMain/.../
├── theme/
│   ├── Color.kt        # AutolokateColors (light + dark) + gradients/tints — §1
│   ├── Type.kt         # AutolokateType — Inter + Devanagari/regional fallbacks — §2
│   ├── Dimens.kt       # spacing, radius, elevation — §3
│   ├── Motion.kt       # motion tokens + LocalReducedMotion — §4
│   ├── Material.kt     # Haze-based material/blur tiers + reduced-transparency fallback — §8
│   ├── Haptics.kt      # haptic map wired to core/platform — §4b
│   └── Theme.kt        # AutolokateTheme { } — provides all via CompositionLocals
├── icon/
│   ├── AutolokateIcons.kt   # bespoke hero set (ImageVector) — §9
│   ├── PhosphorAdapter.kt   # themed base-set access
│   └── animated/            # Compottie/Rive hero animations (delight only)
└── components/         # AlScaffold, AlBottomNav, AlButton, AlSosButton, AlStatusPill, AlPlanCard, AlVehicleCard, AlTextField, AlGlassBar, AlBottomSheet, AlSkeleton, AlEmptyState, AlErrorState, AlOfflineChip...
```

- Components reference **semantic roles + tokens only** (`colors.emergency`, `type.headline`, `dimens.lg`, `motion.snappy`) — never raw hex/dp/ms.
- Provide a **token-preview screen** (all colors, type ramp, components in both themes + reduced-motion) as a living reference and visual-regression target.
- Every app wraps its UI in `AutolokateTheme`; per-app branding is limited to the injectable tier accent / role copy — the system itself does not fork per app.

---

## 8. Materials & depth (the Apple-grade layer)

Depth is communicated by **translucent materials + blur + layering**, not stacked shadows. Built on **Haze** (already in the stack) for real-time backdrop blur on Compose Multiplatform.

| Material token       | Blur | Opacity | Use                                                         |
| -------------------- | ---- | ------- | ----------------------------------------------------------- |
| `material.thin`      | 20   | 70%     | inline chips, segmented controls over content               |
| `material.regular`   | 30   | 64%     | nav/top bars, bottom tab bar — content scrolls _under_ them |
| `material.thick`     | 40   | 55%     | modal sheets, dialogs, the SOS confirm overlay              |
| `material.ultraThin` | 12   | 80%     | subtle separators, hovering FABs                            |

**Layer model (z-order):** `canvas (gradient) → content → floating bars (material.regular) → sheets (material.thick) → critical overlays`.
**Rules:** at most **two** translucent layers stacked at once (more = mud). Blur falls back to a solid `surfaceVariant` when the platform can't blur or when **reduced-transparency** is on (accessibility) — never break legibility for an effect. Corner radius on glass surfaces = `radius.lg`; content keeps `lg` padding from the glass edge so blur has room to read.

**Elevation discipline:** only sheets/dialogs and the SOS button carry the single soft `elevation.raised` shadow; everything else uses material + `outline`. No competing shadows on cards.

---

## 9. Iconography (hybrid — this is where "wow" is earned)

**Strategy:** a premium open base set for the long tail + a small **bespoke hero set** for the signature moments. Consistency across both is enforced by one grid + stroke spec.

### Base set

**Phosphor Icons** (duotone/regular) as the utility library — clean, geometric, huge coverage, KMP-usable as vectors. Themed to brand: default weight `regular`, `onSurface` color, `signal.*` only when the icon _is_ a status.

### Bespoke hero set (designed to spec, ~10 icons)

The icons a customer actually feels: **SOS / emergency**, **QR identity**, **scan**, **shield/tiers (Safe·Secure·Shield·Shield+)**, **vehicle**, **parking-pin**, **ambulance**, **family/contacts**, **wallet**, **driver-score gauge**. These get a custom, unmistakably-Autolokate treatment.

### Icon grid + stroke spec (both sets obey this)

- **24×24 grid**, 2px live padding (20px optical area). Also ship 16 / 32 / 48 sizes.
- **Stroke 1.75px**, rounded caps + joins, **optical corner radius 2** (never sharp) — the rounded-but-precise feel.
- Two-tone allowed for hero icons: a solid `signal/primary` foreground + a 12–16% tinted fill.
- Pixel-snapped, single visual weight across the whole app. No mixing filled + outline randomly — outline by default, filled only for selected/active nav state.

### Animated hero icons (delight — never on a critical path)

A few hero icons get **Lottie (Compottie) / Rive-CMP** micro-animation for signature moments only:

- **Sticker activated** → shield draws on + check (celebration).
- **Scan** → QR reticle breathing while scanning.
- **Empty states** → a small, characterful loop (parked car, empty garage).
- **SOS** → the _idle_ button may have a slow ambient pulse, but the **press → dispatch is instant and unanimated**; the "Help is on the way" state animates only after the call has fired.

### Sizing & targets

Icon-only controls: 24px glyph in a ≥48dp touch target. Tab bar 28px. Hero/empty-state illustrations 96–160px. Always pair a meaningful action icon with a label or accessible name.

---

## 10. Wow-moment choreography (where craft becomes emotion)

A premium app feels designed at a few peak moments. These are scripted; everything else stays calm.

1. **First open** — `gradient.canvas` fades in, the wordmark settles with a `gentle` spring, content rises in a `stagger.list`. ~600ms, then dead calm. Sets the "this is considered" tone.
2. **Sticker activated** — full-bleed moment: Compottie shield-draw + success haptic + the vehicle card flips from "unprotected" (amber) to "protected" (green) with the `gradient.protected` halo blooming once. This is the emotional payoff of onboarding — make it sing.
3. **Home dashboard entrance** — vehicle card, plan status, safety status rise with `gentle` stagger; tapping the vehicle card uses a **shared-element transition** into detail (the card _becomes_ the header). This single transition does more for "premium" than any amount of styling.
4. **Crash detected → "Help is on the way"** — triggered by the SDK (not a nav button); the screen calmly transitions to a focused status state with a live dispatch timeline + strong confirming haptic. Tone is **reassurance, not spectacle** — restrained motion, high contrast, zero ambiguity. (Dispatch already fired direct to control-center; visuals never gate it.)
5. **Pull-to-refresh / loading** — branded, physical: content stretches with spring resistance; skeletons shimmer subtly using `material.thin`. Never a spinner-on-blank-screen.

**Discipline:** these five are the budget. Adding a sixth "wow" cheapens the other five. Reduced-motion replaces each with a clean instant/cross-fade equivalent.

**Wow for every age (18 → 70+).** It must land the same for a 22-year-old and a 65-year-old:

- **Felt, not just seen** — a confirming haptic (§4b) on every peak moment, so it registers even at a glance.
- **Clear, never missed** — an unmistakable beat (the vehicle card flips amber→green, "You're protected"), not a flourish only a designer notices.
- **Never gesture-gated** — no delight hidden behind a swipe/long-press the user must discover; the moment comes to _them_.
- **Survives reduced-motion** — the emotional beat stays (the green protected state, the celebration copy + haptic); only the motion is removed, not the meaning. Premium lives in the static frame too (material, type, colour, clarity), so the app feels considered even with every animation off.

---

## 11. Screen scaffold (every screen is laid out the same — this is what makes it "easy to navigate")

One scaffold, used everywhere. Structural sameness is _why_ an app feels effortless — the user never relearns a screen.

**`AlScaffold`** = the standard screen, top to bottom:

1. **Status region** — translucent, edge-to-edge; content scrolls under it. Respect safe-area insets on both platforms.
2. **Top bar** _(optional, `material.regular`)_ — a large title (`headline`) that collapses to `title` on scroll (one collapsing pattern, app-wide). Left = back/close _only when there's somewhere to go back to_; right = **at most one** action icon. Tab roots usually have **no** top bar — the screen title is the first content block.
3. **Content** — a single scroll column at the `lg` (16dp) side margin; sections separated by `xl`/`xxl` whitespace, **never dividers** (Principle #1). One screen = one job (Principle #2): the primary thing dominates, the rest recedes.
4. **Primary action** — in the **thumb zone** (bottom third): a bottom-pinned `AlButton` on a `material.regular` bar, or inline at the natural end of the flow. One per screen (§14).
5. **Bottom nav** _(tab roots only)_ — 4 tabs, `material.regular`, content scrolls _under_ it (§8). Detail/flow screens hide it.

**Rules:** one content margin (`lg`) app-wide (no per-screen margins); one vertical scroll owner per screen (no competing nested scrolls); group by whitespace + a `title` header, not by boxing everything in a card; edge-to-edge with safe-area respect on Android **and** iOS — nothing under the notch or the gesture/home indicator.

---

## 12. State catalog (no screen ships without these — a dead-end is a bug)

Every data-driven screen defines all six states the same way. Consistency here is half of "easy to navigate."

| State       | Pattern                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading** | **Skeletons** shaped like the real content (shimmer via `material.thin`) — never a centered spinner on a blank screen. Swap to real data the moment it arrives.                                      |
| **Loaded**  | The normal scaffold (§11).                                                                                                                                                                           |
| **Empty**   | A calm bespoke hero illustration (96–160px, §9) + one `title` line of plain copy + one primary action ("Add your first vehicle"). Never a blank screen or a raw "No data."                           |
| **Error**   | `signal.amber`, **inline**, for recoverable errors: short plain-language cause + **Retry**. Reserve `signal.red` for genuine danger, not "request failed." Never a stack trace or an error code.     |
| **Offline** | A quiet persistent `material.thin` chip ("Offline — changes will sync"), not a blocking modal. Cached content stays usable; queued actions show a "pending sync" affordance (esp. QR-partner scans). |
| **Success** | Inline confirmation + success haptic (§4b); a milestone (activation/payment) earns the §10 celebration. Then **get out of the way** — auto-dismiss, don't trap the user on a "done" screen.          |

**Rules:** optimistic UI where safe (reflect the tap instantly, reconcile on response); every error offers a way forward (Retry / contact / back) — **no dead-ends**; loading never blocks the back gesture.

---

## 13. Navigation patterns (predictable = easy)

- **Bottom nav is the spine.** Tapping the **active** tab scrolls to top, then pops to its root. Tabs never reorder. (Consumer = Home · Services · Community · Profile; partner apps define their own ≤ 4.)
- **Back always means back.** System back and the top-bar back do the same thing; closing a sheet ≠ leaving the screen. Never trap the user.
- **Sheet vs full-screen:** a **bottom sheet** (`material.thick`, drag-to-dismiss, `radius.lg` top) for a quick focused sub-task that returns you to context (pick a plan, confirm, filter); **full-screen** (`motion.standard` push) for a new place or a multi-step flow. Never stack more than one sheet.
- **Flows are guided, one step at a time.** A multi-step task (onboarding, activation, KYC, booking) is a sequence of **single-decision screens** — one job each, one primary/Next, easy Back, a quiet progress cue — **never one long scrolling form**. The user is never asked to juggle two choices at once.
- **Transitions carry meaning** (§4): push = "deeper," shared-element = "this _becomes_ that," fade = peer swap. One transition vocabulary app-wide.
- **Depth discipline:** ≤ 3 levels from any tab root to any action. Deeper than that = it's a flow (own scaffold), not buried navigation.
- **Deep links / push** land on the real destination with a synthesized back stack to the tab root — never a dead modal.
- **"Where am I?" is always answerable:** the screen title + the lit tab. No chevrons into nowhere.

---

## 14. Reach & one-handed use (a phone used in / near a car, every day)

- **Primary action in the bottom third** — where the thumb rests (bottom-pinned button or sheet). The top half is for reading, not reaching.
- **Top bar = low-frequency only** (back, one overflow). The screen's main action is **never** top-right.
- **Quick actions** (Scan · Parking · Challan on Home) sit as a thumb-row near the bottom of the hero, not in a top toolbar.
- **Critical/destructive actions** are reachable but **guarded** (confirm sheet) — easy to reach, hard to fire by accident.
- **One primary per screen** (Principle #2): two "primary" buttons means the screen is doing two jobs — split it.
- **Targets** ≥ 48dp with ≥ `sm` (8dp) between them; bottom-edge actions get extra bottom inset to clear the home indicator / gesture bar.

---

## 15. Voice & microcopy (words are UI — calm, clear, human)

The brand voice is a **calm, plain, reassuring** competent friend — never a marketer or a machine. Under stress (emergency, payment, offline) the words carry the trust.

- **Plain language, no jargon.** "Crash detection is on," not "Telemetry active." "Couldn't reach the server — tap to retry," not "Error 503."
- **Reassure on the critical path.** Emergency copy is steady and specific: _"Help is on the way. Ambulance notified · 2 contacts alerted."_ No exclamation marks, no drama.
- **Buttons are verbs** that name the outcome: "Activate sticker," "Pay ₹999," "Add vehicle" — never "OK / Submit / Done."
- **Numbers are honest + tabular** (§2): prices, scores, OTP, ETAs exact and aligned.
- **Errors = cause + way forward**, one line, no blame.
- **Sentence case** everywhere (never Title Case or ALL CAPS, except the wordmark). One space, one idea.
- **Localised, not translated:** Hindi/regional copy is written to feel native (same calm), mapped to the same type hierarchy (§2).

---

## 16. Input & selection (tap, don't type)

Typing is the heaviest, most error-prone interaction for a daily, all-ages, mobile-first app — and painful in regional scripts. **Default to select · tap · scan · pick. Reserve the keyboard for the few cases that truly need it.**

**Text input (`AlTextField`) is allowed ONLY for this whitelist:**

- Mobile number + OTP (prefer OTP autofill / SMS retriever).
- Vehicle registration number — and only until **Vahan auto-fills** the rest.
- Search (marketplace, parts).
- User-generated content — Q&A posts, reel captions, support messages.

**Everything else is a tap, not a field:**
| Instead of typing… | Use |
|---|---|
| Plan / tier | `AlPlanCard` tap-to-select |
| Emergency contacts | device **contact picker** (don't retype names/numbers) |
| Vehicle details | **Vahan auto-fill** from the reg number; the user only confirms |
| Active vehicle | quick toggle |
| Language · category · zone | select list or chips |
| Amount to pay | fixed from the selected plan — **no amount field** |
| Quantity (sticker reorder) | stepper (− / +) |
| Date / time | native picker |
| Location | map pick / GPS — **not** an address field |
| Yes/no · on/off | toggle |
| Filters | chips |

**Rules:** a screen never asks for more than the whitelist allows; if a flow looks like a form, redesign it as a sequence of taps — **"select, touch, and go."** `AlTextField` is the exception, not the default — every use is a deliberate choice a reviewer can challenge. Lean on the device to skip typing: **contact picker, camera/QR scan, Vahan auto-fill, maps pick, OTP autofill.**
