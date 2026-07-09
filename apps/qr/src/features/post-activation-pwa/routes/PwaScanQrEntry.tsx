import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { usePwaScan } from '../context/PwaScanContext.js';
import { pwaScanPaths } from '../constants/pwa-scan-paths.js';
import { useQrResolve } from '../../../hooks/qr/useQrResolve.js';
import {
  applyActivatedQrToPwaSession,
  isQrEntryUrl,
} from '../../../platform/index.js';

/** Applies activated QR params then routes into the PWA bootstrap screen. */
export function PwaScanQrEntryRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateSession } = usePwaScan();
  const { resolveEntry } = useQrResolve();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }

    handledRef.current = true;

    void (async () => {
      if (isQrEntryUrl(searchParams)) {
        const result = await resolveEntry(searchParams);
        if (result.ok && result.payload.type === 'activated') {
          applyActivatedQrToPwaSession(result.payload, updateSession);
        }
      }

      void navigate(pwaScanPaths.loading, { replace: true });
    })();
  }, [navigate, resolveEntry, searchParams, updateSession]);

  return null;
}
