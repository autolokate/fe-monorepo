# CSS Consolidation Report

**Date:** 2026-06-20

---

## Dead CSS Removed (via file deletion)

| File                          | Reason            |
| ----------------------------- | ----------------- |
| `language-picker-sheet.css`   | Component deleted |
| `language-switcher.css`       | Component deleted |
| `r14-permissions.css`         | Screen deleted    |
| `r15-activation-complete.css` | Screen deleted    |
| `qr-scan-screen.css`          | Feature deleted   |
| P01–P06 screen CSS files      | Screens deleted   |

**Bundle impact:** CSS 162 KB → 158 KB (−3.3 KB gzip −0.5 KB)

---

## Live CSS — Verified Retained

| File                       | Consumers          |
| -------------------------- | ------------------ |
| `purchase-phase-b.css`     | R06–R08c (active)  |
| `purchase-vehicle.css`     | R03, R05           |
| `payment-success-hero.css` | R10                |
| `pwa-scan.css`             | PWA routes         |
| `emergency.css`            | Emergency screens  |
| `step-shell-chrome.css`    | Auth + flow shells |

No orphaned selectors found in active stylesheets.

---

## Token Compliance (prior passes)

Hardcoded hex values in PWA reduced to design tokens in pixel-perfect passes. Remaining P2 items:

| File                      | Issue                                 |
| ------------------------- | ------------------------------------- |
| `plan-carousel.css`       | rgba in keyframes — use success token |
| `rider-cover-options.css` | rgba badge — use color-mix            |

Not changed this pass — no visual regression risk accepted.

---

## Duplicate CSS Patterns (P2 — documented)

| Pattern                   | Locations                                      | Recommendation                       |
| ------------------------- | ---------------------------------------------- | ------------------------------------ |
| Step shell chrome         | `auth-step-shell.css`, `step-shell-chrome.css` | Already shared via step-shell-chrome |
| PWA status hero spacing   | `pwa-scan.css`, `pwa-emergency-screen.css`     | Intentional per-screen Figma bands   |
| Loading breathe animation | `interaction-motion.css`                       | Shared utility — OK                  |

---

## Verdict

**PASS** — Dead CSS eliminated with orphan file removal. Active CSS tied to mounted routes only.
