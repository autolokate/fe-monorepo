# Install Prompt Report

**Date:** 2026-06-17  
**Target:** Android Chrome (Chromium `beforeinstallprompt`)  
**Status:** COMPLETE

---

## Implementation

| File                                      | Role                             |
| ----------------------------------------- | -------------------------------- |
| `src/pwa/use-pwa-install.ts`              | Captures deferred install prompt |
| `src/pwa/components/PwaInstallBanner.tsx` | Install CTA UI                   |
| `src/journey/screens/FlowEntryScreen.tsx` | Banner mount point (`/journey`)  |

---

## Flow

1. Chrome fires `beforeinstallprompt` → event prevented and stored
2. `PwaInstallBanner` shown when:
   - Deferred prompt available
   - App not already installed (standalone check)
   - User has not dismissed within 7 days
3. **Install** → `prompt()` → `userChoice`
4. **Not now** → dismiss + `localStorage` timestamp

---

## Storage Keys

| Key                           | Purpose                  |
| ----------------------------- | ------------------------ |
| `al-pwa-install-dismissed-at` | Epoch ms of last dismiss |

Re-prompt after **7 days** (`PWA_INSTALL_DISMISS_MS`).

---

## Standalone Detection

```ts
matchMedia('(display-mode: standalone)').matches;
navigator.standalone; // iOS legacy
```

Banner hidden when already installed.

---

## iOS Note

iOS does not support `beforeinstallprompt`. Users add via Safari Share → Add to Home Screen. Manifest + Apple meta tags enable proper standalone launch and icon.

---

## UX Scope

- Banner placed on flow entry only — no changes to activation/PWA flow screens
- Uses existing `AlButton` + DS tokens
- Does not alter flow dispatcher or routing

---

## Prerequisites (now met)

- HTTPS (Vercel) ✓
- Valid manifest ✓
- Service worker ✓
- Icons 192 + 512 ✓

---

## Verdict

**Install prompt layer: READY** (Android Chrome)  
**iOS A2HS:** Meta + icons READY; manual user action required by platform
