# Permission Audit

**Date:** 2026-06-17  
**Scope:** Runtime permission APIs used by Autolokate PWA (activation + post-activation)  
**Method:** Static code audit — **not** executed on physical devices in this pass  
**Constraint:** Audit only; no flow or business-rule changes

---

## Executive Summary

| Permission            | Used in app               | API                                                   | UI for deny/block | Device QA status  |
| --------------------- | ------------------------- | ----------------------------------------------------- | ----------------- | ----------------- |
| **Geolocation**       | YES — Park Me, SOS        | `navigator.geolocation`                               | YES               | Needs real device |
| **Camera**            | YES — Park Me, SOS photos | `<input capture>` + optional `getUserMedia` preflight | PARTIAL           | Needs real device |
| **Contacts (device)** | **NO**                    | —                                                     | N/A               | N/A               |
| **Notifications**     | **NO**                    | —                                                     | N/A               | N/A               |
| **Microphone**        | **NO**                    | —                                                     | N/A               | N/A               |
| **Clipboard**         | **NO**                    | —                                                     | N/A               | N/A               |

**“Contacts” in product copy** refers to **emergency contact phone numbers entered manually** during activation (E02/E06) or SOS **“Alert contacts only”** dispatch state — **not** the native Contacts Picker / `navigator.contacts` API.

---

## Geolocation

### Implementation

```23:64:apps/qr/src/features/post-activation-pwa/hooks/use-geolocation.ts
  const requestLocation = useCallback((): Promise<GeoResult | null> => {
    // ...
      navigator.geolocation.getCurrentPosition(
        (position) => { /* reverse geocode */ },
        (geoError) => {
          setError(geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'unavailable');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
```

| Trigger            | Route / screen                                 | User gesture                             |
| ------------------ | ---------------------------------------------- | ---------------------------------------- |
| Park Me photos     | `PwaParkMePhotosRoute` — `handleLocation`      | Button tap on photos screen              |
| SOS allow location | `PwaSosAllowLocationRoute` — `handleAllow`     | Permission sheet primary + location chip |
| SOS location chip  | `PwaEmergencyScreen` → navigate to allow route | Tap                                      |

### Denied / unavailable handling

| State                      | Behavior                           | Route                          |
| -------------------------- | ---------------------------------- | ------------------------------ |
| Permission denied          | `error: 'denied'`, `resolve(null)` | SOS → `sosLocationUnavailable` |
| Timeout / unavailable      | `error: 'unavailable'`             | Same                           |
| User chooses contacts-only | `sosStatus: 'contacts-only'`       | `sosContactsOnly`              |
| Retry                      | “Turn on location” CTA             | Back to `sosAllowLocation`     |

```395:428:apps/qr/src/features/post-activation-pwa/routes/pwa-sos-routes.tsx
export function PwaSosLocationUnavailableRoute() {
  // ...
  description="Responders can't reach the spot without it. Turn it on to send help, or alert their contacts only."
  // Alert contacts only → sosContactsOnly
  // Turn on location → sosAllowLocation
```

Session flag: `locationDenied` on `PwaScanSession`.

### Permission matrix (code-supported)

| Scenario                | Expected UX                                     | Code support                           |
| ----------------------- | ----------------------------------------------- | -------------------------------------- |
| First request (granted) | OS prompt → coords stored in session            | PASS                                   |
| Denied once             | Error route / unavailable hero                  | PASS                                   |
| Blocked permanently     | OS may not re-prompt; retry CTA still calls API | PARTIAL — no “Open Settings” deep link |
| Re-request after deny   | User can tap “Turn on location” again           | PASS                                   |
| Settings recovery flow  | Guide user to OS Settings                       | **FAIL** — not implemented             |

### Platform notes (expected, needs device QA)

| Platform       | Notes                                                                                |
| -------------- | ------------------------------------------------------------------------------------ |
| iOS Safari     | Requires HTTPS + user gesture; precise location prompt; Settings → Safari → Location |
| Android Chrome | Site settings → Location; “blocked” persists per origin                              |
| Standalone PWA | Same APIs; behavior untested without manifest                                        |

---

## Camera

### Primary capture path — file input

```23:27:apps/qr/src/features/post-activation-pwa/hooks/use-camera-capture.ts
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
```

Used via `usePwaPhotoCapture` on Park Me (2 photos) and SOS (4 scene photos).

| Scenario            | Handling                                      |
| ------------------- | --------------------------------------------- |
| User cancels picker | `capture_cancelled` diagnostic, `null` result |
| Compression failure | Error surfaced via capture hook               |
| Retake              | Per-slot retake in photo grid                 |

**Does not use** persistent `getUserMedia` stream for live viewfinder — OS camera app / picker only.

### Preflight path — getUserMedia (Park Me only)

```70:79:apps/qr/src/features/post-activation-pwa/hooks/use-geolocation.ts
export async function requestMediaPermissions(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => { track.stop(); });
    return true;
  } catch {
    return false;
  }
}
```

Invoked from `PwaParkMePermissionsRoute` on “Allow access”.

| Check                      | Status   | Issue                                                                                     |
| -------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| Requests camera            | PASS     | `getUserMedia({ video: true })`                                                           |
| Requests location at sheet | **FAIL** | Sheet copy says “camera & location” but `handleAllow` does **not** call `requestLocation` |
| Stores grant flag          | PASS     | `permissionsGranted` on session                                                           |
| “Not now” skip             | PASS     | Navigates to photos without preflight                                                     |

```227:231:apps/qr/src/features/post-activation-pwa/routes/pwa-park-me-routes.tsx
  const handleAllow = async () => {
    const granted = await requestMediaPermissions();
    updateSession({ permissionsGranted: granted });
    setSheetOpen(false);
    void navigate(pwaScanPaths.parkMePhotos);
```

Location is requested **later** on the photos route via separate `requestLocation()` — timing differs from sheet promise.

### SOS camera

No dedicated permission sheet before SOS photos; capture starts on photo route via file input (implicit OS permission on first capture).

### Permission matrix (camera)

| Scenario            | Park Me                                           | SOS                     |
| ------------------- | ------------------------------------------------- | ----------------------- |
| Granted             | Preflight optional; capture works                 | Capture on demand       |
| Denied getUserMedia | `permissionsGranted: false`, still reaches photos | N/A (no preflight)      |
| Denied file capture | OS blocks picker; app shows capture error paths   | Same                    |
| Blocked permanently | No settings deep link                             | Same                    |
| Re-request          | User can re-open permission route from flow       | Retake / re-tap capture |

---

## Contacts

| Interpretation                  | Reality                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| Device address book             | **Not used** — no `navigator.contacts`, no Contact Picker API |
| Emergency contacts (activation) | Manual name + mobile entry (E01–E06)                          |
| SOS “contacts alerted”          | In-app dispatch demo state (`sosContactsOnly`, timeline copy) |

**Special check — Contacts on real device:** N/A for native contacts permission. Verify **manual emergency contact entry** and **SOS contacts-only branch** on device instead.

---

## Notifications

| Check                            | Status    |
| -------------------------------- | --------- |
| `Notification.requestPermission` | Not found |
| Push / Web Push                  | Not found |

---

## Microphone

| Check                     | Status                                   |
| ------------------------- | ---------------------------------------- |
| `getUserMedia({ audio })` | Not found                                |
| SOS alert tone            | Audio file playback (not mic permission) |

---

## Clipboard

| Check                 | Status                                                                            |
| --------------------- | --------------------------------------------------------------------------------- |
| `navigator.clipboard` | Not found                                                                         |
| OTP paste             | `handleOtpPaste` in OtpInput — reads paste **event**, no Clipboard API permission |

---

## Clipboard / Geolocation naming

User checklist listed both **Location** and **Geolocation** — same API (`navigator.geolocation`) in this codebase.

---

## Activation flow permissions

Consumer QR activation flows (Purchase, Prepaid/B2B, B2B2C) use:

- Mobile + OTP (no device permission)
- Plate / vehicle entry (no camera in standard path)
- Emergency contact **manual** phone entry

No camera or location during activation unless user later enters post-activation PWA.

---

## Permission denied vs blocked — recovery gaps

| Recovery pattern                                                     | Implemented                        |
| -------------------------------------------------------------------- | ---------------------------------- |
| In-app retry button                                                  | YES (location retry, photo retake) |
| Explain why permission needed                                        | YES (permission sheets)            |
| Deep link to iOS Settings                                            | NO                                 |
| Deep link to Android app settings (`intent://` / site settings hint) | NO                                 |
| Detect permanent block vs one-time deny                              | NO — both map to `null` / `denied` |

---

## Real-device test checklist (manual)

Execute on HTTPS production/staging URL:

1. **Geo granted** — Park Me photos: location name appears after tap.
2. **Geo denied** — SOS: lands on location unavailable; contacts-only path works.
3. **Geo blocked** — Deny + “Don’t ask again” (Android) / iOS Settings block → retry behavior.
4. **Camera granted** — Park Me: two photos compress and preview.
5. **Camera denied** — Capture cancel / error surfaces; flow continues or shows error state.
6. **Park Me sheet** — Confirm location prompt appears **on photos screen**, not on permission sheet (documented mismatch).
7. **tel:112** — `PwaEmergencyScreen` emergency dial link opens dialer (no permission).

---

## Verdict

| Category                        | Verdict                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| Geolocation                     | **Code complete** — needs real-device QA                         |
| Camera                          | **Code complete** — Park Me sheet/copy mismatch; needs device QA |
| Device contacts                 | **Not applicable**                                               |
| Notifications / mic / clipboard | **Not in scope**                                                 |
| Settings recovery               | **Gap** — no OS settings guidance                                |

See `IOS_AUDIT.md`, `ANDROID_AUDIT.md`, and `REAL_DEVICE_TEST_MATRIX.md` for per-device matrices.
