import { useCallback, useState } from 'react';

import { mapAuthApiError } from '@/services/auth/auth-errors';
import { verifyOtp, type VerifyOtpInput } from '@/services/auth/auth-service';

export function useVerifyOtp() {
  const [isPending, setIsPending] = useState(false);

  const submitOtp = useCallback(async (input: VerifyOtpInput) => {
    setIsPending(true);
    try {
      const tokens = await verifyOtp(input);
      return { ok: true as const, data: tokens };
    } catch (error) {
      return { ok: false as const, error: mapAuthApiError(error) };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { verifyOtp: submitOtp, isPending };
}
