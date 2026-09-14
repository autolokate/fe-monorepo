'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/error';
import { ApiService } from '@/services/api.service';
import { dedupedRequest, invalidateDedupeCache } from '@/lib/api/dedupe-cache';
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
} from './types';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Short TTL so profile + preference sync share one network round-trip. */
const CURRENT_USER_CACHE_KEY = 'website:current-user';
const CURRENT_USER_TTL_MS = 30_000;

type BackendProfile = {
  name?: string | null;
  locale?: string | null;
  photoMediaId?: string | null;
  phone?: string | null;
  full_name?: string | null;
  city_id?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_fuel_types?: string[] | null;
  preferred_body_types?: string[] | null;
  preferred_vehicle_category?: string | null;
  id?: string;
  userId?: string;
  user_id?: string;
};

function readOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readOptionalStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.filter(
    (item): item is string => typeof item === 'string' && item.trim() !== '',
  );
  return items.length > 0 ? items : null;
}

/**
 * Map `GET/PATCH /v1/profile` into the AuthUser shape the website UI already uses.
 * Accepts both Autolokate (`name`) and extended marketplace fields when present.
 */
function profileToAuthUser(raw: unknown): AuthUser | null {
  if (!isRecord(raw)) return null;

  const nested = isRecord(raw.data) ? (raw.data as BackendProfile) : null;
  const root = raw as BackendProfile;
  const profile = nested ?? root;

  const name = readOptionalString(profile.name) ?? readOptionalString(profile.full_name);
  const phone = readOptionalString(profile.phone);
  const id =
    readOptionalString(profile.id) ??
    readOptionalString(profile.userId) ??
    readOptionalString(profile.user_id) ??
    undefined;

  const hasAnyField =
    name !== null ||
    phone !== null ||
    id !== undefined ||
    'name' in profile ||
    'full_name' in profile ||
    'locale' in profile ||
    'photoMediaId' in profile ||
    'city_id' in profile ||
    'budget_min' in profile ||
    'preferred_fuel_types' in profile;

  if (!hasAnyField) return null;

  return {
    id,
    full_name: name,
    phone,
    locale: readOptionalString(profile.locale),
    photo_media_id: readOptionalString(profile.photoMediaId),
    city_id: readOptionalString(profile.city_id),
    budget_min: readOptionalNumber(profile.budget_min),
    budget_max: readOptionalNumber(profile.budget_max),
    preferred_fuel_types: readOptionalStringArray(profile.preferred_fuel_types),
    preferred_body_types: readOptionalStringArray(profile.preferred_body_types),
    preferred_vehicle_category: readOptionalString(profile.preferred_vehicle_category),
  };
}

/** POST /v1/auth/otp/request — kicks off OTP delivery. */
export async function requestOtp(payload: RequestOtpPayload): Promise<RequestOtpResponse> {
  const res = await ApiService.post<ApiEnvelope<RequestOtpResponse>>(
    endpoints.auth.requestOtp,
    payload,
    { withAuth: false },
  );
  const data = res.data;

  if (isRecord(data) && 'sent' in data) {
    const r = data as Record<string, unknown>;
    return {
      sent: Boolean(r.sent),
      expires_in: typeof r.expires_in === 'number' ? r.expires_in : 300,
      message: typeof r.message === 'string' ? r.message : undefined,
    };
  }

  const envelope = (isRecord(data) ? data : {}) as {
    success?: boolean;
    data?: { message?: string; channel?: string };
  };
  return {
    sent: envelope.success !== false,
    expires_in: 300,
    message: envelope.data?.message,
  };
}

/** POST /v1/auth/otp/verify — exchanges OTP for tokens + user. */
export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const body: Record<string, unknown> = {
    phone: payload.phone,
    code: payload.otp,
  };
  if (payload.full_name?.trim()) body.full_name = payload.full_name.trim();

  const res = await ApiService.post(endpoints.auth.verifyOtp, body, {
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
    typeof inner.access_token === 'string' &&
    typeof inner.refresh_token === 'string'
  ) {
    return {
      access_token: inner.access_token,
      refresh_token: inner.refresh_token,
      user: isRecord(inner.user) ? inner.user : {},
      is_new_user: typeof inner.is_new_user === 'boolean' ? inner.is_new_user : false,
    };
  }

  if (
    isRecord(inner) &&
    typeof inner.accessToken === 'string' &&
    typeof inner.refreshToken === 'string'
  ) {
    const userId = typeof inner.userId === 'string' ? inner.userId : undefined;
    return {
      access_token: inner.accessToken,
      refresh_token: inner.refreshToken,
      user: isRecord(inner.user) ? inner.user : { id: userId },
      is_new_user: typeof inner.isNewUser === 'boolean' ? inner.isNewUser : false,
    };
  }

  if (
    isRecord(inner) &&
    isRecord(inner.session) &&
    typeof inner.session.access_token === 'string' &&
    typeof inner.session.refresh_token === 'string'
  ) {
    const sessionUser = isRecord(inner.session.user) ? inner.session.user : null;
    const topUser = isRecord(inner.user) ? inner.user : null;
    return {
      access_token: inner.session.access_token,
      refresh_token: inner.session.refresh_token,
      user: topUser ?? sessionUser ?? {},
      is_new_user: typeof inner.is_new_user === 'boolean' ? inner.is_new_user : false,
    };
  }

  throw new ApiError('We couldn’t complete sign-in. Please try again.', 0, root);
}

/** GET /v1/profile — signed-in account profile (deduped for header + page). */
export async function fetchCurrentUser(): Promise<AuthUser> {
  return dedupedRequest(CURRENT_USER_CACHE_KEY, CURRENT_USER_TTL_MS, async () => {
    const res = await ApiService.get<ApiEnvelope<BackendProfile>>(endpoints.profile);
    const user = profileToAuthUser(res.data);
    if (user) return user;
    throw new ApiError('We couldn’t load your profile. Please try again.', 0, res.data);
  });
}

/** POST /v1/auth/refresh — manual refresh. The interceptor also runs this automatically on 401. */
export async function refreshAuthToken(
  payload: RefreshTokenPayload,
): Promise<RefreshTokenResponse> {
  const res = await ApiService.post(endpoints.auth.refresh, payload, {
    withAuth: false,
    retryOnAuthFailure: false,
  });
  const root = res.data;
  const inner = isRecord(root) && isRecord(root.data) ? root.data : root;

  if (isRecord(inner) && typeof inner.access_token === 'string') {
    return {
      access_token: inner.access_token,
      refresh_token: typeof inner.refresh_token === 'string' ? inner.refresh_token : undefined,
      user: isRecord(inner.user) ? inner.user : undefined,
    };
  }
  if (
    isRecord(inner) &&
    isRecord(inner.session) &&
    typeof inner.session.access_token === 'string'
  ) {
    return {
      access_token: inner.session.access_token,
      refresh_token:
        typeof inner.session.refresh_token === 'string' ? inner.session.refresh_token : undefined,
      user: isRecord(inner.user) ? inner.user : undefined,
    };
  }
  throw new ApiError('We couldn’t refresh your session. Please sign in again.', 0, root);
}

/**
 * PATCH /v1/profile — persists every field the form collects.
 * Always includes Autolokate `name` (from `full_name`) so staging/prod stay compatible.
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const body: Record<string, unknown> = {};
  const name = payload.full_name?.trim();
  if (name) {
    body.name = name;
    body.full_name = name;
  }
  if (payload.phone?.trim()) body.phone = payload.phone.trim();
  if (payload.city_id !== undefined) body.city_id = payload.city_id;
  if (payload.budget_min !== undefined) body.budget_min = payload.budget_min;
  if (payload.budget_max !== undefined) body.budget_max = payload.budget_max;
  if (payload.preferred_fuel_types !== undefined) {
    body.preferred_fuel_types = payload.preferred_fuel_types;
  }
  if (payload.preferred_body_types !== undefined) {
    body.preferred_body_types = payload.preferred_body_types;
  }
  if (payload.preferred_vehicle_category !== undefined) {
    body.preferred_vehicle_category = payload.preferred_vehicle_category;
  }

  const res = await ApiService.patch<ApiEnvelope<BackendProfile>>(endpoints.profile, body);
  const user = profileToAuthUser(res.data);
  if (!user) {
    throw new ApiError('We couldn’t save your profile. Please try again.', 0, res.data);
  }
  // Merge request values so fields the API echoes only as `name` still stick in the UI.
  const merged: AuthUser = {
    ...user,
    full_name: user.full_name ?? name ?? null,
    phone: user.phone ?? payload.phone ?? null,
    city_id: user.city_id ?? payload.city_id ?? null,
    budget_min: user.budget_min ?? payload.budget_min ?? null,
    budget_max: user.budget_max ?? payload.budget_max ?? null,
    preferred_fuel_types: user.preferred_fuel_types ?? payload.preferred_fuel_types ?? null,
    preferred_body_types: user.preferred_body_types ?? payload.preferred_body_types ?? null,
    preferred_vehicle_category:
      user.preferred_vehicle_category ?? payload.preferred_vehicle_category ?? null,
  };
  invalidateDedupeCache(CURRENT_USER_CACHE_KEY);
  return merged;
}

/** POST /v1/auth/logout — server-side revoke. The hook handles local token cleanup. */
export async function logoutUser(): Promise<void> {
  try {
    await ApiService.post(endpoints.auth.logout);
  } finally {
    invalidateDedupeCache(CURRENT_USER_CACHE_KEY);
  }
}
