# Final Bugfix Report

**Date:** 2026-06-17  
**Sprint:** Post-Activation PWA — Final Bug Fix + Interaction Correction  
**Reference:** `archive/FINAL_UX_POLISH_REPORT.md` + latest screenshot review

---

## Verdict: **READY**

All P0 defects from screenshot review are resolved. No visible card breakage, dialog blur, or SOS tap-through on captured after shots. Auth screen **03** (mobile) and **05** (name) remain on shared onboarding shell — accepted B-grade constraint; **04** (OTP) is now on PWA-native shell.

---

## Issues found and fixed

| ID    | Issue                         | Root cause                                                                                      | Screens                   | Fix                                                                      |
| ----- | ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| BF-01 | Location card left-edge break | Absolute map-line gradients used fixed px offsets (`50.5px`, `177.5px`) — misaligned at 320–414 | **09b**                   | Percentage-centered crosshair lines; box-sizing + symmetric padding      |
| BF-02 | Brand logo optical drift      | Full horizontal logo SVG + CSS invert; bounding box not optically centered in header grid       | **All PWA shell**         | `PwaHeaderBrand` — mark (22px) + wordmark (15px/700), 8px gap            |
| BF-03 | Spacing drift                 | Mixed 20px screen gap + negative margin hacks                                                   | **02, 08–13, 15b, 19–23** | `pwa-scan-screen__intro` (4px title→subtitle), 16px section gap          |
| BF-04 | Screen 04 layout break        | `AuthStepShell` onboarding chrome (progress bar, green wash, wrong hierarchy)                   | **04**                    | `PwaVerifyShell` + `AlOtpInput` — PWA wordmark header, structural layout |
| BF-05 | Confirmation dialog blur      | Sheet inside dimmed frame + persistent `transform: translateY(0)` compositor layer              | **14c, 14d, 09a**         | Portal to `document.body`; `transform: none` when settled                |
| BF-06 | Animation flicker             | Stacked opacity:0 entrances (PwaFade + CSS + stagger + CTA delay)                               | **Most screens**          | Opacity-only screen fade; removed duplicate entrance animations          |
| BF-07 | SOS tap-through               | Navigate to 14b on `pointerdown` — tap entered holding route                                    | **14, 14b**               | 200ms engage gate; progress from absolute timestamp; pointer capture     |
| BF-08 | Card stability                | Review map overflow from decorative lines                                                       | **09b**                   | Contained map card; no overflow at 390                                   |

---

## Components changed

| Component           | Change                                           |
| ------------------- | ------------------------------------------------ |
| `PwaHeaderBrand`    | **New** — Figma-accurate mark + wordmark         |
| `PwaVerifyShell`    | **New** — PWA verify frame for screen 04         |
| `PwaScanShell`      | Uses `PwaHeaderBrand`; safe-area header padding  |
| `AlPermissionSheet` | Portal render; settled state removes transform   |
| `AlPhotoGrid`       | Location review map lines — responsive centering |
| `AlSosHoldButton`   | Pointer capture; click blocked; hold-only        |
| `PwaMotion`         | Opacity-only fade; no CTA delay flash            |
| `pwa-sos-routes`    | Hold engage + timestamp progress handoff         |

---

## Before / after evidence

| Screen            | Before                                                              | After                                                             |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 09b Location card | [before](audit-screenshots/bugfix/before/09b-park-me-review.png)    | [after](audit-screenshots/bugfix/after/09b-park-me-review.png)    |
| 04 OTP            | [before](audit-screenshots/bugfix/before/04-verify-otp.png)         | [after](audit-screenshots/bugfix/after/04-verify-otp.png)         |
| 14d Dialog        | [before](audit-screenshots/bugfix/before/14d-sos-leave-confirm.png) | [after](audit-screenshots/bugfix/after/14d-sos-leave-confirm.png) |
| 14 SOS            | [before](audit-screenshots/bugfix/before/14-sos.png)                | [after](audit-screenshots/bugfix/after/14-sos.png)                |
| 02 Hub            | [before](audit-screenshots/bugfix/before/02-vehicle-found.png)      | [after](audit-screenshots/bugfix/after/02-vehicle-found.png)      |

Full set: `docs/audit-screenshots/bugfix/{before,after}/` (30/30)

---

## Remaining drift

| Item        | Severity | Notes                                                         |
| ----------- | -------- | ------------------------------------------------------------- |
| Auth 03, 05 | Low      | Still on `A1`/`A3` + `AuthStepShell` — out of P0 scope for 04 |
| Light theme | Low      | Dark-first; light acceptable                                  |

---

## Companion reports (archived)

- `archive/SOS_INTERACTION_REPORT.md`
- `archive/DIALOG_RENDERING_REPORT.md`
- `archive/ANIMATION_REFINEMENT_REPORT.md`
- `archive/SCREENSHOT_VERIFICATION_REPORT.md`
