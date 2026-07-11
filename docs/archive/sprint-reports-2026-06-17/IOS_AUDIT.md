# iOS Audit — Autolokate PWA

**Date:** 2026-06-17  
**Browsers:** Safari (primary), Chrome (WebKit wrapper)  
**Method:** Static audit + iOS platform behavior mapping  
**Device QA executed:** No — checklist for manual validation

---

## Executive Summary

| Layer | Verdict |
|-------|---------|
| Mobile Safari (in-browser) | **Likely functional** for activation + SOS/Park Me — pending device QA |
| Installable PWA (A2HS + standalone) | **FAIL** — missing manifest, meta tags, icons |
| Permissions (camera, location) | **Code ready** — iOS-specific quirks documented below |
| Safe area / notch | **PARTIAL** — CSS present; `viewport-fit=cover` missing |

---

## Safari vs Chrome on iOS

Both use **WebKit**. Permission prompts, file input camera, and geolocation behave identically for practical QA purposes. Chrome on iOS does **not** enable separate install criteria — A2HS is still via Safari share sheet for best results.

| Feature | Safari | Chrome iOS |
|---------|--------|------------|
| Geolocation | WebKit prompt | Same |
| Camera (`capture=environment`) | Camera roll / camera | Same |
| `getUserMedia` preflight | Supported; user prompt | Same |
| PWA install | Share → Add to Home Screen | Limited; no Chrome install banner |
| Standalone | Requires meta tags + icon | Same when saved from Safari |
| sessionStorage | Tab-scoped; cleared when tab evicted | Same |

---

## Add to Home Screen (A2HS)

| Requirement | Status | Detail |
|-------------|--------|--------|
| `apple-mobile-web-app-capable` | FAIL | Not in `index.html` |
| `apple-mobile-web-app-title` | FAIL | Not set |
| `apple-mobile-web-app-status-bar-style` | FAIL | Not set |
| `apple-touch-icon` (180×180) | FAIL | No PNG in app |
| `link rel="manifest"` | FAIL | No manifest |
| Launch in standalone | **Untested** | Meta missing |

**Current behavior:** User can save bookmark to home screen; launch opens **Safari browser tab** with URL bar unless meta/icons added.

---

## Viewport & Safe Area

**Current viewport:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

| Item | Status |
|------|--------|
| `viewport-fit=cover` | FAIL — needed for notch/home indicator insets |
| `env(safe-area-inset-top/bottom)` in CSS | PASS — shells use insets |
| Fixed footers clearing home indicator | PASS — padding on scan shell, step chrome |

**Risk:** In standalone/A2HS without `viewport-fit=cover`, safe-area env vars may resolve to `0px` and content may sit under notch or home bar.

---

## Input & Keyboard (iOS)

| Input | Font size | Zoom on focus? | Keyboard |
|-------|-----------|----------------|----------|
| Auth mobile | 20px | No (≥16px) | Numeric (`inputMode="numeric"`) |
| OTP cells | 22px (1.375rem) | No | Numeric + `pattern="[0-9]*"` |
| OTP autofill | — | — | `autoComplete="one-time-code"` on first cell |
| Plate entry | Default TextField 20px | No | Alphanumeric (no forced numeric) |

**P0 fixes applied:** `interaction-reset.css`, OTP active cell styling, numeric keyboard patterns.

**Keyboard overlap:** `scroll-margin-block: 80px` on auth mobile input — verify on iPhone SE and Pro Max.

---

## Geolocation (iOS Safari)

| Behavior | Expected on device |
|----------|-------------------|
| First prompt | System dialog on user tap (`requestLocation`) |
| Precise location | iOS 14+ may show approximate vs precise — app uses coords as returned |
| Denied | SOS → location unavailable screen |
| Retry | “Turn on location” re-invokes API |
| Blocked in Settings | Safari → Location → Deny — API fails silently to unavailable; **no in-app Settings link** |
| HTTPS required | Satisfied on Vercel |

**Timing:** Location **not** requested on page load — only on button/sheet action. PASS for UX guideline.

---

## Camera (iOS Safari)

| Path | API | iOS behavior |
|------|-----|--------------|
| Photo capture | `<input type="file" accept="image/*" capture="environment">` | Opens camera or picker sheet |
| Park Me preflight | `getUserMedia({ video: true })` then stop tracks | Separate camera permission; may differ from file capture permission state |

**Known iOS quirk:** Denying camera in Settings affects both paths. User must enable Camera for Safari in Settings.

**No in-app live viewfinder** — each capture opens system UI.

---

## SOS Flow (iOS)

| Step | Route | Real-device priority |
|------|-------|---------------------|
| Hold button | `/pwa/scan/sos` hold disc | P0 — verify 3s hold, haptics N/A (web) |
| Location sheet | `/pwa/scan/sos/allow-location` | P0 |
| Location unavailable | `/pwa/scan/sos/location-unavailable` | P0 |
| Contacts only | `/pwa/scan/sos/contacts-only` | P1 |
| Scene photos | `/pwa/scan/sos/photos` | P0 — 4 captures |
| tel:112 | Emergency screen | P1 — opens Phone app |

**Audio:** SOS alert tone via audio element — verify silent mode / hardware mute behavior on device.

---

## Park Me Flow (iOS)

| Step | Note |
|------|------|
| Permission sheet | Copy promises camera **and** location; code only runs `getUserMedia` — location on next screen |
| Photos + GPS | Two photos then location chip — test order on device |
| sessionStorage photos | Large base64 — watch for quota on older iPhones |

---

## Session & State (iOS)

| Storage key | Scope | iOS note |
|-------------|-------|----------|
| `al-journey-v1` | sessionStorage | Lost when tab closed / evicted |
| `al-pwa-scan-v1` | sessionStorage | Same |
| `al-qr-theme` | localStorage | Survives restart |
| `al-selected-flow` | localStorage | Survives restart |

**Phone restart:** sessionStorage empty — user starts fresh. Expected.

---

## Deep Links

Vercel SPA rewrite supports direct navigation to `/pwa/scan/vehicle`, `/journey/auth/mobile`, etc.

| Check | Status |
|-------|--------|
| Cold open deep link | CODE — should render route |
| Universal Links | Not configured — opens in Safari |

---

## Back Navigation

React Router `navigate(-1)` and explicit `onBack` handlers in `PwaScanShell`, `AuthStepShell`.

| Check | iOS note |
|-------|----------|
| Swipe-back gesture | Safari edge swipe may exit site — expected browser behavior |
| In-app back button | CODE — primary navigation |

---

## Offline

| Check | Status |
|-------|--------|
| Service worker | FAIL |
| Offline chip on A1 | UI-only demo state |
| Airplane mode | App will fail to load without cached shell |

---

## iOS-Specific Issues Found

| # | Issue | Severity |
|---|-------|----------|
| 1 | No A2HS / standalone configuration | P0 |
| 2 | No `viewport-fit=cover` | P1 |
| 3 | No apple-touch-icon | P0 |
| 4 | Park Me permission sheet does not request location | P2 |
| 5 | No Settings deep link when geo/camera blocked | P2 |
| 6 | sessionStorage photo quota on long SOS sessions | P2 |

---

## iOS Manual QA Script (minimum)

1. Open production URL in **Safari** (not desktop sim).
2. Complete Purchase flow through OTP — confirm numeric keyboard + no zoom.
3. Add post-activation: `/pourney` → QR Scan card → SOS hold → allow/deny location.
4. Capture at least one SOS photo.
5. Repeat Park Me with two photos + location.
6. Test Add to Home Screen (expect poor experience until PWA layer shipped).
7. Optional: repeat steps 2–5 in **Chrome iOS** for WebKit parity.

---

## Verdict

**iOS in-browser mobile web:** CODE COMPLETE — **device QA pending**  
**iOS installable PWA:** **NOT READY**
