# Session Health Report

**Date:** 2026-06-17  
**Scope:** Journey + PWA session persistence across Phase 1 unified provider

---

## Storage keys (unchanged)

| Key | Store | Owner |
|-----|-------|-------|
| `al-journey-v1` | sessionStorage | JourneyProvider |
| `al-selected-flow` | localStorage | JourneyProvider |
| `al-pwa-scan-v1` | sessionStorage | PwaScanProvider |
| `al-qr-theme` | localStorage | App root |

**Verified:** No new keys. No schema merge.

---

## Write paths

| Action | Clears journey? | Clears PWA? |
|--------|-----------------|-------------|
| `clearJourney()` (completed screen) | ✅ Yes | ❌ No |
| `dispatchPlatformFlow('postActivation')` | ❌ No | ❌ No |
| `setSelectedFlow` / `updateSession` | Partial journey update | ❌ No |
| PWA `updateSession` | ❌ No | Updates PWA only |
| `resetSession()` | ❌ No | Would reset PWA — **never called from routes** |

---

## Cross-navigation

| Transition | Journey memory | PWA memory | Storage |
|------------|----------------|------------|---------|
| `/journey` → PWA card | Preserved ✅ | Preserved ✅ | Both keys intact |
| PWA → `/journey` (back/URL) | Preserved ✅ | Preserved ✅ | Both keys intact |
| Phase 1 vs before | **Improved** — provider no longer unmounts | **Improved** | Same as before |

Post-activation dispatch does **not** call `setSelectedFlow` — verified in `flow-dispatcher.ts`.

---

## Refresh behavior

Full page reload remounts providers and re-hydrates from `sessionStorage` for both keys. Theme re-applied from `localStorage` in `main.tsx`.

---

## Theme persistence

Independent of providers: `al-qr-theme` + `data-theme` on `<html>`. Survives route changes and refresh.

---

## Special scenarios

| Scenario | Journey after | PWA after | Issue? |
|----------|---------------|-----------|--------|
| Purchase → Completed → Go home → PWA | Cleared (intentional) | Intact | No |
| Purchase → Completed → PWA (no go home) | Intact | Intact | No |
| PWA mid-verify → `/journey` → Purchase | Intact / updated on card | Intact | No |
| Prepaid → Home → PWA | Intact | Intact | No |
| B2B2C → Home → Purchase | Flow updated on card | Intact | No |

---

## Final verdict

# VERIFIED

Session keys and schemas unchanged. No accidental cross-slice clearing. Phase 1 preserves in-memory state across cross-navigation.
