# Phase 11b — Emergency + Rider Implementation

**App:** `@autolokate/qr`  
**Date:** 2026-06-17  
**Source of truth:** [PHASE_11_EMERGENCY_AUDIT.md](./PHASE_11_EMERGENCY_AUDIT.md)  
**Figma section:** `371:1275` · Consumer · Emergency + Rider  
**Status:** Implemented · lint + build passing

---

## Summary

Phase 11b implements all **9 Figma primary screens** and **10 state-variant frames** (19 total) as presentational screens with journey orchestration. Architecture placeholders `emergency.plan-addon` and `emergency.confirmation` are removed from config and routing.

**Entry:** Purchase P06 (and future activation exits) → `/journey/emergency/rider-prompt`  
**Exit:** E5 Continue → `/journey/completed`

---

## Implemented routes

| Path | Screen | Figma | Step ID |
|------|--------|-------|---------|
| `/journey/emergency/rider-prompt` | R0 · Rider prompt | `375:37` | `emergency.rider-prompt` |
| `/journey/emergency/rider-mobile` | R1 · Rider mobile | `374:37` | `emergency.rider-mobile` |
| `/journey/emergency/rider-otp` | R2 · Rider OTP | `374:54` | `emergency.rider-otp` |
| `/journey/emergency/rider-name` | R3 · Rider name | `374:71` | `emergency.rider-name` |
| `/journey/emergency/contacts-empty` | E0 · No contacts | `373:37` | `emergency.contacts-empty` |
| `/journey/emergency/contact-mobile` | E1 · Contact mobile | `371:1295` | `emergency.contact-mobile` |
| `/journey/emergency/contact-otp` | E2 · Contact OTP | `371:1318` | `emergency.contact-otp` |
| `/journey/emergency/contact-name` | E3 · Contact name | `371:1276` | `emergency.contact-name` |
| `/journey/emergency/contacts-summary` | E5 · Contacts summary | `373:64` | `emergency.contacts-summary` |

**Legacy redirect:** `/journey/emergency/rider-setup` → `/journey/emergency/rider-prompt`

### Route graph (orchestrated)

```
Activation success (P06)
  → R0
    → Add rider details → R1 → R2 → R3 → E0
    → Skip for now → E0
  → E0
    → Add from contacts → [picker sim] → E3
    → Enter a number instead → E1 → E2 → E3
  → E3 → E5
  → E5
    → Add another contact → E1 (loop, max 3)
    → Continue → /journey/completed
```

Session fields persisted on `JourneySession.emergency`: `riderSkipped`, `rider`, `contactDraft`, `contacts[]`.

---

## Reused components

| Asset | Used on |
|-------|---------|
| `FlowStepShell` (`phase: 'emergency'`, 9 steps) | All 9 screens |
| `EmptyStateHero` | R0, E0 |
| `FormFieldStack` | R1, R2, R3, E1, E2, E3 |
| R04 OTP validation (`isValidOtp`, `isExpiredOtp`, `RESEND_COOLDOWN_SECONDS`, `OTP_LENGTH`) | R2, E2 |
| R03 mobile validation (`isValidMobile`, `normalizeMobile`) | R1, E1 |
| `AlTextField`, `AlOtpInput`, `AlInput`, `AlButton`, `AlScreenBg variant="protected"` | Per Figma DS usage |

---

## Promoted compositions

| Composition | Figma usage | Screens |
|-------------|-------------|---------|
| `RelationshipSelector` | R3 + E3 relationship grid | `e04-rider-name`, `e08-contact-name` |
| `EmergencyContactRow` | E5 verified contact row | `e09-contacts-summary` |
| `AddContactRow` | E5 “Add another contact” | `e09-contacts-summary` |

Registered in `components/compositions/index.ts` and `inventory.ts`.

---

## Figma parity checklist

### Primary screens (9/9)

| Frame | Implemented | Screen file |
|-------|-------------|-------------|
| R0 `375:37` | ✅ | `E01RiderPromptScreen` |
| R1 `374:37` | ✅ | `E02RiderMobileScreen` |
| R2 `374:54` | ✅ | `E03RiderOtpScreen` |
| R3 `374:71` | ✅ | `E04RiderNameScreen` |
| E0 `373:37` | ✅ | `E05ContactsEmptyScreen` |
| E1 `371:1295` | ✅ | `E06ContactMobileScreen` |
| E2 `371:1318` | ✅ | `E07ContactOtpScreen` |
| E3 `371:1276` | ✅ | `E08ContactNameScreen` |
| E5 `373:64` | ✅ | `E09ContactsSummaryScreen` |

### State variants (10/10 — dev preview + screen props)

| Frame | Node | Prop / dev state |
|-------|------|------------------|
| R1 · Error | `595:1895` | `mobileState="error"` |
| R1 · Offline | `595:1913` | `mobileState="offline"` |
| R2 · Error | `580:1748` | `otpState="error"` |
| R2 · Verifying | `580:1769` | `otpState="verifying"` |
| R2 · Network error | `595:1933` | `otpState="network-error"` |
| E1 · Error | `595:1815` | `mobileState="error"` |
| E1 · Offline | `595:1838` | `mobileState="offline"` |
| E2 · Error | `579:1794` | `otpState="error"` |
| E2 · Verifying | `579:1806` | `otpState="verifying"` |
| E2 · Network error | `595:1863` | `otpState="network-error"` |

### Removed (no Figma frames)

| Removed step | Status |
|--------------|--------|
| `emergency.plan-addon` | Deleted from `flows.config.ts`, `steps.config.ts`, `types/flow.ts` |
| `emergency.confirmation` | Deleted from config; E5 Continue replaces terminal handoff |

---

## Responsive audit

Verified via dev preview viewport toggles at **320 · 360 · 375 · 390 · 414** px:

| Width | Result |
|-------|--------|
| 320 | Relationship grid wraps; OTP cells fit; footer CTAs full width |
| 360 | No horizontal overflow |
| 375 | Matches Figma intent |
| 390 | Default dev preview width |
| 414 | Centered column capped by `.journey-frame` / shell max-width |

Shell: `.journey-frame` + `FlowStepShell` — no new layout primitives.

---

## Theme audit

| Theme | Verification |
|-------|--------------|
| **Dark** | Default · `data-theme="dark"` |
| **Light** | Dev preview theme toggle · DS token swap |

Ambient: `AlScreenBg variant="protected"` (green radial) on all emergency screens.

---

## Config alignment

| File | Change |
|------|--------|
| `types/flow.ts` | 9 emergency step IDs + screen IDs |
| `flows.config.ts` | Emergency flow = 9 suffix steps only (no shared pipeline prefix) |
| `steps.config.ts` | Figma-aligned step → screen mapping |
| `activation-routing.ts` | `EMERGENCY_SUFFIX_STEP_IDS`, handoff → `rider-prompt` |
| `routes.schema.ts` | 9 journey emergency route definitions |
| `JourneyRoutes.tsx` | `EmergencyRoutes` replaces placeholder |
| `JourneyContext.tsx` | `updateSession()` + `session.emergency` |

---

## Dev preview

`ScreenDevApp.tsx` — Emergency (Phase 11b) group with **E01–E09** and state toggles for all 19 frames.

Run: `pnpm --filter @autolokate/qr dev` with dev preview entry (see `main.tsx`).

---

## Verification

```bash
pnpm --filter @autolokate/qr lint
pnpm --filter @autolokate/qr build
```

Both pass as of Phase 11b signoff.

**Smoke path:** Home → Purchase → Auth → P01–P06 → Emergency R0→…→E5 → Completed.

---

## Remaining gaps

| Gap | Notes |
|-----|-------|
| **Device contact picker** | E0 “Add from contacts” simulates picker with `demoPickerContact` → E3; no native bridge |
| **Relationship tile icons** | Figma uses heart/smile/ellipsis; DS maps to nearest `AlIcon` names (`user`, `circle-user`, `users`, `plus`) |
| **Offline chip (Figma)** | R1/E1 offline frames show top `offlineChip`; implementation uses field `helperText: "No internet connection"` + disabled CTA |
| **Network error in journey** | Variant rendered in dev preview; live journey OTP uses wrong/expired/valid only (no simulated network failure) |
| **Description casing** | `FlowStepShell` applies `text-transform: lowercase` on description — existing shell behavior |
| **`EmergencyPlaceholderScreen.tsx`** | File retained but no longer routed; safe to delete in cleanup pass |
| **Prepaid / B2B2C activation** | Still placeholders; emergency entry wired from P06 and activation placeholder handoff |

---

## File map

```
features/emergency/
├── types.ts
├── emergency.validation.ts
├── emergency.css
├── data/demo-data.ts
├── data/relationships.ts
└── screens/
    ├── e01-rider-prompt/ … e09-contacts-summary/
    ├── shared/EmergencyOtpScreen.tsx
    └── index.ts

journey/
├── emergency/emergency-routing.ts
└── routes/EmergencyRoutes.tsx

components/compositions/
├── relationship-selector/
├── emergency-contact-row/
└── add-contact-row/
```

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [PHASE_11_EMERGENCY_AUDIT.md](./PHASE_11_EMERGENCY_AUDIT.md) | Figma source of truth |
| [PHASE_10_PURCHASE_ALIGNMENT.md](./PHASE_10_PURCHASE_ALIGNMENT.md) | P06 → emergency handoff |
| [PHASE_9_JOURNEY_ORCHESTRATOR.md](./PHASE_9_JOURNEY_ORCHESTRATOR.md) | Journey architecture |
