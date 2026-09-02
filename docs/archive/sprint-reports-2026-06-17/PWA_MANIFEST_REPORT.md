# PWA Manifest Report

**Date:** 2026-06-17  
**App:** `apps/qr`  
**Status:** COMPLETE

---

## Summary

Production web app manifest added at `apps/qr/public/manifest.webmanifest`, linked from `index.html`, and copied to `dist/` on build.

---

## Manifest Fields

| Field              | Value                                                                |
| ------------------ | -------------------------------------------------------------------- |
| `name`             | Autolokate                                                           |
| `short_name`       | Autolokate                                                           |
| `description`      | Vehicle protection activation, emergency SOS, and Park Me reporting. |
| `start_url`        | `/journey`                                                           |
| `scope`            | `/`                                                                  |
| `display`          | `standalone`                                                         |
| `orientation`      | `portrait`                                                           |
| `theme_color`      | `#0A0A0A`                                                            |
| `background_color` | `#0A0A0A`                                                            |

---

## Icons

| File                           | Size    | Purpose         |
| ------------------------------ | ------- | --------------- |
| `/icons/icon-192.png`          | 192×192 | `any`           |
| `/icons/icon-512.png`          | 512×512 | `any`           |
| `/icons/icon-192-maskable.png` | 192×192 | `maskable`      |
| `/icons/icon-512-maskable.png` | 512×512 | `maskable`      |
| `/apple-touch-icon.png`        | 180×180 | iOS home screen |
| `/favicon.ico`                 | 32×32   | Browser tab     |
| `/favicon-32.png`              | 32×32   | Browser tab     |
| `/favicon-16.png`              | 16×16   | Browser tab     |

Icons generated from `packages/brand/src/assets/al-mark-light.svg` on `#0A0A0A` canvas via `scripts/generate-pwa-icons.mjs` (Autolokate branding — no placeholders).

---

## HTML Meta (Phase 3)

Added to `index.html`:

- `viewport-fit=cover`
- `theme-color`
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style` (`black-translucent`)
- `apple-mobile-web-app-title`
- `<link rel="manifest">`
- favicon + apple-touch-icon links

---

## Build Verification

```
dist/manifest.webmanifest   ✓
dist/icons/icon-*.png       ✓
dist/apple-touch-icon.png   ✓
dist/favicon.ico            ✓
```

Precached by service worker (25 entries).

---

## Unchanged (per constraint)

- Routes, flow dispatcher, providers, session keys, business rules, Figma screens

---

## Verdict

**Manifest layer: READY**
