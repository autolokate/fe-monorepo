"use client";

import { useCallback } from "react";
import { CONSENT_VERSION } from "@/lib/auth/constants";
import { writeAuthTokens } from "@/lib/auth/storage";
import { verifyOtp } from "@/services/auth";
import type { VerifyOtpResponse } from "@/services/auth/types";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

export interface VerifyOtpInput {
  phone: string;
  otp: string;
  /** Forwarded only on signup verification. */
  full_name?: string;
}

/**
 * `POST /v1/auth/verify-otp` — exchanges an OTP for tokens, then persists them
 * to localStorage + cookies. On success the user is fully authenticated.
 */
export function useVerifyOtp(
  options?: UseApiMutationOptions<VerifyOtpResponse, VerifyOtpInput>,
) {
  const fn = useCallback(
    (input: VerifyOtpInput) =>
      verifyOtp({
        phone: input.phone,
        otp: input.otp,
        consent_accepted: true,
        consent_version: CONSENT_VERSION,
        full_name: input.full_name,
      }),
    [],
  );

  return useApiMutation<VerifyOtpResponse, VerifyOtpInput>(fn, {
    ...options,
    onSuccess: async (data, vars) => {
      // Persist tokens before any caller-provided onSuccess runs so that
      // downstream calls (e.g. fetching /me) already see the new session.
      writeAuthTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      await options?.onSuccess?.(data, vars);
    },
  });
}
