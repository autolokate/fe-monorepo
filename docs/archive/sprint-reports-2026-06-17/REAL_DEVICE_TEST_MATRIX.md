# Real Device Test Matrix

**Date:** 2026-06-17  
**App:** Autolokate Onboarding PWA (`apps/qr`)  
**Method:** Code-derived matrix + manual QA protocol  
**Legend:**  
- **CODE** — behavior implemented in source; not executed on hardware this pass  
- **PASS** — verified on real device (none marked PASS in this audit pass)  
- **FAIL** — confirmed broken or missing  
- **N/A** — not applicable  
- **BLOCK** — blocked by missing PWA layer or external dependency  

---

## Device × Browser Matrix

| Test area | Android Chrome | Samsung Internet | iPhone Safari | iPhone Chrome |
|-----------|----------------|------------------|---------------|---------------|
| Load `/journey` | CODE | CODE | CODE | CODE |
| Load `/pwa/scan/*` deep link | CODE | CODE | CODE | CODE |
| Install / A2HS | BLOCK | BLOCK | BLOCK | BLOCK |
| Standalone chrome | BLOCK | BLOCK | BLOCK | BLOCK |
| Session restore (refresh) | CODE | CODE | CODE | CODE |
| Safe area / notch | CODE | CODE | CODE* | CODE* |
| OTP numeric keyboard | CODE | CODE | CODE | CODE |
| OTP SMS autofill | CODE | CODE | CODE | CODE |
| Camera capture | CODE | CODE | CODE | CODE |
| Geolocation | CODE | CODE | CODE | CODE |
| SOS hold + dispatch | CODE | CODE | CODE | CODE |
| Park Me full branch | CODE | CODE | CODE | CODE |
| Back navigation | CODE | CODE | CODE | CODE |
| Offline / airplane mode | FAIL | FAIL | FAIL | FAIL |

\* iPhone: safe-area CSS requires `viewport-fit=cover` for full standalone effect — not in `index.html`.

---

## PWA Install & Shell

| ID | Test case | Android Chrome | Samsung | iPhone Safari | iPhone Chrome | Notes |
|----|-----------|----------------|---------|---------------|---------------|-------|
| PWA-01 | Manifest present | BLOCK | BLOCK | BLOCK | BLOCK | No manifest file |
| PWA-02 | Install prompt / banner | BLOCK | BLOCK | N/A | N/A | No SW + manifest |
| PWA-03 | Add to Home Screen | BLOCK | BLOCK | BLOCK | BLOCK | No apple meta/icons |
| PWA-04 | Standalone (no URL bar) | BLOCK | BLOCK | BLOCK | BLOCK | |
| PWA-05 | App icon on launcher | BLOCK | BLOCK | BLOCK | BLOCK | No PNG icons |
| PWA-06 | Splash on cold start | BLOCK | BLOCK | BLOCK | BLOCK | |
| PWA-07 | Theme color in status bar | BLOCK | BLOCK | BLOCK | BLOCK | |
| PWA-08 | Offline open installed app | FAIL | FAIL | FAIL | FAIL | No SW |
| PWA-09 | SW update after deploy | FAIL | FAIL | FAIL | FAIL | No SW |

---

## Permissions

| ID | Test case | Android Chrome | Samsung | iPhone Safari | iPhone Chrome |
|----|-----------|----------------|---------|---------------|---------------|
| PERM-01 | Geo prompt on SOS allow | CODE | CODE | CODE | CODE |
| PERM-02 | Geo prompt Park Me photos | CODE | CODE | CODE | CODE |
| PERM-03 | Geo denied → unavailable UI | CODE | CODE | CODE | CODE |
| PERM-04 | Geo blocked → retry | CODE | CODE | CODE | CODE |
| PERM-05 | Settings recovery link | FAIL | FAIL | FAIL | FAIL |
| PERM-06 | Camera via file capture | CODE | CODE | CODE | CODE |
| PERM-07 | Park Me getUserMedia preflight | CODE | CODE | CODE | CODE |
| PERM-08 | Device contacts picker | N/A | N/A | N/A | N/A |
| PERM-09 | Push notifications | N/A | N/A | N/A | N/A |
| PERM-10 | Microphone | N/A | N/A | N/A | N/A |
| PERM-11 | Clipboard API | N/A | N/A | N/A | N/A |
| PERM-12 | tel:112 dialer | CODE | CODE | CODE | CODE |

---

## Activation Flows (Consumer QR)

Entry: `/journey` → four cards via `FLOW_ENTRY_REGISTRY`.

| ID | Flow | Steps (high level) | All devices |
|----|------|-------------------|-------------|
| ACT-01 | **Purchase** | Card → Auth (mobile → OTP → name) → R03–R10 → Emergency | CODE |
| ACT-02 | **Prepaid (B2B)** | Prepaid welcome → Auth → Emergency | CODE |
| ACT-03 | **B2B2C** | Partner welcome → Auth → Emergency | CODE |
| ACT-04 | **Post-Activation QR** | Card → `/pwa/scan/loading` → vehicle hub | CODE |

| ID | Cross-cutting | Status |
|----|---------------|--------|
| ACT-05 | Flow selection persisted (`al-selected-flow`) | CODE |
| ACT-06 | Journey session persist (`al-journey-v1`) | CODE |
| ACT-07 | Theme persist (`al-qr-theme`) | CODE |
| ACT-08 | Logged-out / fresh session | CODE |
| ACT-09 | Mid-flow refresh restore | CODE |
| ACT-10 | Phone restart (sessionStorage cleared) | CODE — expect fresh session |

---

## Post-Activation QR Scan

| ID | Branch | Key routes | Status |
|----|--------|------------|--------|
| SCAN-01 | Bootstrap / loading | `/pwa/scan/loading` | CODE |
| SCAN-02 | Vehicle hub | `/pwa/scan/vehicle` | CODE |
| SCAN-03 | Verify gate | verify mobile + consent | CODE |
| SCAN-04 | Park Me E2E | confirm → permissions → photos → sending → tracker | CODE |
| SCAN-05 | SOS E2E | hold → allow location → photos → sending → status | CODE |
| SCAN-06 | Protected vs plain vehicle | 08 / 08b confirm variants | CODE |
| SCAN-07 | PWA session persist (`al-pwa-scan-v1`) | CODE |
| SCAN-08 | Photo quota / sessionStorage limit | CODE — diagnostic logging |

---

## User States

| ID | State | Expected | Code | Device QA |
|----|-------|----------|------|-----------|
| ST-01 | First visit (no storage) | Default session, flow entry | CODE | Pending |
| ST-02 | Fresh install (PWA) | N/A until install layer | BLOCK | Pending |
| ST-03 | Returning user (same tab) | sessionStorage restore | CODE | Pending |
| ST-04 | Logged-out / cleared storage | Flow entry | CODE | Pending |
| ST-05 | Session restore mid-journey | Resume step from storage | CODE | Pending |
| ST-06 | App restart (kill browser) | sessionStorage lost on iOS/Android | CODE | Pending |
| ST-07 | Phone restart | All sessionStorage cleared | CODE | Pending |

---

## PWA UX

| ID | Test | Expected (code) | Device QA |
|----|------|-------------------|-----------|
| UX-01 | Standalone mode | BLOCK — no install | Pending |
| UX-02 | Safe area top/bottom | `env(safe-area-inset-*)` in shells | Pending |
| UX-03 | Keyboard covers input | `scroll-margin-block: 80px` on mobile field | Pending |
| UX-04 | Input zoom (iOS) | Mobile field 20px; OTP 22px (≥16px) | Pending |
| UX-05 | OTP autofill | `autoComplete="one-time-code"` cell 0 | Pending |
| UX-06 | Numeric keyboard OTP | `inputMode="numeric"` + `pattern="[0-9]*"` | Pending |
| UX-07 | Numeric keyboard mobile | `inputMode="numeric"` on A1 | Pending |
| UX-08 | Plate field keyboard | Alphanumeric (not forced numeric) | CODE |
| UX-09 | Camera launch | Hidden file input click | Pending |
| UX-10 | Location request timing | After user tap (not on mount) | CODE |
| UX-11 | Back navigation | Shell `showBack` + React Router | Pending |
| UX-12 | Deep links | `/journey/*`, `/pwa/scan/*` via Vercel rewrite | Pending |
| UX-13 | Tap highlight flash | P0 interaction-reset.css | Pending |

---

## Special Check — SOS (Real Device Required)

| ID | Check | SOS route | API | Code | Device |
|----|-------|-----------|-----|------|--------|
| SOS-01 | Hold-to-send progress | `sosHold` / 14b | rAF hold button | CODE | **Required** |
| SOS-02 | Location share | `sosAllowLocation` | geolocation | CODE | **Required** |
| SOS-03 | Location denied path | `sosLocationUnavailable` | — | CODE | **Required** |
| SOS-04 | Contacts-only branch | `sosContactsOnly` | In-app state | CODE | **Required** |
| SOS-05 | Scene photos (4-up) | `sosPhotos` | file capture | CODE | **Required** |
| SOS-06 | Cancel / leave confirm | `sosLeaveConfirm` | — | CODE | **Required** |
| SOS-07 | Emergency dial | tel:112 link | — | CODE | **Required** |

**Note:** “Contacts” in SOS = **dispatch to owner’s emergency contacts (demo)** — not device address book.

---

## Special Check — Park Me (Real Device Required)

| ID | Check | Code | Device |
|----|-------|------|--------|
| PM-01 | Permission sheet | CODE | **Required** |
| PM-02 | Two photo capture | CODE | **Required** |
| PM-03 | GPS + reverse geocode label | CODE | **Required** |
| PM-04 | Protected vehicle variant | CODE | **Required** |
| PM-05 | CC tracker timeline | CODE | **Required** |

---

## Execution Protocol (for QA team)

1. Deploy to Vercel staging/production (HTTPS).
2. Run **Android Chrome** + **iPhone Safari** as primary (P0).
3. Add **Samsung Internet** + **iPhone Chrome** for regression (P1).
4. For each row marked CODE: execute once, mark PASS/FAIL with build SHA + OS version.
5. Record screen capture for SOS hold, geo deny, camera capture.
6. Do **not** use desktop DevTools device emulation for SOS/PM sign-off.

### Suggested URLs

| Entry | URL pattern |
|-------|-------------|
| Flow hub | `https://<host>/journey` |
| PWA vehicle | `https://<host>/pwa/scan/vehicle` |
| SOS deep | `https://<host>/pwa/scan/sos` |
| Park Me | `https://<host>/pwa/scan/park-me/confirm` |

---

## Audit Pass Summary

| Category | CODE | FAIL | BLOCK | PASS (device) |
|----------|-----:|-----:|------:|--------------:|
| PWA install | 0 | 2 | 7 | 0 |
| Permissions | 9 | 1 | 0 | 0 |
| Flows | 18 | 0 | 0 | 0 |
| UX | 12 | 0 | 1 | 0 |
| **Total** | **39** | **3** | **8** | **0** |

**This audit pass did not execute hardware tests.** All CODE items require manual execution before production PWA sign-off.
