import { env } from '@/config/env';

import { buildQrDeepLinkPath } from '@/journey/constants';

/**
 * QR sticker entry base — this app's own deployed origin (qr-staging.<apex> in staging,
 * qr.<apex> in prod), overridable via VITE_QR_ENTRY_BASE_URL. See config/env.ts.
 */
export const QR_ENTRY_BASE_URL = env.qrEntryBaseUrl;

/** Build the production QR deep-link URL for a sticker code (`/q/:code`). */
export function buildQrDeepLinkUrl(qrCode: string, baseUrl = QR_ENTRY_BASE_URL): string {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}${buildQrDeepLinkPath(qrCode)}`;
}

/** @deprecated Use buildQrDeepLinkUrl — kept for callers expecting the old name. */
export function buildQrAuthMobileUrl(qrCode: string, baseUrl = QR_ENTRY_BASE_URL): string {
  return buildQrDeepLinkUrl(qrCode, baseUrl);
}
