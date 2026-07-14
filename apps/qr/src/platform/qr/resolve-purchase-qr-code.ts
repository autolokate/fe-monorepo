import { readQrCodeFromSearchParams } from './qr-url-params';
import { parseJourneyIdFromPathname } from '@/journey/routing/journey-url-routing';
import { peekLastResolvedPurchaseCode } from '@/services/qr/qr-cache';
import { getAttachResult, getResolvedQr } from '@/storage/index';

/**
 * Canonical purchase QR code / journey id.
 * Priority: URL path → query param → session resolve cache → attach result → in-memory cache.
 */
export function resolvePurchaseQrCode(searchParams?: URLSearchParams): string | null {
  if (typeof window !== 'undefined') {
    const fromPath = parseJourneyIdFromPathname(window.location.pathname);
    if (fromPath) {
      return fromPath;
    }
  }

  if (searchParams) {
    const fromUrl = readQrCodeFromSearchParams(searchParams);
    if (fromUrl) {
      return fromUrl;
    }
  }

  const resolved = getResolvedQr()?.qrCode.trim();
  if (resolved) {
    return resolved;
  }

  const cached = peekLastResolvedPurchaseCode()?.trim();
  if (cached) {
    return cached;
  }

  const fromAttach = getAttachResult()?.purchaseQrCode.trim();
  if (fromAttach) {
    return fromAttach;
  }

  return null;
}

/** @deprecated QR code lives in the URL — kept for callers during migration. */
export function saveQrCodeToUrlOnly(_code: string): void {
  // no-op: journey id must be present in the URL path
}
