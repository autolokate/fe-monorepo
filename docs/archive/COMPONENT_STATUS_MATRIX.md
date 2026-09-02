# Component Status Matrix — RC1

**Version:** v4.0.0-rc1 · **ui-preview:** single source of truth  
**Legend:** Pass = verified in ui-preview · Partial = known limitation · N/A = not applicable

| Component           | Light | Dark | Responsive | Accessibility | Figma Match | Production Ready |
| ------------------- | ----- | ---- | ---------- | ------------- | ----------- | ---------------- |
| **AlButton**        | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlInput**         | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlTextField**     | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlOtpInput**      | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlToggle**        | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlCheckbox**      | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlChip**          | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlStatusPill**    | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlAvatar**        | Pass  | Pass | Pass       | Partial       | Pass        | Yes              |
| **AlField**         | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlQuickAction**   | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlBottomNav**     | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlStepProgress**  | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlPlateInput**    | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlPlanCard**      | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlVehicleRcCard** | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlText**          | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlHeading**       | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlIconButton**    | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |
| **AlStack**         | Pass  | Pass | Pass       | Pass          | N/A         | Yes              |
| **AlGrid**          | Pass  | Pass | Pass       | Pass          | N/A         | Yes              |
| **AlContainer**     | Pass  | Pass | Pass       | Pass          | N/A         | Yes              |
| **AlDivider**       | Pass  | Pass | Pass       | Pass          | Pass        | Yes              |

### Supplementary (documented, outside 16+7 RC inventory)

| Component       | Light | Dark | Responsive | Accessibility | Figma Match | Production Ready |
| --------------- | ----- | ---- | ---------- | ------------- | ----------- | ---------------- |
| **AlStatusBar** | Pass  | Pass | Pass       | Partial       | Pass        | Yes              |

---

## Partial accessibility notes

| Component   | Issue                     | Mitigation                                                 |
| ----------- | ------------------------- | ---------------------------------------------------------- |
| AlAvatar    | md size = 46px (< 48dp)   | Use for display; pair with tappable wrapper if interactive |
| AlStatusBar | Decorative preview chrome | Not shipped in consumer app screens                        |

---

## RC1 fixes applied (Phase 2.7)

| Component         | Fix                                                                          |
| ----------------- | ---------------------------------------------------------------------------- |
| AlPlateInput      | Added `:focus-within` focus ring; green divider token (`--al-color-success`) |
| AlPlateInput      | New ui-preview page with full showcase                                       |
| AlPlanCard        | New ui-preview page with interactive state simulation                        |
| AlVehicleRcCard   | New ui-preview page with full showcase                                       |
| Layout primitives | Enhanced pages: variants, accessibility notes, props tables                  |
| @autolokate/ui    | Removed 6 dead re-export shims                                               |
| ui-preview        | Removed dead `.ds-vehicle-verify` CSS                                        |

---

## Viewport verification

All **Pass** responsive cells verified at: 320 · 360 · 375 · 390 · 414 · 768 · 1024 px via `CoreComponentShowcase` responsive section.

---

## Summary

| Metric                | Count                              |
| --------------------- | ---------------------------------- |
| RC components         | 23                                 |
| Production ready      | 23/23                              |
| Partial accessibility | 1 (AlAvatar — display-only caveat) |
| Blocking issues       | 0                                  |

**Foundation freeze complete. Proceed to QR Flow screens.**
