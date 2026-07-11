# Service Worker Report

**Date:** 2026-06-17  
**Stack:** `vite-plugin-pwa` v1.3.0 + Workbox 7  
**Status:** COMPLETE

---

## Configuration

File: `apps/qr/vite.config.ts`

| Setting | Value |
|---------|-------|
| `registerType` | `prompt` — user confirms updates |
| `injectRegister` | `auto` |
| `manifest` | `false` — static `manifest.webmanifest` in `public/` |
| `skipWaiting` | `false` — safe rollout |
| `clientsClaim` | `true` |
| `cleanupOutdatedCaches` | `true` |

---

## Precache

Build output (2026-06-17):

- **25 precache entries** (~1.28 MB)
- Includes: `index.html`, `offline.html`, manifest, icons, JS, CSS, favicons

Generated files:

- `dist/sw.js`
- `dist/workbox-*.js`

---

## Runtime Caching

| Strategy | Targets | Cache name | TTL |
|----------|---------|------------|-----|
| Navigation fallback | SPA routes → `/index.html` | precache | versioned |
| NetworkFirst | HTML documents | `al-html-shell` | 24h |
| StaleWhileRevalidate | JS / CSS | `al-static-assets` | 30d |
| CacheFirst | Images | `al-images` | 14d |

Denylist: `/api/*`

---

## Versioning & Updates

| Mechanism | Implementation |
|-----------|----------------|
| Cache busting | Workbox content hashes on precache |
| New deploy | New `sw.js` revision |
| User prompt | `usePwaUpdate()` + `PwaUpdatePrompt` |
| Apply update | `updateServiceWorker(true)` → `skipWaiting` + reload |
| Dismiss update | Session flag `al-pwa-update-dismissed-at` |

Client hook: `src/pwa/use-pwa-update.ts` (`virtual:pwa-register/react`)

---

## Safe Invalidation

- `cleanupOutdatedCaches: true` removes stale Workbox caches on activate
- Precache revisions change when assets change
- Old caches expire per `ExpirationPlugin` max age

---

## Offline Shell

| Layer | Behavior |
|-------|----------|
| `public/offline.html` | Static offline page with Try again |
| `PwaAppShell` | Blocks cold offline load when no SW controller |
| Cached shell | After first visit, app runs offline with banner |

---

## Build Command

```bash
pnpm --filter @autolokate/qr build
```

Prebuild regenerates icons; Vite PWA plugin emits SW.

---

## Unchanged

No changes to flow routes, providers, or session architecture.

---

## Verdict

**Service worker layer: READY**
