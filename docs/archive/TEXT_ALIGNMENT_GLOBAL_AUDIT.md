# Text Alignment Global Audit

**Date:** 2026-06-19  
**Figma file:** `FtHCUnE0HH586PtG5yJyG0`  
**Reference frames:** Auth A1 `102:268` · Purchase R03 `170:25` · PWA SOS `849:321`

---

## Summary

| Metric                      |            Value |
| --------------------------- | ---------------: |
| Active screens audited      |           **65** |
| Text alignment issues found | **5** (systemic) |
| Per-screen patches          |            **0** |
| Shared fixes                |      **6 files** |

---

## Figma Baseline (all step flows)

| Element          |        X |              Width | Typography                  |
| ---------------- | -------: | -----------------: | --------------------------- |
| Content column   | **16px** | **361px** (393−32) | —                           |
| Headline         |     16px |              361px | 28/36/700, letter-spacing 0 |
| Subtitle / body  |     16px |              361px | 16/24/400                   |
| CTA              |     16px |             361×58 | 16/600 centered in button   |
| Section gap      |        — |                  — | **20px** vertical           |
| Title ↔ subtitle |        — |                  — | **8px**                     |

PWA status screens use the same **16px** content gutter (`849:321` title @ x:16).

---

## Root Causes

### RC-T1 — Split gutter double-padding

**Broken model:** frame `padding-inline: 4px` + sections `padding-inline: 12px`.

**Impact:** Body text at 16px on auth/purchase, but **welcome screens at 28px** (`welcome-activation-shell__frame` added another 16px on top of 12px inset).

**Responsible:** `touch-target-layout.css` (old), `step-shell-chrome.css`, `welcome-activation-shell.css`

### RC-T2 — Headline letter-spacing drift

**Broken:** DS token `--al-text-headline-letter-spacing: -0.01em` shifts text ~0.28px left vs Figma.

**Responsible:** `step-shell-chrome.css` (now overrides to `0` for all step headings)

### RC-T3 — Purchase subtitle forced lowercase

**Broken:** `.ob-shell__description { text-transform: lowercase }` on all FlowStepShell screens.

**Impact:** R03+ subtitles misaligned with Figma sentence case.

**Responsible:** `flow-step-shell.css`

### RC-T4 — Inconsistent top offset

**Broken:** Header used `--al-space-lg` (16px) vs Figma content start at **y:66** (22px below 44px status bar).

**Responsible:** `step-shell-chrome.css` → now `--ob-shell-header-top: 22px`

### RC-T5 — Heading typography scattered in per-flow CSS

**Broken:** Auth/purchase/welcome each re-declared 28/36/700 in local shell CSS.

**Responsible:** Centralized in `step-shell-chrome.css` `.ob-step-chrome__heading`

---

## Shared Fix

**Single gutter model** (`touch-target-layout.css`):

```css
--ob-shell-gutter: 16px;
--ob-shell-section-gap: 20px;
--ob-shell-heading-gap: 8px;
--ob-shell-header-top: 22px;
```

**All step shells:** one `padding-inline: var(--ob-shell-gutter)` on frame; **no** secondary horizontal inset on header/body/footer.

**Typography in shell:**

```css
.ob-step-chrome__heading .al-heading--h2 { 28/36/700; letter-spacing: 0; text-align: start; }
.ob-step-chrome__heading .al-text, descriptions { 16/24/400; text-align: start; }
```

---

## Consumer Verification

| Shell                  | Screens                | Heading X |   Body X | CTA X | Status |
| ---------------------- | ---------------------- | --------: | -------: | ----: | :----: |
| AuthStepShell          | A1, A2, A3             |        16 |       16 |    16 |   ✅   |
| FlowStepShell          | R03–R10c, E0–E5, R0–R4 |        16 |       16 |    16 |   ✅   |
| WelcomeActivationShell | Prepaid, B2B2C         |        16 |       16 |    16 |   ✅   |
| PwaScanShell           | 29 PWA routes          |        16 |       16 |    16 |   ✅   |
| PurchaseStatusShell    | R04, R09, R10…         |  center\* | center\* |    16 |   ✅   |
| Legal reader           | L1, L2                 |        16 |       16 |     — |   ✅   |
| Flow Entry             | `/journey`             |        16 |       16 |    16 |   ✅   |
| Completed              | `/journey/completed`   |  center\* | center\* |    16 |   ✅   |

\*Intentionally centered per Figma status/completion frames — not step-column layouts.

---

## Files Changed

- `apps/qr/src/components/step-shell-chrome/touch-target-layout.css`
- `apps/qr/src/components/step-shell-chrome/step-shell-chrome.css`
- `apps/qr/src/components/compositions/welcome-activation/welcome-activation-shell.css`
- `apps/qr/src/components/flow-step-shell/flow-step-shell.css`
- `apps/qr/src/journey/screens/flow-entry-screen.css`
- `apps/qr/src/features/post-activation-pwa/components/pwa-scan-shell.css`

---

## Before / After

| Issue                  | Before           | After                 |
| ---------------------- | ---------------- | --------------------- |
| Prepaid welcome body X | ~28px            | 16px                  |
| Purchase subtitle      | forced lowercase | sentence case (Figma) |
| Headline tracking      | −0.01em          | 0                     |
| Section vertical gap   | mixed 16/20      | 20px token            |
| Title/subtitle gap     | mixed            | 8px token             |

---

## Verdict

**PASS** — Text X alignment unified at the shell layer. No per-screen text offset patches.
