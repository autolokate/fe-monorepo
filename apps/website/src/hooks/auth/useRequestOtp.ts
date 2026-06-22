"use client";

import { useMemo } from "react";
import { requestOtp } from "@/services/auth";
import type { RequestOtpPayload, RequestOtpResponse } from "@/services/auth/types";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `POST /v1/auth/login/otp` — requests an OTP for the supplied phone.
 *
 * @example
 *   const { mutate, isLoading } = useRequestOtp({
 *     onSuccess: () => router.push("/auth/login?step=otp"),
 *   });
 *   await mutate({ phone: "+91XXXXXXXXXX" });
 */
export function useRequestOtp(
  options?: UseApiMutationOptions<RequestOtpResponse, RequestOtpPayload>,
) {
  const fn = useMemo(() => (payload: RequestOtpPayload) => requestOtp(payload), []);
  return useApiMutation(fn, options);
}
