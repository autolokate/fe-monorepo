# iOS Install Report

**Date:** 2026-06-17  
**Sprint:** P0 iOS Contact Picker + Rider Loop + iOS Install  
**Status:** FIXED

---

## Problem

Android showed a working install banner; iOS users saw no usable install path, or risked seeing the Android install CTA.

---

## Expected platform UX

| Platform                       | UX                                                     |
| ------------------------------ | ------------------------------------------------------ |
| Android Chrome                 | Native `beforeinstallprompt` banner                    |
| iPhone Safari                  | Add to Home Screen helper — Share → Add to Home Screen |
| iPhone Chrome                  | Sheet — Open in Safari → Share → Add to Home Screen    |
| iPhone Edge                    | Sheet — Open in Safari → Share → Add to Home Screen    |
| Already installed / standalone | Hidden                                                 |

---

## Fix

### Detection (`pwa/device-detection.ts`)

- `isIosSafari()` — Safari on iPhone/iPad
- `isIosChrome()` — `CriOS` user agent
- `isIosEdge()` — `EdgiOS` user agent
- `isIosNonSafariBrowser()` — Chrome, Edge, Firefox wrappers
- `isAndroidDevice()` — Android install gating

### Router (`pwa/components/PwaInstallPrompt.tsx`)

- **Android banner:** `canPrompt && isAndroidDevice()` only — never on iOS
- **iOS Safari:** `PwaIosSafariInstallBanner` with numbered Share steps
- **iOS Chrome / Edge / other:** `PwaIosInstallSheet` with Safari-first steps
- Dismiss: shared 7-day `localStorage` key

### Copy updates

- Chrome iOS: explicit “Open in Safari” path
- Edge iOS: same Safari path
- Safari banner: numbered Share → Add to Home Screen list

---

## Files

| File                                    | Role                       |
| --------------------------------------- | -------------------------- |
| `pwa/device-detection.ts`               | Browser detection          |
| `pwa/components/PwaInstallPrompt.tsx`   | Platform router            |
| `pwa/components/PwaIosInstallSheet.tsx` | Safari + non-Safari iOS UX |
| `pwa/components/PwaIosInstallSheet.css` | Banner step styling        |
| `journey/screens/FlowEntryScreen.tsx`   | Mount point `/journey`     |

---

## Verification matrix

| Device / Browser | Must NOT show  | Must show                              |
| ---------------- | -------------- | -------------------------------------- |
| Android Chrome   | iOS sheet      | Install banner (when prompt available) |
| iPhone Safari    | Android banner | A2HS banner                            |
| iPhone Chrome    | Android banner | Safari install sheet                   |
| iPhone Edge      | Android banner | Safari install sheet                   |
| Installed PWA    | Any prompt     | Nothing                                |

---

## Verdict

**FIXED** — Platform-specific install UX; Android banner gated to Android only.
