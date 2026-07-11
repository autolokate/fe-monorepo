# Sprint 1 — Icon Parity Report

**Scope:** Full icon audit across Shared Auth + Legal · Purchase · Emergency · Prepaid · B2B2C  
**Figma file:** [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Package:** `@autolokate/icons`  
**Date:** 2026-06-17  
**Related:** [`MISSING_ASSET_RECOVERY_REPORT.md`](./MISSING_ASSET_RECOVERY_REPORT.md) · [`FIGMA_SCREENSHOT_INDEX.md`](./assets/sprint-1-asset-recovery/FIGMA_SCREENSHOT_INDEX.md)

---

## Executive summary

| Metric | Count |
|--------|-------|
| Icons in registry (after Sprint 1) | **27** |
| Halos in registry | **4** (`fetch-failed`, `payment-success`, `payment-unconfirmed`, `activation-complete`) |
| New icons added Sprint 1 | **4** (`payment-unconfirmed-halo`, `heart`, `smile`, `ellipsis`) |
| Wrong wirings fixed | **2** (R10c halo · 3 relation mappings) |
| Parity gaps remaining | **0** icon-registry · **2** UI tiles (icons exist, options missing) |

---

## Icon registry (`AlIconName`)

### Core UI icons (24×24 viewBox)

| Name | Figma component | Export / source | Wired in |
|------|-----------------|-----------------|----------|
| `arrow-left` | `19:5` | `svg/arrow-left.svg` | Auth, Legal, Purchase, Emergency, B2B shells |
| `bell` | — | `svg/bell.svg` | R14 notifications |
| `car` | — | `svg/car.svg` | R05 watermark, legacy purchase |
| `check` | `170:38` | `svg/check.svg` | Vahan preview chips |
| `chevron-down` | — | `svg/chevron-down.svg` | Language switcher |
| `circle-check` | `181:28` | `svg/circle-check.svg` | Plans, partner verified, contacts |
| `circle-user` | `17:21` | `svg/circle-user.svg` | E01 hero, Child relation |
| `circle-x` | `181:33` | `svg/circle-x.svg` | Error states |
| `credit-card` | `181:37` | `svg/credit-card.svg` | Available (halo uses inline paths) |
| **`ellipsis`** | **`588:314`** | **`figma-export/icon-ellipsis.svg`** | **E3 Other relation** |
| **`heart`** | **`603:1895`** | **`figma-export/icon-heart.svg`** | **E3 Spouse relation** |
| `house` | `17:5` | `svg/house.svg` | Registry only — Relative tile not in UI |
| `map-pin` | — | `svg/map-pin.svg` | R14 location permission |
| `phone` | — | `svg/phone.svg` | Available |
| `plus` | — | `svg/plus.svg` | Add contact row |
| `receipt-text` | — | `svg/receipt-text.svg` | Available |
| `scan-line` | — | `svg/scan-line.svg` | QR scan |
| `shield-check` | `18:11` | `svg/shield-check.svg` | Trust rows, permissions, E5 |
| **`smile`** | **`588:309`** | **`figma-export/icon-smile.svg`** | **E3 Friend relation** |
| `square-parking` | — | `svg/square-parking.svg` | Available |
| `store` | `17:10` | `svg/store.svg` | Registry only — Colleague tile not in UI |
| `user` | `19:13` | `svg/user.svg` | Parent relation, rider addon |
| `users` | `17:16` | `svg/users.svg` | Sibling relation, E5 empty |

### Composite halos (240×240)

| Name | Figma node | Center glyph | Screens |
|------|------------|--------------|---------|
| `fetch-failed-halo` | `579:1667` | White `circle-x` | R04b, R10b |
| `payment-success-halo` | R10 halo family | White check / success | R10 |
| **`payment-unconfirmed-halo`** | **`579:1642`** | **White credit card** | **R10c** |
| `activation-complete-halo` | `171:62` | White shield motif | R15 |

---

## Sprint 1 — Missing → Recovered → Still missing

### Missing (before)

| Icon | Screen | Problem |
|------|--------|---------|
| `payment-unconfirmed-halo` | R10c `579:1638` | Not in `src/`; screen used `fetch-failed-halo` |
| `heart` | E3 Spouse `374:71` | Wrong: `user` |
| `smile` | E3 Friend `374:71` | Wrong: `user` |
| `ellipsis` | E3 Other `374:71` | Wrong: `plus` |

### Recovered (Sprint 1)

| Icon | Action | Screenshot |
|------|--------|------------|
| `payment-unconfirmed-halo` | Exported `579:1642`, added to registry, wired `R10cPaymentUnconfirmedScreen` | [579:1638](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=579-1638) |
| `heart` | Exported `603:1895`, registry + `relationships.ts` | [374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71) |
| `smile` | Exported `588:309`, registry + `relationships.ts` | [374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71) |
| `ellipsis` | Exported `588:314`, registry + `relationships.ts` | [374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71) |

### Still missing (icon parity)

| Item | Notes |
|------|-------|
| — | **No missing icons in registry for audited flows** |
| Relative tile | `house` exists; UI option absent (schema) |
| Colleague tile | `store` exists; UI option absent (schema) |

---

## Flow parity tables

### Purchase — status & payment graphics

| Screen | Figma | Icon / graphic | Parity |
|--------|-------|----------------|--------|
| R04 loading | `179:25` | `AlScreenSpinner` 60px `#1FA24A` | ✅ Not icon-pack |
| R04b failed | `579:1663` | `fetch-failed-halo` | ✅ |
| R10 success | `194:37` | `payment-success-halo` | ✅ |
| R10b failed | `194:25` | `fetch-failed-halo` (circle-x center) | ✅ |
| R09b confirming | `579:1687` | `AlScreenSpinner` 60px | ✅ Not icon-pack |
| **R10c unconfirmed** | **`579:1638`** | **`payment-unconfirmed-halo`** | ✅ **Fixed** |
| R15 complete | `171:25` | `activation-complete-halo` | ✅ |

**Screenshot refs:** [Purchase index](./assets/sprint-1-asset-recovery/FIGMA_SCREENSHOT_INDEX.md#purchase)

### Purchase — chips, badges, trust

| Element | Figma | Implementation | Parity |
|---------|-------|----------------|--------|
| Vahan chips (×6) | `170:38` family | `check` 10×7 | ✅ |
| Trust row | `170:56` | `shield-check` 16px | ✅ |
| Plan selected radio | — | `circle-check` 24px | ✅ |
| Plan feature rows | — | `circle-check` 15px | ✅ |
| Paid chip | `615:267` | `circle-check` 13px + label | ✅ |
| Promo applied | — | `circle-check` 20px | ✅ |

### Emergency — relation grid (`374:71`)

| Relation | Figma icon | Size | Before | After |
|----------|------------|------|--------|-------|
| Spouse | `heart` | 26×26 | `user` ❌ | `heart` ✅ |
| Parent | `user` | 26×26 | `user` ✅ | — |
| Child | `circle-user` | 26×26 | ✅ | — |
| Sibling | `users` | 26×26 | ✅ | — |
| Friend | `smile` | 26×26 | `user` ❌ | `smile` ✅ |
| Relative | `house` | 26×26 | N/A | Tile missing |
| Colleague | `store` | 26×26 | N/A | Tile missing |
| Other | `ellipsis` | 26×26 | `plus` ❌ | `ellipsis` ✅ |

### Emergency — heroes & empty states

| Screen | Figma | Icon | Parity |
|--------|-------|------|--------|
| R0 default | `375:37` | `circle-user` 50 in 112px `#4A4A4A` circle | ✅ |
| E5 empty | `374:91` | `users` 48px | ✅ |
| Trust copy | — | `shield-check` 16px | ✅ |

### B2B2C + Prepaid — activation visuals

| Element | Figma | Implementation | Parity |
|---------|-------|----------------|--------|
| Back | `386:893` | `arrow-left` 24px | ✅ |
| Partner verified | `608:269` | `circle-check` 18px | ✅ |
| Partner avatar | `608:265` | Initials text (not image) | ✅ Per Figma |
| Plan features | — | `circle-check` 15px | ✅ |
| Rider addon | `443:37` | `user` 15px | ✅ |
| Error alert | `592:1860` | 56px amber circle + `!` text | ✅ CSS exact |
| Loading | `588:1798` | CSS skeleton bars | ✅ No Figma SVG asset |

### Auth + Legal

| Element | Figma | Implementation | Parity |
|---------|-------|----------------|--------|
| Back | — | `arrow-left` 24px | ✅ |
| Language chevron | — | `chevron-down` 16px | ✅ |
| Selected language | `677:2080` | `✓` text 18/600 `#1FA24A` | ✅ Not `check` icon |
| Offline chip dot | `580:1743` | CSS amber dot | ✅ Composition |
| Legal back | — | `arrow-left` 20px | ✅ |

### Permissions (R14)

| Permission | Icon | Parity |
|------------|------|--------|
| Location | `map-pin` 22px | ✅ |
| Crash detection | `shield-check` 22px | ✅ |
| Notifications | `bell` 22px | ✅ |

---

## Non-icon graphics (documented, not in registry)

These Figma elements are **not** `@autolokate/icons` glyphs by design:

| Graphic | Figma | Implementation |
|---------|-------|----------------|
| Loaders (R04, R09b, B2B loading) | Green 60px ellipse | `AlScreenSpinner` |
| B2B error `!` | `592:1860` ellipse + text | CSS `.ob-welcome-error__icon` |
| Language `✓` | `677:2080` text | Unicode in `LanguagePickerSheet` |
| Offline chip | `580:1743` pill + dot | `AlOfflineChip` CSS |
| Partner / plan skeletons | `588:1798` | CSS shimmer blocks |
| Car watermark | R05 | `car` 170px low-opacity ✅ in registry |

---

## Export inventory (`packages/icons/figma-export/`)

| File | Used in registry | Notes |
|------|------------------|-------|
| `payment-unconfirmed-halo-r10c.svg` | ✅ `payment-unconfirmed-halo` | Sprint 1 |
| `icon-heart.svg` | ✅ `heart` | Sprint 1 |
| `icon-smile.svg` | ✅ `smile` | Sprint 1 |
| `icon-ellipsis.svg` | ✅ `ellipsis` | Sprint 1 |
| `fetch-failed-halo-r04b.svg` | ✅ `fetch-failed-halo` | Phase A |
| `payment-success-halo-r10.svg` | ✅ `payment-success-halo` | Prior |
| `chip-icon-*.svg` (×6) | Via `check` | Identical glyph |
| `shield-check-r03.svg` | ✅ `shield-check` | Prior |
| `rider-prompt-hero-r0.svg` | ❌ | Orphan — Figma uses `circle-user` |

---

## Verification

```bash
pnpm --filter @autolokate/icons build      # ✅
pnpm --filter @autolokate/qr build # ✅
```

Registry count: **27** `AlIconName` values (23 UI + 4 halos).

---

## Sign-off

| Requirement | Status |
|-------------|--------|
| Figma source of truth | ✅ |
| No redesign / simplify / approximate | ✅ |
| Missing icons recovered | ✅ 4 added, 2 wirings fixed |
| Wrong icons replaced | ✅ R10c halo, E3 mappings |
| Screenshot references | ✅ [Index](./assets/sprint-1-asset-recovery/FIGMA_SCREENSHOT_INDEX.md) |
| Still-missing documented | ✅ Relative + Colleague tiles only |

**Icon parity for Sprint 1: approved.** Remaining work is product schema for two emergency relation options, not icon export.
