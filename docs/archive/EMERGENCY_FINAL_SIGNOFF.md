# Emergency + Rider — Final Figma Signoff Audit

**App:** `@autolokate/qr`  
**Date:** 2026-06-18  
**Figma:** Section `371:1275` · Consumer · Emergency + Rider · READY FOR DEV  
**File:** `FtHCUnE0HH586PtG5yJyG0`  
**Mode:** Audit only — no code changes  
**Compared against:** Phase E2 implementation (`e01`–`e10`, `EmergencyRoutes.tsx`, `@autolokate/ui`)

---

## Signoff verdict

### **CONDITIONAL — not pixel-ready**

The emergency suffix is **functionally complete** for journey orchestration, plan limits, and required Figma state frames. It is **not approved for pixel-perfect signoff** due to systematic OTP screen drift (title, description layout, resend copy), R0 offline copy/chip drift, hero/trust absolute positioning vs scroll shell, and one external journey gap (R10 → emergency).

| Category               | Result                                                       |
| ---------------------- | ------------------------------------------------------------ |
| Frame coverage (19/19) | ✅ All primary + variant frames have code paths              |
| Plan limits            | ✅ Dynamic via `selectedPlanId` (no UI hardcode `3`)         |
| Core navigation        | ✅ R0→R4→E0→E5→Completed wired                               |
| Pixel parity           | ⚠️ OTP + hero layout + contact card surface                  |
| Theme parity           | ⚠️ Dark good; light unverified in Figma; token surface drift |
| Missing states         | ⚠️ E3 submit/error not routed; R0 error needs manual flag    |

---

## Figma frame inventory (section `371:1275`)

**19 frames** in READY FOR DEV — all mapped to implementation.

| #   | Figma frame   | Node       | Code        | Parity                       |
| --- | ------------- | ---------- | ----------- | ---------------------------- |
| 1   | R0 default    | `375:37`   | E01         | ⚠️ Copy default prop         |
| 2   | R0 loading    | `713:2264` | E01 + route | ✅                           |
| 3   | R0 error      | `713:2288` | E01 + route | ⚠️ Error trigger manual only |
| 4   | R0 offline    | `713:2311` | E01 + route | ❌ Copy + chip drift         |
| 5   | R1 mobile     | `789:2064` | E02         | ⚠️ No language switcher      |
| 6   | R2 OTP        | `789:2109` | E03         | ❌ Title/layout/copy drift   |
| 7   | R3 name       | `374:71`   | E04         | ✅                           |
| 8   | R3 disabled   | `713:2021` | E04         | ✅                           |
| 9   | R3 submitting | `719:2084` | E04 + route | ✅                           |
| 10  | R3 error      | `719:2143` | E04 + route | ✅                           |
| 11  | R4 riders     | `822:1980` | E10         | ✅                           |
| 12  | R4 max 2      | `824:2014` | E10         | ✅                           |
| 13  | E0 empty      | `373:37`   | E05         | ⚠️ Layout + default prop     |
| 14  | E1 mobile     | `789:1982` | E06         | ⚠️ No language switcher      |
| 15  | E2 OTP        | `789:2027` | E07         | ❌ Title/layout/copy drift   |
| 16  | E3 name       | `371:1276` | E08         | ✅                           |
| 17  | E3 disabled   | `713:1962` | E08         | ✅                           |
| 18  | E5 contacts   | `373:64`   | E09         | ✅                           |
| 19  | E5 max 3      | `717:2237` | E09         | ✅ (parameterized per plan)  |

---

## 1. Layout drift

| Screen                   | Figma layout                                                           | Implementation                                                       | Severity                                             |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| **Shell**                | Content column `gap: 20px`, `padding: 0 16px`, CTA `361×58` at `y:762` | `step-shell-chrome` — 16px inset, 58px CTA, pinned footer            | ✅ Match                                             |
| **OTP (R2/E2)**          | Inner frame `gap: 24px` (progress → title block → OTP → resend)        | `FlowStepShell` body `gap: 20px` + `FormFieldStack`                  | ⚠️ −4px vertical rhythm                              |
| **OTP Change link**      | Absolute at `(318, 188)` beside description line                       | Inline flex row with ghost button after muted text                   | ❌ Position/structure drift                          |
| **R0 / E0 hero**         | Illustration absolutely at `y: 360` / `y: 330`                         | `EmptyStateHero` in `.ob-state-panel` (flex-centered in scroll body) | ❌ Vertical placement drifts with viewport           |
| **E0 trust row**         | Fixed at `y: 540` (between hero and CTA)                               | `margin-block-start: auto` in scroll body                            | ⚠️ Pushes to bottom of scroll area, not fixed offset |
| **R0 offline chip**      | Centered at `x: 102, y: 64` below status bar                           | `headerAccessory` absolute center in header stack                    | ⚠️ Close but stacking order differs                  |
| **Capture progress**     | 3 segments, `height: 4`, `gap: 6`                                      | `AlStepProgress` capture mode                                        | ✅ Match                                             |
| **Contact list (E5/R4)** | Cards `gap: 12px`                                                      | `AlStack gap="md"`                                                   | ✅ ~12px                                             |
| **Add row**              | Dashed border, `height: 48`, centered                                  | `min-height: 3rem`, dashed                                           | ✅ Match                                             |

---

## 2. Spacing drift

| Element                | Figma                                | Code                                    | Delta                       |
| ---------------------- | ------------------------------------ | --------------------------------------- | --------------------------- |
| Headline → body        | `8px`                                | `ob-step-chrome__heading gap: 8px`      | ✅                          |
| Relation grid tile gap | `10px`                               | `0.625rem` (10px)                       | ✅                          |
| Relation tile size     | `113×80` implied                     | `7.0625rem` width, `min-height: 5rem`   | ✅                          |
| Hero circle            | `112×112`                            | `7rem` (112px)                          | ✅                          |
| Hero icon R0           | `50px`                               | `50`                                    | ✅                          |
| Hero icon E0           | `48px`                               | `48`                                    | ✅                          |
| Contact card padding   | `13px 14px`                          | `0.8125rem 0.875rem`                    | ✅                          |
| Avatar in card         | `42×42`                              | `AlAvatar md` via `--al-comp-avatar-md` | ⚠️ Verify token = 42px      |
| Footer helper → CTA    | ~`8px` above CTA (`y:730` → `y:762`) | `margin-bottom: var(--al-space-sm)`     | ✅                          |
| OTP cell height        | `60px`                               | `AlOtpInput` default                    | ✅                          |
| Secondary link → CTA   | `y:712` text, `48px` hit target      | Ghost button in footer stack            | ⚠️ Not underlined text link |

---

## 3. Typography drift

| Location               | Figma                                               | Implementation                                         | Match                            |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------------ | -------------------------------- |
| Headline               | Inter 700 · 28/36                                   | `AlHeading variant="h2"`                               | ✅                               |
| Body / muted           | Inter 400 · 16/24 · `#8A8A8A`                       | `AlText tone="muted"`                                  | ✅ Token                         |
| CTA label              | Inter 600 · 16/20                                   | `AlButton` primary                                     | ✅                               |
| Disabled helper        | Inter 400 · 16/24 center · `#8A8A8A`                | `ob-shell__footer-helper--muted`                       | ✅                               |
| R3 error helper        | Inter 500 · 13/18 · `#F5A623`                       | `footer-helper--warning` 13/18                         | ✅                               |
| Verified badge         | Inter 500 · 11/14 · green                           | `al-contact-card__verified-label`                      | ✅                               |
| Skip / secondary       | Inter 500 · 14 · underline · center                 | `AlButton variant="ghost"`                             | ❌ No underline, not 14px medium |
| **R2/E2 title**        | **"Enter their code"**                              | **"Verify rider's number" / "Verify their number"**    | ❌ Wrong headline                |
| **R2/E2 description**  | **"Sent to them on WhatsApp · 98765 43210"**        | **"Enter the code we sent on WhatsApp to {mobile} ·"** | ❌ Different copy structure      |
| **Resend**             | **"Resend code in 0:24"**                           | **"Code on its way · resend in 0:24"**                 | ❌                               |
| R0 offline body        | "We'll set this up when you're back online"         | Keeps paid-rider description                           | ❌                               |
| R0 error body          | "We couldn't load your rider cover"                 | Same                                                   | ✅                               |
| E0 description (Figma) | "Add 1–3 people we'll alert if you're in a crash"   | Route: plan-dynamic; **default prop still "1–3"**      | ⚠️                               |
| E0 trust               | "Encrypted · only used to reach them in a crash"    | Same                                                   | ✅                               |
| E5 subtitle            | `{n} of {max} added · you can add {remaining} more` | `getContactsSummaryDescription()`                      | ✅                               |
| Max message            | "You've added the maximum 3 contacts"               | `getContactsMaxReachedMessage(planId)`                 | ✅                               |

---

## 4. Icon drift

| Icon                      | Figma                | Code                          | Match                           |
| ------------------------- | -------------------- | ----------------------------- | ------------------------------- |
| `arrow-left`              | 24×24                | `AlIcon` 20 in `AlIconButton` | ⚠️ −4px                         |
| `circle-user` (R0)        | 50 in 112 circle     | 50 in 112 circle              | ✅                              |
| `users` (E0)              | 48 in 112 circle     | 48 in 112 circle              | ✅                              |
| `shield-check` (E0 trust) | 16×16                | 16                            | ✅                              |
| `plus` (add row)          | 18                   | 18                            | ✅                              |
| `circle-check` (verified) | 20                   | 20                            | ✅                              |
| Relation tiles            | per `AlRelationGrid` | 26px icons                    | ✅                              |
| `chevron-down` (language) | R1/E1 top-right      | **Not implemented**           | ❌ Intentional product omission |

---

## 5. Theme drift

| Element             | Figma dark                          | Implementation                              | Issue                                                  |
| ------------------- | ----------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Canvas              | `#0A0A0C`                           | `AlScreenBg protected`                      | ✅                                                     |
| Ambient tint        | Green radial 4%                     | Protected variant                           | ✅                                                     |
| Muted text          | `#8A8A8A`                           | `--al-color-on-surface-muted`               | ✅                                                     |
| Contact card fill   | `#1A1A1A`                           | `--al-color-surface`                        | ⚠️ Token may differ from raised `#1A1A1A`              |
| Contact card border | `#4A4A4A`                           | `--al-color-outline`                        | ✅                                                     |
| Hero circle         | `#4A4A4A`                           | `--al-color-outline`                        | ✅                                                     |
| Verified green      | `#1FA24A`                           | `--al-color-success`                        | ✅                                                     |
| Warning (R3 error)  | `#F5A623`                           | `--al-color-warning`                        | ✅                                                     |
| Offline chip pill   | `#4A4A4A` fill, amber dot           | Warning-tinted `ob-offline-chip` background | ❌ Chip styling drift                                  |
| CTA                 | White fill / `#0A0A0A` text         | Primary button tokens                       | ✅                                                     |
| **Light theme**     | **No frames in section `371:1275`** | Token-based via `data-theme="light"`        | ⚠️ **Unverified** — no Figma reference in this section |

Emergency descriptions no longer force lowercase (`.ob-shell--emergency .ob-shell__description { text-transform: none }`) — fixes prior theme/copy bug.

---

## 6. Missing states

### States in Figma but incomplete in app

| State                     | Figma                               | Gap                                                                                                     |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **R0 error**              | `713:2288`                          | UI exists; only reachable via `session.emergency.riderPromptLoadFailed` — no automatic API failure path |
| **R0 offline**            | `713:2311`                          | Implemented but **wrong body copy** and **chip text/styling** vs Figma                                  |
| **E3 submitting / error** | Not framed in Figma (disabled only) | `EmergencyNameFormState` exists; **E3 route never sets submitting/error**                               |

### States in app but not in Figma section `371:1275`

| State                                 | Code          | Notes                                                                                           |
| ------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| R1/E1 error + offline                 | `mobileState` | Implemented (auth pattern); **no dedicated Figma frames** in current section — acceptable extra |
| R2/E2 error, verifying, network-error | `otpState`    | Implemented; **no dedicated Figma frames** in current section — acceptable extra                |
| Safe plan E5 max 1                    | Dynamic       | Figma only shows max-3 frame; logic correct                                                     |

### Safe / Secure plan-specific frames

Figma authors **max-3** and **1-of-3** copy only. Implementation parameterizes `{max}` per plan (Safe=1, Secure=2, Shield=3). **No missing logic** — Figma lacks Safe/Secure-specific summary frames.

---

## 7. Broken / risky navigation

| Flow                            | Expected                               | Actual                                   | Status                                   |
| ------------------------------- | -------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Purchase **P06** → Emergency    | Continue → `getEmergencyHandoffPath()` | ✅ Works                                 | ✅                                       |
| Purchase **R10** → Emergency    | Product expectation                    | **R10 has no `onContinue` to emergency** | ❌ External gap (purchase untouched)     |
| Safe plan entry                 | Skip rider                             | R0 → redirect E0                         | ✅                                       |
| R0 → R1 → R2 → R3 → R4          | Rider capture                          | ✅                                       | ✅                                       |
| R4 → E0                         | Continue                               | ✅                                       | ✅                                       |
| R4 → R1                         | Add another (under max)                | ✅ Clears draft mobile                   | ⚠️ Empty mobile on re-entry              |
| E0 → E3 (picker)                | Picker shortcut                        | Demo contact stub                        | ⚠️ No native picker                      |
| E1 → E2 → E3 → E5               | Contact loop                           | ✅                                       | ✅                                       |
| E5 → E1                         | Add another (under plan max)           | ✅ Gated by `canAddEmergencyContact`     | ✅                                       |
| E5 → Completed                  | Continue (≥1 contact)                  | ✅                                       | ✅                                       |
| R0 back                         | Prior activation screen                | → `r10-payment-success`                  | ⚠️ Wrong if user entered via P06         |
| `/journey/emergency/*` fallback | Sensible entry                         | Always `rider-prompt` (Safe redirects)   | ✅                                       |
| E5 back                         | Contextual                             | Always E0                                | ⚠️ Skips E3 when coming from picker path |

**No dead-end routes found** in orchestration review.

---

## 8. Hardcoded limits

| Location                                  | Finding                                                                   | Severity                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `emergency-limits.ts`                     | Plan constants `safe:1, secure:2, shield:3` — **correct source of truth** | ✅ Not a bug                                                      |
| `E09ContactsSummaryScreen`                | Uses `planId` + `getEmergencyPlanLimits()`                                | ✅                                                                |
| `E10RidersSummaryScreen`                  | Uses `planId` + `purchasedRiderSlots`                                     | ✅                                                                |
| `EmergencyRoutes` E5/R4 gates             | `canAddEmergencyContact` / `canAddRider`                                  | ✅                                                                |
| **`E05ContactsEmptyScreen` default prop** | `'Add 1–3 people…'` when `description` not passed                         | ⚠️ Hardcoded fallback (dev/standalone only; route passes dynamic) |
| **`E01RiderPromptScreen` default prop**   | 1-rider copy when `description` not passed                                | ⚠️ Hardcoded fallback (route passes `getRiderPromptDescription`)  |
| **`resolvePurchasePlanId` fallback**      | `DEFAULT_PURCHASE_PLAN_ID` = `'secure'` if session missing plan           | ⚠️ Limits default to Secure=2, not Safe=1                         |
| `captureProgress total: 3`                | Sub-flow steps (mobile/OTP/name), **not** contact plan limit              | ✅ Correct semantics                                              |

**No production hardcoded `max 3 contacts`** in screen logic.

---

## 9. Per-screen summary

### R0 · Rider prompt (`E01` / `375:37`)

| Check                  | Status                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| Title, CTAs, skip link | ✅                                                                   |
| Loading CTA spinner    | ✅                                                                   |
| Error copy + Try again | ✅                                                                   |
| Offline chip text      | ❌ Figma: _"You're offline, we'll retry"_ · Code: _"You're offline"_ |
| Offline description    | ❌ Figma replaces body with offline message                          |
| Hero placement         | ❌ Scroll-centered vs absolute                                       |

### R1 · Rider mobile (`E02` / `789:2064`)

| Check                  | Status                               |
| ---------------------- | ------------------------------------ |
| Title + body copy      | ✅                                   |
| Step 1/3 progress      | ✅                                   |
| Mobile field + Get OTP | ✅                                   |
| Language switcher      | ❌ Omitted (product decision)        |
| Error/offline (extra)  | ✅ Implemented, not in Figma section |

### R2 · Rider OTP (`E03` / `789:2109`)

| Check                   | Status            |
| ----------------------- | ----------------- |
| Headline                | ❌ See typography |
| Description + Change    | ❌ Layout/copy    |
| Step 2/3, OTP, Verify   | ✅                |
| Resend copy             | ❌                |
| Error/verifying (extra) | ✅                |

### R3 · Rider name (`E04` / `374:71`)

| Check                                  | Status |
| -------------------------------------- | ------ |
| Title, body, relation grid, Save rider | ✅     |
| Disabled helper                        | ✅     |
| Submitting / error                     | ✅     |

### R4 · Riders added (`E10` / `822:1980`, `824:2014`)

| Check                                   | Status |
| --------------------------------------- | ------ |
| Title, dynamic subtitle, cards, add row | ✅     |
| Max 2 riders message                    | ✅     |
| Continue → E0                           | ✅     |

### E0 · No contacts (`E05` / `373:37`)

| Check                            | Status |
| -------------------------------- | ------ |
| Title, CTAs, secondary link      | ✅     |
| Hero + "No contacts yet"         | ✅     |
| Trust row copy                   | ✅     |
| Plan-aware description (journey) | ✅     |
| Hero/trust vertical layout       | ⚠️     |

### E1 · Contact mobile (`E06` / `789:1982`)

| Check                                 | Status |
| ------------------------------------- | ------ |
| Title "Their mobile number"           | ✅     |
| Body copy (updated to match R1 Figma) | ✅     |
| Step 1/3                              | ✅     |

### E2 · Contact OTP (`E07` / `789:2027`)

| Check            | Status |
| ---------------- | ------ |
| Same drift as R2 | ❌     |

### E3 · Contact name (`E08` / `371:1276`)

| Check                           | Status |
| ------------------------------- | ------ |
| Title, body, grid, Save contact | ✅     |
| Disabled helper                 | ✅     |

### E5 · Contacts summary (`E09` / `373:64`, `717:2237`)

| Check                                   | Status |
| --------------------------------------- | ------ |
| Title, dynamic subtitle, cards, add row | ✅     |
| Max reached message                     | ✅     |
| Continue disabled at 0                  | ✅     |
| `AlContactCard` surface color           | ⚠️     |

---

## 10. Blockers vs acceptable drift

### Blockers (fix before pixel signoff)

1. **R2/E2 OTP headline** — must be _"Enter their code"_ with Figma description line structure.
2. **R2/E2 resend copy** — _"Resend code in 0:24"_ format.
3. **R0 offline** — body swap + chip text _"You're offline, we'll retry"_ + gray pill styling per `580:1743`.
4. **OTP content gap** — 24px column rhythm inside capture flow.

### Should fix (journey / UX)

5. **R10 → Emergency** — payment success path does not enter emergency (P06 only).
6. **R0 back target** — hardcoded to R10; may not match P06 entry.
7. **Contact card fill** — align `--al-color-surface` with Figma `#1A1A1A` raised card.
8. **Light theme** — run visual QA; no Figma reference in this section.

### Acceptable / documented drift

9. Language switcher removed on R1/E1 (product-wide).
10. R1/E1/R2/E2 error/offline frames absent from Figma but implemented from auth patterns.
11. Hero/trust use responsive scroll layout vs Figma absolute coords (acceptable if product prefers scroll shell).
12. Footer secondary as ghost button vs underlined text (minor).
13. Back icon 20px vs 24px (minor).
14. `DEFAULT_PURCHASE_PLAN_ID` fallback when session incomplete (edge case).

---

## 11. Signoff checklist

| Gate                                 | Pass?          |
| ------------------------------------ | -------------- |
| All 10 screens implemented           | ✅             |
| All Figma variant frames represented | ✅             |
| Plan limits dynamic                  | ✅             |
| No hardcoded contact max in journey  | ✅             |
| OTP Figma copy/layout                | ❌             |
| R0 offline Figma parity              | ❌             |
| R10 emergency entry                  | ❌             |
| Light theme verified                 | ⚠️ Not audited |
| Native contact picker                | ⚠️ Stub        |
| Pixel-to-pixel 393px                 | ❌             |

---

## 12. Recommendation

**Approve for functional QA and plan-limit validation.**  
**Do not approve for design signoff** until OTP screens (R2/E2) and R0 offline are aligned to Figma `789:2109`, `789:2027`, and `713:2311`, and R10 handoff is resolved at the product level.

### Suggested fix order

1. Align `EmergencyOtpScreen` title, description, Change placement, resend copy (fixes R2 + E2).
2. Align R0 offline description + `AlOfflineChip` text and styles.
3. Wire R10 `onContinue` → emergency (purchase — separate PR).
4. Token pass: contact card `#1A1A1A`, light theme screenshot matrix at 320–414px.
5. Optional: hero/trust absolute positioning layer for E0/R0 if pixel signoff required.

---

## Appendix — Figma URLs

| Frame      | URL                                                                               |
| ---------- | --------------------------------------------------------------------------------- |
| Section    | [371:1275](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=371-1275) |
| R0         | [375:37](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=375-37)     |
| R2         | [789:2109](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=789-2109) |
| R0 offline | [713:2311](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=713-2311) |
| E5 max     | [717:2237](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=717-2237) |
| R4         | [822:1980](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=822-1980) |

---

_Audit performed against live Figma MCP data and codebase at Phase E2 completion. No files were modified._
