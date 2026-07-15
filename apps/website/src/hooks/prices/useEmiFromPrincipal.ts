'use client';

import { useApiQuery } from '@/hooks/useApiQuery';
import type { EmiQuote } from '@/services/prices/prices-api';
import { getEmiQuote } from '@/services/prices/prices-api';

const EMI_RATE = 9.5;
const EMI_MONTHS = 60;

export function useEmiFromPrincipal(
  principal: number | null | undefined,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const p =
    typeof principal === 'number' && Number.isFinite(principal) && principal >= 10_000
      ? principal
      : null;
  const canRun = enabled && p != null;

  return useApiQuery<EmiQuote>(
    () => {
      // `canRun` gates the fetch, so `p` is always a valid principal here.
      if (p == null) throw new Error('EMI query ran without a principal');
      return getEmiQuote({ principal: p, rate: EMI_RATE, tenure_months: EMI_MONTHS });
    },
    [p, enabled],
    { enabled: canRun },
  );
}
