# Photo Flow Simplification Report — Park Me

**Date:** 2026-06-17  
**Flow:** Park Me photo capture  
**Constraint:** No business logic changes; route `/park-me/review` preserved as redirect for deep links.

---

## Issue

Park Me used a two-step photo experience:

1. `/pwa/scan/park-me/photos` — empty upload placeholders
2. `/pwa/scan/park-me/review` — filled previews + map + Send CTA

QA required a **single-step** screen: upload placeholders become filled previews in-place; CTA always **Send to owner** on the same route.

---

## Root Cause

- `PwaParkMePhotosRoute` footer CTA navigated to `pwaScanPaths.parkMeReview` instead of sending.
- `PwaParkMeReviewRoute` duplicated grid layout in `layout="review"` mode with hardcoded location.
- `AlScenePhotoCard` already supported in-card retake when `state=filled` + `onCapture` — capability existed but journey forced a second screen.

---

## Fix

### Photos Route (`PwaParkMePhotosRoute`)

| Before                                         | After                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| CTA disabled until ready → navigates to review | CTA disabled until ready → navigates to `parkMeStatusChecking`      |
| Static helper text                             | Dynamic: _Add photos…_ / _Ready to send to the owner_               |
| Location label inline strings                  | `formatPwaLocationLabel(session.location)`                          |
| Empty/filled via stacked grid                  | Same — filled photos render inside upload cards with retake overlay |

### Review Route (`PwaParkMeReviewRoute`)

Replaced full screen with:

```tsx
export function PwaParkMeReviewRoute() {
  return <Navigate to={pwaScanPaths.parkMePhotos} replace />;
}
```

Deep links and bookmarks to `/park-me/review` land on unified screen.

---

## User Journey (After)

```
Permissions → Photos (single screen)
  ├─ Empty slots: dashed cards + camera icon
  ├─ After capture: photo fills card + retake icon (Figma rotate-ccw)
  ├─ Location card: session-driven label
  └─ CTA "Send to owner" → Status checking
```

No intermediate review step.

---

## Screens Affected

- `/pwa/scan/park-me/photos` — primary
- `/pwa/scan/park-me/review` — redirect only
- `/pwa/scan/park-me/photo-not-clear` — retake still returns to photos ✓

SOS photo flow unchanged (4-up quad + captured review remains per existing SOS journey order constraint).

---

## Screenshots

|        | Description                                                            |
| ------ | ---------------------------------------------------------------------- |
| Before | Two screens: empty photos → review with map card                       |
| After  | Single screen — recapture script batch pending for `09-park-me-photos` |

---

## Components Involved

- `AlPhotoGrid` (`layout="stacked"`)
- `AlScenePhotoCard` — filled + retake overlay
- `RetakeIcon` — shared Figma icon
- `usePwaPhotoCapture('park-me/photos', 'parkMePhotos')`

---

## Remaining Drift

- Review layout map card (large location preview with grid lines) no longer shown in Park Me — Figma 1044:2406 map panel merged into location capture chip. If design requires map panel on same screen, add `locationPreview` prop without reintroducing a second route.
- Playwright after-screenshot for Park Me photos not yet in `recapture-fixes.mjs`.

---

## Final Verdict: **READY** (Park Me scope)

Single-step Park Me photo flow is complete in code. Full visual sign-off pending screenshot recapture.
