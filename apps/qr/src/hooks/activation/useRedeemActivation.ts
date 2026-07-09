import { useCallback, useState } from 'react';

import {
  getActivationRevision,
  redeemActivationEntitlement,
  type RedeemActivationResult,
} from '@/services/activation/activation-service';

export function useRedeemActivation() {
  const [isPending, setIsPending] = useState(false);
  const [revision, setRevision] = useState(() => getActivationRevision());

  const redeem = useCallback(async (): Promise<RedeemActivationResult> => {
    setIsPending(true);
    try {
      const result = await redeemActivationEntitlement();
      if (result.ok) {
        setRevision(result.revision);
      }
      return result;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { redeemActivation: redeem, isPending, revision };
}
