# Phase 11 — Emergency + Rider Audit

**App:** `@autolokate/qr`  
**Date:** 2026-06-17  
**Mode:** Audit only — no screen implementation  
**Figma:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Section:** `371:1275` · **Consumer · Emergency + Rider**  
**Inputs:** Figma MCP audit · `flows.config.ts` · `activation-routing.ts` · composition inventory · Phase 9/10 journey wiring

---

## Executive summary

Figma defines **9 primary screens** and **10 state-variant frames** (19 total) for the shared Emergency + Rider suffix. The suffix runs after activation success (Purchase, Prepaid, or B2B2C) and ends at **Completed**.

**Critical finding:** Current declarative step IDs (`emergency.rider-setup`, `emergency.contact-capture`, `emergency.plan-addon`, `emergency.confirmation`) **do not match Figma**. Two config steps (`plan-addon`, `confirmation`) **have no Figma frames**. Implementation must follow Figma node names and flows — not the placeholder 4-step contract.

**Screen count:** 9 unique UX surfaces · 19 Figma frames · 0 implemented in code today.

---

## 1. Figma node inventory

### Section

| Property           | Value                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section name       | Consumer · Emergency + Rider                                                                                                                         |
| Node ID            | `371:1275`                                                                                                                                           |
| Canvas             | `5:2` · ② Screens · Signature Flow                                                                                                                   |
| Frame size         | 393 × 852 (all primary frames)                                                                                                                       |
| Ambient tint       | Green radial (`rgba(31,162,74,0.04)`) — **protected**, not emergency-red                                                                             |
| DS components used | `StatusBar`, `AlButton/Primary`, `AlTextField`, `AlOtpInput`, `AlInput`, `AlOtpInput/Error`, `AlButton/Primary·Loading`, `AlButton/Primary·Disabled` |

### Primary screens (9)

| #   | Figma frame                 | Node ID    | Headline                  | Primary CTA       | Secondary action       |
| --- | --------------------------- | ---------- | ------------------------- | ----------------- | ---------------------- |
| 1   | **R0 · Rider prompt**       | `375:37`   | Add your rider’s details? | Add rider details | Skip for now           |
| 2   | **R1 · Rider mobile**       | `374:37`   | Rider’s mobile number     | Get OTP           | —                      |
| 3   | **R2 · Rider OTP**          | `374:54`   | (OTP headline block)      | Verify            | Change (link)          |
| 4   | **R3 · Rider name**         | `374:71`   | Add this rider            | Save rider        | —                      |
| 5   | **E0 · No contacts**        | `373:37`   | Who should we call?       | Add from contacts | Enter a number instead |
| 6   | **E1 · Contact mobile**     | `371:1295` | Their mobile number       | Get OTP           | —                      |
| 7   | **E2 · Contact OTP**        | `371:1318` | (OTP headline block)      | Verify            | Change (link)          |
| 8   | **E3 · Contact name**       | `371:1276` | Add this contact          | Save contact      | —                      |
| 9   | **E5 · Contacts (1 added)** | `373:64`   | Emergency contacts        | Continue          | Add another contact    |

### State-variant frames (10)

| Figma frame                      | Node ID    | Base screen | State                   |
| -------------------------------- | ---------- | ----------- | ----------------------- |
| E1 · Contact mobile · Error      | `595:1815` | E1          | error                   |
| E1 · Contact mobile · Offline    | `595:1838` | E1          | offline                 |
| E2 · Contact OTP · Error         | `579:1794` | E2          | error                   |
| E2 · Contact OTP · Verifying     | `579:1806` | E2          | verifying (loading CTA) |
| E2 · Contact OTP · Network error | `595:1863` | E2          | network error           |
| R1 · Rider mobile · Error        | `595:1895` | R1          | error                   |
| R1 · Rider mobile · Offline      | `595:1913` | R1          | offline                 |
| R2 · Rider OTP · Error           | `580:1748` | R2          | error                   |
| R2 · Rider OTP · Verifying       | `580:1769` | R2          | verifying (loading CTA) |
| R2 · Rider OTP · Network error   | `595:1933` | R2          | network error           |

### Screens **not** in Figma (do not invent)

| Config step ID (current) | Screen ID (current)     | Figma status                                               |
| ------------------------ | ----------------------- | ---------------------------------------------------------- |
| `emergency.plan-addon`   | `EmergencyPlanAddon`    | **No frame** — remove from implementation plan             |
| `emergency.confirmation` | `EmergencyConfirmation` | **No dedicated frame** — E5 Continue handoff replaces this |

---

## 2. Screen inventory (implementation mapping)

Proposed screen IDs aligned to Figma (Phase 11b implementation):

| Screen ID                  | Figma ref     | Step slug (proposed) | Feature folder         | Interactive elements                       |
| -------------------------- | ------------- | -------------------- | ---------------------- | ------------------------------------------ |
| `EmergencyRiderPrompt`     | R0 `375:37`   | `rider-prompt`       | `e01-rider-prompt`     | Primary CTA · skip link                    |
| `EmergencyRiderMobile`     | R1 `374:37`   | `rider-mobile`       | `e02-rider-mobile`     | `AlTextField` (+91 mobile)                 |
| `EmergencyRiderOtp`        | R2 `374:54`   | `rider-otp`          | `e03-rider-otp`        | `AlOtpInput` · resend · Change             |
| `EmergencyRiderName`       | R3 `374:71`   | `rider-name`         | `e04-rider-name`       | `AlInput` · relationship grid              |
| `EmergencyContactsEmpty`   | E0 `373:37`   | `contacts-empty`     | `e05-contacts-empty`   | Picker CTA · manual entry link · trust row |
| `EmergencyContactMobile`   | E1 `371:1295` | `contact-mobile`     | `e06-contact-mobile`   | `AlTextField` (+91 mobile)                 |
| `EmergencyContactOtp`      | E2 `371:1318` | `contact-otp`        | `e07-contact-otp`      | `AlOtpInput` · resend · Change             |
| `EmergencyContactName`     | E3 `371:1276` | `contact-name`       | `e08-contact-name`     | `AlInput` · relationship grid              |
| `EmergencyContactsSummary` | E5 `373:64`   | `contacts-summary`   | `e09-contacts-summary` | Contact row · add-another · Continue       |

**Total screens to build:** 9 (+ state props on mobile/OTP screens, not separate routes).

---

## 3. Route inventory

### Target journey routes (Figma-aligned)

| Path                                  | Screen | Step ID (proposed)           |
| ------------------------------------- | ------ | ---------------------------- |
| `/journey/emergency/rider-prompt`     | R0     | `emergency.rider-prompt`     |
| `/journey/emergency/rider-mobile`     | R1     | `emergency.rider-mobile`     |
| `/journey/emergency/rider-otp`        | R2     | `emergency.rider-otp`        |
| `/journey/emergency/rider-name`       | R3     | `emergency.rider-name`       |
| `/journey/emergency/contacts-empty`   | E0     | `emergency.contacts-empty`   |
| `/journey/emergency/contact-mobile`   | E1     | `emergency.contact-mobile`   |
| `/journey/emergency/contact-otp`      | E2     | `emergency.contact-otp`      |
| `/journey/emergency/contact-name`     | E3     | `emergency.contact-name`     |
| `/journey/emergency/contacts-summary` | E5     | `emergency.contacts-summary` |

### Current vs target

| Current (Phase 9 contract)           | Status                                          |
| ------------------------------------ | ----------------------------------------------- |
| `/journey/emergency/rider-setup`     | **Replace** → `/journey/emergency/rider-prompt` |
| `/journey/emergency/contact-capture` | **Split** → E0–E3 + E5 routes                   |
| `/journey/emergency/plan-addon`      | **Remove** — not in Figma                       |
| `/journey/emergency/confirmation`    | **Remove** — E5 Continue → `/journey/completed` |

### Entry handoff (all activation flows)

| Source           | Trigger             | Target                            |
| ---------------- | ------------------- | --------------------------------- |
| Purchase P06     | Continue            | `/journey/emergency/rider-prompt` |
| Prepaid (future) | Activation complete | Same                              |
| B2B2C (future)   | Activation complete | Same                              |

### Exit handoff

| Source                | Trigger  | Target               |
| --------------------- | -------- | -------------------- |
| E5 · Contacts summary | Continue | `/journey/completed` |

### Guards (reuse Phase 10 patterns)

| Guard                       | Condition                                 |
| --------------------------- | ----------------------------------------- |
| `RequireAuthCompleted`      | Auth must be complete                     |
| `RequireSelectedFlowMatch`  | Any of `purchase` \| `prepaid` \| `b2b2c` |
| Emergency segment bootstrap | `setPhase('emergency')` on entry          |

---

## 4. Route graph

```mermaid
flowchart TD
  ACT[Activation success<br/>Purchase · Prepaid · B2B2C] --> R0[R0 · Rider prompt<br/>375:37]

  R0 -->|Add rider details| R1[R1 · Rider mobile]
  R0 -->|Skip for now| E0[E0 · No contacts]

  R1 --> R2[R2 · Rider OTP]
  R2 --> R3[R3 · Rider name]
  R3 --> E0

  E0 -->|Add from contacts| PICK[Device contact picker<br/>native — no screen]
  E0 -->|Enter a number instead| E1[E1 · Contact mobile]

  PICK --> E3
  E1 --> E2[E2 · Contact OTP]
  E2 --> E3[E3 · Contact name]
  E3 --> E5[E5 · Contacts summary]

  E5 -->|Add another contact| E1
  E5 -->|Continue| DONE[/journey/completed]
```

### Branching notes (from Figma, not invented)

- **R0 skip** bypasses R1–R3 and lands on E0.
- **E0** offers device contact picker (primary) or manual mobile entry (secondary link).
- **Contact loop:** E1 → E2 → E3 → E5; from E5, “Add another contact” returns to E1 (up to 3 contacts per E5 copy: “1 of 3 added”).
- **No plan-add-on step** exists in Figma between contacts and completion.

---

## 5. State inventory

### View states per screen

| Screen | Figma states                                | `ScreenViewState` mapping         | DS signals                                      |
| ------ | ------------------------------------------- | --------------------------------- | ----------------------------------------------- |
| R0     | default                                     | `default`                         | illustration hero                               |
| R1     | default · error · offline                   | `default` \| `error` \| `empty`\* | `AlTextField` border                            |
| R2     | default · error · verifying · network error | `default` \| `error` \| `loading` | `AlOtpInput` / `AlOtpInput/Error` · loading CTA |
| R3     | default                                     | `default`                         | `AlInput` + relation tiles                      |
| E0     | default                                     | `default`                         | empty illustration · trust row                  |
| E1     | default · error · offline                   | `default` \| `error` \| `empty`\* | same as R1                                      |
| E2     | default · error · verifying · network error | same as R2                        | same as R2                                      |
| E3     | default                                     | `default`                         | same as R3                                      |
| E5     | default (1 contact)                         | `default` \| `success`            | verified badge on row                           |

\*Offline frames use dedicated Figma art; map to `empty` or new `offline` state — follow shared-auth R03/R04 convention.

### Session fields (orchestration — not in Figma, required for navigation)

| Field                      | Set on     | Used by                                                 |
| -------------------------- | ---------- | ------------------------------------------------------- |
| `riderSkipped`             | R0 skip    | Skip R1–R3                                              |
| `riderMobile`              | R1         | R2 OTP context                                          |
| `riderOtpVerified`         | R2 success | R3 gate                                                 |
| `riderName`                | R3         | Display only                                            |
| `riderRelation`            | R3         | Spouse \| Parent \| Child \| Sibling \| Friend \| Other |
| `contacts[]`               | E3 save    | E5 list (max 3)                                         |
| `contactDraft.mobile`      | E1         | E2                                                      |
| `contactDraft.otpVerified` | E2         | E3 gate                                                 |
| `contactDraft.name`        | E3         | Push to `contacts[]`                                    |

### OTP shared behaviors (reuse auth patterns)

| Behavior        | Figma copy                         | Prior art                       |
| --------------- | ---------------------------------- | ------------------------------- |
| Resend cooldown | “Code on its way · resend in 0:24” | R04 · `RESEND_COOLDOWN_SECONDS` |
| Change number   | “hotspot · Change”                 | R04 back to mobile              |
| Verifying       | `AlButton/Primary·Loading`         | R04 loading                     |
| OTP error       | `AlOtpInput/Error`                 | R04 wrong/expired               |

---

## 6. Reuse analysis

### Existing onboarding assets to reuse (no rebuild)

| Asset                                  | Reuse in emergency                                              |
| -------------------------------------- | --------------------------------------------------------------- |
| `FlowStepShell`                        | All 9 screens — **extend `phase: 'emergency'`** (not built yet) |
| `EmptyStateHero`                       | R0 illustration · E0 empty contacts                             |
| `InlineStatusBanner`                   | E1/R1 error · E2/R2 OTP errors                                  |
| `FormFieldStack`                       | R1 · E1 mobile · R3/E3 name (optional wrapper)                  |
| R04 OTP validation helpers             | R2 · E2 (`isValidOtp`, resend timer)                            |
| R03 mobile field pattern               | R1 · E1 (`AlTextField` +91)                                     |
| `PurchaseRoutes` orchestration pattern | URL-driven `EmergencyRoutes` segment                            |

### Figma vs Purchase P03 — do not conflate

| Pattern                                  | Figma location | Purchase P03              | Reuse?                                |
| ---------------------------------------- | -------------- | ------------------------- | ------------------------------------- |
| Rider cover toggle + count chips         | —              | P03 `AlToggle` + `AlChip` | **No** — different product intent     |
| Rider identity capture (mobile/OTP/name) | R1–R3          | —                         | Emergency-only                        |
| Plan rider addon                         | —              | P03                       | **No** — not part of emergency suffix |

**`RiderSelectorRow` (P03) must not be reused** for emergency rider setup. Figma emergency rider flow is contact verification, not plan addon selection.

---

## 7. Composition promotion analysis

Rule: **Promote only if reused 2+ times in Figma primary screens.**

| Candidate                  | Figma occurrences        | Screens                      | Verdict                                                                                                         |
| -------------------------- | ------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Relationship selector**  | 2                        | E3 `371:1276` · R3 `374:71`  | **Promote → `RelationshipSelector`**                                                                            |
| **Emergency contact row**  | 1 filled row + 1 add row | E5 `373:64`                  | **Promote → `EmergencyContactRow` + `AddContactRow`** (two row types in one list — extract as list composition) |
| **Mobile + OTP intro**     | 2                        | R1 + E1 (identical layout)   | **Promote → `MobileOtpIntroField`** or reuse `FormFieldStack` + screen template                                 |
| **OTP verification block** | 2                        | R2 + E2 (+ 8 variant frames) | **Do not new-compose** — reuse R04 screen logic / props                                                         |
| **Verification badge row** | 1                        | E5 verified chip             | Part of `EmergencyContactRow`                                                                                   |
| **Trust footer row**       | 1                        | E0 shield + encrypted copy   | **Defer** — single use                                                                                          |
| **Rider row (P03-style)**  | 0 in emergency           | —                            | **Do not promote**                                                                                              |

### Recommended new compositions (Phase 11b)

| Composition                | Building blocks                                           | Used on       |
| -------------------------- | --------------------------------------------------------- | ------------- |
| **`RelationshipSelector`** | `AlStack`, `AlText`, `AlChip` or icon tile grid, `AlIcon` | R3, E3        |
| **`EmergencyContactRow`**  | `AlAvatar`, `AlStack`, `AlText`, `AlIcon` (verified)      | E5 list items |
| **`AddContactRow`**        | `AlIcon` (plus), `AlText`, dashed border container        | E5 footer row |
| **`EmergencyContactList`** | `EmergencyContactRow` × n + `AddContactRow`               | E5            |

### New core candidates (`@autolokate/ui`)

| Candidate                    | Rationale                                             | Phase                                    |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `AlRelationshipSelector`     | 2 screens now; likely reuse in profile/settings later | **Defer** — onboarding composition first |
| `AlEmergencyContactRow`      | Emergency-only until second flow needs contact rows   | **Defer**                                |
| `AlOtpInput` / `AlTextField` | Already in DS — use directly                          | Now                                      |

**Do not add new core components in Phase 11b** unless relationship or contact row appears in a second product flow during implementation.

---

## 8. Config misalignment (must fix before build)

### Current `flows.config.ts` / `activation-routing.ts`

```
emergency.rider-setup → emergency.contact-capture → emergency.plan-addon → emergency.confirmation
```

### Figma-aligned proposal

```
emergency.rider-prompt → emergency.rider-mobile → emergency.rider-otp → emergency.rider-name
  → emergency.contacts-empty → [loop: contact-mobile → contact-otp → contact-name]
  → emergency.contacts-summary
```

| Action        | Item                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **Replace**   | `emergency.rider-setup` → rider sub-flow (4 steps)                        |
| **Replace**   | `emergency.contact-capture` → contact sub-flow (5 steps)                  |
| **Delete**    | `emergency.plan-addon`                                                    |
| **Delete**    | `emergency.confirmation` (E5 handles terminal)                            |
| **Update**    | `EMERGENCY_SUFFIX_STEP_IDS` in `activation-routing.ts`                    |
| **Update**    | `getEmergencyHandoffPath()` → `/journey/emergency/rider-prompt`           |
| **Update**    | `routes.schema.ts` journey emergency paths                                |
| **Deprecate** | Standalone `emergency` flow ID with embedded R01–R06 in `flows.config.ts` |

---

## 9. Responsive QA matrix

All Figma frames are **393px** wide. Implementation must verify at:

| Width     | Expectation                                                                                   |
| --------- | --------------------------------------------------------------------------------------------- |
| **320px** | Relationship grid wraps (3×2 tiles at 113px + gap); contact rows stack; footer CTA full width |
| **360px** | Same; primary reference for Android mid                                                       |
| **375px** | Matches Figma intent                                                                          |
| **390px** | No horizontal overflow on OTP cells                                                           |
| **414px** | `journey-frame` caps at `min(100%, 24.5625rem)` — centered column                             |

Shell: reuse `.journey-frame` + `FlowStepShell` — no new layout primitives.

---

## 10. Theme QA matrix

| Theme     | Figma evidence                         | Implementation                       |
| --------- | -------------------------------------- | ------------------------------------ |
| **Dark**  | Primary frame fill `#0A0A0C`           | Default · `data-theme="dark"`        |
| **Light** | Foundations light `501:37` (DS parity) | `setThemeMode('light')` · token swap |

Rules:

- Use `AlScreenBg variant="protected"` (green ambient) — matches Figma emergency **onboarding** suffix (not live SOS red).
- **No hardcoded colors** — `#0A0A0C`, `#1A1A1A`, `#4A4A4A`, `#1FA24A` map to existing DS tokens.
- Only `@autolokate/ui`, `@autolokate/icons`, `@autolokate/brand`.

---

## 11. Implementation plan (Phase 11b — not started)

### Phase 11b.1 — Schema & routing alignment

1. Update `types/flow.ts` emergency step IDs and screen IDs.
2. Replace `EMERGENCY_SUFFIX_STEP_IDS` and journey paths.
3. Change P06 (and future activation exits) handoff to `/journey/emergency/rider-prompt`.
4. Add `RequireSelectedFlowMatch` on emergency routes (same as purchase).

### Phase 11b.2 — Compositions

1. Extract `RelationshipSelector` from E3/R3 Figma parity.
2. Extract `EmergencyContactRow`, `AddContactRow`, `EmergencyContactList` from E5.
3. Register in `compositions/inventory.ts`.

### Phase 11b.3 — Feature module

```
features/emergency/
├── types.ts
├── screens/
│   ├── e01-rider-prompt/
│   ├── e02-rider-mobile/
│   ├── … (9 folders)
│   └── inventory.ts          ← Figma node refs
├── emergency-routing.ts
└── index.ts
```

### Phase 11b.4 — Journey orchestration

1. Create `EmergencyRoutes.tsx` (mirror `PurchaseRoutes.tsx`).
2. Replace `EmergencyPlaceholderScreen` in `JourneyRoutes.tsx`.
3. Wire back/continue · skip · contact loop · E5 → completed.
4. Persist emergency session fields in `JourneyContext.session`.

### Phase 11b.5 — Shell extension

1. Add `phase: 'emergency'` to `FlowStepShell` with appropriate step total (dynamic — rider optional).
2. Hide step progress if matching purchase Figma delta (document as architecture choice).

### Phase 11b.6 — QA signoff

1. Lint + build.
2. Manual smoke: Purchase → P06 → full emergency suffix → Completed.
3. Repeat at widths 320–414 and light/dark.
4. Write `PHASE_11_EMERGENCY_IMPLEMENTATION.md`.

---

## 12. Remaining placeholders after Phase 11

| Segment               | After Phase 11b                             |
| --------------------- | ------------------------------------------- |
| Prepaid activation    | Still placeholder                           |
| B2B2C activation      | Still placeholder                           |
| Emergency suffix      | **Implemented**                             |
| `purchase.qr-scan`    | Still redirect bootstrap (no QrScan screen) |
| Device contact picker | Native bridge — not a screen                |

---

## 13. Alignment impact (pre-implementation)

| Dimension                 | Phase 10                   | After Phase 11 (projected) |
| ------------------------- | -------------------------- | -------------------------- |
| Emergency placement       | Routing contract only      | Figma-aligned suffix spec  |
| Emergency screen coverage | 0 / 9                      | 0 / 9 (audit only)         |
| Config ↔ Figma parity     | **Low**                    | Audit documents target     |
| Composition inventory     | Missing emergency extracts | 3–4 candidates identified  |

**Overall journey alignment (projected post-11b):** 82 → **~90 / 100** once screens ship.

---

## 14. Verdict

Phase 11 audit confirms the Emergency + Rider suffix is **fully specified in Figma** (`371:1275`) with **9 primary screens** and **19 total frames**. The existing 4-step config is **obsolete** and must be realigned before implementation.

**Do not invent:**

- Plan add-on screen
- Standalone confirmation screen
- Purchase P03 rider toggle pattern in emergency context

**Do implement (Phase 11b):**

- Exact Figma screen set R0–R3 + E0–E3 + E5
- Relationship selector composition (2× reuse)
- Emergency contact list composition (E5)
- Figma-aligned routes under `/journey/emergency/*`

---

## Appendix A — Figma URLs

| Frame   | URL                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Section | [Consumer · Emergency + Rider](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=371-1275) |
| R0      | [375:37](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=375-37)                         |
| R1      | [374:37](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-37)                         |
| R2      | [374:54](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-54)                         |
| R3      | [374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71)                         |
| E0      | [373:37](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=373-37)                         |
| E1      | [371:1295](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=371-1295)                     |
| E2      | [371:1318](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=371-1318)                     |
| E3      | [371:1276](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=371-1276)                     |
| E5      | [373:64](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=373-64)                         |

## Appendix B — Code references (current)

| File                                             | Role                                                |
| ------------------------------------------------ | --------------------------------------------------- |
| `journey/activation-routing.ts`                  | Placeholder 4-step contract — **needs realignment** |
| `journey/screens/EmergencyPlaceholderScreen.tsx` | Runtime placeholder                                 |
| `flow/registry/config/flows.config.ts`           | Declarative emergency flow                          |
| `flow/registry/config/steps.config.ts`           | Step → screenId mapping                             |
| `components/compositions/inventory.ts`           | `EmergencyContactSummary` candidate                 |
| `components/flow-step-shell/FlowStepShell.tsx`   | Needs `emergency` phase                             |

## Appendix C — Related documents

| Document                                                             | Relationship                                         |
| -------------------------------------------------------------------- | ---------------------------------------------------- |
| [PHASE_10_PURCHASE_ALIGNMENT.md](./PHASE_10_PURCHASE_ALIGNMENT.md)   | P06 → emergency handoff                              |
| [PHASE_9_JOURNEY_ORCHESTRATOR.md](./PHASE_9_JOURNEY_ORCHESTRATOR.md) | Suffix architecture                                  |
| [FLOW_ALIGNMENT_REPORT.md](./FLOW_ALIGNMENT_REPORT.md)               | Original 4-step proposal (superseded by Figma audit) |
| [PHASE_6_5_COMPOSITION_AUDIT.md](./PHASE_6_5_COMPOSITION_AUDIT.md)   | RiderSelectorRow ≠ emergency rider                   |
