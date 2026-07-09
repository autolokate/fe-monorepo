import { useCallback, useState } from 'react';

import { mapAuthApiError } from '@/services/auth/auth-errors';
import { sendOtp, type SendOtpInput } from '@/services/auth/auth-service';

export function useRequestOtp() {
  const [isPending, setIsPending] = useState(false);

  const requestOtp = useCallback(async (input: SendOtpInput) => {
    setIsPending(true);
    try {
      const result = await sendOtp(input);
      return { ok: true as const, data: result };
    } catch (error) {
      return { ok: false as const, error: mapAuthApiError(error) };
    } finally {
      setIsPending(false);
    }
  }, []);

  return { requestOtp, isPending };
}
