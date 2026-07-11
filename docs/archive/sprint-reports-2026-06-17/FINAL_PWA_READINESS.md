# Final PWA Readiness — Autolokate

**Date:** 2026-06-17  
**Audit type:** Real Device PWA Readiness (static codebase audit + platform mapping)  
**Scope:** `apps/qr` — install layer, permissions, flows, UX  
**Constraints honored:** No flow, business rule, or architecture changes made  

---

## Final Verdict

# ISSUES FOUND

The Autolokate app is **not production-ready as an installable Progressive Web App** on real mobile devices. Core **in-browser** activation and post-activation flows (SOS, Park Me) are **implemented in code** and align with prior pixel-parity signoff, but **PWA install infrastructure is absent** and **no physical device test pass was executed** in this audit.

---

## Verdict Matrix

| Dimension | Result | Notes |
|-----------|--------|-------|
| **PWA install (manifest, SW, icons)** | **FAIL** | Blockers — see P0 list |
| **Offline / cache / updates** | **FAIL** | No service worker |
| **Permissions (geo, camera)** | **PARTIAL** | Code complete; device QA pending; no Settings recovery |
| **Device contacts / notifications / mic** | **N/A** | Not in product |
| **Activation flows (4 entries)** | **CODE READY** | Purchase, Prepaid, B2B2C, post-activation |
| **SOS special check** | **CODE READY** | Location, camera, contacts-only — **needs real device** |
| **Park Me special check** | **CODE READY** | Permission sheet mismatch noted |
| **Mobile UX (keyboard, OTP, safe area)** | **PARTIAL** | P0 input fixes in place; `viewport-fit=cover` missing |
| **Real device execution** | **NOT DONE** | Matrix prepared for QA |

---

## P0 Blockers (Install & Launch)

These must ship before claiming **PRODUCTION READY** as a PWA:

| # | Blocker | Evidence |
|---|---------|----------|
| 1 | **No web app manifest** | Zero manifest files; no `<link rel="manifest">` |
| 2 | **No service worker** | No registration, no Workbox/vite-plugin-pwa |
| 3 | **No PWA icons** | No `public/` folder; brand SVGs only — no 192/512/maskable PNG |
| 4 | **No iOS web app meta** | Missing `apple-mobile-web-app-*`, touch icon |
| 5 | **No theme-color** | OS chrome not themed |
| 6 | **No offline fallback** | Airplane mode = total failure |

---

## P1 Issues (UX on Real Devices)

| # | Issue | Impact |
|---|-------|--------|
| 1 | **`viewport-fit=cover` missing** | Safe-area CSS may not apply on notched iPhones in standalone |
| 2 | **Park Me permission sheet** | Promises camera + location; only requests camera via `getUserMedia` |
| 3 | **No permission Settings recovery** | Blocked geo/camera requires manual OS settings — no in-app guide |
| 4 | **No real device sign-off** | SOS hold, camera intent, geo deny paths unverified on hardware |
| 5 | **sessionStorage-only sessions** | Kill tab / reboot = lost progress (by design, but affects “returning user”) |

---

## P2 Observations (Non-blocking)

| Item | Detail |
|------|--------|
| No `beforeinstallprompt` UX | Optional Android enhancement |
| No Universal Links / App Links | Deep links open in browser |
| Photo quota in sessionStorage | Diagnostic logging exists; edge case on low storage |
| Demo backend timers | VAHAN/dispatch not live — expected for demo |
| Bundle size ~1.08 MB JS | Documented in prior verification |

---

## What Works (Code-Level Confidence)

Based on source review and prior **PIXEL PERFECT / VERIFIED** signoffs:

### Flows

| Flow | Entry | Status |
|------|-------|--------|
| Consumer QR + Purchase | `/journey` → purchase | Routes + session wired |
| B2B Prepaid | `/journey` → prepaid | Welcome + auth + emergency |
| B2B2C Partner | `/journey` → b2b2c | Partner welcome path |
| QR Scan post-activation | `/journey` → postActivation → `/pwa/scan/*` | 30 routes, hub + verify + branches |

### Permissions (in-browser)

| API | Used where | Deny handling |
|-----|------------|---------------|
| `navigator.geolocation` | Park Me photos, SOS allow | Unavailable screen, contacts-only |
| File capture + `getUserMedia` | Park Me/SOS photos, preflight | Cancel/error paths |
| Manual emergency phones | Activation E02/E06 | Validation only |
| `tel:112` | SOS emergency | Native dialer link |

### Mobile UX

| Feature | Implementation |
|---------|----------------|
| OTP numeric keyboard | `inputMode="numeric"`, `pattern="[0-9]*"` |
| OTP SMS autofill | `autoComplete="one-time-code"` |
| Input zoom prevention | ≥20px on mobile fields |
| Safe area padding | `env(safe-area-inset-*)` in shells |
| Tap flash reset | `interaction-reset.css` |

### State

| Key | Storage | Survives refresh |
|-----|---------|------------------|
| `al-journey-v1` | sessionStorage | Same tab |
| `al-pwa-scan-v1` | sessionStorage | Same tab |
| `al-qr-theme` | localStorage | Yes |
| `al-selected-flow` | localStorage | Yes |

---

## Device Coverage Summary

| Device / Browser | In-browser flows | Installable PWA |
|------------------|------------------|-----------------|
| Android Chrome | CODE — QA pending | **NOT READY** |
| Samsung Internet | CODE — QA pending | **NOT READY** |
| iPhone Safari | CODE — QA pending | **NOT READY** |
| iPhone Chrome | CODE — QA pending | **NOT READY** |

---

## Special Check — SOS / Location / Camera / Contacts

| Check | Code | Real device |
|-------|------|-------------|
| SOS hold + dispatch UI | YES | **Required** |
| Location grant | YES | **Required** |
| Location deny → unavailable | YES | **Required** |
| Contacts-only branch | YES (in-app) | **Required** |
| Scene camera capture | YES | **Required** |
| Native device contacts | **NO** — not product scope | N/A |

**Important:** “Contacts” = **owner emergency contacts (demo dispatch)**, not phone address book access.

---

## Relationship to Prior Signoffs

| Document | Verdict | This audit |
|----------|---------|------------|
| `FINAL_PRODUCTION_READINESS.md` | READY WITH KNOWN GAPS | Consistent — demo deployment OK |
| `POST_ACTIVATION_PARITY_REPORT.md` | 94% parity; SW gap noted | Confirmed |
| Unified PWA Phase 1 verification | VERIFIED (provider/dispatcher) | No conflict — orthogonal to install layer |

**Distinction:** The repo is **demo-production-ready as a mobile web SPA**. It is **not PWA-install-production-ready**.

---

## Path to PRODUCTION READY (PWA)

Recommended sequence (implementation — out of scope for this audit):

1. Add `apps/qr/public/` with icons (192, 512, maskable, apple-touch-icon, favicon).
2. Add `manifest.webmanifest` (`name`, `short_name`, `start_url`, `scope`, `display: standalone`, `theme_color`, `background_color`, icons).
3. Integrate `vite-plugin-pwa` (or equivalent) — app shell precache + offline fallback page.
4. Update `index.html`: manifest link, theme-color, Apple meta, `viewport-fit=cover`.
5. Optional: `beforeinstallprompt` deferred prompt on `/journey`.
6. Run **REAL_DEVICE_TEST_MATRIX.md** on Android Chrome + iPhone Safari — mark PASS.
7. Lighthouse PWA audit ≥ 90 on production URL.

---

## Deliverables Index

| Document | Purpose |
|----------|---------|
| [PWA_INSTALL_AUDIT.md](./PWA_INSTALL_AUDIT.md) | Manifest, SW, icons, install, offline |
| [PERMISSION_AUDIT.md](./PERMISSION_AUDIT.md) | Camera, geo, deny/block matrix |
| [REAL_DEVICE_TEST_MATRIX.md](./REAL_DEVICE_TEST_MATRIX.md) | Full QA matrix by device |
| [IOS_AUDIT.md](./IOS_AUDIT.md) | Safari / Chrome iOS specifics |
| [ANDROID_AUDIT.md](./ANDROID_AUDIT.md) | Chrome / Samsung specifics |
| **FINAL_PWA_READINESS.md** | This document |

---

## Sign-Off Statement

| Role | Status |
|------|--------|
| PWA install layer | **NOT APPROVED** |
| In-browser mobile flows | **CONDITIONAL** — pending real device QA |
| Architecture / flows / business rules | **UNCHANGED** (audit only) |

**Final verdict: ISSUES FOUND**

Do not mark **PRODUCTION READY** for real-device PWA until P0 blockers are resolved and SOS/Park Me paths pass manual QA on Android Chrome and iPhone Safari.
