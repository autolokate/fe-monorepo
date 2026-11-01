'use client';

import { useMemo } from 'react';
import { requestOtp } from '@/services/auth';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';

export interface RequestOtpInput {
  /** E.164, e.g. "+919876543210". */
  phone: string;
}

/** `POST /v1/auth/otp/request`. */
export function useRequestOtp(
  options?: UseApiMutationOptions<{ channel: 'sms' | 'whatsapp' }, RequestOtpInput>,
) {
  const fn = useMemo(() => (input: RequestOtpInput) => requestOtp(input.phone), []);
  return useApiMutation(fn, options);
}
