'use client';

/**
 * Purchase "verify your number" step. Same Nest endpoints and the same session as the
 * account login (`POST /v1/auth/otp/request|verify`) — see `@/services/auth`.
 */
import { requestOtp, verifyOtp, type VerifiedSession } from '@/services/auth';

export interface RequestOtpPayload {
  /** E.164 phone, e.g. "+919876543210". */
  phone: string;
}

export interface VerifyOtpPayload {
  /** E.164 phone, e.g. "+919876543210". */
  phone: string;
  /** The OTP the buyer entered. */
  code: string;
}

export type VerifyOtpResult = VerifiedSession;

/** POST /v1/auth/otp/request (public). */
export async function requestPurchaseOtp(payload: RequestOtpPayload): Promise<void> {
  await requestOtp(payload.phone);
}

/** POST /v1/auth/otp/verify (public) — stores the returned pair as the website session. */
export function verifyPurchaseOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
  return verifyOtp(payload.phone, payload.code);
}
