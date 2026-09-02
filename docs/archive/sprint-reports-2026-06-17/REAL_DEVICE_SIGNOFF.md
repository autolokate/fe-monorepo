# Real Device Sign-Off

**Date:** 2026-06-17  
**Build:** `@autolokate/qr` — Vite 6 + vite-plugin-pwa 1.3.0  
**Method:** Build verification + static audit (physical device lab not run in this pass)

---

## Final Verdict

# INSTALLABLE PWA READY

The **PWA install layer is implemented and production-build verified**. All P0 blockers from `FINAL_PWA_READINESS.md` are resolved in code. Physical device QA remains recommended before marketing install.

---

## Phase Completion

| Phase                   | Deliverable                                  | Status |
| ----------------------- | -------------------------------------------- | ------ |
| 1 — Manifest            | `public/manifest.webmanifest`                | ✅     |
| 2 — Icons               | 192, 512, maskable, apple-touch, favicon     | ✅     |
| 3 — Meta                | `index.html` PWA + iOS tags                  | ✅     |
| 4 — Service Worker      | vite-plugin-pwa, Workbox precache + runtime  | ✅     |
| 5 — Install Prompt      | `beforeinstallprompt` + banner on `/journey` | ✅     |
| 6 — Offline             | `offline.html` + `PwaAppShell` + banner      | ✅     |
| 7 — Permission Recovery | Settings / Retry / Continue without          | ✅     |
| 8 — Verification        | Build + dist audit                           | ✅     |

---

## Build Evidence

```
✓ tsc --noEmit
✓ vite build
✓ PWA precache 25 entries (1281 KiB)
✓ dist/sw.js generated
✓ dist/manifest.webmanifest present
```

---

## Constraint Audit

| Area                               | Touched? |
| ---------------------------------- | -------- |
| Flow dispatcher                    | ❌ No    |
| Root / Journey / PwaScan providers | ❌ No    |
| Session schema / keys              | ❌ No    |
| Routing tree                       | ❌ No    |
| Business rules                     | ❌ No    |
| Figma screen layouts               | ❌ No    |

**Added only:**

- `apps/qr/public/*`
- `apps/qr/src/pwa/*`
- `PwaAppShell` wrapper in `JourneyOrchestrator`
- `PwaInstallBanner` on flow entry
- Permission recovery actions on Park Me / SOS permission surfaces
- `vite.config.ts` PWA plugin

---

## Device Matrix (manual QA checklist)

Execute on **HTTPS production/staging** after deploy:

| Test                           | Android Chrome | Samsung | iPhone Safari  | iPhone Chrome |
| ------------------------------ | -------------- | ------- | -------------- | ------------- |
| Install / A2HS                 | ☐              | ☐       | ☐ (Share menu) | ☐             |
| Standalone launch              | ☐              | ☐       | ☐              | ☐             |
| Icon on home screen            | ☐              | ☐       | ☐              | ☐             |
| Reopen from launcher           | ☐              | ☐       | ☐              | ☐             |
| Kill app → reopen              | ☐              | ☐       | ☐              | ☐             |
| Offline (cached)               | ☐              | ☐       | ☐              | ☐             |
| SW update prompt               | ☐              | ☐       | ☐              | ☐             |
| SOS geo deny → recovery        | ☐              | ☐       | ☐              | ☐             |
| Park Me camera deny → recovery | ☐              | ☐       | ☐              | ☐             |

Mark ☐ → ✅ during QA pass.

---

## Known Platform Limits

| Item                    | Note                                       |
| ----------------------- | ------------------------------------------ |
| iOS install prompt      | No programmatic prompt; A2HS is manual     |
| Open Settings deep link | Best-effort; may show instructions only    |
| First visit offline     | Requires prior online visit to cache shell |
| Real device lab         | Not executed in this implementation pass   |

---

## Related Docs

- [PWA_MANIFEST_REPORT.md](./PWA_MANIFEST_REPORT.md)
- [SERVICE_WORKER_REPORT.md](./SERVICE_WORKER_REPORT.md)
- [INSTALL_PROMPT_REPORT.md](./INSTALL_PROMPT_REPORT.md)
- [OFFLINE_MODE_REPORT.md](./OFFLINE_MODE_REPORT.md)
- [FINAL_PWA_READINESS.md](./FINAL_PWA_READINESS.md) — prior audit (superseded for install layer)

---

## Sign-Off

| Layer                          | Result                  |
| ------------------------------ | ----------------------- |
| Installable PWA (code + build) | **READY**               |
| Physical device QA             | **Pending manual pass** |

**Overall: INSTALLABLE PWA READY**
