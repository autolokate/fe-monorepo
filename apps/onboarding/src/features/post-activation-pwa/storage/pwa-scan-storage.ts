import { PWA_SCAN_STORAGE_KEY } from '../constants/pwa-scan-paths.js';
import { defaultPwaScanSession, type PwaScanSession } from '../context/pwa-scan-types.js';
import { pwaScannedVehicleFields, PWA_SCANNED_MODEL, PWA_SCANNED_PLATE, PWA_SCANNED_PLAN } from '../data/pwa-demo-data.js';
import {
  estimateSessionPhotoBytes,
  logPhotoDiagnostic,
} from '../utils/pwa-photo-diagnostics.js';

function hydrateSession(raw: Partial<PwaScanSession>): PwaScanSession {
  const base = defaultPwaScanSession();
  return {
    ...base,
    ...raw,
    scannedVehicle: {
      ...base.scannedVehicle,
      ...raw.scannedVehicle,
      plate: raw.scannedVehicle?.plate ?? PWA_SCANNED_PLATE,
      modelSummary: raw.scannedVehicle?.modelSummary ?? PWA_SCANNED_MODEL,
      protected: raw.scannedVehicle?.protected ?? true,
      planLabel: raw.scannedVehicle?.planLabel ?? PWA_SCANNED_PLAN,
      fields:
        raw.scannedVehicle?.fields && raw.scannedVehicle.fields.length > 0
          ? raw.scannedVehicle.fields
          : pwaScannedVehicleFields,
    },
    parkMePhotos: { ...base.parkMePhotos, ...raw.parkMePhotos },
    parkMePhotoIds: { ...base.parkMePhotoIds, ...raw.parkMePhotoIds },
    sosPhotos: { ...base.sosPhotos, ...raw.sosPhotos },
    sosPhotoIds: { ...base.sosPhotoIds, ...raw.sosPhotoIds },
  };
}

export type SavePwaScanSessionResult =
  | { ok: true }
  | { ok: false; code: 'QuotaExceededError' | 'Unknown'; message: string };

export function loadPwaScanSession(): PwaScanSession {
  if (typeof window === 'undefined') {
    return defaultPwaScanSession();
  }
  try {
    const stored = window.sessionStorage.getItem(PWA_SCAN_STORAGE_KEY);
    if (!stored) {
      return defaultPwaScanSession();
    }
    return hydrateSession(JSON.parse(stored) as Partial<PwaScanSession>);
  } catch {
    return defaultPwaScanSession();
  }
}

export function savePwaScanSession(session: PwaScanSession): SavePwaScanSessionResult {
  if (typeof window === 'undefined') {
    return { ok: true };
  }

  const photoBytes = estimateSessionPhotoBytes(session);

  try {
    const payload = JSON.stringify(session);
    window.sessionStorage.setItem(PWA_SCAN_STORAGE_KEY, payload);
    logPhotoDiagnostic('storage', 'save_ok', {
      payloadBytes: payload.length,
      photoBytes,
    });
    return { ok: true };
  } catch (error) {
    const name = error instanceof DOMException ? error.name : 'Unknown';
    const message =
      name === 'QuotaExceededError'
        ? 'Photo storage is full on this device. Your photo is kept for this session only.'
        : 'Could not save session data on this device.';

    logPhotoDiagnostic('storage', 'save_failed', {
      code: name,
      photoBytes,
      message,
    });

    return {
      ok: false,
      code: name === 'QuotaExceededError' ? 'QuotaExceededError' : 'Unknown',
      message,
    };
  }
}

export function clearPwaScanSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(PWA_SCAN_STORAGE_KEY);
}
