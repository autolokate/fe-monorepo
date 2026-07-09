import { env } from '@/config/env.js';

/**
 * QR sticker entry base — this app's own deployed origin (qr-staging.<apex> in staging,
 * qr.<apex> in prod), overridable via VITE_QR_ENTRY_BASE_URL. See config/env.ts.
 */
export const QR_ENTRY_BASE_URL = env.qrEntryBaseUrl;

/** Build the production auth-mobile entry URL for a QR code. */
export function buildQrAuthMobileUrl(qrCode: string, baseUrl = QR_ENTRY_BASE_URL): string {
  const url = new URL('/journey/auth/mobile', baseUrl);
  url.searchParams.set('qr_code', qrCode.trim());
  return url.toString();
}
