# Autolokate PWA — Project Charter

**Effective:** 2026-06-17  
**Status:** **BASELINE LOCKED**  
**Repository:** `autolokate-web` (QR PWA + Activation + Post-Activation)

---

## Purpose

This charter establishes the **Autolokate PWA implementation as the permanent reference baseline** for all future Autolokate work.

Future development must **build on top of this baseline** — not replace, redesign, or re-architect it without explicit approval.

---

## What This Repository Is

**Not the Consumer App.**

This monorepo delivers:

- Consumer QR onboarding (Purchase, Prepaid, B2B2C)
- Shared Auth (Mobile → OTP → Vehicle owner name)
- Emergency + Rider contact setup
- Post-Activation PWA (SOS Emergency, Park Me)

| Entry               | Path                             |
| ------------------- | -------------------------------- |
| QR journey          | `/journey/auth/mobile?qr_code=…` |
| Post-activation PWA | `/pwa/scan/*`                    |

**Deploy reference:** `https://qr-staging.autolokate.com`

---

## Baseline Signoffs

| Domain               | Verdict                       | Reference                       |
| -------------------- | ----------------------------- | ------------------------------- |
| Visual / Figma       | **PIXEL PERFECT VERIFIED**    | `VISUAL_TRUTH_MATRIX_V2.md`     |
| Theme                | Signed off                    | `FINAL_THEME_SIGNOFF.md`        |
| Engineering          | **READY WITH KNOWN GAPS**     | `FINAL_SANITY_REPORT.md`        |
| Production readiness | Demo-ready; device QA pending | `FINAL_PRODUCTION_READINESS.md` |

Known gaps (documented, not blockers for baseline lock):

- Real-device evidence not yet attached (`REAL_DEVICE_EVIDENCE_REPORT.md`)
- Bundle size optimization deferred (P2)
- Orphan legacy catalog screens retained (P3)

---

## Locked Areas

### 1. UI Lock

Current Figma parity implementation is the baseline.

**Do not change** spacing, typography, icon sizes, component layouts, button sizing, or screen structure **unless Figma changes**.

Figma is the single source of truth for all UI.

### 2. Flow Lock

**Do not modify** without explicit architecture approval:

- Purchase flow order (R03 → R10 → Emergency)
- Prepaid flow order
- B2B2C flow order
- Emergency flow order (R0 → E5)
- Post-Activation PWA flow order
- Journey orchestration (`JourneyOrchestrator`)
- `selectedFlow` logic
- QR dispatch logic (`parseQrFromSearchParams`, `dispatchQrPayload`)

### 3. Session Lock

**Do not modify** without migration planning:

- `JourneySession` schema (`journey/types.ts`)
- `PwaScanSession` schema (`features/post-activation-pwa/`)
- Storage keys (see `ARCHITECTURE_PRINCIPLES.md` § Session)
- Persistence model (`sessionStorage` journey, `localStorage` flow + theme)

### 4. Component Lock

All UI must come from:

- `@autolokate/ui`
- `@autolokate/icons`
- `@autolokate/design-system`

Never duplicate primitives listed in `DEVELOPMENT_STANDARDS.md` § Component Ownership.

If a pattern is reused 2+ times → promote to `@autolokate/ui`.

### 5. Import Lock

- Use `@/` alias and package imports
- No `../../../../` deep relative imports
- No circular imports

### 6. React Standards

See `DEVELOPMENT_STANDARDS.md` — strict typing, minimal effects, provider ownership, no `any`, no `@ts-ignore`.

### 7. PWA Standards

All future apps/modules must support before release:

- Web manifest
- Service worker
- Offline shell
- Install prompt (platform-appropriate)
- Safe areas
- Camera
- Location
- Permission recovery
- Theme persistence

---

## Default Priority Order

Future work must follow this order. **Never reverse it.**

1. Preserve architecture
2. Preserve flow behavior
3. Preserve session behavior
4. Preserve component ownership
5. Preserve design system
6. Preserve Figma parity
7. Add new functionality

---

## Reference for Future Autolokate Projects

Treat this repository as the **canonical implementation**. New projects should inherit:

| Area                    | Reference location                                             |
| ----------------------- | -------------------------------------------------------------- |
| Folder structure        | `apps/qr/src/`                                                 |
| Component ownership     | `packages/ui/`, `CLAUDE_PROJECT_INDEX.md` §8                   |
| Design system usage     | `packages/design-system/`                                      |
| Provider patterns       | `AutolokateRootProvider`, `JourneyProvider`, `PwaScanProvider` |
| Route organization      | `journey/routes/`, `features/post-activation-pwa/routes/`      |
| PWA architecture        | `pwa/`, `features/post-activation-pwa/`                        |
| Engineering standards   | `DEVELOPMENT_STANDARDS.md`                                     |
| Documentation standards | `memory/MEMORY.md`, truth hierarchy                            |

---

## Change Control

| Change type                    | Required approval                            |
| ------------------------------ | -------------------------------------------- |
| Figma-driven UI fix            | Design signoff + visual truth re-capture     |
| New screen in existing flow    | Architecture review + Figma node             |
| Flow order change              | Explicit architecture approval               |
| Session schema change          | Migration plan + version bump on storage key |
| New `@autolokate/ui` primitive | Component ownership review                   |
| Route graph change             | Architecture approval + regression checklist |

---

## Permanent Reference Documents

| Document                     | Role                                       |
| ---------------------------- | ------------------------------------------ |
| `PROJECT_CHARTER.md`         | This file — baseline lock + change control |
| `ARCHITECTURE_PRINCIPLES.md` | Locked architecture reference              |
| `DEVELOPMENT_STANDARDS.md`   | Engineering + PWA standards                |
| `CLAUDE_PROJECT_INDEX.md`    | Routes, session, components                |
| `PROJECT_STATUS.md`          | Live status and signoffs                   |
| `memory/MEMORY.md`           | Agent memory index                         |

---

## Final Verdict

# BASELINE LOCKED

The Autolokate PWA implementation is locked as the reference architecture effective 2026-06-17. All future work extends this baseline under the rules above.
