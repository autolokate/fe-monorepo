# Offline Mode Report

**Date:** 2026-06-17  
**Status:** COMPLETE

---

## Layers

| Layer           | File                   | Purpose                                         |
| --------------- | ---------------------- | ----------------------------------------------- |
| Static fallback | `public/offline.html`  | Branded page when shell cannot load             |
| In-app offline  | `PwaOfflineScreen.tsx` | React recovery screen                           |
| Runtime banner  | `PwaOfflineBanner.css` | Non-blocking notice when offline with cached SW |
| Shell gate      | `PwaAppShell.tsx`      | Chooses blocking vs cached offline UX           |

---

## Behavior Matrix

| Scenario                         | UX                                      |
| -------------------------------- | --------------------------------------- |
| First visit, offline, no SW      | Full `PwaOfflineScreen` — no white page |
| Return visit, offline, SW active | Cached app + top offline banner         |
| Back online                      | Banner clears automatically             |
| User taps Try again              | `window.location.reload()`              |
| SW navigate fallback             | Serves precached `index.html`           |

---

## No White Page / No Crash

- `offline.html` precached with icons
- `index.html` precached for SPA shell
- `PwaAppShell` renders recovery UI instead of empty `#root` on cold offline
- Existing demo flows (SOS timers, sessionStorage) continue when cached shell is active

---

## Network-First HTML

Workbox `NetworkFirst` for documents (5s timeout) falls back to cache when network unavailable.

---

## Integration Point

`JourneyOrchestrator` wraps routes with `PwaAppShell` — **outside** `AutolokateRootProvider` children order preserved:

```
BrowserRouter → AutolokateRootProvider → PwaAppShell → Routes
```

Providers, session schema, and flow routes unchanged.

---

## Verdict

**Offline mode layer: READY**
