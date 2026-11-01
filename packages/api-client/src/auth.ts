import type { ApiClient } from './client';
import { ApiError } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type OtpChannel = 'sms' | 'whatsapp';

export type RequestOtpBody = {
  phone: string;
  channel?: OtpChannel;
};

export type RequestOtpResult = {
  channel: OtpChannel;
};

export type VerifyOtpBody = {
  phone: string;
  code: string;
  deviceId?: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  isNewUser?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return null;
}

/** Accept camelCase or snake_case token payloads from the backend envelope. */
export function normalizeTokenPair(data: unknown): TokenPair {
  if (!isRecord(data)) {
    throw new ApiError('Invalid auth token response', 0, 'invalid_response');
  }

  const accessToken = readString(data, 'accessToken', 'access_token');
  const refreshToken = readString(data, 'refreshToken', 'refresh_token');
  const expiresAt = readString(data, 'expiresAt', 'expires_at');
  const userId = readString(data, 'userId', 'user_id');

  if (!accessToken || !refreshToken || !expiresAt || !userId) {
    throw new ApiError('Invalid auth token response: missing token fields', 0, 'invalid_response');
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    userId,
    ...(typeof data['isNewUser'] === 'boolean'
      ? { isNewUser: data['isNewUser'] }
      : typeof data['is_new_user'] === 'boolean'
        ? { isNewUser: data['is_new_user'] }
        : {}),
  };
}

export type RefreshTokenBody = {
  refreshToken: string;
};

export type Profile = {
  name: string | null;
  locale: string;
  photoMediaId: string | null;
};

export type SessionRoles = {
  role: string;
  availableRoles: string[];
  staffId?: string;
  locationId?: string;
  accessToken?: string;
  expiresAt?: string;
};

/** POST /v1/auth/otp/request */
export async function requestOtp(
  client: ApiClient,
  body: RequestOtpBody,
): Promise<RequestOtpResult> {
  const response = await client.post<unknown>(endpoints.auth.requestOtp, body, { skipAuth: true });
  return unwrapEnvelope(response) as RequestOtpResult;
}

/** POST /v1/auth/otp/verify */
export async function verifyOtp(client: ApiClient, body: VerifyOtpBody): Promise<TokenPair> {
  const response = await client.post<unknown>(endpoints.auth.verifyOtp, body, { skipAuth: true });
  return normalizeTokenPair(unwrapEnvelope(response));
}

/** POST /v1/auth/refresh */
export async function refreshToken(client: ApiClient, body: RefreshTokenBody): Promise<TokenPair> {
  const response = await client.post<unknown>(endpoints.auth.refresh, body, {
    skipAuth: true,
    skipAuthRetry: true,
  });
  return normalizeTokenPair(unwrapEnvelope(response));
}

/** POST /v1/auth/logout */
export async function logoutSession(client: ApiClient): Promise<void> {
  await client.post(endpoints.auth.logout);
}

/** Result of `POST /v1/auth/step-up/otp/request` (202). */
export type StepUpOtpRequested = {
  channel: string;
};

/** Result of `POST /v1/auth/step-up/otp/verify` — same token shape as `/v1/auth/session`, `step_up=true`. */
export type StepUpTokenDto = {
  accessToken: string;
  /** Seconds until the stepped-up access token expires (short TTL). */
  expiresIn: number;
};

/** POST /v1/auth/step-up/otp/request — OPERATOR only; sends an OTP to the account's own phone. */
export async function requestStepUpOtp(client: ApiClient): Promise<StepUpOtpRequested> {
  const response = await client.post<unknown>(endpoints.auth.stepUpOtpRequest, {});
  const data = unwrapEnvelope(response);
  const channel = isRecord(data) && typeof data['channel'] === 'string' ? data['channel'] : 'sms';
  return { channel };
}

/** POST /v1/auth/step-up/otp/verify — exchanges the OTP for a stepped-up access token. */
export async function verifyStepUpOtp(
  client: ApiClient,
  body: { token: string },
): Promise<StepUpTokenDto> {
  const response = await client.post<unknown>(endpoints.auth.stepUpOtpVerify, body);
  const data = unwrapEnvelope(response);
  if (!isRecord(data)) {
    throw new ApiError('Invalid step-up response', 0, 'invalid_response');
  }
  const accessToken = readString(data, 'accessToken', 'access_token');
  const expiresInRaw = data['expiresIn'] ?? data['expires_in'];
  const expiresIn = typeof expiresInRaw === 'number' ? expiresInRaw : Number(expiresInRaw);
  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new ApiError('Invalid step-up response: missing token fields', 0, 'invalid_response');
  }
  return { accessToken, expiresIn };
}

/**
 * True when the server refused an admin-plane call because the access token lacks the
 * `step_up` (2FA) claim. Contract code is `step_up_required`; older servers answer a plain
 * 403 `forbidden` whose message names step-up — both are recognised.
 */
export function isStepUpRequiredError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 403) {
    return false;
  }
  if (error.code?.toLowerCase() === 'step_up_required') {
    return true;
  }
  return /step-up|step_up/i.test(error.message);
}

/** POST /v1/auth/session — read or switch role (omit role to read). */
export async function getOrSwitchSession(
  client: ApiClient,
  body: { role?: string } = {},
): Promise<SessionRoles> {
  const response = await client.post<unknown>(endpoints.auth.session, body);
  return unwrapEnvelope(response) as SessionRoles;
}

/** GET /v1/profiles */
export async function getProfile(client: ApiClient): Promise<Profile> {
  const response = await client.get<unknown>(endpoints.auth.profiles);
  return unwrapEnvelope(response) as Profile;
}

/** PATCH /v1/profile */
export async function updateProfile(
  client: ApiClient,
  body: Partial<Pick<Profile, 'name' | 'locale' | 'photoMediaId'>>,
): Promise<Profile> {
  const response = await client.patch<unknown>(endpoints.auth.profile, body);
  return unwrapEnvelope(response) as Profile;
}

/** Body for `POST /v1/auth/flow-a/handoff/mint` (lock §5 / §A5). */
export type MintFlowAHandoffBody = {
  vehicleId?: string;
  activationContext?: Record<string, unknown>;
};

/** Response for Flow A mint — opaque code, never put tokens in the URL. */
export type MintFlowAHandoffResult = {
  code: string;
  expiresAt: string;
  ttlSeconds: number;
};

/** Body for `POST /v1/auth/flow-a/handoff/exchange`. */
export type ExchangeFlowAHandoffBody = {
  code: string;
  deviceId?: string;
};

/** Exchange response — session tokens + optional vehicle/activation context. */
export type ExchangeFlowAHandoffResult = TokenPair & {
  accountId: string;
  vehicleId: string | null;
  activationContext: Record<string, unknown> | null;
};

/** POST /v1/auth/flow-a/handoff/mint — authenticated PWA→native handoff mint. */
export async function mintFlowAHandoff(
  client: ApiClient,
  body: MintFlowAHandoffBody = {},
  options: { signal?: AbortSignal } = {},
): Promise<MintFlowAHandoffResult> {
  const response = await client.post<unknown>(endpoints.auth.mintFlowAHandoff, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as MintFlowAHandoffResult;
}

/**
 * POST /v1/auth/flow-a/handoff/exchange — public single-use exchange (~60s TTL).
 * Production ship still requires formal security sign-off (PRG-Sec-FlowA).
 */
export async function exchangeFlowAHandoff(
  client: ApiClient,
  body: ExchangeFlowAHandoffBody,
  options: { signal?: AbortSignal } = {},
): Promise<ExchangeFlowAHandoffResult> {
  const response = await client.post<unknown>(endpoints.auth.exchangeFlowAHandoff, body, {
    skipAuth: true,
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const data = unwrapEnvelope(response);
  const tokens = normalizeTokenPair(data);
  const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  return {
    ...tokens,
    accountId:
      typeof record['accountId'] === 'string'
        ? record['accountId']
        : typeof record['account_id'] === 'string'
          ? record['account_id']
          : tokens.userId,
    vehicleId:
      typeof record['vehicleId'] === 'string'
        ? record['vehicleId']
        : typeof record['vehicle_id'] === 'string'
          ? record['vehicle_id']
          : null,
    activationContext:
      record['activationContext'] && typeof record['activationContext'] === 'object'
        ? (record['activationContext'] as Record<string, unknown>)
        : record['activation_context'] && typeof record['activation_context'] === 'object'
          ? (record['activation_context'] as Record<string, unknown>)
          : null,
  };
}

/** Format a 10-digit Indian mobile as E.164 (+91). */
export function toE164IndianMobile(digits10: string): string {
  const normalized = digits10.replace(/\D/g, '').slice(-10);
  return `+91${normalized}`;
}
