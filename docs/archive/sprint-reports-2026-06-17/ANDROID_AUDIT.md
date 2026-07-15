# Android Audit — Autolokate PWA

**Date:** 2026-06-17  
**Browsers:** Chrome (primary), Samsung Internet  
**Method:** Static audit + Android/Chromium platform behavior mapping  
**Device QA executed:** No — checklist for manual validation

---

## Executive Summary

| Layer                                        | Verdict                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| Mobile Chrome (in-browser)                   | **Likely functional** for activation + SOS/Park Me — pending device QA |
| Installable PWA (install banner / APK-style) | **FAIL** — no manifest, no service worker                              |
| Permissions (camera, location)               | **Code ready** — Android site-permission model applies                 |
| Safe area / gesture nav                      | **PARTIAL** — bottom inset CSS present                                 |

---

## Chrome vs Samsung Internet

Both are Chromium-based. Install criteria and permission UX are substantially similar.

| Feature             | Chrome Android                        | Samsung Internet |
| ------------------- | ------------------------------------- | ---------------- |
| Install app prompt  | Requires manifest + SW + icons        | Same             |
| Geolocation         | Site permission + OS location on      | Same             |
| Camera file capture | `capture=environment` → camera intent | Same             |
| `getUserMedia`      | Separate permission in site settings  | Same             |
| Standalone display  | `display: standalone` in manifest     | Same             |
| sessionStorage      | Tab-scoped                            | Same             |

Samsung Internet may show slightly different permission wording; test P1 after Chrome P0 pass.

---

## PWA Install (Android)

| Chrome criterion                  | Status        |
| --------------------------------- | ------------- |
| Served over HTTPS                 | PASS (Vercel) |
| Web app manifest                  | **FAIL**      |
| Service worker with fetch handler | **FAIL**      |
| Icons 192 + 512                   | **FAIL**      |
| `start_url` reachable             | N/A           |

| Feature                       | Status                 |
| ----------------------------- | ---------------------- |
| `beforeinstallprompt` handler | FAIL — not implemented |
| Custom install CTA            | FAIL                   |
| TWA / Play Store              | Not in scope           |

**Expected today:** “Install app” menu item **absent** or non-functional. App runs as tabbed browser experience.

---

## Theme & Status Bar

| Check                       | Status |
| --------------------------- | ------ |
| `<meta name="theme-color">` | FAIL   |
| Manifest `theme_color`      | FAIL   |
| `theme-color` in standalone | N/A    |

Address bar uses browser default — not branded.

---

## Display Mode & Splash

| Check                        | Status |
| ---------------------------- | ------ |
| `display: standalone`        | FAIL   |
| Adaptive icon / maskable     | FAIL   |
| Android splash from manifest | FAIL   |

---

## Permissions Model (Android)

Android groups site permissions under **Site settings** (lock icon → Permissions).

### Geolocation

| Scenario                 | App behavior               | Android system                                   |
| ------------------------ | -------------------------- | ------------------------------------------------ |
| First grant              | Coords + reverse geocode   | OS location prompt                               |
| Deny once                | SOS unavailable route      | Can ask again                                    |
| Deny + “Don’t ask again” | API error → unavailable    | **Blocked** until user clears in site settings   |
| Re-request               | “Turn on location” button  | May not show dialog if blocked                   |
| Settings recovery        | **Not implemented in app** | User must open Chrome → Site settings → Location |

Implementation: `useGeolocationCapture` — 12s timeout, high accuracy.

### Camera

| Path                             | Permission                          |
| -------------------------------- | ----------------------------------- |
| File input capture               | Camera intent — permission via OS   |
| Park Me `getUserMedia` preflight | Chrome camera permission for origin |

**Mismatch:** Park Me sheet title “Allow camera & location” — only camera preflight runs on primary action; location deferred to photos screen.

### Not used on Android

- `READ_CONTACTS` / Contact Picker — **N/A**
- `POST_NOTIFICATIONS` — **N/A** (no push)
- `RECORD_AUDIO` — **N/A**

---

## SOS Flow (Android)

| Step                                     | Real-device priority           |
| ---------------------------------------- | ------------------------------ |
| Hold-to-activate (rAF progress)          | P0                             |
| Location permission + unavailable branch | P0                             |
| Contacts-only fallback                   | P1                             |
| 4 scene photos                           | P0                             |
| Back button vs system back               | P0 — verify no accidental exit |
| tel:112                                  | P1                             |

**Vibration:** Web Vibration API not audited in SOS hold — hold is visual progress ring.

---

## Park Me Flow (Android)

| Step                      | Note                   |
| ------------------------- | ---------------------- |
| Reporter plate entry      | Alphanumeric keyboard  |
| Permission sheet          | getUserMedia preflight |
| Two photos                | Rear + front labels    |
| Location on photos screen | Separate tap           |
| Tracker timeline          | Demo timers            |

---

## Activation Flows (Android)

All four `/journey` entry cards:

| Flow                    | ID               | Status |
| ----------------------- | ---------------- | ------ |
| Consumer QR + Purchase  | `purchase`       | CODE   |
| B2B Prepaid             | `prepaid`        | CODE   |
| B2B2C Partner           | `b2b2c`          | CODE   |
| Post-Activation QR Scan | `postActivation` | CODE   |

Auth path: mobile (`inputMode="numeric"`) → OTP (6-digit, autofill hint) → vehicle owner name.

---

## Keyboard & Input (Android)

| Input  | Configuration                             | Expected keyboard |
| ------ | ----------------------------------------- | ----------------- |
| Mobile | `inputMode="numeric"`, 20px font          | Phone pad         |
| OTP    | `inputMode="numeric"`, `pattern="[0-9]*"` | Numeric           |
| Plate  | No forced numeric                         | Text/QWERTY       |

**Tap highlight:** Reduced via design-system interaction reset.

---

## Safe Area & Navigation

| Check                           | Status                                       |
| ------------------------------- | -------------------------------------------- |
| Gesture navigation bottom inset | CSS `env(safe-area-inset-bottom)` on footers |
| Display cutout (punch-hole)     | Top inset on shell headers                   |
| Standalone without insets       | Untested — no install                        |

---

## Session Persistence (Android)

| Event                    | sessionStorage  | localStorage           |
| ------------------------ | --------------- | ---------------------- |
| Refresh tab              | Restored        | Theme + flow selection |
| Kill Chrome from recents | Usually cleared | Persists               |
| Reboot phone             | Cleared         | Persists               |

Photo-heavy PWA sessions may hit **QuotaExceededError** — handled in `savePwaScanSession`.

---

## Deep Links & App Links

| Mechanism                 | Status                    |
| ------------------------- | ------------------------- |
| HTTPS path deep links     | PASS — Vercel SPA rewrite |
| Digital Asset Links / TWA | Not configured            |

Opening `https://<host>/pwa/scan/sos` in Chrome should land on SOS route directly.

---

## Offline & Cache (Android)

| Check                   | Status                 |
| ----------------------- | ---------------------- |
| Service worker offline  | FAIL                   |
| Chrome offline dinosaur | Expected on no network |
| Precached app shell     | FAIL                   |

---

## Version Updates

No SW `skipWaiting` flow. New deploy: user gets new assets on next full navigation/hard refresh. Installed PWA (future) would need update UX — not implemented.

---

## Android-Specific Issues Found

| #   | Issue                                              | Severity |
| --- | -------------------------------------------------- | -------- |
| 1   | Not installable (manifest + SW missing)            | P0       |
| 2   | No install prompt handling                         | P1       |
| 3   | No maskable icon for adaptive launcher             | P0       |
| 4   | No theme-color for Chrome address bar              | P2       |
| 5   | Permission blocked → no Settings shortcut          | P2       |
| 6   | Park Me sheet location not requested at allow time | P2       |
| 7   | Large photo sessionStorage on low-RAM devices      | P2       |

---

## Android Manual QA Script (minimum)

1. **Chrome Android** — production HTTPS URL.
2. Purchase activation: mobile + OTP keyboards, no input zoom.
3. Post-activation SOS: hold, deny location, contacts-only, grant location, one photo.
4. Park Me: permission sheet → photos → location.
5. Verify **no** install banner (baseline before PWA work).
6. Site settings: block location → confirm unavailable UI + retry limits.
7. **Samsung Internet** — repeat steps 3–4 only (P1).

---

## Verdict

**Android in-browser mobile web:** CODE COMPLETE — **device QA pending**  
**Android installable PWA:** **NOT READY**
