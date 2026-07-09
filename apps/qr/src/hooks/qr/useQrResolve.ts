import { useCallback, useState } from 'react';

import { resolveQrCode, resolveQrEntry, refreshQrResolution } from '@/services/qr/qr-service';

export function useQrResolve() {
  const [isPending, setIsPending] = useState(false);

  const resolveEntry = useCallback(async (searchParams: URLSearchParams) => {
    setIsPending(true);
    try {
      return await resolveQrEntry(searchParams);
    } finally {
      setIsPending(false);
    }
  }, []);

  const resolveCode = useCallback(async (code: string) => {
    setIsPending(true);
    try {
      return await resolveQrCode(code);
    } finally {
      setIsPending(false);
    }
  }, []);

  const refreshCode = useCallback(async (code: string) => {
    setIsPending(true);
    try {
      return await refreshQrResolution(code);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { resolveEntry, resolveCode, refreshCode, isPending };
}
