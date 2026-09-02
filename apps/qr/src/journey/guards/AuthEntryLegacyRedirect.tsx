import { Navigate, useLocation } from 'react-router-dom';

import { journeyPaths } from '../constants';
import { QR_URL_PARAMS, readQrCodeFromSearchParams } from '@/platform/qr/qr-url-params';

/** `/scan` → `/auth` — normalizes legacy `qr_code` query to `q`. */
export function AuthEntryLegacyRedirect() {
  const location = useLocation();
  const incoming = new URLSearchParams(location.search);
  const qrCode = readQrCodeFromSearchParams(incoming);
  const next = new URLSearchParams();

  if (qrCode) {
    next.set(QR_URL_PARAMS.qrCode, qrCode);
  }

  for (const [key, value] of incoming.entries()) {
    if (
      key === QR_URL_PARAMS.qrCode ||
      key === QR_URL_PARAMS.legacyQrCode ||
      key === QR_URL_PARAMS.legacyCode
    ) {
      continue;
    }
    next.set(key, value);
  }

  const search = next.toString();
  return <Navigate to={{ pathname: journeyPaths.auth, ...(search ? { search } : {}) }} replace />;
}
