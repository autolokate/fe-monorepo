# Autolokate Onboarding — Claude Project Index

**Generated:** 2026-06-19 · **Updated:** 2026-06-17 (project lockdown — **BASELINE LOCKED**)  
**Scope:** Full read-only audit of `apps/qr/src/journey/`, `apps/qr/src/features/`, `packages/ui/`, `packages/icons/`, `packages/design-system/`, `docs/`

---

## 0. Baseline Lock & Charter

# BASELINE LOCKED

This repository is the **reference implementation** for all future Autolokate projects.

| Document                     | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `PROJECT_CHARTER.md`         | Locked areas, change control, priority order |
| `ARCHITECTURE_PRINCIPLES.md` | Provider tree, sessions, flows, PWA          |
| `DEVELOPMENT_STANDARDS.md`   | TS, React, imports, components, PWA gates    |

**Default priority:** Preserve architecture → flow → session → components → design system → Figma → new features.

---

## 1. What This Repository Is

This is **not** the Consumer App. It is the **Autolokate Onboarding + Activation + Post-Activation PWA** — a monorepo PWA containing:

- Consumer QR onboarding (purchase, prepaid, B2B2C flows)
- Shared Auth (Mobile → OTP → Name)
- Emergency + Rider contact setup
- Post-Activation PWA (SOS Emergency, Park Me)

**Entry point:** `/journey` (supports QR query dispatch: `?type=purchase|prepaid|b2b2c`)  
**PWA entry point:** `/pwa/scan/*` (post-activation; activated QR may also land here via dispatcher)

---

## 2. Route Architecture

### 2.1 Top-Level Routing (`JourneyOrchestrator.tsx`)

```
BrowserRouter
└── AutolokateRootProvider
    ├── JourneyProvider      (journey session: al-journey-v1)
    └── PwaScanProvider      (PWA session: al-pwa-scan-v1)
        └── PwaAppShell
            ├── /pwa/scan/*  →  PwaScanRoutes
            └── *            →  JourneyProvider routes via JourneyRoutes
```

Note: PWA has **separate scan session storage** but shares the root provider shell. Journey purchase/emergency state is not used inside PWA flows.

### 2.2 Journey Routes (`/journey/*`)

| Path                   | Component                                  | Guard                                                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| `/`                    | → redirect `/journey`                      | —                                                             |
| `/journey`             | `FlowEntryScreen`                          | —                                                             |
| `/journey/home`        | → redirect `/journey`                      | —                                                             |
| `/journey/flow-hub`    | `FlowHubScreen`                            | —                                                             |
| `/journey/qr-scan`     | → redirect `/journey`                      | —                                                             |
| `/journey/auth/*`      | `JourneySharedAuthRoute` → `AuthRoutes`    | —                                                             |
| `/journey/purchase`    | → redirect `/journey/purchase/r03-vehicle` | —                                                             |
| `/journey/purchase/*`  | `PurchaseRoutes`                           | `RequireAuthCompleted` + `RequireSelectedFlowMatch(purchase)` |
| `/journey/prepaid/*`   | `PrepaidRoutes`                            | —                                                             |
| `/journey/b2b2c/*`     | `B2b2cRoutes`                              | —                                                             |
| `/journey/emergency`   | → redirect `rider-prompt`                  | —                                                             |
| `/journey/emergency/*` | `EmergencyRoutes`                          | `RequireAuthCompleted` + `RequireSelectedFlow`                |
| `/journey/completed`   | `JourneyCompletedScreen`                   | —                                                             |
| `*`                    | → redirect `/journey`                      | —                                                             |

---

## 3. Flow Architecture

### 3.1 Auth Flow (`/journey/auth/*`)

Shared across all activation flows.

| Step               | Route                         | Screen                    |
| ------------------ | ----------------------------- | ------------------------- |
| Mobile + consent   | `/journey/auth/mobile`        | `A1MobileScreen`          |
| OTP verify         | `/journey/auth/otp`           | `A2OtpScreen`             |
| Vehicle owner name | `/journey/auth/vehicle-owner` | `A3VehicleOwnerScreen`    |
| Privacy Policy     | `/journey/auth/legal/privacy` | `L1PrivacyPolicyScreen`   |
| Terms              | `/journey/auth/legal/terms`   | `L2TermsConditionsScreen` |

**Demo credentials:** Mobile `9999999999`, OTP `123456`, Expired OTP `000000`  
**On completion:** routes to first screen of selected flow via `getPostAuthActivationPath()`

### 3.2 Purchase Flow (`/journey/purchase/*`)

Consumer QR Activation + Purchase.

| Step    | Route                         | Screen                            | Notes                              |
| ------- | ----------------------------- | --------------------------------- | ---------------------------------- |
| R03     | `r03-vehicle`                 | `R03VehicleNumberScreen`          | Plate input, fetch intent          |
| R04     | `r04-fetching`                | `R04FetchingVehicleScreen`        | Async Vahan lookup                 |
| R04b    | `r04b-fetch-failed`           | `R04bFetchFailedScreen`           | Retry / manual entry               |
| R05     | `r05-confirm`                 | `R05ConfirmVehicleScreen`         | Vehicle RC card                    |
| R06     | `r06-choose-plan`             | `R06ChoosePlanScreen`             | Safe/Secure/Shield/Shield+         |
| R07     | `r07-rider-cover`             | `R07RiderCoverScreen`             | 0–2 rider addon count              |
| R08     | `r08-order-summary`           | `R08OrderSummaryScreen`           | Promo code entry                   |
| R08b    | `r08b-promo-applied`          | `R08bPromoAppliedScreen`          | Valid promo state                  |
| R08c    | `r08c-invalid-promo`          | `R08cInvalidPromoScreen`          | Invalid promo state                |
| R09     | `r09-processing-payment`      | `R09ProcessingPaymentScreen`      | Payment timer                      |
| R09b    | `r09b-still-confirming`       | `R09bStillConfirmingScreen`       | Long confirm                       |
| R10     | `r10-payment-success`         | `R10PaymentSuccessScreen`         | Terminal → Emergency               |
| R10b    | `r10b-payment-failed`         | `R10bPaymentFailedScreen`         | Retry                              |
| R10c    | `r10c-payment-unconfirmed`    | `R10cPaymentUnconfirmedScreen`    | Check status                       |
| ~~R14~~ | ~~`r14-permissions`~~         | ~~`R14PermissionsScreen`~~        | **ARCHIVED — not in active graph** |
| ~~R15~~ | ~~`r15-activation-complete`~~ | ~~`R15ActivationCompleteScreen`~~ | **ARCHIVED — not in active graph** |

**After R10:** always enters Emergency at `contacts-empty` (rider prompt skipped post-payment).  
**Purchase terminal:** R10 / R10b / R10c. R14 and R15 are archived and must not be restored or referenced.

### 3.3 Emergency Flow (`/journey/emergency/*`)

Shared across all flows after activation. Entry point depends on plan + rider entitlement.

| Step | Route              | Screen                     | Notes                   |
| ---- | ------------------ | -------------------------- | ----------------------- |
| R0   | `rider-prompt`     | `E01RiderPromptScreen`     | Only if rider entitled  |
| R1   | `rider-mobile`     | `E02RiderMobileScreen`     | Rider mobile capture    |
| R2   | `rider-otp`        | `E03RiderOtpScreen`        | Rider OTP               |
| R3   | `rider-name`       | `E04RiderNameScreen`       | Rider name + relation   |
| R4   | `riders-summary`   | `E10RidersSummaryScreen`   | Multi-rider summary     |
| E0   | `contacts-empty`   | `E05ContactsEmptyScreen`   | Entry point from R10    |
| E1   | `contact-mobile`   | `E06ContactMobileScreen`   | Contact mobile          |
| E2   | `contact-otp`      | `E07ContactOtpScreen`      | Contact OTP             |
| E3   | `contact-name`     | `E08ContactNameScreen`     | Contact name + relation |
| E5   | `contacts-summary` | `E09ContactsSummaryScreen` | Summary → Completed     |

**Entry logic:**

- `shouldEnterRiderPrompt(planId, riderCount)` → enters R0 or skips to E0
- Rider optional. Contacts mandatory (min 1) unless rider skipped.
- **Rider skip (R0):** confirmation sheet → `riderSkipped: true` → `/journey/completed` (bypasses emergency contacts)
- **iOS E0:** no "Add from contacts" CTA — `shouldShowAddFromContactsCTA()` returns false

**Plan limits (single source of truth in `emergency-limits.ts`):**

| Plan          | Max Contacts | Max Riders |
| ------------- | ------------ | ---------- |
| `safe`        | 1            | 0          |
| `secure`      | 2            | 2          |
| `shield`      | 3            | 2          |
| `shield-plus` | 3            | 2          |

### 3.4 Prepaid Flow (`/journey/prepaid/*`)

B2B pre-paid — no purchase, no payment, no vehicle activation.

| Route                      | Screen                 |
| -------------------------- | ---------------------- |
| `/journey/prepaid/welcome` | `PrepaidWelcomeScreen` |

Post-auth, routes to emergency flow.

### 3.5 B2B2C Flow (`/journey/b2b2c/*`)

Partner-bridge activation — no purchase, no payment, no vehicle activation.

| Route                               | Screen                                      |
| ----------------------------------- | ------------------------------------------- |
| `/journey/b2b2c/welcome`            | `PartnerWelcomeScreen variant="plan-only"`  |
| `/journey/b2b2c/welcome/plan-rider` | `PartnerWelcomeScreen variant="plan-rider"` |

### 3.6 Post-Activation PWA (`/pwa/scan/*`)

Isolated from journey. Separate context (`PwaScanContext`), separate session (`pwa-scan-v1`).

**Shared / scan entry:**

| Route                     | Purpose               |
| ------------------------- | --------------------- |
| `/pwa/scan/loading`       | Bootstrap (1200ms)    |
| `/pwa/scan/vehicle`       | Scanned vehicle found |
| `/pwa/scan/verify/mobile` | Auth: mobile          |
| `/pwa/scan/verify/otp`    | Auth: OTP             |
| `/pwa/scan/verify/name`   | Auth: name            |

**SOS flow** (no auth required — tap → HOLD required):

| Route                                 | Purpose                |
| ------------------------------------- | ---------------------- |
| `/pwa/scan/sos`                       | SOS entry              |
| `/pwa/scan/sos/holding`               | 4-second hold progress |
| `/pwa/scan/sos/allow-location`        | Location permission    |
| `/pwa/scan/sos/leave-confirm`         | Leave confirmation     |
| `/pwa/scan/sos/scene-photos`          | Photo capture          |
| `/pwa/scan/sos/scene-photos/captured` | Review captured        |
| `/pwa/scan/sos/location-unavailable`  | No location            |
| `/pwa/scan/sos/sending`               | Dispatch in progress   |
| `/pwa/scan/sos/couldnt-send`          | Send failed            |
| `/pwa/scan/sos/help-received`         | Help acknowledged      |
| `/pwa/scan/sos/help-dispatched`       | Dispatched             |
| `/pwa/scan/sos/resolved`              | Resolved               |
| `/pwa/scan/sos/alert-cancelled`       | Cancelled              |
| `/pwa/scan/sos/contacts-only`         | Contacts notified only |

**Park Me flow** (auth required):

| Route                                 | Purpose             |
| ------------------------------------- | ------------------- |
| `/pwa/scan/park-me/vehicle-number`    | Enter plate         |
| `/pwa/scan/park-me/looking-up`        | Lookup              |
| `/pwa/scan/park-me/confirm`           | Confirm vehicle     |
| `/pwa/scan/park-me/confirm-protected` | Protected confirm   |
| `/pwa/scan/park-me/permissions`       | Location permission |
| `/pwa/scan/park-me/photos`            | Photo capture       |
| `/pwa/scan/park-me/review`            | Review photos       |
| `/pwa/scan/park-me/status/checking`   | Checking            |
| `/pwa/scan/park-me/status/calling`    | Calling owner       |
| `/pwa/scan/park-me/status/resolved`   | Resolved            |
| `/pwa/scan/park-me/photo-not-clear`   | Retake prompt       |

---

## 4. Session Model

### 4.1 Storage

| Key                | Store            | Contents                                                 |
| ------------------ | ---------------- | -------------------------------------------------------- |
| `al-journey-v1`    | `sessionStorage` | Full `PersistedJourneyState` (flow, authStatus, session) |
| `al-selected-flow` | `localStorage`   | Last selected `ActivationFlowId`                         |
| `al-qr-theme`      | `localStorage`   | `'dark'` \| `'light'`                                    |
| `al-pwa-scan-v1`   | `sessionStorage` | PWA scan context                                         |

### 4.2 JourneySession Shape

```typescript
JourneySession = {
  auth?: {
    mobile?: string;
    mobileDisplay?: string;
    consentAccepted?: boolean;
    otpVerified?: boolean;
    ownerName?: string;
  };
  vehicle?: {
    plate?: string;
    fields?: AlVehicleRcField[];
    fetchStatus?: 'idle' | 'fetching' | 'success' | 'not-found' | 'error';
    confirmed?: boolean;
  };
  purchase?: {
    selectedPlanId?: 'safe' | 'secure' | 'shield' | 'shield-plus';
    riderCount?: 0 | 1 | 2;
    promoCode?: string | null;
    promoApplied?: boolean;
    promoInvalid?: boolean;
    checkoutReady?: boolean;
    paymentStatus?: 'idle' | 'processing' | 'confirming' | 'success' | 'failed' | 'unconfirmed';
    paidAmountInr?: number;
  };
  prepaid?: PrepaidLandingSession;
  b2b2c?: B2b2cLandingSession;
  emergency?: {
    riderSkipped?: boolean;
    rider?: EmergencyRider;
    riders?: EmergencyRider[];
    contactDraft?: EmergencyContactDraft;
    contacts?: EmergencyContact[];
    riderPromptLoadFailed?: boolean;
  };
}
```

### 4.3 JourneyPhase State Machine

```
home → flow-select → shared-auth → activation → emergency → completed
```

- `setPhase()` is called at Bootstrap entry of each route segment
- Phase drives UI chrome (progress bars, step indicators)

---

## 5. Flow Relationships

```
/journey  (FlowEntryScreen)
    │
    ├── Purchase  ──► Auth (mobile → otp → name) ──► R03–R10 ──► Emergency (E0→E5) ──► Completed
    │
    ├── Prepaid   ──► PrepaidWelcome ──► Auth ──► Emergency (E0→E5) ──► Completed
    │
    └── B2B2C     ──► PartnerWelcome ──► Auth ──► Emergency (R0→R4→E0→E5) ──► Completed

/pwa/scan  (PwaScanRoutes — no JourneyProvider)
    ├── SOS   ──► hold → location → photos → dispatch → resolution
    └── Park Me ──► auth → vehicle → photos → send → status
```

---

## 6. Route Guards

| Guard                      | Rule                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `RequireAuthCompleted`     | Redirects to `auth/mobile` if `authStatus !== AUTH_COMPLETED` |
| `RequireSelectedFlow`      | Redirects to `auth/mobile` or activation if no flow selected  |
| `RequireSelectedFlowMatch` | Redirects if `selectedFlow !== expected flow`                 |

---

## 7. Design System — `@autolokate/design-system`

Tokens exported from `packages/design-system/src/index.ts`:

- **Colors:** `brand`, `colorPrimitives`, `colors`, `gradients`, `neutral`, `semanticDark`, `semanticLight`, `signal`
- **Typography:** `fontFamily`, `textBody`, `textBodyLarge`, `textDisplay`, `textHeadline`, `textLabel`, `textMono`, `textTitle`, `typography`, `typographyPrimitives`
- **Spacing/Layout:** `border`, `elevation`, `layout`, `material`, `radius`, `shadow`, `space`, `spacing`
- **Motion:** `motion`, `motionDuration`, `motionEasing`, `motionScale`, `alAnimations`, `alMotionDurations`, `alMotionEasings`
- **Theme:** `applyTheme`, `getThemeMode`, `setThemeMode`, `theme`, `themes`, `ThemeMode`

**Theme:** Dark + Light. Set at `/journey` entry via `useThemeMode()`. Persisted in `al-qr-theme`.

---

## 8. Component Inventory — `@autolokate/ui`

### 8.1 Primitives

| Component                   | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `AlButton`                  | Primary, ghost, outline CTAs                                       |
| `AlIconButton`              | Icon-only button                                                   |
| `AlContainer`               | Max-width layout wrapper                                           |
| `AlDivider`                 | Horizontal/vertical rule                                           |
| `AlGrid`                    | CSS grid layout                                                    |
| `AlStack`                   | Flex stack layout                                                  |
| `AlText`                    | Body text with `tone` variants                                     |
| `AlHeading`                 | h1–h4 headings                                                     |
| `AlScreenBg`                | Screen background with variant                                     |
| `AlChip`                    | Small status/label chip                                            |
| `AlAvatar`                  | User avatar                                                        |
| `AlContactCard`             | Emergency contact card                                             |
| `AlStatusPill`              | Status badge pill                                                  |
| `AlScreenSpinner`           | Full-screen loading spinner                                        |
| `AlField`                   | Field label/value pair                                             |
| `AlQuickAction`             | Tappable quick action row                                          |
| `AlStepProgress`            | Step progress indicator                                            |
| `AlPlanCard`                | Plan selection card                                                |
| `AlVehicleRcCard`           | Vehicle RC details card                                            |
| `AlScannedVehicleCard`      | Scan result display only                                           |
| `AlVehicleConfirmationCard` | Scanner confirmation only — NOT for purchase RC confirm (promoted) |
| `AlStatusBar`               | Status bar display                                                 |
| `AlScannerHubCard`          | Scanner hub card                                                   |
| `AlDispatchTimeline`        | Incident dispatch timeline (promoted)                              |
| `AlStatusTracker`           | Status tracker (promoted)                                          |
| `AlScenePhotoCard`          | Scene photo card (promoted)                                        |
| `AlPhotoGrid`               | Photo grid layout (promoted)                                       |
| `AlSosHoldButton`           | SOS hold-to-activate button (promoted)                             |
| `AlPermissionSheet`         | Permission request sheet (promoted)                                |
| `AlIncidentStatusHero`      | Incident status hero (promoted)                                    |

### 8.2 Forms

| Component        | Purpose                         |
| ---------------- | ------------------------------- |
| `AlInput`        | Base input                      |
| `AlTextField`    | Text field with state           |
| `AlOtpInput`     | OTP digit input                 |
| `AlCheckbox`     | Checkbox                        |
| `AlToggle`       | Toggle switch                   |
| `AlPlateInput`   | Vehicle plate input (formatted) |
| `AlRelationGrid` | Relationship picker grid        |

### 8.3 Navigation

| Component     | Purpose               |
| ------------- | --------------------- |
| `AlBottomNav` | Bottom navigation bar |

### 8.4 Icons — `@autolokate/icons`

Exports: `AlIcon`, `AlIconName`, `IconSvg`, plus all generated icon components.

---

## 9. Promoted Components (used 2+ times — must not be duplicated)

Per project rule: if a component appears in 2+ places it must live in `@autolokate/ui`.

| Component                   | Package                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| `AlVehicleConfirmationCard` | `@autolokate/ui` — scanner confirmation only, not purchase RC confirm |
| `AlDispatchTimeline`        | `@autolokate/ui`                                                      |
| `AlIncidentStatusHero`      | `@autolokate/ui`                                                      |
| `AlPhotoGrid`               | `@autolokate/ui`                                                      |
| `AlScenePhotoCard`          | `@autolokate/ui`                                                      |
| `AlStatusTracker`           | `@autolokate/ui`                                                      |
| `AlPermissionSheet`         | `@autolokate/ui`                                                      |
| `AlSosHoldButton`           | `@autolokate/ui`                                                      |
| `AlScannedVehicleCard`      | `@autolokate/ui`                                                      |

---

## 10. Feature Registry

| Feature ID     | Flow ID     | Description                      |
| -------------- | ----------- | -------------------------------- |
| `shared-auth`  | `auth`      | Mobile, OTP, name capture        |
| `shared-legal` | `legal`     | Privacy + Terms readers          |
| `qr-purchase`  | `purchase`  | QR activation + plan + payment   |
| `qr-b2b`       | `b2b`       | Fleet B2B activation             |
| `qr-prepaid`   | `prepaid`   | Voucher-based pre-paid B2B       |
| `qr-b2b2c`     | `b2b2c`     | Partner-bridge activation        |
| `emergency`    | `emergency` | Emergency contacts + rider addon |

---

## 11. Current Implementation Status

### Signoff status per area (as of 2026-06-19 — full reconstruction audit)

| Area                | Status             | Notes                                                             |
| ------------------- | ------------------ | ----------------------------------------------------------------- |
| Auth (A1–A3)        | CONDITIONAL (~89%) | All verified correct this session; L1/L2 legal routes P2 only     |
| Purchase (R03–R10c) | CONDITIONAL (~93%) | All P0s resolved; R07/R08d cosmetic P2 gaps remain                |
| Emergency (E01–E10) | CONDITIONAL (~91%) | E0 trust row fixed; all 19 frames wired; P2 gaps only             |
| B2B2C               | ~95% parity        | 4 frames verified correct (plan-only, plan-rider, loading, error) |
| Prepaid             | ~95% parity        | 1 frame verified correct                                          |
| Post-Activation PWA | V4 Signoff (~96%)  | All 30 frames wired; CSS tokens fixed (C1)                        |

### P0 gaps resolved this session (2026-06-19)

- ✅ R08c / R09b / R10c — implemented and mounted in PurchaseRoutes
- ✅ Post-payment back guards — `redirectIfPaymentSucceeded` active R03–R09b
- ✅ R10 Continue → Emergency wired (`setPhase('emergency')`)
- ✅ PWA SOS CSS — 5 hardcoded hex colours replaced with design tokens
- ✅ E0 trust row — moved inside EmptyStateHero children for correct centred grouping

### Remaining gaps (P2 — non-blocking)

1. **Auth:** L1/L2 legal screens not full routes — linked text only (known exception)
2. **Purchase:** R07 extra plan-context line; R08d no-rider path shows promo field
3. **Emergency:** E2/R2 Change link — flex row adaptation (vs Figma absolute) — accepted
4. **Legacy orphan routes:** P01–P06 screens exist in `qr-purchase/screens/p01–p06` but are not in the active route graph

---

## 12. Known Constraints (Never Change Without Explicit Instruction)

- **Journey phase order:** `home → flow-select → shared-auth → activation → emergency → completed`
- **Purchase route sequence:** R03 → R04 → R05 → R06 → R07 → R08 → R09 → R10 → Emergency
- **Emergency handoff:** Purchase always enters emergency at `contacts-empty` (not `rider-prompt`)
- **Auth completion:** routes to `vehicle-owner` screen, not directly to activation
- **Session persistence:** `sessionStorage` for journey, `localStorage` for flow selection + theme
- **PWA session:** `PwaScanProvider` + `al-pwa-scan-v1` — separate from journey emergency/purchase state; root `AutolokateRootProvider` wraps both segments
- **SOS hold interaction:** 4000ms hold required — tap must never trigger SOS
- **Plan limits:** defined only in `emergency-limits.ts` — not duplicated in UI

---

## 13. Figma Rules

- Pixel-to-pixel parity is the only standard
- Figma is the single source of truth for all UI
- Never approximate, simplify, or invent UI not in Figma
- Export all assets from Figma — no placeholders
- Never add: mobile status bar, network indicator, battery indicator, carrier text, fake device chrome
- Match: spacing, typography, icons, cards, heroes, chips, CTAs, loaders, all states

---

## 14. QA Rules

**Widths to verify:** 320, 360, 375, 390, 393, 414  
**Themes to verify:** Dark + Light  
**Always verify:** icon alignment, icon padding, card spacing, CTA spacing, hero spacing, timeline spacing, safe areas, responsive layouts

**Animation rules:**

- No flicker, no opacity flash, no layout jumps
- Use: subtle scale, hero reveal, CTA reveal, timeline progression, hold progress
- Premium motion only

**Code quality rules:**

- No console errors
- No TypeScript errors
- No React warnings
- No dead routes
- No unused exports

---

## 15. Active Document References

Long-term source-of-truth documents live in **`docs/`** root. All intermediate audit, parity, recovery, and signoff reports are in **`docs/archive/`**.

| Document                        | Role                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `PROJECT_STATUS.md`             | Current status — this file                              |
| `VISUAL_TRUTH_MATRIX_V2.md`     | Visual verification matrix — **PIXEL PERFECT VERIFIED** |
| `FINAL_THEME_SIGNOFF.md`        | Theme parity signoff                                    |
| `FINAL_PRODUCTION_READINESS.md` | Production readiness                                    |
| `CLAUDE_PROJECT_INDEX.md`       | Architecture index — this file                          |
| `memory/MEMORY.md`              | Agent memory + doc map                                  |

**Visual evidence (post-consolidation):**

| Path                                  | Contents                              |
| ------------------------------------- | ------------------------------------- |
| `docs/visual-truth/samples/`          | 10 representative 393px PNG           |
| `docs/visual-truth/completed/`        | Completed screen before/after + Figma |
| `docs/archive/visual-truth-metadata/` | capture-manifest, measurements JSON   |

**Historical reports:** `docs/archive/` (185+ files, including prior signoffs, audits, and `THEMING.md`)

> Re-run captures: `apps/qr/scripts/recapture-completed-screens.mjs` (Completed only) or `visual-truth-capture.mjs` (full matrix)
