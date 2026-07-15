# Production Camera Flow — Root Cause Analysis

**Date:** 2026-06-17  
**Severity:** P0 — production blocker  
**Environment:** Vercel deployment (`*.vercel.app`), mobile browser / PWA  
**Symptom:** After camera capture and accepting a photo, navigation occurs and the entire screen goes black. Does not reproduce reliably on localhost.

---

## Summary

| Field                         | Value                                                                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Exact failing route (SOS)** | `/pwa/scan/sos/scene-photos` → `/pwa/scan/sos/scene-photos/captured` (4th photo) or `/pwa/scan/park-me/photos` → `/pwa/scan/park-me/review`               |
| **Exact failing component**   | `PwaScanProvider` → `updateSession` → `savePwaScanSession` (uncaught throw inside React `setState` updater)                                               |
| **Exact exception**           | `DOMException: QuotaExceededError` from `window.sessionStorage.setItem`                                                                                   |
| **Why localhost works**       | Dev testing uses smaller/no real camera files; desktop file picker returns smaller images; sessionStorage rarely fills                                    |
| **Why Vercel fails**          | Real mobile camera photos (3–12 MB each) encoded as base64 data URLs (4–16 MB each) exceed `sessionStorage` quota (~5–10 MB per origin) on phone browsers |

---

## Failure Chain

```
User accepts photo in native camera
  → useCameraCapture: FileReader.readAsDataURL(full-resolution file)
  → captureSlot: updateSession({ parkMePhotos | sosPhotos: dataUrl })
  → PwaScanContext.setSession updater
  → savePwaScanSession(next)
  → JSON.stringify(session)   // 6–30+ MB with multiple photos
  → sessionStorage.setItem()  // throws QuotaExceededError
  → Uncaught exception in setState updater
  → React unmounts entire tree
  → #root renders nothing → black screen
  → (SOS) useEffect may still navigate to review route on partial in-memory state
```

There is **no `URL.createObjectURL`** in this flow. Photos are stored as inline base64 strings, not blob URLs. The `blob` from capture was previously discarded; lifecycle of object URLs is not a factor.

---

## Audit Checklist

| #   | Area                               | Finding                                                                                                                       |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Camera capture payload             | Full-resolution JPEG/HEIC from device camera via `<input capture="environment">`; converted to base64 data URL with no resize |
| 2   | File object serialization          | `File` is not persisted; only `dataUrl` string is written to session JSON                                                     |
| 3   | Blob handling                      | `blob` returned from hook but never used; no IndexedDB / object URL storage                                                   |
| 4   | `URL.createObjectURL` lifecycle    | **Not used** anywhere in post-activation PWA                                                                                  |
| 5   | `sessionStorage` persistence       | Entire `PwaScanSession` JSON including all photo strings saved on every `updateSession` call; **save had no try/catch**       |
| 6   | Navigation after capture           | SOS auto-navigates to `sos/scene-photos/captured` when 4 slots filled; Park Me navigates to `park-me/review` on button click  |
| 7   | Review screen required props       | No guards — review routes render with empty `<img>` if photos missing; not the crash cause                                    |
| 8   | Undefined property access          | Not primary cause; session hydrate merges defaults safely on load                                                             |
| 9   | Error boundaries                   | **None** before fix — any thrown error blanked `#root`                                                                        |
| 10  | Production-only Vercel differences | HTTPS + real mobile camera + stricter storage limits + production build (no dev overlays); not a Vercel platform bug          |

---

## Contributing Factors

### Secondary: `PwaFade` initial opacity 0

Photo routes wrapped content in `PwaFade` with `initial={{ opacity: 0 }}` on dark emergency background. After a heavy state update this reads as a black screen for ~220ms even without a crash.

### Secondary: Stale closure in capture handlers

`updateSession({ parkMePhotos: { ...session.parkMePhotos, [slot]: dataUrl } })` closed over stale `session` from render. Could lose slots on rapid retake; not the black-screen root cause.

### Secondary: `FileReader` without `onerror`

Failed reads left `capturePhoto()` pending and slot stuck in `capturing` — frozen UI, not blank root.

---

## Minimal Fix (Applied)

1. **Compress before persist** — `compressCaptureImage()` resizes to max 1280px, JPEG 0.72 (~150–400 KB per photo) before storing data URL.
2. **Safe session save** — `savePwaScanSession()` wraps `setItem` in try/catch; returns `{ ok: false, code: 'QuotaExceededError' }` instead of throwing.
3. **In-memory fallback** — React state still updates when storage fails; user sees warning banner, not crash.
4. **Error boundary** — `PwaScanErrorBoundary` wraps all PWA routes; shows recovery UI instead of blank screen.
5. **Photo route guards** — `PwaPhotoRouteGuard` on all photo/review routes with capture error + storage error banners.
6. **Diagnostics** — `logPhotoDiagnostic()` writes last 40 events to `sessionStorage` key `al-pwa-photo-diagnostics` (never throws).
7. **No black flash** — `PwaFade immediate` on photo routes skips initial opacity 0.
8. **Functional session updates** — `usePwaPhotoCapture` uses `updateSession(prev => …)` to avoid stale closures.

---

## Files Changed

| File                                  | Change                                   |
| ------------------------------------- | ---------------------------------------- |
| `utils/compress-capture-image.ts`     | New — canvas resize/compress             |
| `utils/pwa-photo-diagnostics.ts`      | New — runtime diagnostics                |
| `storage/pwa-scan-storage.ts`         | Safe save + size logging                 |
| `context/PwaScanContext.tsx`          | Functional patches, `storageError` state |
| `hooks/use-camera-capture.ts`         | Compress + error propagation             |
| `hooks/use-pwa-photo-capture.ts`      | New — guarded capture helper             |
| `components/PwaScanErrorBoundary.tsx` | New — fallback UI                        |
| `components/PwaPhotoRouteGuard.tsx`   | New — route guards                       |
| `components/PwaMotion.tsx`            | `PwaFade immediate` prop                 |
| `routes/PwaScanRoutes.tsx`            | Top-level error boundary                 |
| `routes/pwa-sos-routes.tsx`           | Guarded SOS photo routes                 |
| `routes/pwa-park-me-routes.tsx`       | Guarded Park Me photo routes             |
| `styles/pwa-scan.css`                 | Alert + error fallback styles            |

---

## Verification on Vercel

1. Deploy this branch.
2. Open SOS or Park Me photo flow on a **real phone** (not desktop devtools).
3. Capture **2–4 full camera photos**.
4. Confirm review screen renders (not black).
5. If storage fills, confirm amber warning banner — not blank screen.
6. Inspect diagnostics: `sessionStorage.getItem('al-pwa-photo-diagnostics')` in remote debugging.

---

## Future Hardening (Out of Scope)

- Store photos in **IndexedDB**; keep only thumbnail IDs in `sessionStorage`
- Use `URL.createObjectURL(blob)` for `<img src>` display; revoke on unmount
- Server upload pipeline for production (no client-side photo persistence)
