import type {
  QrActivatedPayload,
  QrB2b2cPayload,
  QrDecodeResult,
  QrPayloadType,
  QrPrepaidPayload,
  QrPurchasePayload,
} from './qr-dispatch-contract.js';
import { QR_URL_PARAMS, readQrCodeFromSearchParams } from './qr-url-params.js';

function invalid(message: string): QrDecodeResult {
  return {
    ok: false,
    error: { code: 'invalid', message },
  };
}

function parsePurchase(params: URLSearchParams): QrDecodeResult {
  const token = params.get('token')?.trim();
  if (!token) {
    return invalid('Purchase QR requires a token');
  }

  const orgId = params.get('orgId')?.trim();
  const payload: QrPurchasePayload = {
    type: 'purchase',
    token,
    ...(orgId ? { orgId } : {}),
  };

  return { ok: true, payload };
}

function parsePrepaid(params: URLSearchParams): QrDecodeResult {
  const voucherId = params.get('voucherId')?.trim();
  if (!voucherId) {
    return invalid('Prepaid QR requires a voucherId');
  }

  const payload: QrPrepaidPayload = { type: 'prepaid', voucherId };
  return { ok: true, payload };
}

function parseB2b2c(params: URLSearchParams): QrDecodeResult {
  const partnerId = params.get('partnerId')?.trim();
  if (!partnerId) {
    return invalid('B2B2C QR requires a partnerId');
  }

  const variantParam = params.get('variant')?.trim() ?? 'plan-only';
  if (variantParam !== 'plan-only' && variantParam !== 'plan-rider') {
    return invalid('B2B2C QR variant must be plan-only or plan-rider');
  }

  const payload: QrB2b2cPayload = {
    type: 'b2b2c',
    partnerId,
    variant: variantParam,
  };

  return { ok: true, payload };
}

function parseActivated(params: URLSearchParams): QrDecodeResult {
  const vehicleId = params.get('vehicleId')?.trim();
  const plate = params.get('plate')?.trim();
  if (!vehicleId) {
    return invalid('Activated QR requires a vehicleId');
  }
  if (!plate) {
    return invalid('Activated QR requires a plate');
  }

  const planLabel = params.get('planLabel')?.trim();
  const payload: QrActivatedPayload = {
    type: 'activated',
    vehicleId,
    plate,
    ...(planLabel ? { planLabel } : {}),
  };

  return { ok: true, payload };
}

const PARSERS: Record<QrPayloadType, (params: URLSearchParams) => QrDecodeResult> = {
  purchase: parsePurchase,
  prepaid: parsePrepaid,
  b2b2c: parseB2b2c,
  activated: parseActivated,
};

/** Decode QR entry query params from a scanned sticker URL. */
export function parseQrFromSearchParams(params: URLSearchParams): QrDecodeResult {
  const type = params.get(QR_URL_PARAMS.legacyType)?.trim() as QrPayloadType | undefined;
  if (!type) {
    return invalid('Missing QR type');
  }

  if (!(type in PARSERS)) {
    return invalid(`Unsupported QR type: ${type}`);
  }

  return PARSERS[type](params);
}

export function isQrEntryUrl(params: URLSearchParams): boolean {
  return Boolean(
    params.get(QR_URL_PARAMS.legacyType)?.trim() || readQrCodeFromSearchParams(params),
  );
}

/** Legacy demo/deep-link URLs that carry an explicit `type` query param. */
export function hasLegacyQrEntryParams(params: URLSearchParams): boolean {
  return Boolean(params.get(QR_URL_PARAMS.legacyType)?.trim());
}

/** Opaque backend QR code from `?qr_code=` (preferred) or legacy `?code=`. */
export function extractQrCodeParam(params: URLSearchParams): string | null {
  return readQrCodeFromSearchParams(params);
}
