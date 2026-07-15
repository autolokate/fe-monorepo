import { useCallback, useState } from 'react';

import {
  enterJourneyFromQrCode,
  enterJourneyFromQrSearchParams,
  type QrJourneyEntryDeps,
  type QrJourneyEntryOptions,
  type QrJourneyEntryResult,
} from '@/services/qr/qr-journey-entry';

export function useQrJourneyEntry() {
  const [isPending, setIsPending] = useState(false);

  const enterFromCode = useCallback(
    async (
      code: string,
      deps: QrJourneyEntryDeps,
      options?: QrJourneyEntryOptions,
    ): Promise<QrJourneyEntryResult> => {
      setIsPending(true);
      try {
        return await enterJourneyFromQrCode(code, deps, options);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  const enterFromSearchParams = useCallback(
    async (
      searchParams: URLSearchParams,
      deps: QrJourneyEntryDeps,
      options?: QrJourneyEntryOptions,
    ) => {
      setIsPending(true);
      try {
        return await enterJourneyFromQrSearchParams(searchParams, deps, options);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { enterFromCode, enterFromSearchParams, isPending };
}
