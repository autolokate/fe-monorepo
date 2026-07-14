import { resolveQr as resolveQrApi, type QrResolution } from '@autolokate/api-client';

import {
  extractQrCodeParam,
  hasLegacyQrEntryParams,
  parseQrFromSearchParams,
} from '@/platform/qr/parse-qr-url';
import type { QrDecodeResult, QrDispatchError, QrPayload } from '@/platform/qr/qr-dispatch-contract';
import { getQrBootstrapClient } from '@/platform/api/qr-api-client';

import { seedActivationFromQrPayload } from '@/services/activation/activation-service';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { saveQrCode, saveResolvedQr, getResolvedQr, type StoredQrResolve } from '@/storage/index';

import { clearResolvedQrCache, peekResolvedQr, rememberResolvedQr } from './qr-cache';
import { mapQrApiError, mapQrStatusError } from './qr-errors';
import {
  isActivatedQrResolution,
  isExpiredQrStatus,
  mapResolutionToPayload,
} from './qr-mapper';
import { qrLogger } from './qr-logger';

export type ResolveQrCodeResult =
  | { ok: true; payload: QrPayload; resolution: QrResolution }
  | { ok: false; error: QrDispatchError };

function failure(error: QrDispatchError): ResolveQrCodeResult {
  return { ok: false, error };
}

function persistQrResolution(code: string, resolution: QrResolution): void {
  rememberResolvedQr(code, resolution);
  saveResolvedQr(code, resolution);
}

function seedPurchaseQrFromResolve(code: string, resolution: QrResolution): void {
  if (resolution.journey !== 'CONSUMER_PREPAID') {
    return;
  }
  saveQrCode(code);
}

const inflightResolveByCode = new Map<string, Promise<QrResolution>>();

export type ResolveQrCodeOptions = {
  /**
   * When false, still call resolve and return the payload, but do not write
   * purchase/session storage or seed partner activation. Used for signed-in `/q`
   * re-entry until ACTIVATED commits a new journey.
   */
  commit?: boolean;
  /**
   * Always call GET /resolve (skip in-memory / session peek).
   * Required for `/q/:code` so status is fresh even when the sticker was resolved earlier.
   */
  forceNetwork?: boolean;
};

function validateResolution(code: string, resolution: QrResolution): QrDispatchError | null {
  if (isExpiredQrStatus(resolution.qrStatus)) {
    return mapQrStatusError('This QR code has expired.', 'expired');
  }

  if (resolution.journey === 'NONE' && !isActivatedQrResolution(resolution)) {
    return mapQrStatusError('This QR code is not available for activation.', 'invalid');
  }

  if (resolution.qrStatus === 'ACTIVATED' && !isActivatedQrResolution(resolution)) {
    return mapQrStatusError('This QR code is already activated.', 'invalid');
  }

  const payload = mapResolutionToPayload(code, resolution);
  if (!payload) {
    return mapQrStatusError('This QR code cannot be used for activation.', 'invalid');
  }

  qrLogger.debug('resolve_validated', { code, journey: resolution.journey, status: resolution.qrStatus });
  return null;
}

function finalizeResolvedPayload(
  code: string,
  resolution: QrResolution,
  commit: boolean,
): ResolveQrCodeResult | null {
  const payload = mapResolutionToPayload(code, resolution);
  if (!payload) {
    return failure(mapQrStatusError('This QR code cannot be used for activation.', 'invalid'));
  }

  if (commit) {
    if (payload.type === 'prepaid' || payload.type === 'b2b2c') {
      seedActivationFromQrPayload(code, payload);
    }
    seedPurchaseQrFromResolve(code, resolution);
  }

  return { ok: true, payload, resolution };
}

function materializeResolved(
  code: string,
  resolution: QrResolution,
  commit: boolean,
): ResolveQrCodeResult {
  if (commit) {
    persistQrResolution(code, resolution);
  }
  // Read-only resolve must not replace the active purchase QR cache.

  const validationError = validateResolution(code, resolution);
  if (validationError) {
    return failure(validationError);
  }

  return (
    finalizeResolvedPayload(code, resolution, commit) ??
    failure(mapQrStatusError('This QR code cannot be used for activation.', 'invalid'))
  );
}

/** Persist resolve side effects after a read-only resolve (e.g. ACTIVATED on `/q`). */
export function commitResolvedQr(code: string, resolution: QrResolution): ResolveQrCodeResult {
  return materializeResolved(code.trim(), resolution, true);
}

/** Resolve an opaque QR code via GET /v1/qr/{code}/resolve. */
export async function resolveQrCode(
  code: string,
  options?: ResolveQrCodeOptions,
): Promise<ResolveQrCodeResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return failure(mapQrStatusError('Missing QR code.', 'invalid'));
  }

  const commit = options?.commit !== false;
  const forceNetwork = options?.forceNetwork === true;

  if (!forceNetwork) {
    const cached = peekResolvedQr(trimmed);
    if (cached) {
      return materializeResolved(trimmed, cached, commit);
    }
  }

  try {
    let resolutionPromise = inflightResolveByCode.get(trimmed);
    if (!resolutionPromise) {
      const client = getQrBootstrapClient();
      resolutionPromise = (async () => {
        const resolution = await resolveQrApi(client, trimmed);
        qrLogger.info('qr_resolved', {
          journey: resolution.journey,
          status: resolution.qrStatus,
          channel: resolution.channel,
        });
        return resolution;
      })();
      inflightResolveByCode.set(trimmed, resolutionPromise);
    }

    try {
      const resolution = await resolutionPromise;
      return materializeResolved(trimmed, resolution, commit);
    } finally {
      inflightResolveByCode.delete(trimmed);
    }
  } catch (error) {
    qrLogger.warn('qr_resolve_failed', { error });
    return failure(mapQrApiError(error));
  }
}

/**
 * Compatibility bridge: legacy `type=` URLs parse locally;
 * `code=` URLs resolve through the backend.
 */
export async function resolveQrEntry(searchParams: URLSearchParams): Promise<QrDecodeResult> {
  if (hasLegacyQrEntryParams(searchParams)) {
    const result = parseQrFromSearchParams(searchParams);
    if (result.ok && result.payload.type === 'purchase') {
      saveQrCode(result.payload.token);
    }
    return result;
  }

  const code = extractQrCodeParam(searchParams);
  if (!code) {
    return {
      ok: false,
      error: mapQrStatusError('Missing QR entry parameters.', 'invalid'),
    };
  }

  saveQrCode(code);

  const result = await resolveQrCode(code);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  if (result.payload.type === 'purchase') {
    saveQrCode(code);
  }

  return { ok: true, payload: result.payload };
}

/** Read persisted resolve for the active purchase QR — does not call the API. */
export function getStoredPurchaseQrResolve():
  | { ok: true; resolution: StoredQrResolve }
  | { ok: false; error: QrDispatchError } {
  const code = resolvePurchaseQrCode();
  if (!code) {
    return {
      ok: false,
      error: mapQrStatusError('Your purchase QR code is missing. Scan your Autolokate sticker or open your purchase link again.', 'invalid'),
    };
  }

  const stored = getResolvedQr();
  if (!stored || stored.qrCode !== code) {
    return {
      ok: false,
      error: mapQrStatusError('QR details are missing. Scan your Autolokate sticker or open your purchase link again.', 'invalid'),
    };
  }

  return { ok: true, resolution: stored };
}

/** Refresh backend resolution for a known code (e.g. after FCM/token rotation flows). */
export async function refreshQrResolution(code: string): Promise<ResolveQrCodeResult> {
  clearResolvedQrCache();
  return resolveQrCode(code);
}

export { clearResolvedQrCache, peekResolvedQr };
