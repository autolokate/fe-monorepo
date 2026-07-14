"use client";

import { useMemo } from "react";
import { requestPurchaseOtp, type RequestOtpPayload } from "@/services/otp";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `POST /v1/auth/otp/request` — requests an OTP for the purchase verify-number
 * step.
 *
 * @example
 *   const { mutate, isLoading } = useRequestPurchaseOtp({
 *     onSuccess: () => update({ otpSent: true }),
 *   });
 *   await mutate({ phone: "+919876543210" });
 */
export function useRequestPurchaseOtp(
  options?: UseApiMutationOptions<void, RequestOtpPayload>,
) {
  const fn = useMemo(() => (payload: RequestOtpPayload) => requestPurchaseOtp(payload), []);
  return useApiMutation(fn, options);
}
