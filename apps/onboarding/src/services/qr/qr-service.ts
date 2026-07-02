import { resolveQr as resolveQrApi, type QrResolution } from '@autolokate/api-client';

import {
  extractQrCodeParam,
  hasLegacyQrEntryParams,
  parseQrFromSearchParams,
} from '@/platform/qr/parse-qr-url.js';
import type { QrDecodeResult, QrDispatchError, QrPayload } from '@/platform/qr/qr-dispatch-contract.js';
import { getOnboardingBootstrapClient } from '@/platform/api/onboarding-api-client.js';

import { seedActivationFromQrPayload } from '@/services/activation/activation-service.js';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code.js';
import { saveQrCode, saveResolvedQr, getResolvedQr, type StoredQrResolve } from '@/storage/index.js';

import { clearResolvedQrCache, peekResolvedQr, rememberResolvedQr } from './qr-cache.js';
import { mapQrApiError, mapQrStatusError } from './qr-errors.js';
import {
  isActivatedQrResolution,
  isExpiredQrStatus,
  mapResolutionToPayload,
} from './qr-mapper.js';
import { qrLogger } from './qr-logger.js';

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
  if (resolution.journey !== 'CONSUMER_SELF_PAY') {
    return;
  }
  saveQrCode(code);
}

const inflightResolveByCode = new Map<string, Promise<ResolveQrCodeResult>>();

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
): ResolveQrCodeResult | null {
  const payload = mapResolutionToPayload(code, resolution);
  if (!payload) {
    return failure(mapQrStatusError('This QR code cannot be used for activation.', 'invalid'));
  }

  if (payload.type === 'prepaid' || payload.type === 'b2b2c') {
    seedActivationFromQrPayload(code, payload);
  }
  seedPurchaseQrFromResolve(code, resolution);

  return { ok: true, payload, resolution };
}

/** Resolve an opaque QR code via GET /v1/qr/{code}/resolve. */
export async function resolveQrCode(code: string): Promise<ResolveQrCodeResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return failure(mapQrStatusError('Missing QR code.', 'invalid'));
  }

  const cached = peekResolvedQr(trimmed);
  if (cached) {
    persistQrResolution(trimmed, cached);
    const validationError = validateResolution(trimmed, cached);
    if (validationError) {
      return failure(validationError);
    }
    const result = finalizeResolvedPayload(trimmed, cached);
    return result ?? failure(mapQrStatusError('This QR code cannot be used for activation.', 'invalid'));
  }

  try {
    const inflight = inflightResolveByCode.get(trimmed);
    if (inflight) {
      return await inflight;
    }

    const client = getOnboardingBootstrapClient();

    const request = (async (): Promise<ResolveQrCodeResult> => {
      const resolution = await resolveQrApi(client, trimmed);
      persistQrResolution(trimmed, resolution);

      const validationError = validateResolution(trimmed, resolution);
      if (validationError) {
        return failure(validationError);
      }

      qrLogger.info('qr_resolved', {
        journey: resolution.journey,
        status: resolution.qrStatus,
        channel: resolution.channel,
      });

      const result = finalizeResolvedPayload(trimmed, resolution);
      return result ?? failure(mapQrStatusError('This QR code cannot be used for activation.', 'invalid'));
    })();

    inflightResolveByCode.set(trimmed, request);
    try {
      return await request;
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
