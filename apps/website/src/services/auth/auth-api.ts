"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/error";
import { ApiService } from "@/services/api.service";
import type {
  ApiEnvelope,
  AuthUser,
  RefreshTokenPayload,
  RefreshTokenResponse,
  RequestOtpPayload,
  RequestOtpResponse,
  UpdateProfilePayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** POST /v1/auth/login/otp — kicks off OTP delivery. */
export async function requestOtp(payload: RequestOtpPayload): Promise<RequestOtpResponse> {
  const res = await ApiService.post<ApiEnvelope<RequestOtpResponse>>(
    endpoints.auth.requestOtp,
    payload,
    { withAuth: false },
  );
  const data = res.data;

  if (isRecord(data) && "sent" in data) {
    const r = data as Record<string, unknown>;
    return {
      sent: Boolean(r.sent),
      expires_in: typeof r.expires_in === "number" ? r.expires_in : 300,
      message: typeof r.message === "string" ? r.message : undefined,
    };
  }

  const envelope = (isRecord(data) ? data : {}) as {
    success?: boolean;
    data?: { message?: string };
  };
  return {
    sent: envelope.success !== false,
    expires_in: 300,
    message: envelope.data?.message,
  };
}

/** POST /v1/auth/verify-otp — exchanges OTP for tokens + user. */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const body: Record<string, unknown> = {
    phone: payload.phone,
    otp: payload.otp,
    consent_accepted: payload.consent_accepted,
    consent_version: payload.consent_version,
  };
  if (payload.full_name?.trim()) body.full_name = payload.full_name.trim();

  const res = await ApiService.post<unknown>(endpoints.auth.verifyOtp, body, {
    withAuth: false,
  });

  // Backend may return any of these shapes — normalise into VerifyOtpResponse.
  //   Flat:          { access_token, refresh_token, user, is_new_user? }
  //   Enveloped:     { success, data: { access_token, refresh_token, user, is_new_user? } }
  //   Supabase-like: { success, data: { user, session: { access_token, refresh_token, user } } }
  const root = res.data;
  const inner = isRecord(root) && isRecord(root.data) ? root.data : root;

  if (
    isRecord(inner) &&
    typeof inner.access_token === "string" &&
    typeof inner.refresh_token === "string"
  ) {
    return {
      access_token: inner.access_token,
      refresh_token: inner.refresh_token,
      user: (isRecord(inner.user) ? inner.user : {}) as AuthUser,
      is_new_user: typeof inner.is_new_user === "boolean" ? inner.is_new_user : false,
    };
  }

  if (
    isRecord(inner) &&
    isRecord(inner.session) &&
    typeof inner.session.access_token === "string" &&
    typeof inner.session.refresh_token === "string"
  ) {
    const sessionUser = isRecord(inner.session.user) ? inner.session.user : null;
    const topUser = isRecord(inner.user) ? inner.user : null;
    return {
      access_token: inner.session.access_token,
      refresh_token: inner.session.refresh_token,
      user: (topUser ?? sessionUser ?? {}) as AuthUser,
      is_new_user: typeof inner.is_new_user === "boolean" ? inner.is_new_user : false,
    };
  }

  throw new ApiError("Invalid verify OTP response", 0, root);
}

/** GET /v1/auth/me — returns the signed-in user's profile. */
export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await ApiService.get<ApiEnvelope<AuthUser>>(endpoints.auth.me);
  const data = res.data;

  if (isRecord(data) && "id" in data) return data as AuthUser;
  if (isRecord(data) && isRecord(data.data) && "id" in data.data) return data.data as AuthUser;
  throw new ApiError("Invalid profile response", 0, data);
}

/** POST /v1/auth/refresh — manual refresh. The interceptor also runs this automatically on 401. */
export async function refreshAuthToken(payload: RefreshTokenPayload): Promise<RefreshTokenResponse> {
  const res = await ApiService.post<unknown>(endpoints.auth.refresh, payload, {
    withAuth: false,
    retryOnAuthFailure: false,
  });
  const root = res.data;
  const inner = isRecord(root) && isRecord(root.data) ? root.data : root;

  if (isRecord(inner) && typeof inner.access_token === "string") {
    return {
      access_token: inner.access_token,
      refresh_token:
        typeof inner.refresh_token === "string" ? inner.refresh_token : undefined,
      user: isRecord(inner.user) ? (inner.user as AuthUser) : undefined,
    };
  }
  if (
    isRecord(inner) &&
    isRecord(inner.session) &&
    typeof inner.session.access_token === "string"
  ) {
    return {
      access_token: inner.session.access_token,
      refresh_token:
        typeof inner.session.refresh_token === "string"
          ? inner.session.refresh_token
          : undefined,
      user: isRecord(inner.user) ? (inner.user as AuthUser) : undefined,
    };
  }
  throw new ApiError("Invalid refresh token response", 0, root);
}

/** PATCH /v1/auth/me — partial update of the current user's profile. */
export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const res = await ApiService.patch<ApiEnvelope<AuthUser>>(endpoints.auth.me, payload);
  const data = res.data;

  if (isRecord(data) && "id" in data) return data as AuthUser;
  if (isRecord(data) && isRecord(data.data) && "id" in data.data) return data.data as AuthUser;
  throw new ApiError("Invalid update profile response", 0, data);
}

/** POST /v1/auth/logout — server-side revoke. The hook handles local token cleanup. */
export async function logoutUser(): Promise<void> {
  await ApiService.post(endpoints.auth.logout);
}
