# Emergency Entry Flow Verification

**App:** `@autolokate/qr`  
**Date:** 2026-06-18  
**Mode:** Audit only — no code changes  
**Figma:** Section `371:1275` · Consumer · Emergency + Rider  
**Runtime under review:** R10 Payment Success → `rider-prompt` (Secure / default plan path)

**Sources:** `EMERGENCY_IMPLEMENTATION_BLUEPRINT.md` · `PHASE_11_EMERGENCY_AUDIT.md` · `EMERGENCY_HANDOFF_FIX_REPORT.md` · `EMERGENCY_FINAL_SIGNOFF.md` · runtime trace of `activation-routing.ts`, `emergency-limits.ts`, `EmergencyRoutes.tsx`, screen components.

---

## Executive summary

| Question | Answer |
|----------|--------|
| **Figma logical route order** | R0 → R1 → R2 → R3 → R4 → E0 → E1 → E2 → E3 → E5 → Completed |
| **First screen after R10 Continue (default Secure plan)** | **R0 · Rider prompt** (`375:37`) — **correct** for addon plans |
| **First screen after R10 (Safe plan)** | **E0 · No contacts** (`373:37`) — skips R0 |
| **Rider mandatory?** | **Optional** — skippable via “Skip for now”; only shown when plan entitles rider addon |
| **Emergency contact mandatory?** | **Mandatory (min 1)** — E5 Continue disabled until ≥1 contact; max is plan-dependent |
| **Why CTA shows loader on R0?** | **Figma-valid loading variant** (`713:2264`) — runtime forces `loading` for **600ms on every R0 mount**; not shown on default frame `375:37` |

**Verdict:** R10 → `rider-prompt` is **correct entry for Secure/Shield/Shield+** with rider entitlement. The visible CTA loader is **intentional implementation of the R0 Loading frame**, not a random bug — but it **diverges from the default R0 frame** on every entry because of an artificial delay, not a real fetch.

---

## 1. Exact Figma route order

### 1.1 Logical journey sequence (section `371:1275`)

Figma defines **11 primary surfaces** in this order (happy path + branches):

```
R0 → R1 → R2 → R3 → R4 → E0 → E1 → E2 → E3 → E5 → /completed
```

| Step | Dev ID | Figma ref | Node ID | Route (runtime) |
|------|--------|-----------|---------|-----------------|
| R0 | E01 | Rider prompt | `375:37` | `/journey/emergency/rider-prompt` |
| R1 | E02 | Rider mobile | `789:2064` | `/journey/emergency/rider-mobile` |
| R2 | E03 | Rider OTP | `789:2109` | `/journey/emergency/rider-otp` |
| R3 | E04 | Rider name | `374:71` | `/journey/emergency/rider-name` |
| R4 | E10 | Riders added | `822:1980` · `824:2014` | `/journey/emergency/riders-summary` |
| E0 | E05 | No contacts | `373:37` | `/journey/emergency/contacts-empty` |
| E1 | E06 | Contact mobile | `789:1982` | `/journey/emergency/contact-mobile` |
| E2 | E07 | Contact OTP | `789:2027` | `/journey/emergency/contact-otp` |
| E3 | E08 | Contact name | `371:1276` | `/journey/emergency/contact-name` |
| E5 | E09 | Contacts summary | `373:64` · `717:2237` | `/journey/emergency/contacts-summary` |

> **No E4 screen** in Figma or code.

### 1.2 Figma route graph (including branches)

```mermaid
flowchart TD
  ACT[Activation success<br/>R10 / P06 / Prepaid / B2B2C] --> ENTRY{Plan + rider entitlement}

  ENTRY -->|Safe OR no rider addon| E0[E0 · No contacts<br/>373:37]
  ENTRY -->|Secure / Shield / Shield+<br/>rider addon entitled| R0[R0 · Rider prompt<br/>375:37]

  R0 -->|Add rider details| R1[R1 · Rider mobile]
  R0 -->|Skip for now| E0

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
  E5 -->|Continue ≥ 1 contact| DONE[/journey/completed]
```

### 1.3 Frame inventory order (19 frames in section)

Figma file frame numbering (READY FOR DEV) does **not** equal journey order. Canonical journey order is §1.1 above.

| # | Frame | Node |
|---|-------|------|
| — | E0 empty | `373:37` |
| — | E1 mobile | `789:1982` |
| — | E2 OTP | `789:2027` |
| — | E3 name | `371:1276` |
| — | E5 contacts | `373:64` |
| — | E5 max reached | `717:2237` |
| — | R0 default | `375:37` |
| — | R0 loading | `713:2264` |
| — | R0 error | `713:2288` |
| — | R0 offline | `713:2311` |
| — | R1 mobile | `789:2064` |
| — | R2 OTP | `789:2109` |
| — | R3 name / disabled / submitting / error | `374:71` · `713:2021` · `719:2084` · `719:2143` |
| — | R4 riders / max 2 | `822:1980` · `824:2014` |

---

## 2. Entry point after Purchase Success (R10 Continue)

### 2.1 Question: R0 or E0 first?

**Answer: plan-dependent — not a single Figma entry for all plans.**

| Plan | `getEmergencyHandoffPath()` | First screen | Figma frame |
|------|----------------------------|--------------|-------------|
| **Safe** | `/journey/emergency/contacts-empty` | **E0** | `373:37` |
| **Secure** (default `DEFAULT_PURCHASE_PLAN_ID`) | `/journey/emergency/rider-prompt` | **R0** | `375:37` |
| **Shield** | `/journey/emergency/rider-prompt` | **R0** | `375:37` |
| **Shield+** | `/journey/emergency/rider-prompt` | **R0** | `375:37` |

**Implementation:** `activation-routing.ts` → `getEmergencyHandoffPath()`:
- `safe` → `emergencyJourneyPaths.contactsEmpty`
- all other plans → `emergencyJourneyPaths.riderPrompt`

**Secondary guard:** If user lands on R0 but has **no rider addon entitlement** (`shouldEnterRiderPrompt()` → false, i.e. `riderCount === 0` or Safe `maxRiders === 0`), `R0Route` immediately `<Navigate>` to E0.

### 2.2 Why runtime shows R10 → `rider-prompt`

Default purchase journey sets:
- `selectedPlanId`: **Secure** (`DEFAULT_PURCHASE_PLAN_ID`)
- `riderCount`: **1** (set at R05 continue)

Therefore `getEntitledRiderSlots('secure', 1) === 1` → R0 is the **correct** first emergency screen.

Figma’s generic graph shows `Activation success → R0`, but product rules add **Safe → E0** shortcut. Runtime matches product rules, not the undifferentiated Figma diagram alone.

### 2.3 Figma vs runtime entry matrix

| Scenario | Figma expectation | Runtime | Match? |
|----------|-------------------|---------|--------|
| Secure + 1 rider purchased | R0 | R0 | ✅ |
| Safe (no rider addon) | Skip R0 → E0 | E0 direct | ✅ |
| Secure + 0 riders (skipped R07 addon) | Skip R0 → E0 | R0 mount → redirect E0 | ⚠️ Brief R0 hop |
| Shield + 2 riders | R0 | R0 | ✅ |

---

## 3. Mandatory vs optional rules

### 3.1 Rider (R0–R4)

| Dimension | Rule |
|-----------|------|
| **Mandatory to complete journey?** | **No — optional** |
| **Figma evidence** | R0 secondary CTA: **“Skip for now”** → E0 (`375:37`) |
| **Plan-dependent?** | **Yes** |
| **When shown** | `shouldEnterRiderPrompt(planId, riderCount)` → `getEntitledRiderSlots() > 0` |
| **Entitlement** | Safe: `maxRiders = 0` (never shown). Secure/Shield/Shield+: up to 2 slots if purchased on R07 |
| **Required for /completed?** | No — user can skip entire R1–R4 chain |

**Summary:** Rider capture is **optional and plan-dependent**. Addon plans **offer** R0; user may defer via skip.

### 3.2 Emergency contact (E0–E5)

| Dimension | Rule |
|-----------|------|
| **Mandatory to complete journey?** | **Yes — minimum 1 contact** |
| **Code source** | `getEmergencyPlanLimits()` → `minEmergencyContacts: 1` (all plans) |
| **Figma evidence** | E5 Continue only meaningful with ≥1 card; blueprint: *“At least 1 emergency contact required before Continue on E5”* |
| **Plan-dependent?** | **Yes — for maximum, not minimum** |
| **Max contacts** | Safe: 1 · Secure: 2 · Shield / Shield+: 3 |
| **E0 skippable?** | No — user must add at least one contact (via picker stub or E1→E2→E3) before E5 Continue enables |

**Summary:** Emergency contact is **mandatory (≥1)** with a **plan-dependent ceiling**.

---

## 4. CTA behavior verification (R0 · R4 · E0 · E5)

### 4.1 R0 · Rider prompt (`E01` / `375:37`)

| State | Figma frame | CTA label | Loading | Disabled | Navigation target |
|-------|-------------|-----------|---------|----------|-------------------|
| **default** | `375:37` | Add rider details | No | No | R1 (`rider-mobile`) |
| **loading** | `713:2264` | Add rider details + spinner | **Yes** (`AlButton/Primary·Loading`) | **Yes** | Blocked until default |
| **error** | `713:2288` | Try again | No | No | Retry load → default |
| **offline** | `713:2311` | Add rider details | No | **Yes** | Blocked; skip still works |
| **secondary** | all | Skip for now | No | No (except offline primary) | E0 (`contacts-empty`) |
| **back** | all | — | — | — | R10 (`r10-payment-success`) |

**Runtime wiring (`R0Route` + `E01RiderPromptScreen`):**
- `viewState` initial = `'loading'`
- After `RIDER_LOAD_MS` (600ms) → `'default'` (or `'error'` on simulated failure)
- `footerLoading={viewState === 'loading'}`
- `footerDisabled={offline || loading}`
- `onContinue` blocked unless `viewState === 'default'` (or error retry path)

### 4.2 R4 · Riders summary (`E10` / `822:1980`)

| State | Figma frame | CTA label | Loading | Disabled | Navigation target |
|-------|-------------|-----------|---------|----------|-------------------|
| **default** | `822:1980` | Continue | No | No | E0 (`contacts-empty`) |
| **max reached** | `824:2014` | Continue | No | No | E0 |
| **add row** | under max | Add another rider | No | — | R1 (`rider-mobile`) |
| **back** | all | — | — | — | R3 (`rider-name`) |

**Runtime:** No `footerLoading` on `E10RidersSummaryScreen`. R3 saves rider → R4 (not E0). Matches Figma graph.

### 4.3 E0 · No contacts (`E05` / `373:37`)

| State | Figma frame | CTA label | Loading | Disabled | Navigation target |
|-------|-------------|-----------|---------|----------|-------------------|
| **default** | `373:37` | Add from contacts | No | No | E3 (`contact-name`) via picker stub |
| **secondary** | `373:37` | Enter a number instead | No | No | E1 (`contact-mobile`) |
| **back** | contextual | — | — | — | R0 if skipped · R4 if riders saved · R10 if Safe-only path |

**Runtime:** No loading/disabled on primary CTA. Picker is a **demo stub** (`demoPickerContact` → E3).

### 4.4 E5 · Contacts summary (`E09` / `373:64`)

| State | Figma frame | CTA label | Loading | Disabled | Navigation target |
|-------|-------------|-----------|---------|----------|-------------------|
| **under max** | `373:64` | Continue | No | No if `count ≥ 1` | `/journey/completed` |
| **0 contacts** | (edge) | Continue | No | **Yes** | Blocked |
| **max reached** | `717:2237` | Continue | No | No if `count ≥ 1` | `/journey/completed` |
| **add row** | under max | Add another contact | No | — | E1 (`contact-mobile`) |
| **back** | all | — | — | — | E0 (`contacts-empty`) always |

**Runtime:** `footerDisabled={count < minEmergencyContacts}` where `minEmergencyContacts === 1`.

---

## 5. Why runtime shows loader on R0 CTA

### 5.1 Observation

After **R10 Continue** on Secure (default), user lands on **`rider-prompt`** and sees the primary CTA in **loading/spinner** state for ~600ms before “Add rider details” becomes clickable.

### 5.2 Is loader present in Figma?

**Yes.**

| Property | Value |
|----------|-------|
| Frame | `09 · R0 Rider prompt · Loading` |
| Node ID | **`713:2264`** |
| DS component | `AlButton/Primary·Loading` |
| Primary CTA | Spinner on “Add rider details”; CTA disabled |
| Documented in | `EMERGENCY_IMPLEMENTATION_BLUEPRINT.md` §1.2, `EMERGENCY_FINAL_SIGNOFF.md` row #2 |

The **default** R0 frame (`375:37`) does **not** show a loading CTA.

### 5.3 Runtime cause (not a rendering bug)

| Layer | Behavior |
|-------|----------|
| `R0Route` | `useState<EmergencyRiderPromptState>('loading')` on mount |
| Effect | Sets `viewState = 'loading'`, then `setTimeout` 600ms (`RIDER_LOAD_MS`) → `'default'` |
| `E01RiderPromptScreen` | `footerLoading={isLoading}` → `FlowStepShell` → `AlButton loading` |
| Blueprint intent | *“Fetch rider entitlement before showing CTA”* (§4.3 R0) |

**Conclusion:** The loader is **Figma-intentional** for the **loading variant** (`713:2264`). Runtime **always plays this variant first** on every R0 entry because of a **simulated 600ms fetch**, not because default frame `375:37` requires it.

### 5.4 Implementation assessment

| Assessment | Detail |
|------------|--------|
| **Not a stray bug** | Maps correctly to Figma `713:2264` |
| **UX drift from default frame** | User briefly sees Loading variant before Default variant on every visit |
| **When loader persists** | Offline → disabled (no spinner on loading path). Error → “Try again” (no spinner). Shield+2 riders first load → error frame (`713:2288`) after 600ms |

---

## 6. Runtime vs Figma deltas (entry-focused)

| Item | Figma | Runtime | Severity |
|------|-------|---------|----------|
| Secure entry after R10 | R0 | R0 | ✅ |
| Safe entry after R10 | E0 (product rule) | E0 | ✅ |
| R0 initial state | Default `375:37` after load completes | 600ms Loading `713:2264` first | ⚠️ UX |
| R0 → R1 → R2 → R3 → R4 → E0 | Full chain | Implemented | ✅ |
| Rider optional (skip) | Yes | Yes | ✅ |
| Contact min 1 | Yes | Yes (`minEmergencyContacts: 1`) | ✅ |
| R0 back target | Activation success | Hardcoded R10 | ⚠️ P1 |
| E5 back target | Contextual | Always E0 | ⚠️ P1 |
| E0 picker | Native | Demo stub | ⚠️ Known |

---

## 7. Exact fixes required

Audit-only — fixes documented, not applied.

### 7.1 R0 CTA loader on every entry (P1 — UX parity)

**Problem:** Default Secure path shows Figma **Loading** frame (`713:2264`) for 600ms on every R0 mount, then **Default** (`375:37`). Users perceive this as a stuck/broken CTA after R10.

**Fix options (pick one):**

1. **Remove artificial delay** — if entitlement is already in `session.purchase`, render `viewState: 'default'` immediately; reserve `loading` for real async API only.
2. **Keep delay but prefetch before navigation** — resolve entitlement during R10 Continue transition so R0 mounts in `default`.
3. **Product sign-off** — accept 600ms loading as “fetching rider cover” if backend fetch will always exist in production.

**Figma reference:** Only show `AlButton/Primary·Loading` while on node `713:2264`, not on `375:37`.

### 7.2 Secure + `riderCount: 0` brief R0 flash (P2)

**Problem:** Handoff navigates to `rider-prompt`; `R0Route` redirects to E0 when `shouldEnterRiderPrompt()` is false.

**Fix:** `getEmergencyHandoffPath()` should return `contacts-empty` when `getEntitledRiderSlots() === 0`, not only when `planId === 'safe'`.

### 7.3 R0 back hardcoded to R10 (P1)

**Problem:** Users entering via P06 or deep link see back → R10 even without payment success context.

**Fix:** Contextual back — purchase success screen that initiated emergency, or journey home.

### 7.4 E5 back always → E0 (P1)

**Problem:** After adding contacts via E1 loop, back from E5 should consider prior context; Figma implies return to empty state only when 0 contacts.

**Fix:** Back → E0 when `contacts.length === 0`; else stay or return to last capture entry.

### 7.5 No fix needed

| Item | Reason |
|------|--------|
| R10 → `rider-prompt` for Secure | Correct plan-aware entry |
| R4 in journey | Implemented (`R3` → `riders-summary` → E0) |
| E5 Continue disabled at 0 contacts | Matches mandatory contact rule |
| Loader component itself | Valid Figma `713:2264` — not a missing DS component |

---

## 8. Verification checklist (manual QA)

| # | Steps | Expected |
|---|-------|----------|
| 1 | Purchase **Secure** + 1 rider → R10 Continue | Land **R0**; after ≤600ms, CTA “Add rider details” enabled |
| 2 | R0 → Skip for now | **E0** |
| 3 | R0 → Add rider details → complete R1–R3 | **R4** → Continue → **E0** |
| 4 | Purchase **Safe** → R10 Continue | Land **E0** directly (no R0) |
| 5 | Add 1 contact → E5 | Continue enabled → `/journey/completed` |
| 6 | E5 with 0 contacts (edge) | Continue **disabled** |
| 7 | Shield + 2 riders → R0 first load | May hit **error** frame `713:2288`; Try again → default |

---

## Appendix — code references (read-only)

| Concern | File |
|---------|------|
| R10 handoff | `apps/qr/src/journey/activation-routing.ts` → `getEmergencyHandoffPath()` |
| Plan limits | `apps/qr/src/features/emergency/emergency-limits.ts` |
| R0 state machine | `apps/qr/src/journey/routes/EmergencyRoutes.tsx` → `R0Route` |
| R0 UI | `apps/qr/src/features/emergency/screens/e01-rider-prompt/E01RiderPromptScreen.tsx` |
| R4 / E0 / E5 UI | `e10-riders-summary`, `e05-contacts-empty`, `e09-contacts-summary` |
| R10 Continue | `apps/qr/src/journey/routes/PurchaseRoutes.tsx` → `R10Route` |

---

*Audit complete. No files were modified.*
