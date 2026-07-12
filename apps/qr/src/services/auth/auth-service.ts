import {
  logoutSession,
  requestOtp as requestOtpApi,
  toE164IndianMobile,
  verifyOtp as verifyOtpApi,
  type OtpChannel,
  type Profile,
  type RequestOtpResult,
  type TokenPair,
} from '@autolokate/api-client';
import { getDeviceId, getTokenManager } from '@autolokate/auth';

import {
  getQrApiClient,
  getQrBootstrapClient,
} from '@/platform/api/qr-api-client';

import { authLogger } from './auth-logger';
import { grantSignupConsents } from './consent-sync';
import { registerDevice, clearDeviceRegistrationState } from '../device/device-service';
import { mapProfileToJourney, type ProfileJourneyPatch } from '../profile/profile-mapper';

export type SendOtpInput = {
  mobileDigits: string;
  channel?: OtpChannel;
};

export type VerifyOtpInput = {
  mobileDigits: string;
  code: string;
  consentAccepted?: boolean;
};

export type VerifyOtpResult = {
  tokens: TokenPair;
  profile: Profile | null;
  journeyPatch: ProfileJourneyPatch;
  isNewUser: boolean;
};

/** Send OTP to the given 10-digit Indian mobile. */
export async function sendOtp(input: SendOtpInput): Promise<RequestOtpResult> {
  const client = getQrBootstrapClient();
  return requestOtpApi(client, {
    phone: toE164IndianMobile(input.mobileDigits),
    ...(input.channel ? { channel: input.channel } : {}),
  });
}

/** Verify OTP, persist tokens, sync profile, and optionally grant consent. */
export async function verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
  const bootstrap = getQrBootstrapClient();
  const authenticated = getQrApiClient();
  const tokenManager = getTokenManager();

  const tokens = await verifyOtpApi(bootstrap, {
    phone: toE164IndianMobile(input.mobileDigits),
    code: input.code,
  });

  tokenManager.save(tokens);

  const isNewUser = tokens.isNewUser === true;

  if (isNewUser) {
    authLogger.info('profile_fetch_skipped', { reason: 'new_user' });
  } else {
    authLogger.info('profile_fetch_skipped', { reason: 'existing_user_from_verify' });
  }

  if (input.consentAccepted) {
    void grantSignupConsents(authenticated);
  }

  // POST /v1/devices/token — { fcmToken, platform } once the session exists (non-blocking).
  void registerDevice();

  return {
    tokens,
    profile: null,
    journeyPatch: mapProfileToJourney(null),
    isNewUser,
  };
}

/** Revoke server session and clear local tokens. */
export async function logout(): Promise<void> {
  const tokenManager = getTokenManager();
  if (!tokenManager.hasSession()) {
    clearDeviceRegistrationState();
    tokenManager.clear();
    return;
  }

  try {
    await logoutSession(getQrApiClient());
  } catch (error) {
    authLogger.warn('logout_api_failed', { error });
  } finally {
    clearDeviceRegistrationState();
    tokenManager.clear();
  }
}
