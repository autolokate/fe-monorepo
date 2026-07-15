import {
  lookupParkVehicle,
  openPark,
  requestParkOtp,
  verifyParkOtp,
  toE164IndianMobile,
} from '@autolokate/api-client';

import { getQrBootstrapClient } from '@/platform/api/qr-api-client';
import { anonymousScannerRepository } from '@/platform/storage/repositories/anonymous-scanner-repository';
import { parkSessionRepository } from '@/platform/storage/repositories/park-session-repository';
import { compactPlate, normalizePlate } from '@/services/vehicle/vehicle-plate';

import { mapBystanderRcToLookupResult } from './park-mapper';
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
import { stopParkStatusPoll } from './scanner-poll-manager';
import { scannerLogger } from './scanner-logger';

export type ParkOtpRequestResult = { ok: true } | { ok: false; error: ScannerApiError };

export type ParkOtpVerifyResult = { ok: true } | { ok: false; error: ScannerApiError };

export type ParkVehicleLookupResult =
  | { ok: true; plate: string; fields: ReturnType<typeof mapBystanderRcToLookupResult>['fields'] }
  | { ok: false; status: 'not-found' | 'error'; error: ScannerApiError };

export type ParkSubmitResult =
  | { ok: true; notificationId: string }
  | { ok: false; error: ScannerApiError };

let inflightOtpRequest: Promise<ParkOtpRequestResult> | null = null;
let inflightOtpVerify: Promise<ParkOtpVerifyResult> | null = null;
const inflightLookupByPlate = new Map<string, Promise<ParkVehicleLookupResult>>();
let inflightSubmit: Promise<ParkSubmitResult> | null = null;

function resolveQrCode(): string | null {
  return anonymousScannerRepository.readQrCode();
}

function toE164(mobileDigits: string): string {
  return toE164IndianMobile(mobileDigits.replace(/\D/g, '').slice(-10));
}

/** Clear park in-flight state — used when starting a new scanner journey. */
export function resetParkServiceState(): void {
  inflightOtpRequest = null;
  inflightOtpVerify = null;
  inflightLookupByPlate.clear();
  inflightSubmit = null;
  stopParkStatusPoll();
}

/** POST /v1/qr/{code}/park/otp/request */
export async function requestParkBystanderOtp(mobileDigits: string): Promise<ParkOtpRequestResult> {
  const qrCode = resolveQrCode();
  if (!qrCode) {
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing QR code.', apiMessage: null },
    };
  }

  if (inflightOtpRequest) {
    return inflightOtpRequest;
  }

  const promise = (async (): Promise<ParkOtpRequestResult> => {
    for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrBootstrapClient();
        await withTimeout(
          requestParkOtp(client, qrCode, { phone: toE164(mobileDigits) }),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
        scannerLogger.info('park_otp_requested');
        return { ok: true };
      } catch (error) {
        if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
          await delay(SCANNER_RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapScannerApiError(error);
        scannerLogger.warn('park_otp_request_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Could not send OTP.', apiMessage: null },
    };
  })();

  inflightOtpRequest = promise;
  try {
    return await promise;
  } finally {
    inflightOtpRequest = null;
  }
}

/** POST /v1/qr/{code}/park/otp/verify */
export async function verifyParkBystanderOtp(
  mobileDigits: string,
  code: string,
): Promise<ParkOtpVerifyResult> {
  const qrCode = resolveQrCode();
  if (!qrCode) {
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing QR code.', apiMessage: null },
    };
  }

  if (inflightOtpVerify) {
    return inflightOtpVerify;
  }

  const promise = (async (): Promise<ParkOtpVerifyResult> => {
    for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrBootstrapClient();
        const result = await withTimeout(
          verifyParkOtp(client, qrCode, { phone: toE164(mobileDigits), code }),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
        parkSessionRepository.writeToken(result.bystanderSessionToken);
        scannerLogger.info('park_otp_verified');
        return { ok: true };
      } catch (error) {
        if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
          await delay(SCANNER_RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapScannerApiError(error);
        scannerLogger.warn('park_otp_verify_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Could not verify OTP.', apiMessage: null },
    };
  })();

  inflightOtpVerify = promise;
  try {
    return await promise;
  } finally {
    inflightOtpVerify = null;
  }
}

/** POST /v1/qr/{code}/park/vehicles/lookup */
export async function lookupParkReporterVehicle(plate: string): Promise<ParkVehicleLookupResult> {
  const qrCode = resolveQrCode();
  const token = parkSessionRepository.readToken();
  const displayPlate = normalizePlate(plate);
  const lookupKey = compactPlate(displayPlate);

  if (!qrCode || !token) {
    return {
      ok: false,
      status: 'error',
      error: {
        code: 'unavailable',
        message: 'Park session expired. Verify again.',
        apiMessage: null,
      },
    };
  }

  if (!lookupKey) {
    return {
      ok: false,
      status: 'not-found',
      error: { code: 'validation', message: 'Enter a valid plate.', apiMessage: null },
    };
  }

  const inflight = inflightLookupByPlate.get(lookupKey);
  if (inflight) {
    return inflight;
  }

  const promise = (async (): Promise<ParkVehicleLookupResult> => {
    for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrBootstrapClient();
        const record = await withTimeout(
          lookupParkVehicle(client, qrCode, {
            bystanderSessionToken: token,
            plate: lookupKey,
          }),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
        const mapped = mapBystanderRcToLookupResult(record);
        scannerLogger.info('park_vehicle_lookup_success', { plate: lookupKey });
        return { ok: true, plate: mapped.plate || displayPlate, fields: mapped.fields };
      } catch (error) {
        const mapped = mapScannerApiError(error);
        if (mapped.code === 'not_found') {
          return { ok: false, status: 'not-found', error: mapped };
        }
        if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
          await delay(SCANNER_RETRY_BASE_MS * attempt);
          continue;
        }
        scannerLogger.warn('park_vehicle_lookup_failed', { plate: lookupKey, error: mapped });
        return { ok: false, status: 'error', error: mapped };
      }
    }
    return {
      ok: false,
      status: 'error',
      error: { code: 'unavailable', message: 'Lookup failed.', apiMessage: null },
    };
  })();

  inflightLookupByPlate.set(lookupKey, promise);
  try {
    return await promise;
  } finally {
    inflightLookupByPlate.delete(lookupKey);
  }
}

export type ParkSubmitInput = {
  name: string;
  reporterPlate?: string;
  photoIds: [string, string];
  geoLat?: number;
  geoLng?: number;
};

/** POST /v1/qr/{code}/park using media ids uploaded at capture time. */
export async function submitParkReport(input: ParkSubmitInput): Promise<ParkSubmitResult> {
  const qrCode = resolveQrCode();
  const token = parkSessionRepository.readToken();

  if (!qrCode || !token) {
    return {
      ok: false,
      error: {
        code: 'unavailable',
        message: 'Park session expired. Verify again.',
        apiMessage: null,
      },
    };
  }

  if (inflightSubmit) {
    return inflightSubmit;
  }

  const promise = (async (): Promise<ParkSubmitResult> => {
    const idempotencyKey = parkSessionRepository.readOrCreateSubmitIdempotencyKey();
    const body = {
      bystanderSessionToken: token,
      name: input.name.trim(),
      photoIds: input.photoIds,
      ...(input.reporterPlate
        ? { reporterPlate: compactPlate(normalizePlate(input.reporterPlate)) }
        : {}),
      ...(input.geoLat !== undefined ? { geoLat: input.geoLat } : {}),
      ...(input.geoLng !== undefined ? { geoLng: input.geoLng } : {}),
    };

    for (let attempt = 1; attempt <= SCANNER_MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getQrBootstrapClient();
        const opened = await withTimeout(
          openPark(client, qrCode, body, idempotencyKey),
          SCANNER_REQUEST_TIMEOUT_MS,
        );
        parkSessionRepository.writeNotificationId(opened.notificationId);
        scannerLogger.info('park_opened', { notificationId: opened.notificationId });
        return { ok: true, notificationId: opened.notificationId };
      } catch (error) {
        if (isScannerTransientError(error) && attempt < SCANNER_MAX_ATTEMPTS) {
          await delay(SCANNER_RETRY_BASE_MS * attempt);
          continue;
        }
        const mapped = mapScannerApiError(error);
        scannerLogger.warn('park_open_failed', { error: mapped });
        return { ok: false, error: mapped };
      }
    }

    return {
      ok: false,
      error: { code: 'unavailable', message: 'Could not send report.', apiMessage: null },
    };
  })();

  inflightSubmit = promise;
  try {
    return await promise;
  } finally {
    inflightSubmit = null;
  }
}
