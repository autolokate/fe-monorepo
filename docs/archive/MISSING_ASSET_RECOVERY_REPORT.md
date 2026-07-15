# Sprint 1 — Missing Asset Recovery Report

**Goal:** Recover every missing Figma asset before parity work.  
**Source of truth:** Figma · [Autolokate · Consumer App](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/) (`FtHCUnE0HH586PtG5yJyG0`)  
**Scope:** Shared Auth + Legal · Purchase · Emergency · Prepaid · B2B2C  
**Date:** 2026-06-17  
**Constraints:** No routing changes · No business-logic changes · No redesign / simplify / approximate

**Screenshot index:** [`docs/assets/sprint-1-asset-recovery/FIGMA_SCREENSHOT_INDEX.md`](./assets/sprint-1-asset-recovery/FIGMA_SCREENSHOT_INDEX.md)

---

## Executive summary

| Category                           | Missing (audit)  | Recovered (Sprint 1) | Still missing |
| ---------------------------------- | ---------------- | -------------------- | ------------- |
| Icon registry gaps                 | 4                | 4                    | 0             |
| Wrong icon wiring                  | 2                | 2                    | 0             |
| Emergency relation icons           | 3 wrong mappings | 3 fixed              | 0             |
| Compositions validated (no change) | 3                | 3                    | 0             |
| UI option gaps (not icon assets)   | 2 relation tiles | —                    | 2             |
| **Total blocking icon assets**     | **9**            | **9**                | **0**         |

Sprint 1 closes all **icon-pack and halo wiring gaps** identified across the five audited flows. Remaining items are **UI surface gaps** (two emergency relation tiles) where Figma icons already exist in `@autolokate/icons` but product options are not exposed — deferred to avoid `RelationshipId` / session schema changes.

---

## Recovered assets

### 1. `payment-unconfirmed-halo` (Purchase · R10c)

| Field          | Detail                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| **Figma**      | `579:1638` · halo `579:1642` — amber blur + ring + white credit-card glyph              |
| **Before**     | `R10cPaymentUnconfirmedScreen` reused `fetch-failed-halo` (circle-x)                    |
| **After**      | `AlIcon name="payment-unconfirmed-halo" size={240}`                                     |
| **Export**     | `packages/icons/figma-export/payment-unconfirmed-halo-r10c.svg`                         |
| **Source**     | `packages/icons/src/generated/payment-unconfirmed-halo.tsx`                             |
| **Screenshot** | [Figma 579:1638](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=579-1638) |

### 2. `heart` (Emergency · relation grid · Spouse)

| Field          | Detail                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| **Figma**      | `374:71` · `icon/heart` `603:1895` on Spouse tile                                   |
| **Before**     | Mapped to generic `user`                                                            |
| **After**      | `RELATIONSHIP_OPTIONS` → `heart` · `AlIcon name="heart" size={26}`                  |
| **Export**     | `packages/icons/figma-export/icon-heart.svg`                                        |
| **Source**     | `packages/icons/src/generated/heart.tsx`                                            |
| **Screenshot** | [Figma 374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71) |

### 3. `smile` (Emergency · relation grid · Friend)

| Field          | Detail                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| **Figma**      | `374:71` · `icon/smile` `588:309` on Friend tile                                    |
| **Before**     | Mapped to generic `user`                                                            |
| **After**      | `RELATIONSHIP_OPTIONS` → `smile`                                                    |
| **Export**     | `packages/icons/figma-export/icon-smile.svg`                                        |
| **Source**     | `packages/icons/src/generated/smile.tsx`                                            |
| **Screenshot** | [Figma 374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71) |

### 4. `ellipsis` (Emergency · relation grid · Other)

| Field          | Detail                                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| **Figma**      | `374:71` · `icon/ellipsis` `588:314` on Other tile                                  |
| **Before**     | Mapped to `plus`                                                                    |
| **After**      | `RELATIONSHIP_OPTIONS` → `ellipsis`                                                 |
| **Export**     | `packages/icons/figma-export/icon-ellipsis.svg`                                     |
| **Source**     | `packages/icons/src/generated/ellipsis.tsx`                                         |
| **Screenshot** | [Figma 374:71](https://www.figma.com/design/FtHCUnE0HH586PtG5yJyG0/?node-id=374-71) |

### 5–7. Validated exact (no code change required)

| Asset                   | Figma                                                      | Implementation                                                | Status   |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | -------- |
| B2B/Prepaid error alert | `588:1850` · `592:1860` — 56px `#F5A623` circle + bold `!` | `WelcomeActivationErrorPanel` + `.ob-welcome-error__icon` CSS | ✅ Exact |
| Language picker check   | `677:2071` · `677:2080` — green `✓` text 18/600            | `LanguagePickerSheet` · `✓` in `.ob-language-picker__check`   | ✅ Exact |
| Partner avatar          | `386:889` · `608:265` — initials in `#4A4A4A` circle       | `PartnerActivationCard` initials span                         | ✅ Exact |

---

## Missing assets (audit baseline)

Assets that were wrong or absent before Sprint 1:

| #   | Flow      | Screen          | Asset type    | Figma node | Issue                                                                              |
| --- | --------- | --------------- | ------------- | ---------- | ---------------------------------------------------------------------------------- |
| 1   | Purchase  | R10c            | Halo          | `579:1642` | Wrong halo (`fetch-failed-halo`)                                                   |
| 2   | Purchase  | R10c            | Icon registry | —          | `payment-unconfirmed-halo` in `dist/` only, missing from `src/`                    |
| 3   | Emergency | R3              | Icon          | `603:1895` | Spouse used `user`                                                                 |
| 4   | Emergency | R3              | Icon          | `588:309`  | Friend used `user`                                                                 |
| 5   | Emergency | R3              | Icon          | `588:314`  | Other used `plus`                                                                  |
| 6   | B2B2C     | Error           | Alert graphic | `592:1860` | Suspected approximation (audit) — **validated exact**                              |
| 7   | Auth      | Language picker | Check glyph   | `677:2080` | Suspected `check` icon (audit) — **validated text ✓ per Figma**                    |
| 8   | B2B2C     | Partner card    | Avatar        | `608:265`  | Suspected logo asset (audit) — **validated initials per Figma**                    |
| 9   | Emergency | R0              | Hero          | `375:58`   | Suspected `rider-prompt-hero-r0.svg` — **validated `circle-user` in 112px circle** |

---

## Still missing assets

Items that remain out of parity after Sprint 1. None are blocking icon-registry gaps.

| #   | Flow      | Asset                       | Figma                           | Why still missing                                                      | Next step                                                  |
| --- | --------- | --------------------------- | ------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Emergency | **Relative** relation tile  | `374:71` · `icon/house` `17:5`  | `RelationshipId` has no `relative`; adding tile changes session schema | Extend `RelationshipId` + grid in a schema-approved sprint |
| 2   | Emergency | **Colleague** relation tile | `374:71` · `icon/store` `17:10` | Same — `house` / `store` icons already in registry                     | Same as above                                              |

**Note:** `packages/icons/figma-export/rider-prompt-hero-r0.svg` is an orphan export with baked-in text. Figma frame `375:37` uses `icon/circle-user` inside a `#4A4A4A` circle — **do not wire** the orphan SVG.

---

## Flow-by-flow asset inventory

### Shared Auth + Legal

| Asset                            | Figma ref  | Status                |
| -------------------------------- | ---------- | --------------------- |
| `arrow-left` back                | `19:5`     | ✅ Registry + wired   |
| `chevron-down` language switcher | —          | ✅                    |
| Language picker `✓`              | `677:2080` | ✅ Text glyph (exact) |
| `AlOfflineChip` amber dot        | `580:1743` | ✅ CSS composition    |
| Legal `arrow-left`               | `677:2090` | ✅                    |
| Auth success `circle-check` 64px | —          | ✅                    |

### Purchase

| Asset                                          | Figma ref             | Status                    |
| ---------------------------------------------- | --------------------- | ------------------------- |
| Vahan chip `check` 10×7                        | `170:38`              | ✅ Phase A                |
| Trust row `shield-check` 16px                  | `170:56`              | ✅                        |
| R04 loader 60px green ellipse                  | `179:44`              | ✅ `AlScreenSpinner`      |
| `fetch-failed-halo` R04b/R10b                  | `579:1667` / `194:28` | ✅                        |
| `payment-success-halo` R10                     | `194:37`              | ✅                        |
| **`payment-unconfirmed-halo` R10c**            | `579:1642`            | ✅ **Recovered Sprint 1** |
| R09b spinner 60px                              | `579:1691`            | ✅ `AlScreenSpinner`      |
| `car` watermark R05                            | `181:25`              | ✅                        |
| `circle-check` verified badge                  | —                     | ✅                        |
| Permission `map-pin` / `shield-check` / `bell` | R14                   | ✅                        |
| `activation-complete-halo` R15                 | `171:62`              | ✅                        |

### Emergency

| Asset                                      | Figma ref   | Status                        |
| ------------------------------------------ | ----------- | ----------------------------- |
| R0 hero `circle-user` 50px in 112px circle | `375:57–58` | ✅                            |
| `users` empty state 48px                   | E5          | ✅                            |
| `shield-check` trust 16px                  | —           | ✅                            |
| Relation Spouse **`heart`**                | `603:1895`  | ✅ **Recovered Sprint 1**     |
| Relation Parent `user`                     | `19:13`     | ✅                            |
| Relation Child `circle-user`               | `17:21`     | ✅                            |
| Relation Sibling `users`                   | `17:16`     | ✅                            |
| Relation Friend **`smile`**                | `588:309`   | ✅ **Recovered Sprint 1**     |
| Relation Relative `house`                  | `17:5`      | ⚠️ Icon ready; tile not in UI |
| Relation Colleague `store`                 | `17:10`     | ⚠️ Icon ready; tile not in UI |
| Relation Other **`ellipsis`**              | `588:314`   | ✅ **Recovered Sprint 1**     |
| `circle-check` contact verified            | —           | ✅                            |
| `plus` add contact                         | —           | ✅                            |

### Prepaid + B2B2C

| Asset                                | Figma ref  | Status                         |
| ------------------------------------ | ---------- | ------------------------------ |
| `arrow-left`                         | —          | ✅                             |
| Partner initials avatar              | `608:265`  | ✅                             |
| `circle-check` partner verified 18px | `608:269`  | ✅                             |
| Plan Paid chip `circle-check` 13px   | `615:268`  | ✅                             |
| Feature rows `circle-check` 15px     | —          | ✅                             |
| Rider row `user` 15px                | `443:37`   | ✅                             |
| Loading skeleton blocks              | `588:1798` | ✅ CSS skeleton (no Figma SVG) |
| Error alert 56px amber `!`           | `592:1860` | ✅ CSS (exact)                 |

---

## Files changed (Sprint 1)

| Path                                                        | Change                      |
| ----------------------------------------------------------- | --------------------------- |
| `packages/icons/src/generated/payment-unconfirmed-halo.tsx` | **Added**                   |
| `packages/icons/src/generated/heart.tsx`                    | **Added**                   |
| `packages/icons/src/generated/smile.tsx`                    | **Added**                   |
| `packages/icons/src/generated/ellipsis.tsx`                 | **Added**                   |
| `packages/icons/src/svg/*.svg`                              | **Added** exports for above |
| `packages/icons/src/iconNames.ts`                           | Registered 4 names          |
| `packages/icons/src/generated/map.ts`                       | Mapped 4 components         |
| `packages/icons/src/generated/index.ts`                     | Exported 4 components       |
| `apps/qr/.../R10cPaymentUnconfirmedScreen.tsx`              | `payment-unconfirmed-halo`  |
| `apps/qr/.../relationships.ts`                              | Figma icon mappings         |

---

## Build verification

```bash
pnpm --filter @autolokate/icons build      # ✅ pass
pnpm --filter @autolokate/qr build # ✅ pass
```

---

## Sign-off

| Check                                           | Result                        |
| ----------------------------------------------- | ----------------------------- |
| Figma used as source of truth                   | ✅                            |
| No routing changes                              | ✅                            |
| No business-logic changes                       | ✅                            |
| Icon registry gaps closed                       | ✅                            |
| Wrong halo on R10c fixed                        | ✅                            |
| Emergency relation icons aligned (6 of 8 tiles) | ✅                            |
| Remaining gaps documented                       | ✅ Relative + Colleague tiles |

**Sprint 1 asset recovery: complete for icon-pack scope.** Proceed to pixel parity sprints; schedule `RelationshipId` extension separately for Relative + Colleague tiles.
