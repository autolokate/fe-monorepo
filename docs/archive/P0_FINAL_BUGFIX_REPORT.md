# P0 Final Bugfix Report — Post-Activation PWA

**Date:** 2026-06-17  
**Scope:** UX / UI / interaction / platform consistency only (no business logic, route architecture, or journey order changes beyond explicit P0 routing fixes).

---

## Executive Summary

| P0 Item                                | Status                       | Verdict                        |
| -------------------------------------- | ---------------------------- | ------------------------------ |
| Global header / background consistency | Fixed in code                | Pass (desktop preview)         |
| SOS auth removal                       | Fixed                        | Pass                           |
| Park Me photo flow simplification      | Fixed                        | Pass                           |
| Location data (no hardcoded places)    | Fixed                        | Pass                           |
| Photo retake / reupload icons          | Fixed                        | Pass                           |
| iOS SOS hold loader                    | Fix implemented              | **Needs real-device sign-off** |
| Screen-by-screen UI audit              | Automated pass @ 320px dark  | Pass with notes                |
| Animation quality pass                 | No regressions introduced    | Pass                           |
| Responsive QA (320–414, light/dark)    | Partial (Playwright desktop) | **Needs device matrix**        |

### Final Verdict: **MORE FIXES REQUIRED**

Code fixes are merged and build passes. **READY** is withheld until:

1. iOS Safari / PWA verification of SOS hold loader (physical device).
2. Full responsive screenshot matrix at 320, 360, 375, 390, 393, 414 in light + dark on iOS Safari and Android Chrome.

---

## P0-1 — Global Header / Background Consistency

### Issue

Header area appeared as a separate black square block on some mobile screens — safe-area, shell, header, scroll, and footer backgrounds did not merge into a single surface.

### Root Cause

- `pwa-scan-shell__frame` and `pwa-scan-shell__header` had no explicit background inheritance; mobile Safari painted the viewport default (`#000`) in safe-area gaps.
- Sticky footer used hardcoded rgba values (`rgba(10,10,10,…)` / `rgba(244,246,249,…)`) instead of `var(--al-color-background)`, causing visible seams in light mode.

### Screens Affected

All PWA screens using `PwaScanShell` / `AlScreenBg` (loading, vehicle hub, auth, Park Me, SOS, status timelines).

### Fix

- `apps/qr/.../components/pwa-scan-shell.css` — unified shell `background-color: var(--al-color-background)`; header/frame/main set to `transparent`; footer gradients use `color-mix(in srgb, var(--al-color-background) …)`.
- `packages/ui/.../ScreenBg/ScreenBg.css` — `.al-screen-bg.pwa-scan-shell { min-height: 100dvh }`.

### Screenshots

|        | Path                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Before | `docs/audit-screenshots/archive/` (pre-fix captures if present)                                                        |
| After  | `docs/audit-screenshots/live/14-sos.png`, `19-help-received.png`, `20-help-dispatched.png`, `21-incident-resolved.png` |

### Remaining Drift

None observed in Playwright @ 320px dark. Physical iOS safe-area notch verification pending.

---

## P0-2 — SOS Auth Removal

### Issue

SOS flow required login (mobile → OTP → name) before entering the journey.

### Root Cause

`startFlow()` in `pwa-shared-routes.tsx` gated **both** Park Me and SOS on `session.verified`.

### Screens Affected

- Vehicle hub (`/pwa/scan/vehicle`) — SOS card tap
- Any resume path with `pendingFlow: 'sos'` after auth (now bypassed at entry)

### Fix

```typescript
// pwa-shared-routes.tsx — startFlow()
if (flow === 'sos') {
  updateSession({ pendingFlow: null });
  void navigate(pwaScanPaths.sos);
  return;
}
// Park Me unchanged: auth when !verified
```

**Routing after fix:**

- SOS: Scan → Vehicle hub → **SOS journey** (no auth)
- Park Me: Scan → Vehicle hub → Auth → Park Me journey

### Screenshots

|        | Path                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| Before | `docs/audit-screenshots/02-vehicle-found` (SOS previously routed to verify/mobile) |
| After  | Tap SOS → direct navigation to `/pwa/scan/sos` without auth screens                |

### Remaining Drift

None.

---

## P0-3 — Park Me Photo Flow Simplification

### Issue

Two-step flow: `/park-me/photos` → `/park-me/review`.

### Root Cause

Photos route CTA navigated to `parkMeReview`; review route duplicated send UX with hardcoded location.

### Screens Affected

- `/pwa/scan/park-me/photos`
- `/pwa/scan/park-me/review` (legacy)

### Fix

- Photos route: filled slots show previews + retake in-place via `AlScenePhotoCard`; CTA **Send to owner** navigates directly to `parkMeStatusChecking` when photos + location ready.
- Review route: redirect-only → `Navigate to={parkMePhotos} replace`.
- Helper copy updates: _"Ready to send to the owner"_ when complete.

See `archive/PHOTO_FLOW_SIMPLIFICATION_REPORT.md` for detail.

### Screenshots

|        | Path                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| Before | Two-screen flow (photos empty → review filled)                                                 |
| After  | Single screen with in-card previews — recapture via Playwright pending for `09-park-me-photos` |

### Remaining Drift

Playwright recapture for Park Me photos screen not in `recapture-fixes.mjs` batch — add to full matrix pass.

---

## P0-4 — Location Data

### Issue

Review screen showed hardcoded `"Andheri West, Mumbai"`.

### Root Cause

Static string in `PwaParkMeReviewRoute`; SOS chip always showed _"Turn on location"_ regardless of session.

### Fix

- New utility: `utils/format-pwa-location.ts` — labels from `session.location` / `session.locationDenied`.
- Park Me photos: `locationCapture.label` uses `formatPwaLocationLabel(session.location)`.
- SOS emergency screen: location chip reflects captured/denied/pending state.

### Screens Affected

Park Me photos, SOS emergency screens, location permission sheets.

### Remaining Drift

No reverse-geocoded street address (session only stores `{ lat, lng }`). Labels correctly reflect state: _Share your location_ / _Location captured_ / _Location unavailable_. Coordinate detail available via `formatPwaLocationDetail()` for future map cards.

---

## P0-5 — Photo Retake / Reupload Icons

### Issue

Inline duplicate SVGs did not match Figma `1059:281` (rotate-ccw).

### Fix

- Shared `packages/ui/src/components/icons/RetakeIcon.tsx` (Figma rotate-ccw paths).
- Wired into `PhotoGrid`, `ScenePhotoCard`.
- Camera icons remain `@autolokate/icons` `camera` (32px) on capture slots.

### Remaining Drift

None in code audit. Visual pixel-diff vs Figma export not run.

---

## P0-6 — iOS SOS Loader

See dedicated `archive/IOS_SOS_LOADER_REPORT.md`.

**Status:** CSS `conic-gradient` progress ring added alongside SVG arc for WebKit compatibility. **Real iOS device verification required.**

---

## Build Verification

```
pnpm --filter @autolokate/ui build        ✓
pnpm --filter @autolokate/qr build ✓
```

---

## Files Changed (Summary)

| Area           | Files                                                         |
| -------------- | ------------------------------------------------------------- |
| SOS auth       | `routes/pwa-shared-routes.tsx`                                |
| Shell bg       | `components/pwa-scan-shell.css`, `ScreenBg/ScreenBg.css`      |
| Park Me photos | `routes/pwa-park-me-routes.tsx`                               |
| Location       | `utils/format-pwa-location.ts`, `PwaEmergencyScreen.tsx`      |
| SOS loader     | `SosHoldButton.tsx`, `SosHoldButton.css`                      |
| Icons          | `icons/RetakeIcon.tsx`, `PhotoGrid.tsx`, `ScenePhotoCard.tsx` |
