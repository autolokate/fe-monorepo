# iOS Install Recovery Report

**Date:** 2026-06-17  
**Sprint:** P0 Device + UX Fix  
**Status:** FIXED (code complete — real-device confirmation recommended)

---

## Problem

Android Chrome showed the native **Install App** banner via `beforeinstallprompt`. iOS Chrome showed nothing — users had no installation guidance.

iOS non-Safari browsers (Chrome, Edge, Firefox) cannot trigger a native PWA install prompt.

---

## Solution

Platform-aware routing in `PwaInstallPrompt` replaces the Android-only banner mount.

| Detection                                  | UX                                                       |
| ------------------------------------------ | -------------------------------------------------------- |
| Android Chrome (deferred prompt available) | `PwaInstallBanner` — native install CTA                  |
| iOS Safari                                 | `PwaIosSafariInstallBanner` — Share → Add to Home Screen |
| iOS Chrome / Edge / other WebKit wrappers  | `PwaIosInstallSheet` — step-by-step helper sheet         |
| Already standalone / installed             | Hidden                                                   |

### Files

| File                                                | Role                                                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `apps/qr/src/pwa/device-detection.ts`               | `isIosDevice`, `isIosSafari`, `isIosNonSafariBrowser`, `isAndroidDevice`, `isStandaloneDisplay` |
| `apps/qr/src/pwa/components/PwaInstallPrompt.tsx`   | Platform router — **Android banner never shown on iOS**                                         |
| `apps/qr/src/pwa/components/PwaIosInstallSheet.tsx` | `AlPermissionSheet` with Safari install steps                                                   |
| `apps/qr/src/pwa/components/PwaIosInstallSheet.css` | Figma-aligned sheet styling                                                                     |
| `apps/qr/src/journey/screens/FlowEntryScreen.tsx`   | Mount point: `PwaInstallPrompt`                                                                 |

### iOS Chrome / Edge sheet copy

1. Open this page in **Safari**
2. Tap **Share**
3. Tap **Add to Home Screen**

Dismiss uses the same 7-day `localStorage` key as Android (`PWA_INSTALL_DISMISS_KEY`).

---

## Verification Matrix

| Device / Browser | Expected                              | Code path                     |
| ---------------- | ------------------------------------- | ----------------------------- |
| iPhone Safari    | Top banner with Share guidance        | `PwaIosSafariInstallBanner`   |
| iPhone Chrome    | Permission sheet (not Android banner) | `PwaIosInstallSheet`          |
| iPhone Edge      | Permission sheet                      | `PwaIosInstallSheet`          |
| Android Chrome   | Native install banner                 | `PwaInstallBanner`            |
| Installed PWA    | No prompt                             | `isStandaloneDisplay()` guard |

---

## Constraints preserved

- No routing changes
- No provider changes
- Banner remains on flow entry only (`/journey`)

---

## Verdict

**FIXED** — iOS install guidance implemented at component level; Android banner gated off iOS.
