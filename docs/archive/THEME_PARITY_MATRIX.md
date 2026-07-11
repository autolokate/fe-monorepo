# Theme Parity Matrix

**Date:** 2026-06-17  
**Themes:** `data-theme="dark"` | `data-theme="light"` on `<html>`  
**Storage key:** `al-qr-theme`

Legend: **P** = Parity confirmed · **F** = Fixed this sprint · **A** = Accepted exception

---

## Component parity

| Component | Visual | Functional | State | Responsive | Dark | Light |
|-----------|--------|------------|-------|------------|------|-------|
| AlButton | P | P | P | P | ✅ | ✅ |
| AlInput / AlTextField | P | P | P | P | ✅ | ✅ |
| AlCheckbox | P | P | P | P | ✅ | ✅ |
| AlOtpInput | P | P | P | P | ✅ | ✅ |
| AlChip | P | P | P | P | ✅ | ✅ |
| AlStatusPill | P | P | P | P | ✅ | ✅ |
| AlPlanCard | F | P | P | P | ✅ | ✅ |
| AlVehicleRcCard | P | P | P | P | ✅ | ✅ |
| AlScannedVehicleCard | F | P | P | P | ✅ | ✅ |
| AlVehicleConfirmationCard | F | P | P | P | ✅ | ✅ |
| AlScannerHubCard | F | P | P | P | ✅ | ✅ |
| AlStatusTracker | F | P | P | P | ✅ | ✅ |
| AlDispatchTimeline | F | P | P | P | ✅ | ✅ |
| AlPhotoGrid | F | P | P | P | ✅ | ✅ |
| AlScenePhotoCard | F | P | P | P | ✅ | ✅ |
| AlPermissionSheet | F | P | P | P | ✅ | ✅ |
| AlIncidentStatusHero | F | P | P | P | ✅ | ✅ |
| AlSosHoldButton | F | P | P | P | ✅ | ✅ |
| AlScreenSpinner | F | P | P | P | ✅ | ✅ |
| Empty states (shell) | P | P | P | P | ✅ | ✅ |
| Error states (validation) | P | P | P | P | ✅ | ✅ |
| Success states (OTP/payment) | P | P | P | P | ✅ | ✅ |
| Loaders (spinners) | F | P | P | P | ✅ | ✅ |

---

## Flow parity — Shared Auth

| Screen ID | States | Dark | Light | Notes |
|-----------|--------|------|-------|-------|
| S0 | 1 | ✅ | ✅ | |
| A1 | 5 | ✅ | ✅ | |
| A2 | 8 | ✅ | ✅ | |
| A3 | 2 | ✅ | ✅ | |
| L1 | 1 | ✅ | ✅ | |
| L2 | 1 | ✅ | ✅ | |

---

## Flow parity — Purchase

| Screen ID | States | Dark | Light | Notes |
|-----------|--------|------|-------|-------|
| R03 | 4 | ✅ | ✅ | |
| R04 | 1 | ✅ | ✅ | |
| R04b | 1 | ✅ | ✅ | Halo icon tokenized |
| R05 | 1 | ✅ | ✅ | |
| R06 | 4 plans | ✅ | ✅ | Carousel glow F |
| R07 | 1 | ✅ | ✅ | Badge F |
| R08 | 1 | ✅ | ✅ | |
| R08b | 1 | ✅ | ✅ | |
| R08c | 1 | ✅ | ✅ | |
| R09 | 1 | ✅ | ✅ | |
| R09b | 1 | ✅ | ✅ | |
| R10 | 1 | ✅ | ✅ | Halo icon tokenized |
| R10b | 1 | ✅ | ✅ | |
| R10c | 1 | ✅ | ✅ | Halo icon tokenized |

---

## Flow parity — Emergency

| Screen ID | States | Dark | Light |
|-----------|--------|------|-------|
| E01 | 4 | ✅ | ✅ |
| E02 | 3 | ✅ | ✅ |
| E03 | 4 | ✅ | ✅ |
| E04 | 3 | ✅ | ✅ |
| E05 | 1 | ✅ | ✅ |
| E06 | 3 | ✅ | ✅ |
| E07 | 4 | ✅ | ✅ |
| E08 | 2 | ✅ | ✅ |
| E09 | 2 | ✅ | ✅ |
| E10 | 2 | ✅ | ✅ |

---

## Flow parity — Prepaid

| Screen ID | States | Dark | Light |
|-----------|--------|------|-------|
| PR01 | 4 | ✅ | ✅ |
| PR02 | 4 | ✅ | ✅ |
| PR03 | 4 | ✅ | ✅ |
| Prepaid welcome | 1 | ✅ | ✅ |

---

## Flow parity — B2B2C

| Screen | Variants | Dark | Light |
|--------|----------|------|-------|
| Partner welcome | plan-only, plan-rider | ✅ | ✅ |

---

## Flow parity — Completed

| Screen | Dark | Light |
|--------|------|-------|
| Journey completed | ✅ | ✅ |
| Completion experience | ✅ | ✅ |

---

## Flow parity — PWA (all routes)

| Route | Dark | Light |
|-------|------|-------|
| `/pwa/scan/loading` | ✅ | ✅ |
| `/pwa/scan/vehicle` | ✅ | ✅ F |
| `/pwa/scan/verify/mobile` | ✅ | ✅ |
| `/pwa/scan/verify/otp` | ✅ | ✅ |
| `/pwa/scan/verify/name` | ✅ | ✅ |
| `/pwa/scan/park-me/vehicle-number` | ✅ | ✅ |
| `/pwa/scan/park-me/looking-up` | ✅ | ✅ |
| `/pwa/scan/park-me/confirm` | ✅ | ✅ F |
| `/pwa/scan/park-me/confirm-protected` | ✅ | ✅ F |
| `/pwa/scan/park-me/permissions` | ✅ | ✅ F |
| `/pwa/scan/park-me/photos` | ✅ | ✅ F |
| `/pwa/scan/park-me/status/checking` | ✅ | ✅ F |
| `/pwa/scan/park-me/status/calling` | ✅ | ✅ F |
| `/pwa/scan/park-me/status/resolved` | ✅ | ✅ F |
| `/pwa/scan/park-me/photo-not-clear` | ✅ | ✅ F |
| `/pwa/scan/sos` | ✅ | ✅ F |
| `/pwa/scan/sos/holding` | ✅ | ✅ F |
| `/pwa/scan/sos/allow-location` | ✅ | ✅ F |
| `/pwa/scan/sos/leave-confirm` | ✅ | ✅ F |
| `/pwa/scan/sos/scene-photos` | ✅ | ✅ F |
| `/pwa/scan/sos/scene-photos/captured` | ✅ | ✅ F |
| `/pwa/scan/sos/location-unavailable` | ✅ | ✅ F |
| `/pwa/scan/sos/sending` | ✅ | ✅ F |
| `/pwa/scan/sos/couldnt-send` | ✅ | ✅ F |
| `/pwa/scan/sos/help-received` | ✅ | ✅ F |
| `/pwa/scan/sos/help-dispatched` | ✅ | ✅ F |
| `/pwa/scan/sos/resolved` | ✅ | ✅ F |
| `/pwa/scan/sos/alert-cancelled` | ✅ | ✅ F |
| `/pwa/scan/sos/contacts-only` | ✅ | ✅ F |

---

## Responsive × theme matrix

All flows above verified at:

| Width | Dark | Light |
|-------|------|-------|
| 320px | ✅ | ✅ |
| 360px | ✅ | ✅ |
| 375px | ✅ | ✅ |
| 390px | ✅ | ✅ |
| 393px | ✅ | ✅ |
| 414px | ✅ | ✅ |

Method: ScreenDevApp viewport toggles + PWA shell max-width / safe-area rules.

---

## Parity gaps (none blocking)

| Item | Type | Status |
|------|------|--------|
| Ambient shell rgba gradients | Visual nuance | A — primitive-based |
| SOS mask `#000` | Technical | A — not visible |
| Figma-exact px gaps | Layout | A — documented |

---

## Overall verdict

**THEME PARITY ACHIEVED** — visual, functional, state, and responsive parity for dark and light across all active screens.
