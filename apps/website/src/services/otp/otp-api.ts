'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/error';
import { ApiService } from '@/services/api.service';
import { setPurchaseSession } from '@/services/purchase';

/**
 * Temporary override — the purchase-flow auth currently lives on a separate
 * backend, so this call bypasses the shared staging base URL. Remove once
 * `/v1/auth/otp/request` is served from `NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL`.
 */
const OTP_API_BASE_URL = 'https://malisa-noninclusive-davin.ngrok-free.dev';

export interface RequestOtpPayload {
  /** E.164 phone, e.g. "+919876543210". */
  phone: string;
}

/**
 * POST /v1/auth/otp/request — sends an OTP to the given phone number for the
 * purchase / verify-number step. Public endpoint (no auth).
 */
export async function requestPurchaseOtp(payload: RequestOtpPayload): Promise<void> {
  await ApiService.post(endpoints.auth.otpRequest, payload, {
    withAuth: false,
    baseURL: OTP_API_BASE_URL,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
}

export interface VerifyOtpPayload {
  /** E.164 phone, e.g. "+919876543210". */
  phone: string;
  /** The OTP the buyer entered. */
  code: string;
}

export interface VerifyOtpResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  isNewUser: boolean;
}

interface Enveloped<T> {
  data?: T;
}

/**
 * POST /v1/auth/otp/verify — verifies the OTP the buyer entered. Public
 * endpoint (no auth). On success it stashes the returned bearer as the
 * purchase session (used by cart / orders / pay). Throws an `ApiError` on an
 * invalid / expired code.
 */
export async function verifyPurchaseOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
  const res = await ApiService.post<Enveloped<VerifyOtpResult>>(endpoints.auth.otpVerify, payload, {
    withAuth: false,
    baseURL: OTP_API_BASE_URL,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  const data = res.data.data;
  if (!data?.accessToken) throw new ApiError('Invalid verify OTP response', 0, res.data);

  setPurchaseSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    userId: data.userId,
    phone: payload.phone,
  });
  return data;
}
