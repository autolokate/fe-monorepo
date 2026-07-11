# Emergency + Rider — Implementation Blueprint

**App:** `@autolokate/qr`  
**Date:** 2026-06-18  
**Mode:** Audit only — no implementation, no route changes, no code changes  
**Figma:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Section:** `371:1275` · **Consumer · Emergency + Rider · ✅ READY FOR DEV**

---

## Executive summary

Figma defines **11 primary screen surfaces** (R0–R4, E0–E3, E5) and **19 frames** in the READY FOR DEV section. Code already implements **9 routes** (E01–E09) matching R0–R3 + E0–E3 + E5, but **does not implement R4**, **does not read plan limits from purchase session**, and **hardcodes max 3 emergency contacts for all plans**.

**Critical gaps before implementation:**

| Gap | Severity |
|-----|----------|
| Plan limit source of truth conflict (user rules vs purchase copy vs Figma vs code) | **Blocker** |
| R4 · Riders added screens missing from routes | **High** |
| E5 max-reached variant not implemented | **High** |
| R0 loading / error / offline variants not implemented | **Medium** |
| R3/E3 disabled + submitting + error variants partial | **Medium** |
| R1/E1/R2/E2 error/offline Figma frames removed — infer from auth patterns | **Low** |
| `session.purchase.selectedPlanId` not consumed by emergency flow | **Blocker** |

**Mandatory business rule:** At least **1 emergency contact** required before Continue on E5.

---

## 1. Frame inventory

All frames are **393 × 852**, dark canvas `#0A0A0C`, green radial ambient tint. Section child count: **19 frames**.

### 1.1 Primary screens (11 surfaces · 11 frames)

| Dev ID | Figma ref | Node ID | Frame name | Route (current code) |
|--------|-----------|---------|------------|----------------------|
| E01 | **R0** Rider prompt | `375:37` | 08 · R0 Rider prompt | `/journey/emergency/rider-prompt` |
| E02 | **R1** Rider mobile | `789:2064` | 12 · R1 Rider mobile | `/journey/emergency/rider-mobile` |
| E03 | **R2** Rider OTP | `789:2109` | 13 · R2 Rider OTP | `/journey/emergency/rider-otp` |
| E04 | **R3** Rider name + relation | `374:71` | 14 · R3 Rider name + relation | `/journey/emergency/rider-name` |
| — | **R4** Riders added | `822:1980` | 18 · R4 Riders added | **Not routed** |
| E05 | **E0** No contacts | `373:37` | 01 · E0 No contacts | `/journey/emergency/contacts-empty` |
| E06 | **E1** Contact mobile | `789:1982` | 02 · E1 Contact mobile | `/journey/emergency/contact-mobile` |
| E07 | **E2** Contact OTP | `789:2027` | 03 · E2 Contact OTP | `/journey/emergency/contact-otp` |
| E08 | **E3** Contact name + relation | `371:1276` | 04 · E3 Contact name + relation | `/journey/emergency/contact-name` |
| E09 | **E5** Contacts added | `373:64` | 06 · E5 Contacts added | `/journey/emergency/contacts-summary` |

> **No E4 screen** exists in Figma or code.  
> **Node ID updates:** E1/E2/R1/R2 were reorganized from legacy IDs (`371:1295`, `371:1318`, `374:37`, `374:54`) to `789:*` in the current READY FOR DEV section.

### 1.2 State-variant frames (8 frames)

| Figma ref | Node ID | Frame name | Base screen | State | In code? |
|-----------|---------|------------|-------------|-------|----------|
| R0 · Loading | `713:2264` | 09 · R0 Rider prompt · Loading | R0 | `loading` (CTA spinner) | ❌ |
| R0 · Error | `713:2288` | 10 · R0 Rider prompt · Error | R0 | `error` | ❌ |
| R0 · Offline | `713:2311` | 11 · R0 Rider prompt · Offline | R0 | `offline` + `AlOfflineChip` | ❌ |
| R3 · Disabled | `713:2021` | 15 · R3 Rider name + relation · Disabled | R3 | `disabled` CTA + helper | ⚠️ partial (`footerDisabled` only) |
| R3 · Submitting | `719:2084` | 16 · R3 Rider name + relation · Submitting | R3 | `submitting` (loading CTA) | ❌ |
| R3 · Error | `719:2143` | 17 · R3 Rider name + relation · Error | R3 | `error` + save failure copy | ❌ |
| E3 · Disabled | `713:1962` | 05 · E3 Contact name + relation · Disabled | E3 | `disabled` CTA + helper | ⚠️ partial |
| E5 · Max 3 | `717:2237` | 07 · E5 Contacts added · Max 3 | E5 | `max reached` | ❌ |
| R4 · Max 2 | `824:2014` | 19 · R4 Riders added · Max 2 | R4 | `max reached` (riders) | ❌ |

### 1.3 Legacy variant frames (removed from Figma)

The Phase 11 audit documented 10 mobile/OTP variant frames (`595:*`, `579:*`, `580:*`). **These nodes no longer exist** in the current file (API returns not found). Behavior should still be implemented by reusing auth OTP/mobile patterns:

| Former frame | Intended state | Implement via |
|--------------|----------------|---------------|
| R1/E1 · Error | Invalid mobile | `AlTextField` error + inline message |
| R1/E1 · Offline | No network | Disabled field + offline signal |
| R2/E2 · Error | Wrong/expired OTP | `AlOtpInput` error |
| R2/E2 · Verifying | OTP submit | `footerLoading` on CTA |
| R2/E2 · Network error | API failure | Error copy + retry |

### 1.4 Figma DS components referenced

| Component | Node / usage |
|-----------|--------------|
| `StatusBar` | All frames |
| `AlButton/Primary` | Default CTA |
| `AlButton/Primary·Disabled` | R0 offline, R3/E3 disabled |
| `AlButton/Primary·Loading` | R0 loading, R3 submitting |
| `AlTextField` | R1, E1 |
| `AlOtpInput` | R2, E2 |
| `AlInput` | R3, E3 |
| `AlRelationGrid` | R3, E3 (Figma component `721:2136`) |
| `AlContactCard` | E5, R4 (`723:2194`) |
| `AlAvatar` | Inside contact card |
| `AlStepProgress/Step1of3` | R1, E1 |
| `AlStepProgress/Step3of3` | R3, E3 |
| `AlOfflineChip` | R0 offline (`580:1743`) |
| `languageSwitcher` | R1, E1 (present in Figma; **removed from auth** — see parity notes) |

---

## 2. State inventory

### 2.1 State matrix by screen

| Screen | States required | Figma evidence | Code today (`types.ts` + screens) |
|--------|-----------------|----------------|-----------------------------------|
| **R0** | default, loading, error, offline | 4 frames | `default` only |
| **R1** | default, error, offline, disabled† | Legacy variants removed; field states inferred | `EmergencyMobileState`: default, error, offline |
| **R2** | default, error, verifying, network-error, disabled† | Legacy variants removed | `EmergencyOtpState`: all four |
| **R3** | default, disabled, submitting, error | 4 frames | disabled via `footerDisabled` only |
| **R4** | default (1 of 2), max reached (2 of 2) | 2 frames | **Not implemented** |
| **E0** | default | 1 frame | default |
| **E1** | default, error, offline, disabled† | Same as R1 | same as R1 |
| **E2** | default, error, verifying, network-error | Same as R2 | same as R2 |
| **E3** | default, disabled, submitting‡, error‡ | Disabled frame; submit/error not framed | disabled via `footerDisabled` only |
| **E5** | under max, max reached, Continue disabled (0 contacts) | 2 frames + business rule | under max only; hardcoded max 3 |

† Disabled = CTA disabled when form invalid (not a separate Figma frame for mobile/OTP).  
‡ E3 submitting/error not in Figma — mirror R3 if API save is added.

### 2.2 Orchestration session fields

| Field | Set on | Used by |
|-------|--------|---------|
| `riderSkipped` | R0 skip | Skip R1–R4 |
| `rider` / `riders[]`† | R3 save | R4 list, back navigation |
| `contactDraft` | E0 picker, E1, E2 | E3 gate |
| `contacts[]` | E3 save | E5 list, plan limit check |
| `session.purchase.selectedPlanId` | Purchase R06 | **Should drive** max contacts, E0 copy, E5 subtitle |
| `session.purchase.riderCount` | Purchase R07 | **Should drive** R0 copy, R4 max, rider loop |

† Code stores single `rider`; Figma R4 implies `riders[]` array for multi-rider addon.

### 2.3 CTA / footer state mapping

| UI state | `AlButton` signal | Helper text location |
|----------|-------------------|----------------------|
| `default` | Primary enabled | — |
| `disabled` | `Primary·Disabled` | Above footer: *"Add a name to continue"* (R3/E3) |
| `loading` / `submitting` / `verifying` | `Primary·Loading` | OTP: resend cooldown caption |
| `offline` | `Primary·Disabled` + `AlOfflineChip` | R0: chip below status bar; R1/E1: field helper |
| `error` | Primary enabled (retry) | Inline field/OTP error or description swap (R0) |
| `max reached` | Primary enabled (Continue) | E5/R4: no add row; centered max copy |

---

## 3. Route graph

### 3.1 Figma-intended graph (including R4)

```mermaid
flowchart TD
  ACT[Activation success<br/>P06 / Prepaid / B2B2C] --> R0[R0 · Rider prompt]

  R0 -->|Add rider details| R1[R1 · Rider mobile]
  R0 -->|Skip for now| E0[E0 · No contacts]

  R1 --> R2[R2 · Rider OTP]
  R2 --> R3[R3 · Rider name]
  R3 --> R4[R4 · Riders summary]

  R4 -->|Add another rider| R1
  R4 -->|Continue| E0

  E0 -->|Add from contacts| PICK[Native contact picker]
  E0 -->|Enter a number instead| E1[E1 · Contact mobile]

  PICK --> E3[E3 · Contact name]
  E1 --> E2[E2 · Contact OTP]
  E2 --> E3
  E3 --> E5[E5 · Contacts summary]

  E5 -->|Add another contact| E1
  E5 -->|Continue ≥1 contact| DONE[/journey/completed]
```

### 3.2 Current code graph (implemented)

```mermaid
flowchart TD
  ACT[Activation success] --> R0[R0]
  R0 -->|Add| R1 --> R2 --> R3
  R0 -->|Skip| E0
  R3 --> E0
  E0 -->|Picker| E3
  E0 -->|Manual| E1 --> E2 --> E3 --> E5
  E5 -->|Add another| E1
  E5 -->|Continue| DONE[/journey/completed]
```

**Delta:** Code skips **R4** — R3 navigates directly to E0. No rider loop after first rider.

### 3.3 Route table

| Path | Screen | Step # | Back target (orchestrated) |
|------|--------|--------|----------------------------|
| `/journey/emergency/rider-prompt` | R0 | 1 | P06 payment success |
| `/journey/emergency/rider-mobile` | R1 | 2 | R0 |
| `/journey/emergency/rider-otp` | R2 | 3 | R1 |
| `/journey/emergency/rider-name` | R3 | 4 | R2 |
| `/journey/emergency/riders-summary` | R4 | — | **Missing** |
| `/journey/emergency/contacts-empty` | E0 | 5 | R3 or R0 if skipped |
| `/journey/emergency/contact-mobile` | E1 | 6 | E5 if contacts exist, else E0 |
| `/journey/emergency/contact-otp` | E2 | 7 | E1 |
| `/journey/emergency/contact-name` | E3 | 8 | E2 or E0 if picker |
| `/journey/emergency/contacts-summary` | E5 | 9 | E0 |

**Exit:** E5 Continue → `/journey/completed` (requires ≥1 contact).

**Guards:** `RequireAuthCompleted`, `RequireSelectedFlowMatch` (purchase | prepaid | b2b2c), `setPhase('emergency')` on segment entry.

---

## 4. Plan limit matrix

### 4.1 Sources of truth (conflict)

| Plan | User business rules (this audit) | `purchase-plans.ts` marketing copy | Figma E5 frames | Code (`E09`, `E5Route`) |
|------|----------------------------------|-------------------------------------|-----------------|-------------------------|
| **Safe** | max **1** contact | "1 emergency contact" | Not framed (E5 shows "1 of 3") | max **3** |
| **Secure** | max **2** contacts | "3 contacts + AI calling" | "1 of 3" / max 3 frame | max **3** |
| **Shield** | max **3** contacts | (inherits Secure features) | "1 of 3" / max 3 | max **3** |
| **Shield+** | max **3** contacts | (inherits Shield) | "1 of 3" / max 3 | max **3** |

**Rider addon (Figma R4):** Secure / Shield / Shield+ include "Rider cover · up to **2** · add-on". Safe has no rider addon. R0 copy references **1 rider's cover** (single-rider purchase scenario).

> **Decision required before implementation:** Align product on contact limits — user rules (Secure=2) vs purchase card copy (Secure=3) vs Figma (always shows 3). Implementation should read limits from a **single config** keyed by `selectedPlanId`, not hardcoded `3`.

### 4.2 Recommended limit config (per user business rules)

| Plan ID | `maxEmergencyContacts` | `minEmergencyContacts` | `maxRiders` | Show R0? |
|---------|--------------------------|------------------------|-------------|----------|
| `safe` | 1 | 1 | 0 | No (no addon) |
| `secure` | 2 | 1 | 2 | If `riderCount > 0` |
| `shield` | 3 | 1 | 2 | If `riderCount > 0` |
| `shield-plus` | 3 | 1 | 2 | If `riderCount > 0` |

### 4.3 How limits affect each surface

#### R0 · Rider prompt

| Condition | Behavior |
|-----------|----------|
| No rider addon purchased (`riderCount === 0` or Safe plan) | **Skip R0 entirely** → land on E0 |
| 1 rider purchased | Show R0; description: *"You've already paid for 1 rider's cover…"* |
| 2 riders purchased (addon) | Show R0 on first entry; after R4 with 1 rider, "Add another rider" loops to R1 |
| Loading | Fetch rider entitlement before showing CTA |
| Error | Description: *"We couldn't load your rider cover"*; CTA: *"Try again"* |
| Offline | Disabled primary CTA + `AlOfflineChip`; skip still available |

#### E0 · No contacts

| Plan | Description copy (dynamic) |
|------|------------------------------|
| Safe | *"Add 1 person we'll alert if you're in a crash."* |
| Secure | *"Add up to 2 people we'll alert if you're in a crash."* |
| Shield / Shield+ | *"Add 1–3 people we'll alert if you're in a crash."* (Figma default) |

Primary CTA always **Add from contacts**; secondary **Enter a number instead**. Plan does not disable E0 — user must add ≥1 contact on all plans.

#### E5 · Contacts summary

| State | Subtitle pattern | Add another row | Footer |
|-------|------------------|-----------------|--------|
| Under max | `{n} of {max} added · you can add {max−n} more` | Show **Add another contact** | Continue enabled if n ≥ 1 |
| Max reached | `{max} of {max} added · maximum reached` | **Hidden** | Continue enabled if n ≥ 1 |
| Max reached helper | *"You've added the maximum {max} contacts"* (centered) | — | — |
| 0 contacts (edge) | — | Show add row | Continue **disabled** |

**Safe plan at 1 contact:** E5 matches "max reached" variant even with 1 card (no add row).

#### Add another contact CTA

| Condition | Visible? |
|-----------|----------|
| `contacts.length < maxEmergencyContacts(plan)` | Yes — dashed `AddContactRow` |
| `contacts.length >= max` | No — show max helper text instead |

#### Max reached state

Figma frame `717:2237` is authored for **3 of 3** only. Implementation must **parameterize** `{max}` per plan (1, 2, or 3).

---

## 5. Component inventory

### 5.1 `@autolokate/ui` — present and used

| Component | Used on |
|-----------|---------|
| `AlTextField` | R1, E1 |
| `AlOtpInput` | R2, E2 |
| `AlInput` | R3, E3 |
| `AlButton` | OTP Change link, Resend |
| `AlText` | OTP description, trust row, captions |
| `AlStack` | E5 list |
| `AlScreenBg` | Via `FlowStepShell` |
| `AlStepProgress` | **Figma yes; code uses emergency phase steps in shell** |
| `AlAvatar` | **Figma `AlContactCard`; code uses icon placeholder** |
| `AlChip` | Not used in emergency |

### 5.2 `@autolokate/ui` — missing (Figma references, not in package)

| Figma component | Purpose | Recommendation |
|-----------------|---------|----------------|
| `AlRelationGrid` | 3×2 relationship tiles | Keep as onboarding `RelationshipSelector` composition unless second flow needs it |
| `AlContactCard` | Verified contact row with avatar | Promote from `EmergencyContactRow` when profile/settings reuses |
| `AlOfflineChip` | Offline banner chip | Add to `@autolokate/ui` or shared compositions (used on R0, likely auth too) |
| `AlButton/Primary·Loading` | Loading CTA | `AlButton` `loading` prop — verify parity |
| `AlButton/Primary·Disabled` | Disabled CTA | `AlButton` `disabled` — verify visual parity |
| `AlOtpInput/Error` | OTP error state | `AlOtpInput` `state="error"` — verify parity |

### 5.3 `@autolokate/icons` — used

| Icon | Where |
|------|-------|
| `arrow-left` | Shell back (via `FlowStepShell`) |
| `circle-user` | R0 hero |
| `users` | E0 hero |
| `shield-check` | E0 trust row |
| `user` | Contact row avatar, relationship tiles |
| `plus` | Add contact/rider row, Other relation |
| `circle-check` | Verified badge on contact row |
| `chevron-down` | Figma language switcher only (not in code) |

### 5.4 Onboarding compositions (implemented)

| Composition | Path | Screens |
|-------------|------|---------|
| `RelationshipSelector` | `components/compositions/relationship-selector/` | R3, E3 |
| `EmergencyContactRow` | `components/compositions/emergency-contact-row/` | E5 |
| `AddContactRow` | `components/compositions/add-contact-row/` | E5 |
| `EmptyStateHero` | `components/compositions/empty-state-hero/` | R0, E0 |
| `FormFieldStack` | `components/compositions/form-field-stack/` | R1, R2, R3, E1, E2, E3 |
| `FlowStepShell` | `components/flow-step-shell/` | All screens |
| `EmergencyOtpScreen` | `features/emergency/screens/shared/` | R2, E2 |

---

## 6. Composition promotion candidates

| Candidate | Figma reuse | Current location | Promote to `@autolokate/ui`? |
|-----------|-------------|------------------|------------------------------|
| **RelationshipSelector** | R3 + E3 (`AlRelationGrid`) | onboarding composition | **Defer** — 2 screens only |
| **EmergencyContactRow** | E5 + R4 (`AlContactCard`) | onboarding composition | **Defer** — promote when second consumer surface needs contact cards |
| **AddContactRow** | E5 + R4 add-another | onboarding composition | **Defer** — pair with contact row |
| **EmergencyContactList** | E5, R4 | Not extracted | **Consider** — compose row + add + max helper |
| **RiderSummaryList** | R4 only | Missing | **New composition** if R4 implemented |
| **TrustFooterRow** | E0 only | Inline in E05 screen | **Defer** — single use |
| **OfflineHeroLayout** | R0 offline | Missing | **Reuse** auth offline patterns |
| **EmergencyOtpScreen** | R2 + E2 | feature shared | **Keep** in feature — already shared |

---

## 7. Existing code reuse opportunities

| Asset | Location | Reuse for |
|-------|----------|-----------|
| `EmergencyRoutes.tsx` orchestration | `journey/routes/` | Extend with R4, plan guards, rider loop |
| `EmergencyOtpScreen` | `features/emergency/screens/shared/` | R2/E2 — already extracted |
| `emergency.validation.ts` | `features/emergency/` | Mobile, OTP, name validation |
| `RESEND_COOLDOWN_SECONDS`, `OTP_LENGTH` | `shared-auth/auth-flow/` | OTP timers |
| Auth mobile field pattern | `A1MobileScreen` / R03 | R1/E1 error/offline |
| Auth OTP pattern | `A2OtpScreen` / R04 | R2/E2 verifying/error/network |
| `FlowStepShell` + `step-shell-chrome` | `components/` | All screens — pinned back + CTA |
| `getPurchasePlan()` | `purchase-plans.ts` | **Wire** after limits config added |
| `PurchaseRoutes` session patching | `journey/routes/PurchaseRoutes.tsx` | Mirror for `riderCount`, `selectedPlanId` reads |
| `demoPickerContact` | `emergency/data/demo-data.ts` | Replace with native bridge later |

### Code ↔ Figma copy deltas (fix during implementation)

| Screen | Figma | Code today |
|--------|-------|------------|
| R0 body | *"…finish later from your profile."* | *"…finish anytime from your profile."* |
| R1 body | *"We'll send them a code on WhatsApp. Enter it here to confirm."* | *"…so they know you've added them."* |
| R3/E3 body | *"Add their name and how they're related"* | *"Confirm their name and how they're related."* |
| E0 trust | *"Encrypted · only used to reach them in a crash"* | *"…only ever used to reach them in an emergency"* |
| E5 subtitle | *"1 of 3 added · you can add 2 more"* | *"1 of 3 added — you can add up to 3."* |
| R0 error | *"We couldn't load your rider cover"* | Not implemented |
| R3 error | *"We couldn't save rider details"* | Not implemented |
| E3/R3 disabled helper | *"Add a name to continue"* | Not shown |

---

## 8. Figma parity checklist

| # | Item | Status |
|---|------|--------|
| 1 | R0 default frame `375:37` | ✅ Implemented |
| 2 | R0 loading `713:2264` | ❌ |
| 3 | R0 error `713:2288` | ❌ |
| 4 | R0 offline + `AlOfflineChip` `713:2311` | ❌ |
| 5 | R1 `789:2064` + step progress 1/3 | ⚠️ Missing step progress; language switcher intentionally omitted |
| 6 | R2 `789:2109` + Change link | ✅ |
| 7 | R3 `374:71` + `AlRelationGrid` | ⚠️ Composition OK; step progress missing |
| 8 | R3 disabled/submitting/error | ❌ / ❌ / ❌ |
| 9 | R4 riders summary `822:1980` | ❌ Route missing |
| 10 | R4 max 2 `824:2014` | ❌ |
| 11 | E0 `373:37` | ✅ |
| 12 | E1 `789:1982` | ⚠️ Language switcher omitted by product decision |
| 13 | E2 `789:2027` | ✅ |
| 14 | E3 `371:1276` | ⚠️ Description copy drift |
| 15 | E3 disabled `713:1962` | ⚠️ No helper text |
| 16 | E5 default `373:64` | ⚠️ Subtitle copy drift |
| 17 | E5 max `717:2237` | ❌ |
| 18 | `AlContactCard` visual (avatar, verified) | ⚠️ Simplified row |
| 19 | Pinned footer CTA + scroll body | ✅ Via `step-shell-chrome` |
| 20 | Green protected ambient (not SOS red) | ✅ `AlScreenBg variant="protected"` |
| 21 | Plan-based contact max | ❌ Hardcoded 3 |
| 22 | Plan-based E0 description | ❌ Always "1–3" |
| 23 | Mandatory ≥1 contact on E5 Continue | ✅ `footerDisabled={count === 0}` |
| 24 | No E4 / plan-addon / confirmation screens | ✅ Not invented |

---

## 9. Dark theme checklist

Figma READY FOR DEV frames are authored in **dark only** (`#0A0A0C` canvas).

| Token / element | Figma value | Implementation |
|-----------------|-------------|----------------|
| Canvas | `#0A0A0C` | `AlScreenBg` protected variant |
| Card fill | `#1A1A1A` | `--al-surface-raised` or equivalent |
| Border / muted | `#4A4A4A` | `--al-border-strong` |
| Muted text | `#8A8A8A` | `tone="muted"` |
| Primary text | `#FFFFFF` | default foreground |
| CTA fill | `#FFFFFF` on `#0A0A0A` text | `AlButton` primary |
| Success / verified | `#1FA24A` | green token |
| Error label | `#F5A623` | R3 error frame |
| Ambient tint | green radial 4% | protected bg gradient |
| Hero circle | `#4A4A4A` | `.ob-emergency-hero-icon` |
| Dashed add row border | `#4A4A4A` dashed | `AddContactRow` CSS |
| Offline chip | `#4A4A4A` fill | **Not implemented** |

**Verify:** No hardcoded neutrals in `emergency.css` / contact row CSS — use semantic tokens (post light-mode pass).

---

## 10. Light theme checklist

No light-theme frames exist in section `371:1275`. Parity is **token-driven** from DS foundations.

| Element | Dark (Figma) | Light (expected via tokens) |
|---------|------------|----------------------------|
| Canvas | `#0A0A0C` | `--al-bg-canvas` light |
| Surface cards | `#1A1A1A` | `--al-surface-raised` light |
| Primary text | `#FFFFFF` | `--al-fg-primary` light |
| Muted text | `#8A8A8A` | `--al-fg-muted` light |
| Primary CTA | white button / dark text | inverted primary button |
| Green verified badge | `#1FA24A` | same brand green |
| Hero icon circle | `#4A4A4A` | `--al-surface-subtle` |
| Trust row | muted caption | `tone="muted"` |
| Error states | amber `#F5A623` | `--al-fg-warning` or semantic |
| `AlOfflineChip` | gray pill | needs token spec |
| Step progress inactive | `#4A4A4A` | token inactive track |

**QA widths:** 320, 360, 375, 390, 414 — relationship grid wrap, OTP cells, pinned footer.

**QA actions:**

1. Toggle `data-theme="light"` on journey root.
2. Walk full suffix: R0 → … → E5 → Completed.
3. Compare surfaces: hero, contact row, dashed add row, disabled CTA, OTP error.
4. Confirm no leaked `#0A0A0C`, `#1A1A1A`, `#8A8A8A` literals in emergency CSS.

---

## Appendix A — Exact copy & CTAs

### R0 · Rider prompt (`375:37`)

| Element | Text |
|---------|------|
| Title | Add your rider's details? |
| Description (default) | You've already paid for 1 rider's cover. Add their name now, or finish later from your profile. |
| Description (error) | We couldn't load your rider cover |
| Primary CTA (default) | Add rider details |
| Primary CTA (error) | Try again |
| Primary CTA (loading) | *(spinner, no label change)* |
| Primary CTA (offline) | *(disabled)* |
| Secondary | Skip for now |

### R1 · Rider mobile (`789:2064`)

| Element | Text |
|---------|------|
| Title | Rider's mobile number |
| Description | We'll send them a code on WhatsApp. Enter it here to confirm. |
| Field placeholder | 98765 43210 |
| Prefix | +91 |
| CTA | Get OTP |
| Error | Enter a valid 10-digit mobile number. *(code convention)* |
| Offline helper | No internet connection *(code convention)* |

### R2 · Rider OTP (`789:2109`)

| Element | Text |
|---------|------|
| Description | Enter the code we sent on WhatsApp to {mobile} · |
| Link | Change |
| CTA | Verify |
| Resend cooldown | Code on its way · resend in 0:{ss} |
| Resend | Resend code |
| Errors | Incorrect code. Try again. / This code has expired. Request a new OTP. / Couldn't reach the server. Tap Verify to retry. |

### R3 · Rider name (`374:71`)

| Element | Text |
|---------|------|
| Title | Add this rider |
| Description | Add their name and how they're related |
| Relation label | How are they related? |
| Relations | Spouse, Parent, Child, Sibling, Friend, Other |
| CTA | Save rider |
| Disabled helper | Add a name to continue |
| Error | We couldn't save rider details |

### R4 · Riders added (`822:1980` / `824:2014`)

| Element | Text (1 rider / max) |
|---------|----------------------|
| Title | Riders |
| Subtitle | 1 of 2 added · you can add 1 more / 2 of 2 added · maximum reached |
| Row badge | Verified |
| Add row | Add another rider |
| Max helper | You've added the maximum 2 riders |
| CTA | Continue |

### E0 · No contacts (`373:37`)

| Element | Text |
|---------|------|
| Title | Who should we call? |
| Description | Add 1–3 people we'll alert if you're in a crash |
| Hero | No contacts yet |
| Trust | Encrypted · only used to reach them in a crash |
| Primary CTA | Add from contacts |
| Secondary | Enter a number instead |

### E1 · Contact mobile (`789:1982`)

Same field pattern as R1 with title **Their mobile number** and CTA **Get OTP**.

### E2 · Contact OTP (`789:2027`)

Same as R2 (shared `EmergencyOtpScreen`).

### E3 · Contact name (`371:1276`)

| Element | Text |
|---------|------|
| Title | Add this contact |
| Description | Add their name and how they're related |
| CTA | Save contact |
| Disabled helper | Add a name to continue |

### E5 · Contacts summary (`373:64` / `717:2237`)

| Element | Text |
|---------|------|
| Title | Emergency contacts |
| Subtitle (under max) | {n} of {max} added · you can add {remaining} more |
| Subtitle (max) | {max} of {max} added · maximum reached |
| Row badge | Verified |
| Add row | Add another contact |
| Max helper | You've added the maximum {max} contacts |
| CTA | Continue |

---

## Appendix B — Implementation sequence (when approved)

1. **Resolve plan limit config** — product sign-off on Secure (2 vs 3); add `getEmergencyLimits(planId)`.
2. **Wire purchase session** — read `selectedPlanId`, `riderCount` in `EmergencyRoutes`.
3. **Add R4 route + screen** — rider loop before E0.
4. **Parameterize E0/E5** — dynamic copy and max-reached UI.
5. **R0 states** — loading, error, offline + `AlOfflineChip`.
6. **R3/E3 states** — disabled helper, submitting, save error.
7. **Copy alignment** — match Figma strings in Appendix A.
8. **Figma visual parity** — `AlContactCard` layout, step progress on sub-flows.
9. **Theme QA** — dark + light at all breakpoints.
10. **Native contact picker** — replace `demoPickerContact` stub.

---

## Appendix C — Related documents

| Document | Role |
|----------|------|
| [PHASE_11_EMERGENCY_AUDIT.md](./PHASE_11_EMERGENCY_AUDIT.md) | Initial Figma audit (partially superseded by frame ID updates) |
| [PHASE_11B_EMERGENCY_IMPLEMENTATION.md](./PHASE_11B_EMERGENCY_IMPLEMENTATION.md) | Phase 11b implementation notes |
| [PHASE_10_PURCHASE_ALIGNMENT.md](./PHASE_10_PURCHASE_ALIGNMENT.md) | P06 → emergency handoff |

---

## Verdict

The emergency suffix is **~75% implemented** in code (9/11 surfaces, core routing, compositions) but **not production-complete** relative to Figma READY FOR DEV or stated business rules. Do not ship until plan limits are unified, R4 is routed, E5 max state exists, and R0/R3 critical states are covered.

**Do not invent:** E4, plan-addon step, standalone confirmation screen, purchase P03 rider toggle in emergency context.

**Do implement (after blueprint approval):** Plan-aware limits, R4, max-reached variants, missing state frames, exact Figma copy, `AlOfflineChip` / contact card parity.
