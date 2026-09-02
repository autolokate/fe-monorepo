# PWA Install Audit

**Date:** 2026-06-17  
**Scope:** Autolokate Onboarding app (`apps/qr`) — installability, manifest, service worker, icons, standalone  
**Method:** Static codebase audit (no physical device install tests executed in this pass)  
**Deploy target:** Vercel (`vercel.json` SPA rewrite → `/index.html`)

---

## Executive Summary

| Area                     | Status              | Verdict |
| ------------------------ | ------------------- | ------- |
| Web manifest             | **Missing**         | FAIL    |
| Service worker           | **Missing**         | FAIL    |
| Icons (192/512/maskable) | **Missing**         | FAIL    |
| Splash / theme color     | **Missing**         | FAIL    |
| Standalone display mode  | **Not configured**  | FAIL    |
| Install prompt (Android) | **Not implemented** | FAIL    |
| Add to Home Screen (iOS) | **Not configured**  | FAIL    |
| Offline fallback         | **Not implemented** | FAIL    |
| Cache / version updates  | **Not implemented** | FAIL    |

**Install audit verdict: FAIL — not an installable PWA today.**

The app runs as a **mobile web SPA** over HTTPS on Vercel. It is **not** a compliant installable Progressive Web App per Chrome install criteria or iOS “Add to Home Screen” best practices.

---

## Manifest

| Check                              | Expected                 | Found        | Status |
| ---------------------------------- | ------------------------ | ------------ | ------ |
| `manifest.json` / `.webmanifest`   | Linked from `index.html` | None in repo | FAIL   |
| `name` / `short_name`              | Brand strings            | N/A          | FAIL   |
| `start_url`                        | `/journey` or `/`        | N/A          | FAIL   |
| `scope`                            | `/`                      | N/A          | FAIL   |
| `display: standalone`              | Full-screen app chrome   | N/A          | FAIL   |
| `background_color` / `theme_color` | DS tokens                | N/A          | FAIL   |
| `icons` array                      | 192, 512, maskable       | N/A          | FAIL   |

**Evidence:** Repo-wide search returns **0** manifest files. `index.html` has no `<link rel="manifest">`.

```1:6:apps/qr/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Autolokate · Onboarding</title>
```

---

## Icons

| Check            | Status | Detail                                                  |
| ---------------- | ------ | ------------------------------------------------------- |
| Favicon          | FAIL   | No `favicon.ico` or `<link rel="icon">` in `index.html` |
| Apple touch icon | FAIL   | No `apple-touch-icon` link                              |
| Maskable icon    | FAIL   | No PNG assets sized for maskable safe zone              |
| PWA icon sizes   | FAIL   | No 192×192 / 512×512 PNG/WebP in app                    |

**Available brand assets:** SVG only in `packages/brand/src/assets/` (`al-logo-*.svg`, `al-mark-*.svg`). SVGs are not sufficient for platform install manifests without raster exports.

**`public/` folder:** Does not exist under `apps/qr`. Vite has no static icon directory for PWA assets.

---

## Splash Screen

| Platform                                     | Status | Detail                                                                                                                      |
| -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| Android (manifest `splash_pages` / adaptive) | FAIL   | No manifest                                                                                                                 |
| iOS (apple-touch-icon + meta)                | FAIL   | No `apple-mobile-web-app-capable`, no touch icon                                                                            |
| In-app splash (S0)                           | PASS   | Journey auth S0 splash screen exists (`s0-splash.css` with safe-area padding) — this is **in-app UI**, not OS launch splash |

---

## Theme Color

| Check                       | Status                                            |
| --------------------------- | ------------------------------------------------- |
| `<meta name="theme-color">` | FAIL — absent from `index.html`                   |
| Manifest `theme_color`      | FAIL — no manifest                                |
| Status bar styling (iOS)    | FAIL — no `apple-mobile-web-app-status-bar-style` |

Theme is applied at runtime via `data-theme` on `<html>` from `localStorage` (`al-qr-theme`), but OS browser chrome is **not** themed for install/standalone.

---

## Maskable Icon

| Check                             | Status |
| --------------------------------- | ------ |
| `purpose: "maskable"` in manifest | FAIL   |
| Maskable-safe artwork             | FAIL   |

---

## Standalone Mode

| Check                                           | Status       | Detail                                                 |
| ----------------------------------------------- | ------------ | ------------------------------------------------------ |
| Manifest `display: standalone`                  | FAIL         | Not configured                                         |
| iOS standalone meta                             | FAIL         | No `apple-mobile-web-app-capable`                      |
| App runs without browser URL bar when installed | **Untested** | Cannot install without manifest/meta                   |
| In-browser full-screen feel                     | PARTIAL      | Mobile layouts use 393px logical width + safe-area CSS |

---

## Install Prompt

| Check                                | Status | Detail                 |
| ------------------------------------ | ------ | ---------------------- |
| `beforeinstallprompt` listener       | FAIL   | No matches in codebase |
| Custom install CTA / deferred prompt | FAIL   | Not implemented        |
| Install eligibility (Lighthouse PWA) | FAIL   | Missing manifest + SW  |

---

## Android Install

| Browser          | Expected path               | Audit status                          |
| ---------------- | --------------------------- | ------------------------------------- |
| Chrome           | Menu → Install app / banner | **NOT ELIGIBLE** — no manifest, no SW |
| Samsung Internet | Same criteria as Chromium   | **NOT ELIGIBLE**                      |

**Chrome install criteria (2026):** HTTPS ✓ (Vercel), registered SW ✗, valid manifest with icons ✗.

---

## iOS Add to Home Screen

| Check                | Status  | Detail                                                                                                               |
| -------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| Add to Home Screen   | PARTIAL | User can still bookmark URL manually                                                                                 |
| Standalone launch    | FAIL    | No web app meta tags                                                                                                 |
| Icon on home screen  | FAIL    | No apple-touch-icon                                                                                                  |
| `viewport-fit=cover` | FAIL    | Viewport is `width=device-width, initial-scale=1.0` only                                                             |
| Safe area insets     | PARTIAL | CSS uses `env(safe-area-inset-*)` in shells — **requires** `viewport-fit=cover` on iOS for full effect in standalone |

Safe-area usage exists in:

- `pwa-scan-shell.css`
- `step-shell-chrome.css`
- `flow-entry-screen.css`
- `journey.css`, auth shells, completion experience

Without `viewport-fit=cover`, notch/home-indicator padding may not apply correctly when added to home screen.

---

## Offline Fallback

| Check                         | Status  | Detail                                                                  |
| ----------------------------- | ------- | ----------------------------------------------------------------------- |
| Service worker                | FAIL    | No SW registration                                                      |
| Offline shell / fallback page | FAIL    | Not implemented                                                         |
| App shell precache            | FAIL    | Not implemented                                                         |
| Auth “offline” UI state       | PARTIAL | `AlOfflineChip` on A1 mobile — **UI state only**, not network detection |

Session data persists in `sessionStorage` across refresh while online; **no offline network resilience**.

---

## Service Worker

| Check                              | Status                     |
| ---------------------------------- | -------------------------- |
| `navigator.serviceWorker.register` | FAIL — not present         |
| `vite-plugin-pwa` / Workbox        | FAIL — not in dependencies |
| SW update strategy                 | FAIL — N/A                 |

---

## Cache Behavior

| Layer    | Behavior                                             | PWA cache                                     |
| -------- | ---------------------------------------------------- | --------------------------------------------- |
| HTTP     | Vercel CDN default                                   | Standard static asset caching only            |
| App data | `sessionStorage` (`al-journey-v1`, `al-pwa-scan-v1`) | Not a cache — tab-scoped                      |
| Photos   | Base64 in session JSON                               | Quota risk documented in `savePwaScanSession` |
| API      | Demo timers / no live backend                        | N/A                                           |

No programmatic cache versioning or `skipWaiting`/`clients.claim` flow.

---

## Version Updates

| Check                       | Status                                       |
| --------------------------- | -------------------------------------------- |
| SW update notification      | FAIL                                         |
| `cacheName` bump strategy   | FAIL                                         |
| Forced reload on new deploy | FAIL — users get latest on hard refresh only |

Vercel deploys new hashed JS bundles; browsers fetch fresh assets on navigation unless aggressively cached at CDN. No in-app “update available” UX.

---

## HTTPS & Deploy

| Check                     | Status                                  |
| ------------------------- | --------------------------------------- |
| Production HTTPS          | PASS (Vercel)                           |
| SPA routing               | PASS (`vercel.json` rewrite)            |
| Geolocation / camera APIs | Require secure context — PASS on Vercel |

---

## Gap Summary (Install Blockers)

| #   | Gap                                   | Severity | Fix class            |
| --- | ------------------------------------- | -------- | -------------------- |
| 1   | No web manifest                       | P0       | Implementation       |
| 2   | No service worker                     | P0       | Implementation       |
| 3   | No raster PWA icons (incl. maskable)  | P0       | Assets + manifest    |
| 4   | No `theme-color` / Apple web app meta | P1       | `index.html`         |
| 5   | No `viewport-fit=cover`               | P1       | `index.html`         |
| 6   | No `beforeinstallprompt` UX           | P2       | Optional enhancement |
| 7   | No offline fallback page              | P2       | SW + static page     |
| 8   | No `public/` static assets folder     | P1       | Project structure    |

---

## Recommended Pre–Device QA (after PWA layer)

1. Run Lighthouse PWA audit on production URL — target score ≥ 90 installable.
2. Android Chrome: verify install banner + standalone launch.
3. iPhone Safari: Add to Home Screen → verify icon, splash, standalone, safe areas.
4. Confirm SW update after redeploy (two-tab test).

---

## References

- `apps/qr/index.html`
- `apps/qr/vercel.json`
- `docs/archive/POST_ACTIVATION_PARITY_REPORT.md` — known gap: “Service worker / offline PWA manifest”
- `packages/brand/src/assets/` — SVG logos only

**Audit conclusion:** PWA **install layer is not production-ready**. Mobile **web** flows may still work in-browser; see `REAL_DEVICE_TEST_MATRIX.md` and `FINAL_PWA_READINESS.md`.
