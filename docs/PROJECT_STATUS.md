# Autolokate Onboarding — Project Status

**Last updated:** 2026-06-17 (Project lockdown — **BASELINE LOCKED**)  
**Source of truth priority:** Figma → `VISUAL_TRUTH_MATRIX_V2.md` → **`PROJECT_CHARTER.md`** → `ARCHITECTURE_PRINCIPLES.md` → `DEVELOPMENT_STANDARDS.md` → `PROJECT_STATUS.md` → `docs/archive/`

---

## Baseline Status

# BASELINE LOCKED

Effective **2026-06-17**. This implementation is the **reference architecture** for all future Autolokate work.

| Domain       | Status                                               |
| ------------ | ---------------------------------------------------- |
| UI / Figma   | PIXEL PERFECT VERIFIED                               |
| Architecture | Locked — see `ARCHITECTURE_PRINCIPLES.md`            |
| Engineering  | READY WITH KNOWN GAPS — see `FINAL_SANITY_REPORT.md` |
| Device QA    | Pending — see `REAL_DEVICE_EVIDENCE_REPORT.md`       |

Permanent charter: `PROJECT_CHARTER.md` · `ARCHITECTURE_PRINCIPLES.md` · `DEVELOPMENT_STANDARDS.md`

---

## What This Repo Is

**Not the Consumer App.**

This repo is the **Autolokate Onboarding + Activation + Post-Activation PWA** only:

- Consumer QR onboarding (Purchase, Prepaid, B2B2C flows)
- Shared Auth (Mobile → OTP → Vehicle owner name)
- Emergency + Rider contact setup
- Post-Activation PWA (SOS Emergency, Park Me)

**Journey entry:** `/journey` (QR query dispatch via `?type=…`)  
**PWA entry:** `/pwa/scan/*` — separate `PwaScanContext` session; shares `AutolokateRootProvider` shell with journey

---

## Current Flows

| Flow                    | Entry                                          | Status              |
| ----------------------- | ---------------------------------------------- | ------------------- |
| **Purchase**            | `/journey` → Auth → R03–R10 → Emergency        | PIXEL PERFECT       |
| **Prepaid**             | `/journey` → PrepaidWelcome → Auth → Emergency | Active / Functional |
| **B2B2C**               | `/journey` → PartnerWelcome → Auth → Emergency | Active / Functional |
| **Emergency**           | After activation (all flows)                   | PIXEL PERFECT       |
| **Auth (Shared)**       | `/journey/auth/*`                              | PIXEL PERFECT       |
| **Post-Activation PWA** | `/pwa/scan/*`                                  | PIXEL PERFECT       |

---

## Signoff Status by Area

### Auth — PIXEL PERFECT

- **Latest signoff:** `AUTH_FIGMA_PARITY_SIGNOFF.md` (2026-06-17) · pixel-perfect pass 2026-06-19
- **Pixel Perfect Audit:** `PIXEL_PERFECT_AUDIT.md` (2026-06-19)
- **Verdict:** PIXEL PERFECT — A2 OTP desc color drift closed (was gray, Figma=white)
- **Figma section:** `91:268` · Shared · Auth + Legal
- **What's done:** A1/A2/A3 fully verified against Figma this session. Title, description, CTA, InlineConsentBlock, TrustRow, AlOfflineChip, OTP amber border, AlSmsFallback, Change link — all match.
- **Open gaps (P2 only):**
  - L1/L2 legal screens not implemented as standalone routes — linked text only (known exception)
  - Splash screen deprecated — redirects to Mobile (correct, intentional)

### Purchase — PIXEL PERFECT

- **Latest signoff:** `PURCHASE_FINAL_SIGNOFF.md` (2026-06-17) · pixel-perfect pass 2026-06-19
- **Pixel Perfect Audit:** `PIXEL_PERFECT_AUDIT.md` (2026-06-19)
- **Fix Report:** `PIXEL_PERFECT_FIX_REPORT.md` (2026-06-19)
- **Full audit:** `SCREEN_PARITY_MATRIX.md` (2026-06-19)
- **Figma section:** `167:434` · Consumer · QR Activation + Purchase
- **Terminal screen:** R10 / R10b / R10c — purchase ends here
- **Archived:** R14 Permissions, R15 Activation Complete — **do not restore**
- **Resolved since 2026-06-18:**
  - ✅ R08c, R09b, R10c — all implemented and mounted
  - ✅ Post-payment browser-back guards (`redirectIfPaymentSucceeded`) — active in R03–R09b
  - ✅ R10 Continue → Emergency (`setPhase('emergency')`) — wired
- **Open gaps (P2 only):**
  - R07: extra plan-context line not in Figma `186:25`
  - R08d: no-rider path still shows promo field (Figma `648:2053` hides it)
  - Orphan screens: P01–P06 exist in code, not in active route graph

### Emergency — PIXEL PERFECT

- **Latest signoff:** `EMERGENCY_FINAL_SIGNOFF.md` (2026-06-18) · pixel-perfect pass 2026-06-19
- **Pixel Perfect Audit:** `PIXEL_PERFECT_AUDIT.md` (2026-06-19)
- **Figma section:** `371:1275` · Emergency + Rider
- **What's done:** All 19 Figma frames have code paths. Plan limits correct. Core navigation wired.
- **Fixed in pixel-perfect pass (2026-06-19):**
  - ✅ E0 trust row gap: 8px → 6px
  - ✅ E0 hero message: 16px/400 (AlText body) → 15px/600 per Figma
  - ✅ E0 state panel gap: 16px → 14px
  - ✅ E0/R0 footer secondary link line-height: 20px → 17px
  - ✅ E0/R0 footer secondary link text-decoration: underline → none
  - ✅ E5 AddContactRow label: 15px/500 → 14px/600/17px lh
- **Open gaps (P2 only):**
  - E2/R2 OTP: Change link is flex row (vs Figma absolute) — accepted web adaptation
- **Plan limits (locked):**
  - safe: 1 contact, 0 riders
  - secure: 2 contacts, 2 riders
  - shield: 3 contacts, 2 riders
  - shield+: 3 contacts, 2 riders

### Post-Activation PWA — PIXEL PERFECT

- **Latest signoff:** `POST_ACTIVATION_FINAL_SIGNOFF_V4.md` + PWA Pixel Perfect Pass 2026-06-20
- **All 30 frames wired and signed off**
- SOS: hold required (4000ms) — tap must never trigger
- Park Me: auth required, location must never be hardcoded
- **Fixed in PWA pixel-perfect pass (2026-06-20):**
  - ✅ Systematic heading drift: all 23 `variant="h1"` (36px) → `variant="h2"` (28px) across PWA routes
  - ✅ Status hero/spinner lh: added `line-height: 44px` overrides for screens 01, 07, 16, 17, 18, 19, 22
  - ✅ SOS sending heading lh: `line-height: 44px` override
  - ✅ PWA subtitle typography: 15px/18lh for status-timeline and scene-photos screens; 16px/24lh reset for form screens; 19px lh for confirm screen
  - ✅ Hub section heading "What do you need?": CSS override 18px/600/22lh (vs h2 28px token)
  - ✅ Hub screen description line-height: 19px (Figma `400/16px/lh=19.4`)
  - ✅ Location chip token compliance: 3 hardcoded hex → design tokens
  - ✅ Call fallback lh: 18px → 17px in both `pwa-emergency-screen.css` and `pwa-scan.css`
  - ✅ Emergency subtitle: font-size 15px, line-height 18px
  - ✅ AlVehicleConfirmationCard: plate 15→18px/600→700/18→22lh; model+plate order swap; icon-well 40→44px/r10→r12; copy gap 2→8px; grid col 40→44px; SVG 18→22px
  - ✅ AlScannedVehicleCard: plate 15→18px/600→700/18→22lh; model+plate order swap; copy gap 4→8px; SVG 20→24px
  - ✅ AlPermissionSheet: title lh 26→24px; description lh 22→18px; secondary lh 20→18px
  - ✅ B2B2C/Welcome Activation: 8 line-height drifts closed across section-label, error-title, error-message, partner-subtitle, plan text elements
- **Open gaps (P2 only):**
  - PWA heading weight: Figma shows `600` but design system h2 token uses `700` — 1-level weight difference accepted

### Prepaid — Active

- Welcome screen wired at `/journey/prepaid/welcome`
- No purchase, no payment, no vehicle activation
- Routes to Emergency after auth

### B2B2C — Active

- Welcome screen at `/journey/b2b2c/welcome` (plan-only) and `/journey/b2b2c/welcome/plan-rider`
- No purchase, no payment, no vehicle activation
- Routes to Emergency after auth

---

## Known Decisions (Locked)

### Architecture — Never change without explicit instruction

- Journey phase order: `home → flow-select → shared-auth → activation → emergency → completed`
- Purchase route sequence: R03 → R04 → R05 → R06 → R07 → R08 → R09 → R10 → Emergency
- Emergency handoff from Purchase: always enters at `contacts-empty` (not `rider-prompt`)
- Auth completion: routes to `vehicle-owner`, not directly to activation
- Session persistence: `sessionStorage` for journey state, `localStorage` for flow selection + theme
- PWA session: `PwaScanProvider` + `al-pwa-scan-v1` — separate from journey emergency/purchase state
- Root shell: `AutolokateRootProvider` wraps both `/journey/*` and `/pwa/scan/*` (JourneyProvider + PwaScanProvider)
- iOS emergency contacts: no "Add from contacts" CTA — manual entry only (`device-contact-picker.ts`)
- Rider skip: confirmation sheet → `riderSkipped: true` → `/journey/completed` (skips emergency entirely)

### Archived — Do Not Restore

- **R14 Permissions:** archived
- **R15 Activation Complete:** archived
- **Splash screen:** deprecated, redirects to Mobile

### Component Ownership (Precise)

| Component                   | Correct usage                                           |
| --------------------------- | ------------------------------------------------------- |
| `AlVehicleConfirmationCard` | Scanner confirmation only — NOT for purchase RC confirm |
| `AlScannedVehicleCard`      | Scan result display only                                |
| `AlDispatchTimeline`        | Shared timeline primitive                               |
| `AlSosHoldButton`           | Single implementation — no alternates                   |

### Design Rules

- Status bar: **never render**
- Fake mobile chrome: **never render**
- Battery / network indicators: **never render**
- Language picker: removed
- Theme: Dark + Light — toggled at `/journey` only

### Default Mode

All future work follows the **charter priority order** (see `PROJECT_CHARTER.md`):

1. Preserve architecture
2. Preserve flow behavior
3. Preserve session behavior
4. Preserve component ownership
5. Preserve design system
6. Preserve Figma parity
7. Add new functionality

Do not redesign flows, business rules, or session architecture without explicit architecture approval.

---

## Latest Active Documents

| Document                            | Purpose                                            |
| ----------------------------------- | -------------------------------------------------- |
| **`PROJECT_CHARTER.md`**            | **Baseline lock + change control**                 |
| **`ARCHITECTURE_PRINCIPLES.md`**    | **Locked architecture reference**                  |
| **`DEVELOPMENT_STANDARDS.md`**      | **Engineering + PWA standards**                    |
| `FINAL_SANITY_REPORT.md`            | Latest engineering verdict — READY WITH KNOWN GAPS |
| `ENGINEERING_HARDENING_REPORT.md`   | Full hardening sprint audit                        |
| `VISUAL_TRUTH_MATRIX_V2.md`         | Visual source of truth — PIXEL PERFECT VERIFIED    |
| `FINAL_THEME_SIGNOFF.md`            | Dark + light theme signoff                         |
| `FINAL_PRODUCTION_READINESS.md`     | Production readiness baseline                      |
| `CLAUDE_PROJECT_INDEX.md`           | Route maps, architecture, component inventory      |
| `QR_ENTRY_STRATEGY.md`              | QR encoding for four flows                         |
| `IOS_CONTACT_SUPPORT_REPORT.md`     | iOS contact picker policy                          |
| `RIDER_SKIP_CONFIRMATION_REPORT.md` | Rider skip behaviour                               |
| `REAL_DEVICE_EVIDENCE_REPORT.md`    | Device matrix — no evidence attached               |
| `MEMORY_UPDATE_REPORT.md`           | Lockdown changelog                                 |
| `memory/MEMORY.md`                  | Agent memory index                                 |

Historical sprint reports: **`docs/archive/sprint-reports-2026-06-17/`** (46 files) + **`docs/archive/`** (231+ files)

Visual evidence samples: **`docs/visual-truth/samples/`** (10 PNG) · Completed reconstruction: **`docs/visual-truth/completed/`**

---

## Open Issues Summary

**No P0 or P1 issues remain.** All items below are P2 (non-blocking, visual refinement).

| Priority | Area          | Issue                                                                                 |
| -------- | ------------- | ------------------------------------------------------------------------------------- |
| ~~HIGH~~ | ~~Purchase~~  | ~~Post-payment browser-back guards missing~~ — **RESOLVED 2026-06-19**                |
| ~~HIGH~~ | ~~Auth~~      | ~~OTP screen A2 layout drift~~ — **VERIFIED CORRECT 2026-06-19**                      |
| ~~HIGH~~ | ~~Emergency~~ | ~~OTP screens R2/E2 layout drift~~ — **VERIFIED ACCEPTABLE 2026-06-19**               |
| ~~MED~~  | ~~Emergency~~ | ~~R0 offline chip placement + copy~~ — **RESOLVED (headerAccessory)**                 |
| ~~MED~~  | ~~Emergency~~ | ~~E0 trust row fixed position~~ — **RESOLVED 2026-06-19**                             |
| ~~MED~~  | ~~Purchase~~  | ~~R08c/R09b/R10c pixel gaps~~ — **RESOLVED (all implemented)**                        |
| ~~LOW~~  | ~~CSS~~       | ~~Hardcoded hex in pwa-emergency-screen.css~~ — **RESOLVED 2026-06-19**               |
| ~~MED~~  | ~~Purchase~~  | ~~R04b missing `redirectIfPaymentSucceeded` guard~~ — **FIXED 2026-06-20**            |
| ~~MED~~  | ~~PWA~~       | ~~ParkMe Permissions back target wrong for protected flow~~ — **FIXED 2026-06-20**    |
| P2       | Purchase      | R07 extra plan-context line not in Figma                                              |
| P2       | Purchase      | R08d no-rider path shows promo field (Figma hides it)                                 |
| P2       | Auth          | L1/L2 legal screens not full routes — linked text only                                |
| P2       | PWA           | Heading weight: h2 token=700, Figma=600 — design token constraint                     |
| LOW      | Purchase      | P01–P06 orphan screens in codebase, not in active route graph                         |
| LOW      | Codebase      | Auth dead code: AuthFlowApp, SharedAuthSegment — safe to delete                       |
| LOW      | Codebase      | PurchaseStepShell, HomeScreen, EmergencyPlaceholderScreen, QrScanRoute — orphan files |
| LOW      | Icons         | RetakeIcon inline in packages/ui — should be in @autolokate/icons pipeline            |

→ Open issues and decisions: `memory/MEMORY.md` · Full architecture: `CLAUDE_PROJECT_INDEX.md`

---

## Route Ownership Quick Reference

| Route segment          | Owner file                                              |
| ---------------------- | ------------------------------------------------------- |
| `/journey/auth/*`      | `journey/routes/AuthRoutes.tsx`                         |
| `/journey/purchase/*`  | `journey/routes/PurchaseRoutes.tsx`                     |
| `/journey/prepaid/*`   | `journey/routes/PrepaidRoutes.tsx`                      |
| `/journey/b2b2c/*`     | `journey/routes/B2b2cRoutes.tsx`                        |
| `/journey/emergency/*` | `journey/routes/EmergencyRoutes.tsx`                    |
| `/pwa/scan/*`          | `features/post-activation-pwa/routes/PwaScanRoutes.tsx` |

---

## Full Route Map and Architecture

→ See `CLAUDE_PROJECT_INDEX.md` for complete route maps, session model, component inventory, and design system reference.
