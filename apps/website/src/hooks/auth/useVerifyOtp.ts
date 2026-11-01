'use client';

import { useMemo } from 'react';
import { verifyOtp, type VerifiedSession } from '@/services/auth';
import { useApiMutation, type UseApiMutationOptions } from '@/hooks/useApiMutation';

export interface VerifyOtpInput {
  /** E.164 phone the code was sent to. */
  phone: string;
  otp: string;
}

/**
 * `POST /v1/auth/otp/verify` — on success the token pair is already stored as the
 * website session before any caller `onSuccess` runs.
 */
export function useVerifyOtp(options?: UseApiMutationOptions<VerifiedSession, VerifyOtpInput>) {
  const fn = useMemo(() => (input: VerifyOtpInput) => verifyOtp(input.phone, input.otp), []);
  return useApiMutation(fn, options);
}
