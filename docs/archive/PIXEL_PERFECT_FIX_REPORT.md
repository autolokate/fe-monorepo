# Pixel Perfect Fix Report

**Date:** 2026-06-19  
**Session:** Pixel Perfect Final Pass  
**Fixes applied:** 13 discrete CSS changes across 7 files

---

## Fix #1 — A2 OTP Description Text Color

**Screen:** A2 (Auth OTP Verification)  
**Figma node:** `103:324`  
**File:** `apps/qr/src/components/auth-step-shell/auth-step-shell.css`  
**Selector:** `.ob-auth-otp-desc`

| | Before | After |
|--|--------|-------|
| `color` | `var(--al-color-on-surface-muted)` (#8a8a8a gray) | `var(--al-color-on-surface)` (#ffffff white) |

**Figma evidence:** Description text node fill=`#ffffff`. The "Change" link within the same paragraph was already white (`var(--al-color-on-surface)`), so the description was inconsistently gray while Figma shows both as white.

---

## Fix #2 — E0 Trust Row Gap

**Screen:** E0 (No Contacts Yet)  
**Figma node:** `373:37`  
**File:** `apps/qr/src/features/emergency/emergency.css`  
**Selector:** `.ob-emergency-trust-row`

| | Before | After |
|--|--------|-------|
| `gap` | `var(--al-space-sm)` (8px) | `6px` |

**Figma evidence:** Trust row (shield icon + "Encrypted · only used...") has `gap=6` in Figma. The nearest token `--al-space-sm` is 8px — no token for 6px exists.

---

## Fix #3 — Footer Secondary Link Line-Height

**Screen:** All screens using `footerSecondaryLabel` (E0 "Enter a number instead", R0 "Skip for now")  
**Figma nodes:** `373:37`, `375:37`  
**File:** `apps/qr/src/components/flow-step-shell/flow-step-shell.css`  
**Selector:** `.ob-shell__footer-secondary-link`

| | Before | After |
|--|--------|-------|
| `line-height` | `20px` | `17px` |
| `text-decoration` | `underline` | `none` |

**Figma evidence:** "Enter a number instead" and "Skip for now" render as plain 500/14px text with no underline in Figma. Line-height=16.9px rounds to 17px.

---

## Fix #4 — R07 Skip Link Line-Height

**Screen:** R07 (Rider Cover Selection)  
**Figma node:** `186:25`  
**File:** `apps/qr/src/features/qr-purchase/screens/purchase-phase-b.css`  
**Selector:** `.ob-purchase-skip-link`

| | Before | After |
|--|--------|-------|
| `line-height` | `20px` | `17px` |

**Figma evidence:** "Skip, I'll ride solo" text node: `600/14.0px/lh=16.9`. Rounds to 17px.

---

## Fix #5 — R08 Gateway Note Line-Height

**Screen:** R08 (Order Summary)  
**Figma node:** `190:25`  
**File:** `apps/qr/src/features/qr-purchase/screens/purchase-phase-b.css`  
**Selector:** `.ob-purchase-gateway-note`

| | Before | After |
|--|--------|-------|
| `line-height` | `16px` | `15px` |

**Figma evidence:** Gateway note (12px text) has `lh=14.5`. Rounds to 15px.

---

## Fix #6 — EmptyStateHero State Panel Gap

**Screen:** E0 (No Contacts Yet), R0 (Rider Prompt)  
**Figma node:** `373:37` (E0 illustration gap=14)  
**File:** `apps/qr/src/components/flow-step-shell/flow-step-shell.css`  
**Selector:** `.ob-state-panel`

| | Before | After |
|--|--------|-------|
| `gap` | `var(--al-space-md)` (16px) | `14px` |

**Figma evidence:** E0 illustration frame children gap=14px. R0 has only one child so gap is invisible there.

---

## Fix #7 — E0 Hero Message Typography

**Screen:** E0 (No Contacts Yet)  
**Figma node:** `373:37`  
**Files:**
- `apps/qr/src/features/emergency/screens/e05-contacts-empty/E05ContactsEmptyScreen.tsx`
- `apps/qr/src/features/emergency/emergency.css`

**Change in TSX:** `message="No contacts yet"` (string → uses AlText body defaults) changed to `message={<p className="ob-emergency-hero-message">No contacts yet</p>}`

**CSS added:**
```css
.ob-emergency-hero-message {
  margin: 0;
  font-family: var(--al-text-ui-family);
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
  color: var(--al-color-on-surface-muted);
  text-align: center;
}
```

| | Before (AlText defaults) | After |
|--|--------|-------|
| `font-size` | `var(--al-text-body-size)` (16px) | `15px` |
| `font-weight` | `400` | `600` |
| `line-height` | `var(--al-text-body-line-height)` (24px) | `18px` |

**Figma evidence:** "No contacts yet": `600/15.0px/lh=18.2 fill=#8a8a8a`.

---

## Fix #8 — Promo Code Field Line-Heights

**Screen:** R08 (Order Summary — promo code field)  
**Figma node:** `190:25`  
**File:** `apps/qr/src/components/compositions/promo-code-field/promo-code-field.css`

| Selector | Before | After |
|----------|--------|-------|
| `__placeholder` | `line-height: 22px` | `line-height: 18px` |
| `__code` | `line-height: 22px` | `line-height: 18px` |
| `__action` | `line-height: 22px` | `line-height: 18px` |
| `__input` | `line-height: 22px` | `line-height: 18px` |
| `--applied __action` | *(inherited 22px)* | `line-height: 16px` |

**Impact:** Promo field height corrected from 48px → 44px (top=13 + lh=18 + bottom=13 = 44). Matches Figma frame height.

**Figma evidence:** Field `361x44`; "Have a promo code?" text node `280x18 400/15.0px/lh=18.2`.

---

## Fix #9 — AddContactRow Label Typography

**Screen:** E5 (Contacts Summary — "Add another contact" row)  
**Figma node:** `373:64`  
**File:** `apps/qr/src/components/compositions/add-contact-row/add-contact-row.css`

**CSS added:**
```css
.ob-add-contact-row .al-text {
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
}
```

| | Before (AlText variant="label") | After |
|--|--------|-------|
| `font-size` | `var(--al-text-label-size)` (15px) | `14px` |
| `font-weight` | `var(--al-text-label-weight)` (~500) | `600` |
| `line-height` | `var(--al-text-label-line-height)` (~18px) | `17px` |

**Figma evidence:** "Add another contact": `600/14.0px/lh=16.9 fill=#ffffff`.

---

## Fix #10 — OrderSummaryCard Row Text Line-Heights

**Screen:** R08 (Order Summary card)  
**Figma node:** `190:25`  
**File:** `apps/qr/src/components/compositions/order-summary-card/order-summary-card.css`

| Selector | Before | After |
|----------|--------|-------|
| `__label` | `line-height: 22px` | `line-height: 18px` |
| `__value` | `line-height: 22px` | `line-height: 18px` |
| `__gst` | `line-height: 16px` | `line-height: 15px` |

**Impact:** Each row height corrected from 22px → 18px. Card total height reduced by ~12px to match Figma.

**Figma evidence:** Row text nodes each `325x18 400/15.0px/lh=18.2` and `325x18 600/15.0px/lh=18.2`. GST text: `12.0px/lh=14.5`.

---

## Fix #11 — RiderCoverOption Subtitle Font Weight

**Screen:** R07 (Rider Cover Selection)  
**Figma node:** `186:25`  
**File:** `apps/qr/src/components/compositions/rider-cover-options/rider-cover-options.css`  
**Selector:** `.ob-rider-cover-option__subtitle`

| | Before | After |
|--|--------|-------|
| `font-weight` | *(not set — inherits 400)* | `500` |

**Figma evidence:** Subtitle "Cover for 2 riders, incl. pillion": `500/13.0px/lh=18.0 fill=#8a8a8a`.

---

## Files Modified

| File | Changes |
|------|---------|
| `apps/qr/src/components/auth-step-shell/auth-step-shell.css` | Fix #1 |
| `apps/qr/src/features/emergency/emergency.css` | Fix #2, #7 |
| `apps/qr/src/components/flow-step-shell/flow-step-shell.css` | Fix #3, #6 |
| `apps/qr/src/features/qr-purchase/screens/purchase-phase-b.css` | Fix #4, #5 |
| `apps/qr/src/features/emergency/screens/e05-contacts-empty/E05ContactsEmptyScreen.tsx` | Fix #7 (TSX) |
| `apps/qr/src/components/compositions/promo-code-field/promo-code-field.css` | Fix #8 |
| `apps/qr/src/components/compositions/add-contact-row/add-contact-row.css` | Fix #9 |
| `apps/qr/src/components/compositions/order-summary-card/order-summary-card.css` | Fix #10 |
| `apps/qr/src/components/compositions/rider-cover-options/rider-cover-options.css` | Fix #11 |

---

## Design System Compliance

All fixes remain within `@autolokate/ui`, `@autolokate/icons`, `@autolokate/design-system` constraints:
- No hardcoded color hex values introduced
- No one-off spacing hacks beyond exact Figma spec values with no token equivalent (6px trust gap, 14px panel gap, 17px lh)
- No local duplicate component implementations
- Component ownership not changed
