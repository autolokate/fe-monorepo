# Emergency + Rider — Foundation Alignment Report (Phase E1)

**App:** `@autolokate/qr`  
**Date:** 2026-06-18  
**Source of truth:** [EMERGENCY_IMPLEMENTATION_BLUEPRINT.md](./EMERGENCY_IMPLEMENTATION_BLUEPRINT.md)  
**Mode:** Foundation alignment only — no emergency screen UI built or restyled

---

## Executive summary

Phase E1 establishes **plan-aware limits**, **R4 route wiring**, and **component promotion decisions** before screen work begins.

| Deliverable | Status |
|-------------|--------|
| Plan limits module (`emergency-limits.ts`) | ✅ |
| Limits sourced from `session.purchase.selectedPlanId` | ✅ |
| Hardcoded `3` removed from orchestration | ✅ |
| R4 route between R3 and E0 | ✅ (foundation placeholder) |
| Registry / schema / flow config updated | ✅ |
| Component promotion decisions | ✅ (see §5) |
| Emergency screen UI (E01–E09) | **Unchanged** (parity risk documented) |

---

## 1. Final route graph

```mermaid
flowchart TD
  ACT[Activation success] --> R0[R0 · Rider prompt]

  R0 -->|No rider entitlement| E0
  R0 -->|Add rider details| R1[R1 · Rider mobile]
  R0 -->|Skip for now| E0[E0 · No contacts]

  R1 --> R2[R2 · Rider OTP]
  R2 --> R3[R3 · Rider name]
  R3 --> R4[R4 · Riders summary · foundation route]

  R4 -->|Add another rider| R1
  R4 -->|Continue| E0

  E0 -->|Add from contacts| PICK[Native picker]
  E0 -->|Enter a number instead| E1[E1 · Contact mobile]

  PICK --> E3[E3 · Contact name]
  E1 --> E2[E2 · Contact OTP]
  E2 --> E3
  E3 --> E5[E5 · Contacts summary]

  E5 -->|Add another · under plan max| E1
  E5 -->|Continue ≥ min contacts| DONE[/journey/completed]
```

### Entry guards (foundation)

| Condition | Behaviour |
|-----------|-----------|
| `riderCount === 0` or Safe plan (`maxRiders === 0`) | R0 **redirects** to E0 |
| `riderSkipped === true` | R0 skip → E0 (unchanged) |
| R4 with empty `riders[]` | Redirect to R3 |

---

## 2. Final plan limit matrix

**Authoritative limits (Phase E1 — product sign-off applied):**

| Plan ID | Display name | Max emergency contacts | Min emergency contacts | Max rider addon slots | Purchased rider slots |
|---------|--------------|------------------------|------------------------|-----------------------|------------------------|
| `safe` | Safe | **1** | 1 | 0 | `session.purchase.riderCount` (expected 0) |
| `secure` | Secure | **2** | 1 | 2 | `session.purchase.riderCount` (0–2) |
| `shield` | Shield | **3** | 1 | 2 | `session.purchase.riderCount` (0–2) |
| `shield-plus` | Shield+ | **3** | 1 | 2 | `session.purchase.riderCount` (0–2) |

**Entitled riders** = `min(purchasedRiderSlots, maxRiders)` — a user who buys 1 rider slot gets 1, not 2.

### Implementation surface

| Module | Role |
|--------|------|
| `features/emergency/emergency-limits.ts` | Single source of truth for all limit math + copy helpers |
| `journey/emergency/emergency-foundation.ts` | Resolves `planId` + `riderCount` from `JourneySession` |
| `journey/routes/EmergencyRoutes.tsx` | Consumes limits in R0 guard, R4 loop, E5 add-another gate |

### Marketing copy alignment

`purchase-plans.ts` Secure feature line updated from *"3 contacts + AI calling"* → *"2 contacts + AI calling"* to match limits.

### How limits affect surfaces (foundation vs deferred)

| Surface | Foundation (now) | Screen phase (deferred) |
|---------|------------------|-------------------------|
| **R0** | Skip route when no rider entitlement | Dynamic copy for 1 vs 2 purchased riders; loading/error/offline |
| **E0** | — | `getContactsEmptyDescription(planId)` for subtitle |
| **E5** | `canAddEmergencyContact()` in route | Pass `maxEmergencyContacts` + dynamic subtitle into E09 |
| **E5 Continue** | Route allows continue; screen still disables at 0 contacts | Wire `minEmergencyContacts` |
| **Add another contact** | Blocked in route when at plan max | Hide `AddContactRow` + max helper in E09 |
| **Max reached** | Route blocks re-entry to E1 | E09 max-reached layout (Figma `717:2237`) |
| **R4** | Rider loop gated by `canAddRider()` | Full Figma screen (`822:1980`) |

---

## 3. Route inventory

| # | Figma | Step ID | Path | Screen ID | Implementation |
|---|-------|---------|------|-----------|----------------|
| 1 | R0 | `emergency.rider-prompt` | `/journey/emergency/rider-prompt` | `EmergencyRiderPrompt` | E01 (existing) |
| 2 | R1 | `emergency.rider-mobile` | `/journey/emergency/rider-mobile` | `EmergencyRiderMobile` | E02 (existing) |
| 3 | R2 | `emergency.rider-otp` | `/journey/emergency/rider-otp` | `EmergencyRiderOtp` | E03 (existing) |
| 4 | R3 | `emergency.rider-name` | `/journey/emergency/rider-name` | `EmergencyRiderName` | E04 (existing) |
| 5 | **R4** | **`emergency.riders-summary`** | **`/journey/emergency/riders-summary`** | **`EmergencyRidersSummary`** | **Foundation route** (`EmergencyRidersSummaryFoundationRoute`) |
| 6 | E0 | `emergency.contacts-empty` | `/journey/emergency/contacts-empty` | `EmergencyContactsEmpty` | E05 (existing) |
| 7 | E1 | `emergency.contact-mobile` | `/journey/emergency/contact-mobile` | `EmergencyContactMobile` | E06 (existing) |
| 8 | E2 | `emergency.contact-otp` | `/journey/emergency/contact-otp` | `EmergencyContactOtp` | E07 (existing) |
| 9 | E3 | `emergency.contact-name` | `/journey/emergency/contact-name` | `EmergencyContactName` | E08 (existing) |
| 10 | E5 | `emergency.contacts-summary` | `/journey/emergency/contacts-summary` | `EmergencyContactsSummary` | E09 (existing) |

**Step count:** `EMERGENCY_FLOW_STEP_COUNT` = **10** (was 9).

**Session fields added:** `emergency.riders[]` — populated on R3 save for R4 foundation.

**Files updated for routing contract:**

- `journey/emergency/emergency-routing.ts`
- `journey/activation-routing.ts`
- `journey/routes/EmergencyRoutes.tsx`
- `flow/registry/config/flows.config.ts`
- `flow/registry/config/steps.config.ts`
- `router/routes.schema.ts`
- `types/flow.ts`
- `features/emergency/types.ts`

---

## 4. Component promotion decisions

Audit criterion: **used by 2+ screens in the emergency + rider suffix** (Figma-intended surface count included where R4 is specified).

### AlRelationGrid (Figma) → `RelationshipSelector` (code)

| Property | Value |
|----------|-------|
| Figma component | `AlRelationGrid` (`721:2136`) |
| Code today | `components/compositions/relationship-selector/RelationshipSelector.tsx` |
| Screen usage | **R3** + **E3** (2 screens) |
| **Decision** | **Promote to `@autolokate/ui` as `AlRelationGrid`** in screen-build phase |
| Rationale | Meets 2-screen threshold; Figma names it as a DS component |
| Foundation action | **Keep onboarding-local** until promotion PR — no import churn in E1 |
| Promotion scope | Move component + CSS; generalize `RELATIONSHIP_OPTIONS` prop or slots |

### AlContactCard (Figma) → `EmergencyContactRow` (code)

| Property | Value |
|----------|-------|
| Figma component | `AlContactCard` (`723:2194`) |
| Code today | `components/compositions/emergency-contact-row/EmergencyContactRow.tsx` |
| Screen usage | **E5** (code) + **R4** (Figma; foundation route only) |
| **Decision** | **Defer promotion** until R4 screen UI lands |
| Rationale | Only 1 production screen uses the row today; promotion is cleaner when R4 reuses the same card |
| Foundation action | Keep onboarding-local; rename to `AlContactCard` during promotion |
| Gap | Code uses icon avatar; Figma uses `AlAvatar` + verified badge layout |

### AlOfflineChip (Figma)

| Property | Value |
|----------|-------|
| Figma component | `AlOfflineChip` (`580:1743`) |
| Code today | `components/compositions/al-offline-chip/AlOfflineChip.tsx` |
| Screen usage | **A1 Mobile** (auth) + **R0 offline** (Figma; not built) |
| **Decision** | **Keep onboarding-local for E1**; **promote to `@autolokate/ui`** when R0 offline screen ships |
| Rationale | 1 implemented screen today; 2nd screen is designed but not coded |
| Foundation action | No move in E1 |

### Summary table

| Component | Screens (design) | Screens (code) | E1 decision |
|-----------|------------------|----------------|-------------|
| AlRelationGrid | 2 | 2 | **Promote** (next UI phase) |
| AlContactCard | 2 | 1 | **Defer** until R4 UI |
| AlOfflineChip | 2 | 1 | **Defer** until R0 offline |

---

## 5. Parity risks

### High — screen layer still hardcodes limits / copy

| File | Issue | Fix in screen phase |
|------|-------|---------------------|
| `e09-contacts-summary/E09ContactsSummaryScreen.tsx` | `count < 3`, `"of 3 added"` | Accept `planId` or `maxEmergencyContacts` + use `getContactsSummaryDescription()` |
| `e05-contacts-empty/E05ContactsEmptyScreen.tsx` | `"Add 1–3 people…"` | Accept `description` from `getContactsEmptyDescription(planId)` |

Orchestration already enforces plan max on **Add another**; UI can still **display** wrong counts until screens are wired.

### High — R4 is foundation-only

`EmergencyRidersSummaryFoundationRoute` is a journey placeholder — not Figma `822:1980`. Users hitting R3 → R4 see dev-style contract UI until E10 screen ships.

### Medium — single `rider` vs `riders[]`

R3 still edits `emergency.rider` draft; R3 save upserts into `riders[]`. Multi-rider loop restarts R1 without clearing draft — screen phase should reset `rider` draft on "Add another".

### Medium — R0 not plan-copy-aware

R0 always shows *"1 rider's cover"* regardless of `riderCount === 2`. Foundation only skips R0 when entitlement is zero.

### Medium — step progress bar

Figma shows `AlStepProgress` on R1/E1 (1/3) and R3/E3 (3/3). `FlowStepShell` uses flat `EMERGENCY_FLOW_STEP_COUNT = 10` — sub-flow progress not aligned.

### Low — language switcher

Figma R1/E1 include `languageSwitcher`; auth removed language chooser product-wide — intentional drift.

### Low — Secure marketing vs Shield inheritance

Shield inherits Secure features including "2 contacts" — verify inherited copy on plan carousel doesn't still imply 3.

---

## 6. Files added / changed (foundation)

### Added

| File | Purpose |
|------|---------|
| `features/emergency/emergency-limits.ts` | Plan limit source of truth |
| `journey/emergency/emergency-foundation.ts` | Session → limits resolver |
| `journey/emergency/EmergencyRidersSummaryFoundationRoute.tsx` | R4 routing contract placeholder |

### Changed (non-screen)

| File | Change |
|------|--------|
| `journey/routes/EmergencyRoutes.tsx` | R0 guard, R3→R4, R4 route, plan-aware E5 gate, `riders[]` session |
| `journey/emergency/emergency-routing.ts` | `ridersSummary` path + sequence |
| `journey/activation-routing.ts` | `emergency.riders-summary` step |
| `features/emergency/types.ts` | `riders[]`, step/screen IDs, step count 10 |
| `types/flow.ts` | Step + screen IDs |
| `flows.config.ts` / `steps.config.ts` / `routes.schema.ts` | Registry parity |
| `features/qr-purchase/data/purchase-plans.ts` | Secure → 2 contacts |

### Unchanged (by design)

| Area | Files |
|------|-------|
| Emergency screen UI | `features/emergency/screens/e01–e09/**` |
| Compositions | `RelationshipSelector`, `EmergencyContactRow`, `AlOfflineChip` |
| `@autolokate/ui` package | No new exports |

---

## 7. Verification

```bash
pnpm --filter @autolokate/qr build
```

**Result:** ✅ Pass (2026-06-18)

### Manual smoke (recommended)

1. Purchase **Secure** plan, `riderCount: 1` → R0 → R1–R3 → **R4 foundation** → E0.
2. Purchase **Safe** plan → activation → emergency entry **skips R0** → lands on E0.
3. Add contacts on Secure → E5 **Add another** works once, blocked at 2.
4. Dev navigate to `/journey/emergency/riders-summary` with empty session → redirects to R3.

---

## 8. Next phase (screen build — not E1)

1. Promote `RelationshipSelector` → `@autolokate/ui` `AlRelationGrid`.
2. Build **E10 / R4** Figma screen; promote `EmergencyContactRow` → `AlContactCard`.
3. Wire E05/E09 to `emergency-limits` copy helpers.
4. Implement R0 states + promote `AlOfflineChip` when second screen ships.
5. E5 max-reached variant per plan (especially Safe at 1/1).

---

## Verdict

Phase E1 foundation is **aligned** with the blueprint for routing and plan limits at the orchestration layer. Screen-level Figma parity and DS promotions are **explicitly deferred** with documented risks. No emergency screen UI was modified in this phase.
