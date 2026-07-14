"use client";

import { useMemo } from "react";
import {
  verifyPurchaseOtp,
  type VerifyOtpPayload,
  type VerifyOtpResult,
} from "@/services/otp";
import { useApiMutation, type UseApiMutationOptions } from "@/hooks/useApiMutation";

/**
 * `POST /v1/auth/otp/verify` — verifies the OTP for the purchase verify-number
 * step.
 *
 * @example
 *   const { mutateAsync, isLoading } = useVerifyPurchaseOtp();
 *   await mutateAsync({ phone: "+919876543210", code: "123456" });
 */
export function useVerifyPurchaseOtp(
  options?: UseApiMutationOptions<VerifyOtpResult, VerifyOtpPayload>,
) {
  const fn = useMemo(() => (payload: VerifyOtpPayload) => verifyPurchaseOtp(payload), []);
  return useApiMutation(fn, options);
}
