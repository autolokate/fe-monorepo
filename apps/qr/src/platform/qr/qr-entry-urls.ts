/** Production QR sticker entry URLs (canonical prod host; staging serves at qr-staging.<apex>). */
export const QR_ENTRY_BASE_URL = 'https://qr.autolokate.com';

/** Build the production auth-mobile entry URL for a QR code. */
export function buildQrAuthMobileUrl(qrCode: string, baseUrl = QR_ENTRY_BASE_URL): string {
  const url = new URL('/journey/auth/mobile', baseUrl);
  url.searchParams.set('qr_code', qrCode.trim());
  return url.toString();
}
