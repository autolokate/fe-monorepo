import { useCallback, useState } from 'react';

import {
  attachPurchaseQr,
  type AttachPurchaseQrResult,
} from '@/services/qr/qr-attach-service.js';

export function useQrAttach() {
  const [isPending, setIsPending] = useState(false);

  const attachPurchaseQrWithState = useCallback(
    async (searchParams?: URLSearchParams): Promise<AttachPurchaseQrResult> => {
      setIsPending(true);
      try {
        return await attachPurchaseQr(searchParams);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { attachPurchaseQr: attachPurchaseQrWithState, isPending };
}
