import { peekLastResolvedPurchaseCode } from '@/services/qr/qr-cache.js';
import { getAttachResult, getQrCode, getResolvedQr, saveQrCode } from '@/storage/index.js';

import { readQrCodeFromSearchParams } from './qr-url-params.js';

/**
 * Canonical purchase QR code for attach / orders.
 * URL param → localStorage → session resolve cache → attach result → in-memory resolve cache.
 */
export function resolvePurchaseQrCode(searchParams?: URLSearchParams): string | null {
  if (searchParams) {
    const fromUrl = readQrCodeFromSearchParams(searchParams);
    if (fromUrl) {
      saveQrCode(fromUrl);
      return fromUrl;
    }
  }

  const stored = getQrCode()?.trim();
  if (stored) {
    return stored;
  }

  const resolved = getResolvedQr()?.qrCode.trim();
  if (resolved) {
    saveQrCode(resolved);
    return resolved;
  }

  const cached = peekLastResolvedPurchaseCode()?.trim();
  if (cached) {
    saveQrCode(cached);
    return cached;
  }

  const fromAttach = getAttachResult()?.purchaseQrCode.trim();
  if (fromAttach) {
    saveQrCode(fromAttach);
    return fromAttach;
  }

  return null;
}
