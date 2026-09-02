# Checkbox Global Audit

**Date:** 2026-06-19  
**Figma ref:** Auth A1 `102:312` — 22×22 box, 8px radius, 48×48 tap target @ x:4

---

## Summary

| Metric                    |                    Value |
| ------------------------- | -----------------------: |
| Checkbox consumers in app |                    **2** |
| DS preview consumer       | **1** (`AlCheckboxPage`) |
| Issues found              |                    **3** |
| Issues fixed              |                    **3** |
| Per-screen patches        |                    **0** |

---

## All Consumers

| #   | Consumer                | Screen(s)                                | Layout                    | Shell                             |
| --- | ----------------------- | ---------------------------------------- | ------------------------- | --------------------------------- |
| 1   | `InlineConsentBlock`    | A1 Mobile, PWA Verify Mobile (bystander) | Icon-only + external copy | `AuthStepShell`, `PwaVerifyShell` |
| 2   | `R06LegalConsentScreen` | Legacy purchase activation (component)   | Default labeled           | `FlowStepShell`                   |
| 3   | `AlCheckboxPage`        | UI preview docs                          | Showcase                  | N/A                               |

**Flow Entry has no checkbox.**

---

## Root Cause (A1 clipping)

```
.ob-inline-consent__checkbox { margin: -13px 0 0 -13px; }   ← REMOVED
.ob-step-chrome__body { overflow-x: hidden; }                 ← REMOVED
.ob-step-chrome__frame { overflow: hidden; }                  ← kept (vertical shell only)
```

Negative margin pulled the 48×48 control outside the scroll body; parent `overflow-x: hidden` clipped the left 13px — visible as **checkbox cut off on the left**.

This was a **layout-system bug**, not incorrect checkbox dimensions.

---

## Global Fix

### 1. Touch-target gutter (`touch-target-layout.css`)

```css
--ob-shell-content-gutter: 16px;
--ob-touch-inline-bleed: 12px;
--ob-shell-frame-padding-inline: 4px; /* 16 - 12 */
```

Frame padding 4px + section inset 12px = content at 16px; 48px controls start at x:4 without negative margins.

### 2. Inline consent grid (`inline-consent-block.css`)

```css
grid-template-columns: 48px minmax(0, 1fr);
column-gap: 12px;
```

### 3. DS checkbox `layout="icon-only"` (`Checkbox.tsx`)

- 48×48 label wrapper
- `aria-label` on input
- Visible label hidden (no duplicate copy next to `InlineConsentBlock` paragraph)

---

## Verification Checklist (all consumers)

| Check                             |      InlineConsent      |       R06 Legal        |
| --------------------------------- | :---------------------: | :--------------------: |
| Container width                   |     ✅ 48px column      |     ✅ inline-flex     |
| Container height                  |         ✅ 48px         | ✅ auto + 48px control |
| Tap target                        |        ✅ 48×48         |        ✅ 48×48        |
| Overflow                          |       ✅ no clip        |       ✅ no clip       |
| Padding / margin                  |    ✅ grid gap 12px     |      ✅ DS gap sm      |
| Alignment                         |   ✅ center in column   |     ✅ flex-start      |
| Checked                           |      ✅ green fill      |           ✅           |
| Unchecked                         |    ✅ 1.5px outline     |           ✅           |
| Disabled                          |        ✅ muted         |           ✅           |
| Error                             | ✅ sr-only on icon-only |      ✅ errorText      |
| Dark / Light                      |        ✅ tokens        |       ✅ tokens        |
| 320 / 360 / 375 / 390 / 393 / 414 |     ✅ gutter math      |     ✅ step shell      |

---

## Shared Files Changed

- `packages/ui/src/components/forms/Checkbox/Checkbox.types.ts`
- `packages/ui/src/components/forms/Checkbox/Checkbox.tsx`
- `packages/ui/src/components/forms/Checkbox/Checkbox.css`
- `apps/qr/src/components/compositions/inline-consent-block/InlineConsentBlock.tsx`
- `apps/qr/src/components/compositions/inline-consent-block/inline-consent-block.css`
- `apps/qr/src/components/step-shell-chrome/touch-target-layout.css`
- `apps/qr/src/components/step-shell-chrome/step-shell-chrome.css`

---

## Before / After

| State                | Before                           | After                                 |
| -------------------- | -------------------------------- | ------------------------------------- |
| A1 unchecked @ 375px | Left border of 22×22 box clipped | Full box visible                      |
| A1 checked @ 320px   | Checkmark partially clipped      | Full box + checkmark                  |
| PWA verify mobile    | Same inline consent path         | Same global fix                       |
| R06 labeled checkbox | Unaffected visually              | Inherits shell gutter (no regression) |

---

## Verdict

**PASS** — All checkbox instances verified through shared component + layout system. No remaining negative-margin bleed hacks in codebase.
