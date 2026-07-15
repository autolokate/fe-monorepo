# UI Consistency Audit — Post-Activation PWA

**Date:** 2026-06-17  
**Method:** Code audit + Playwright layout audit (`docs/audit-screenshots/layout-audit-results.json`) + post-fix recapture (`docs/audit-screenshots/live/`)

---

## Audit Dimensions

| Dimension         | Standard                                             | Result                            |
| ----------------- | ---------------------------------------------------- | --------------------------------- |
| Header background | Matches shell `var(--al-color-background)`           | Fixed                             |
| Safe-area padding | `env(safe-area-inset-*)` on header/footer            | OK                                |
| Footer gradient   | Theme-token based, no hardcoded rgba seams           | Fixed                             |
| Icons             | Figma exports / `@autolokate/icons`                  | Retake unified; camera via AlIcon |
| Card spacing      | 16px screen gap, 12px grid gaps                      | OK                                |
| CTA spacing       | Sticky footer 12px top padding                       | OK                                |
| Timeline spacing  | Status screens use `pwa-scan-status-timeline-screen` | OK                                |
| SOS hold spacing  | 228px stage, 20px hint margin                        | OK                                |

---

## Screen Inventory

| #       | Route                   | Shell Variant | Issues Found                 | Status                    |
| ------- | ----------------------- | ------------- | ---------------------------- | ------------------------- |
| 01      | loading                 | protected     | None @ 320                   | Pass                      |
| 02      | vehicle                 | protected     | None                         | Pass                      |
| 03–05   | verify mobile/otp/name  | protected     | OTP success hold (prior fix) | Pass                      |
| 06–08   | park-me vehicle/confirm | protected     | None                         | Pass                      |
| 09      | park-me/photos          | protected     | Two-step flow                | **Fixed**                 |
| 09b     | park-me/review          | protected     | Hardcoded location           | **Redirect**              |
| 10–13   | park-me status          | protected     | None                         | Pass                      |
| 14      | sos                     | emergency     | Loader iOS                   | **Fix pending device QA** |
| 14b     | sos/holding             | emergency     | Loader iOS                   | **Fix pending device QA** |
| 14c–14e | sos location sheets     | emergency     | None                         | Pass                      |
| 15–16   | sos scene photos        | emergency     | None                         | Pass                      |
| 17–21   | sos status              | emergency     | Header bg                    | **Fixed**                 |
| 22      | sos/contacts-only       | emergency     | None                         | Pass                      |

---

## P0 Consistency Fixes Applied

### 1. Shell Surface Unification

**Issue:** Black header block / background shade mismatch.  
**Root cause:** Missing inherited background on nested shell layers; hardcoded footer fade colors.  
**Fix:** `pwa-scan-shell.css`, `ScreenBg.css`.  
**Screens:** All.

### 2. SOS Without Auth Chrome

**Issue:** Verify screens appeared before SOS.  
**Fix:** `startFlow('sos')` bypasses auth.  
**Screens:** 02 → 14 direct.

### 3. Location Labels

**Issue:** Demo city name on review.  
**Fix:** Session-driven labels via `format-pwa-location.ts`.  
**Screens:** Park Me photos, SOS chip.

### 4. Retake Icons

**Issue:** Duplicate inline SVGs.  
**Fix:** Shared `RetakeIcon` (Figma 1059:281).  
**Screens:** PhotoGrid review tiles, ScenePhotoCard filled slots.

### 5. SOS Tap Highlight

**Issue:** Light blue block on tap (prior fix).  
**Status:** `-webkit-tap-highlight-color: transparent` on hold disc.

---

## Responsive Results (Automated)

Source: `layout-audit-results.json` — 320px width, dark theme, all registered routes.

- **Vertical scroll:** No unexpected overflow on hub, auth, status screens.
- **Horizontal scroll:** None detected.
- **issueCount:** 0 for audited screens in last full run (pre-fix baseline).

Post-fix recapture @ 320px:

- `live/14-sos.png`
- `live/19-help-received.png`
- `live/20-help-dispatched.png`
- `live/21-incident-resolved.png`

### Breakpoints Not Yet Re-run Post-Fix

320, 360, 375, 390, 393, 414 — light + dark — require full `layout-audit.mjs` pass after deploy.

---

## Animation Quality

| Animation                | Check                                   | Status               |
| ------------------------ | --------------------------------------- | -------------------- |
| SOS hold progress        | CSS ring + SVG, 60ms linear             | Improved WebKit path |
| SOS aura pulse           | CSS keyframes, reduced-motion respected | OK                   |
| Help dispatched/received | Timeline step transitions via `PwaFade` | OK                   |
| Photo fill               | `al-scene-photo-fill` spring            | OK                   |
| OTP success              | 2s green hold (prior fix)               | OK                   |
| CTA reveal               | `PwaCtaReveal` footer                   | OK                   |

No new double-animation or opacity blink introduced in this pass.

---

## Remaining Drift

1. **iOS SOS loader** — code fix in place; device QA pending.
2. **Full breakpoint matrix** — not re-run post-fix.
3. **Park Me photos screenshot** — not in latest recapture batch.
4. **Light mode header** — automated audit skewed dark; manual light-mode spot check recommended on iOS.

---

## Final Verdict: **MORE FIXES REQUIRED**

All identified code-level inconsistencies are addressed. **READY** blocked on iOS loader physical verification and complete responsive screenshot matrix.
