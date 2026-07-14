/** Query parameter names for QR entry URLs. Storage key remains `qr_code`. */
export const QR_URL_PARAMS = {
  qrCode: 'q',
  legacyQrCode: 'qr_code',
  legacyCode: 'code',
  legacyType: 'type',
} as const;

export function readQrCodeFromSearchParams(searchParams: URLSearchParams): string | null {
  return (
    searchParams.get(QR_URL_PARAMS.qrCode)?.trim() ||
    searchParams.get(QR_URL_PARAMS.legacyQrCode)?.trim() ||
    searchParams.get(QR_URL_PARAMS.legacyCode)?.trim() ||
    null
  );
}
