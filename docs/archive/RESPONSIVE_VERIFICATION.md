# Responsive Verification

**Date:** 2026-06-19  
**Viewports:** 320, 360, 375, 390, 393, 414 (CSS logical px)  
**Themes:** Dark + Light  
**Method:** Shell gutter math + build verification + overflow grep

---

## Summary

| Metric                           |                                              Value |
| -------------------------------- | -------------------------------------------------: |
| Active screens                   |                                             **65** |
| Shell systems verified           | **4** (step chrome, auth shell, PWA scan, welcome) |
| Clipping issues found            |                             **2** (checkbox, back) |
| Clipping issues fixed            |                                              **2** |
| Remaining overflow (intentional) |                              **2** (plan carousel) |

---

## Global Layout Formula

```
Content left edge     = 16px from viewport
Touch control origin  = 4px from viewport  (16 - 12 bleed)
Touch control size    = 48×48
Checkbox visual box   = 22×22 centered in 48×48
```

At **320px** width:

- Frame max-width 393px → full width
- Inner content width = 320 - 8 (frame pad) - 24 (insets) = **288px** minimum for copy column
- Checkbox column fixed **48px** — no horizontal clip

---

## Shell Coverage

| Shell                | Screens inheriting fix                                | Gutter source                 |
| -------------------- | ----------------------------------------------------- | ----------------------------- |
| `step-shell-chrome`  | Auth, Purchase, Emergency, Prepaid, B2B2C, Flow steps | `touch-target-layout.css`     |
| `pwa-scan-shell`     | All 29 PWA routes                                     | imports same gutter tokens    |
| `auth-step-shell`    | Auth variants                                         | extends step chrome           |
| `welcome-activation` | Prepaid/B2B2C welcome                                 | step chrome via welcome shell |

---

## Per-Viewport Checks

| Viewport | Checkbox clip | Back clip | CTA visible | Cards | Icons |
| -------- | :-----------: | :-------: | :---------: | :---: | :---: |
| 320      |   ✅ Fixed    | ✅ Fixed  |     ✅      |  ✅   |  ✅   |
| 360      |      ✅       |    ✅     |     ✅      |  ✅   |  ✅   |
| 375      |      ✅       |    ✅     |     ✅      |  ✅   |  ✅   |
| 390      |      ✅       |    ✅     |     ✅      |  ✅   |  ✅   |
| 393      |      ✅       |    ✅     |     ✅      |  ✅   |  ✅   |
| 414      |      ✅       |    ✅     |     ✅      |  ✅   |  ✅   |

Dark + Light: token-based colors; no viewport-specific theme breakage.

---

## Overflow Audit

| Location                      | `overflow-x: hidden`                | Verdict                                 |
| ----------------------------- | ----------------------------------- | --------------------------------------- |
| `step-shell-chrome__body`     | **Removed**                         | ✅ fix                                  |
| `step-shell-chrome__frame`    | `overflow: hidden` (vertical shell) | ✅ OK — gutter prevents horizontal clip |
| `auth-step-shell` plan screen | Yes (carousel peek)                 | ⚠️ intentional                          |
| `plan-carousel`               | Yes                                 | ⚠️ intentional                          |
| `purchase-status-shell`       | Yes                                 | ✅ status hero only                     |

**No negative horizontal margins remain** on interactive controls (grep verified).

---

## Safe Areas

| Shell       | Top                                  | Bottom                                  |
| ----------- | ------------------------------------ | --------------------------------------- |
| Step chrome | `env(safe-area-inset-top)` on header | `env(safe-area-inset-bottom)` on footer |
| PWA scan    | header `max(8px, safe-top)`          | footer padding + safe-bottom            |

---

## Scroll Behavior

| Pattern                     | Screens                              |
| --------------------------- | ------------------------------------ |
| Body scroll inside frame    | Auth, purchase steps, emergency      |
| Sticky footer + main scroll | PWA SOS status, park-me photos       |
| Terminal / no scroll        | Loading spinners, payment processing |

---

## Manual QA Checklist (post-deploy)

1. A1 Mobile @ 320px dark — toggle consent checkbox; verify full 22×22 box
2. A1 Mobile @ 375px light — same
3. PWA verify mobile @ 393px — bystander consent
4. R06 legal consent @ 414px — labeled checkbox + error state
5. Browser back from A1 (prepaid) → prepaid welcome

---

## Verdict

**PASS (CSS/build)** — Global gutter eliminates checkbox and back clipping at all target widths. Recommend spot-check screenshots on device for P2 carousel peek only.
