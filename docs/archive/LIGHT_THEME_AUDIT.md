# Light Theme Audit

**Date:** 2026-06-17  
**Sprint:** Light Theme Recovery  
**Repository:** `autolokate-web`  
**Verdict:** **THEME READY** (see [FINAL_THEME_SIGNOFF.md](./FINAL_THEME_SIGNOFF.md))

---

## Executive summary

Light theme was breaking primarily because PWA and promoted UI components hardcoded **dark-surface palette values** (`#1a1a1a`, `#ffffff`, `#4a4a4a`, `#8a8a8a`) instead of semantic tokens from `@autolokate/design-system/theme.css`. Dark theme appeared correct because those values matched the dark canvas; light theme inherited dark surfaces and low-contrast text.

This sprint audited light and dark **independently**, migrated hardcoded colours to tokens, fixed invalid CSS variable references, and re-ran lint / typecheck / build.

---

## Root causes

| Issue | Impact in light theme | Fix |
|-------|----------------------|-----|
| Hardcoded dark surfaces in PWA CSS | White/light canvas with dark cards, chips, panels | Replace with `--al-color-surface`, `--al-color-on-surface*` |
| `--park-me` ScannerHubCard forced dark gradient | Park Me card always dark | Tokenized surface + outline |
| Invalid vars `--al-color-text`, `--al-color-text-muted` | Fallback to browser default / broken inheritance | Corrected to `--al-color-on-surface`, `--al-color-on-surface-muted` |
| Inline SVG strokes `#FFFFFF` on light-tint backgrounds | Invisible map pin, wrong timeline glyphs | `currentColor` + semantic token classes |
| IncidentStatusHero `#0A0A0C` strokes | Low contrast on dark canvas in dark mode; fixed both ways via `--al-color-on-surface` | Token migration |
| Halo icons with fixed hex | Signal colours OK; inner glyphs not theme-aware | CSS variable strokes in generated icons |

---

## Phase 1 — Token compliance

See [TOKEN_COMPLIANCE_REPORT_V2.md](./TOKEN_COMPLIANCE_REPORT_V2.md).

**Onboarding app CSS:** Zero hardcoded hex/rgba in property values (comments only).  
**UI package CSS:** Zero hardcoded colour properties except documented SOS mask technique (`#000` in radial mask — not a visible colour).

---

## Phase 2 — Component audit (`@autolokate/ui`)

| Component | Dark | Light | Notes |
|-----------|------|-------|-------|
| Button | ✅ | ✅ | Semantic primary/on-primary |
| Input / TextField / OtpInput | ✅ | ✅ | Surface + outline tokens |
| Checkbox | ✅ | ✅ | Success fill token |
| Chip / StatusPill | ✅ | ✅ | Pill surface tokens |
| Card / PlanCard | ✅ | ✅ | Selected glow → `color-mix(success)` |
| VehicleRcCard | ✅ | ✅ | `--al-gradient-vehicle-rc-light` in light |
| ScannedVehicleCard | ✅ | ✅ | Full token rewrite |
| VehicleConfirmationCard | ✅ | ✅ | Full token rewrite |
| ScannerHubCard | ✅ | ✅ | Park-me variant fixed |
| StatusTracker | ✅ | ✅ | Full token rewrite |
| DispatchTimeline | ✅ | ✅ | Active glyph uses `--al-color-on-warning` |
| PhotoGrid / ScenePhotoCard | ✅ | ✅ | Map pin + placeholders tokenized |
| PermissionSheet | ✅ | ✅ | Scrim uses `--al-color-overlay` |
| IncidentStatusHero | ✅ | ✅ | SVG uses semantic vars |
| SosHoldButton | ✅ | ✅ | Signal reds tokenized; white-on-red intentional |
| ScreenSpinner | ✅ | ✅ | Track/arc use signal tokens |
| Empty / loader / error states | ✅ | ✅ | Via shell + AlText tone tokens |

---

## Phase 3 — Screen audit (all active flows)

Audited via ScreenDevApp inventory + journey/PWA route tables. Each row: **code audit + token path verified**; visual spot-check at `http://127.0.0.1:5199` (dev server).

### Shared Auth (17 dev variants + legal)

| Screen | States | Dark | Light |
|--------|--------|------|-------|
| S0 Splash | default | ✅ | ✅ |
| A1 Mobile | empty, filled, ready, error, offline | ✅ | ✅ |
| A2 OTP | default, typing, verifying, success, error, network-error, resend, resend-failed | ✅ | ✅ |
| A3 Vehicle owner | empty, filled | ✅ | ✅ |
| L1 Privacy | default | ✅ | ✅ |
| L2 Terms | default | ✅ | ✅ |

### Purchase (R03–R10c)

| Screen | States | Dark | Light |
|--------|--------|------|-------|
| R03 Vehicle number | empty, filled, error, loading | ✅ | ✅ |
| R04 Fetching | loading | ✅ | ✅ |
| R04b Fetch failed | error | ✅ | ✅ |
| R05 Confirm vehicle | default | ✅ | ✅ |
| R06 Choose plan | safe, secure, shield, shield-plus | ✅ | ✅ |
| R07 Rider cover | default | ✅ | ✅ |
| R08 Order summary | default | ✅ | ✅ |
| R08b Promo applied | default | ✅ | ✅ |
| R08c Invalid promo | error | ✅ | ✅ |
| R09 Processing payment | loading | ✅ | ✅ |
| R09b Still confirming | loading | ✅ | ✅ |
| R10 Payment success | success | ✅ | ✅ |
| R10b Payment failed | error | ✅ | ✅ |
| R10c Payment unconfirmed | attention | ✅ | ✅ |

### Emergency (E01–E10)

| Screen | States | Dark | Light |
|--------|--------|------|-------|
| E01 Rider prompt | default, loading, error, offline | ✅ | ✅ |
| E02 Rider mobile | default, error, offline | ✅ | ✅ |
| E03 Rider OTP | default, error, loading, network-error | ✅ | ✅ |
| E04 Rider name | default, loading, error | ✅ | ✅ |
| E05 Contacts empty | default | ✅ | ✅ |
| E06 Contact mobile | default, error, offline | ✅ | ✅ |
| E07 Contact OTP | default, error, loading, network-error | ✅ | ✅ |
| E08 Contact name | default, error | ✅ | ✅ |
| E09 Contacts summary | default, error (limit) | ✅ | ✅ |
| E10 Riders summary | default, error (limit) | ✅ | ✅ |

### Prepaid

| Screen | States | Dark | Light |
|--------|--------|------|-------|
| PR01 Entry | default, loading, error, success | ✅ | ✅ |
| PR02 Activation code | default, loading, error, success | ✅ | ✅ |
| PR03 Code validation | default, loading, error, success | ✅ | ✅ |
| Prepaid welcome (journey) | default | ✅ | ✅ |

### B2B2C

| Screen | Variants | Dark | Light |
|--------|----------|------|-------|
| Partner welcome | plan-only, plan-rider | ✅ | ✅ |

### Completed

| Screen | Dark | Light |
|--------|------|-------|
| Journey completed | ✅ | ✅ |
| Completion experience | ✅ | ✅ |

### PWA (32 routes)

See [PWA_LIGHT_THEME_REPORT.md](./PWA_LIGHT_THEME_REPORT.md).

---

## Phase 4 — Icon audit

See [ICON_THEME_AUDIT.md](./ICON_THEME_AUDIT.md).

---

## Phase 5 — PWA special audit

All previously flagged PWA components re-audited. No remaining dark-only surface assumptions in active CSS.

---

## Phase 6 — Responsive matrix

Verified token paths at widths **320, 360, 375, 390, 393, 414** via ScreenDevApp viewport controls and PWA shell `max-width` constraints. No clipping regressions introduced by token migration.

| Width | Dark flows | Light flows |
|-------|------------|-------------|
| 320 | ✅ | ✅ |
| 360 | ✅ | ✅ |
| 375 | ✅ | ✅ |
| 390 | ✅ | ✅ |
| 393 | ✅ | ✅ |
| 414 | ✅ | ✅ |

---

## Phase 7 — Visual QA

| Reference | Status |
|-----------|--------|
| Figma dark | Token-aligned; no new drift from this sprint |
| Current dark | ✅ Parity maintained |
| Figma light (partial) | Adapted via semantic tokens — no invented styles |
| Current light | ✅ Surfaces, text, icons, borders theme-correct |

---

## Bugs fixed this sprint

1. **PWA emergency screen** — re-tokenized after regression to hardcoded dark palette  
2. **PWA scan CSS** — invalid `--al-color-text*` variables corrected  
3. **ScannerHubCard park-me** — removed dark-only surface  
4. **PhotoGrid map pin** — white strokes invisible on light green tint → success colour  
5. **DispatchTimeline active glyphs** — white on amber → `--al-color-on-warning` (black per Figma)  
6. **IncidentStatusHero** — theme-aware halo and glyph strokes  
7. **10 halo/status icons** — hex → CSS variables  
8. **ScreenSpinner / SosHoldButton / PlanCard / plan-carousel** — rgba glows → `color-mix` on signal tokens  

---

## Before / after (visual)

Screenshots were not captured in CI for this pass. Reproduce locally:

```bash
pnpm --filter @autolokate/qr dev --port 5199
```

1. Open `/?dev=screens` — toggle **Light** in dev panel  
2. PWA: `http://127.0.0.1:5199/pwa/scan/vehicle` with `localStorage.setItem('al-qr-theme','light')`

**Before:** Dark `#1a1a1a` cards on `#f4f6f9` canvas; invisible white icons on tinted surfaces; muted text stuck at `#8a8a8a` on wrong backgrounds.  
**After:** Semantic surfaces/text; icons inherit `currentColor` or signal tokens; contrast meets design-system roles in both themes.

---

## Remaining drift

| Item | Severity | Notes |
|------|----------|-------|
| Ambient rgba gradients (auth/purchase shells) | Low | Uses brand signal primitives; light overrides in `screen-viewport.css` |
| Figma-exact px spacing (8, 10, 13, 14, 20, 24) | Accepted | Documented in TOKEN_COMPLIANCE_REPORT_V2 |
| SOS hold button mask `#000` | Accepted | CSS mask cutout, not rendered colour |
| Design-system elevation rgba at `:root` | Accepted | Primitive tokens; semantic surfaces unaffected |

---

## Verification commands

```bash
pnpm -r lint && pnpm -r typecheck && pnpm -r build
```

All passed on 2026-06-17 after fixes.
