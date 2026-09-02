import { acceptEmergency, cancelEmergencyAlert } from '@autolokate/api-client';

import { getQrBootstrapClient } from '@/platform/api/qr-api-client';
import { anonymousScannerRepository } from '@/platform/storage/repositories/anonymous-scanner-repository';

import {
  delay,
  SCANNER_MAX_ATTEMPTS,
  SCANNER_RETRY_BASE_MS,
  withTimeout,
  SCANNER_REQUEST_TIMEOUT_MS,
} from './scanner-network';
import {
  isScannerTransientError,
  mapScannerApiError,
  type ScannerApiError,
} from './scanner-api-errors';
import { stopEmergencyAlertPoll } from './scanner-poll-manager';
import { scannerLogger } from './scanner-logger';

export type EmergencySubmitResult =
  | { ok: true; alertId: string; incidentId: string }
  | { ok: false; error: ScannerApiError };

export type EmergencyCancelResult =
  | { ok: true; cancelled: boolean }
  | { ok: false; error: ScannerApiError };

let inflightSubmit: Promise<EmergencySubmitResult> | null = null;
let inflightCancel: Promise<EmergencyCancelResult> | null = null;

/** POST /v1/emergency/{alertId}/cancel — “I'm safe”. */
export async function cancelScannerEmergency(alertId: string): Promise<EmergencyCancelResult> {
  if (!alertId.trim()) {
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing alert id.', apiMessage: null },
    };
  }

  if (inflightCancel) {
    return inflightCancel;
  }

  const promise = (async (): Promise<EmergencyCancelResult> => {
    stopEmergencyAlertPoll();

    for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrBootstrapClient();
        const response = await withTimeout(
          cancelEmergencyAlert(client, alertId),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
        scannerLogger.info('emergency_cancelled', {
          alertId,
          cancelled: response.cancelled,
          status: response.status,
        });
        return { ok: true, cancelled: response.cancelled };
      } catch (error) {
        if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
          await delay(SCANNER_RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapScannerApiError(error);
        scannerLogger.warn('emergency_cancel_failed', { alertId, error: mapped });
        return { ok: false, error: mapped };
      }
    }

    return {
      ok: false,
      error: { code: 'unavailable', message: 'Could not cancel alert.', apiMessage: null },
    };
  })();

  inflightCancel = promise;
  try {
    return await promise;
  } finally {
    inflightCancel = null;
  }
}

/** Clear emergency in-flight state. */
export function resetScannerEmergencyServiceState(): void {
  inflightSubmit = null;
  inflightCancel = null;
  stopEmergencyAlertPoll();
}

export type EmergencySubmitInput = {
  scenePhotoIds?: string[];
};

/**
 * POST /v1/qr/{code}/emergency using media ids uploaded at capture time.
 * Upload failures at capture never block SOS — empty ids are fine.
 */
export async function submitScannerEmergency(
  input: EmergencySubmitInput,
): Promise<EmergencySubmitResult> {
  const qrCode = anonymousScannerRepository.readQrCode();
  if (!qrCode) {
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing QR code.', apiMessage: null },
    };
  }

  if (inflightSubmit) {
    return inflightSubmit;
  }

  const promise = (async (): Promise<EmergencySubmitResult> => {
    const scenePhotoIds = input.scenePhotoIds ?? [];
    const nonce = anonymousScannerRepository.readOrCreateEmergencyNonce();
    const idempotencyKey = anonymousScannerRepository.readOrCreateEmergencySubmitIdempotencyKey();
    const body = {
      nonce,
      ...(scenePhotoIds.length > 0 ? { scenePhotoIds } : {}),
    };

    for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrBootstrapClient();
        const accepted = await withTimeout(
          acceptEmergency(client, qrCode, body, idempotencyKey),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
        anonymousScannerRepository.writeAlertId(accepted.alertId);
        scannerLogger.info('emergency_accepted', {
          alertId: accepted.alertId,
          incidentId: accepted.incidentId,
          scenePhotoCount: scenePhotoIds.length,
        });
        return { ok: true, alertId: accepted.alertId, incidentId: accepted.incidentId };
      } catch (error) {
        if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
          await delay(SCANNER_RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapScannerApiError(error);
        scannerLogger.warn('emergency_accept_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }

    return {
      ok: false,
      error: { code: 'unavailable', message: 'Could not send alert.', apiMessage: null },
    };
  })();

  inflightSubmit = promise;
  try {
    return await promise;
  } finally {
    inflightSubmit = null;
  }
}
