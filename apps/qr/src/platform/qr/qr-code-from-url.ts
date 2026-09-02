import { getQrCode, saveQrCode } from '@/storage/index';

import { QR_URL_PARAMS, readQrCodeFromSearchParams } from './qr-url-params';

/**
 * Read QR code: URL `qr_code` first, then legacy `code`, then localStorage backup.
 */
export function readQrCodeFromSources(searchParams?: URLSearchParams): string | null {
  if (searchParams) {
    const fromUrl = readQrCodeFromSearchParams(searchParams);
    if (fromUrl) {
      return fromUrl;
    }
  }
  return getQrCode();
}

/** Persist QR from URL when present; returns the effective code. */
export function persistQrCodeFromUrl(searchParams: URLSearchParams): string | null {
  const fromUrl = readQrCodeFromSearchParams(searchParams);
  if (fromUrl) {
    saveQrCode(fromUrl);
    return fromUrl;
  }
  return getQrCode();
}

export { QR_URL_PARAMS };
