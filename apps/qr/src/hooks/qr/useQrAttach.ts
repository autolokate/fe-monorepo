import { useCallback, useState } from 'react';

import {
  attachPurchaseQr,
  type AttachPurchaseQrResult,
} from '@/services/qr/qr-attach-service';

export function useQrAttach() {
  const [isPending, setIsPending] = useState(false);

  const attachPurchaseQrWithState = useCallback(
    async (
      searchParams?: URLSearchParams,
      options?: { force?: boolean },
    ): Promise<AttachPurchaseQrResult> => {
      setIsPending(true);
      try {
        return await attachPurchaseQr(searchParams, options);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { attachPurchaseQr: attachPurchaseQrWithState, isPending };
}
