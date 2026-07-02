import {
  getProfile,
  logoutSession,
  requestOtp as requestOtpApi,
  toE164IndianMobile,
  verifyOtp as verifyOtpApi,
  type Profile,
  type RequestOtpResult,
  type TokenPair,
} from '@autolokate/api-client';
import { getTokenManager } from '@autolokate/auth';

import {
  getOnboardingApiClient,
  getOnboardingBootstrapClient,
} from '@/platform/api/onboarding-api-client.js';

import { authLogger } from './auth-logger.js';
import { grantSignupConsents } from './consent-sync.js';
import { registerDevice } from '../device/device-service.js';
import { mapProfileToJourney, type ProfileJourneyPatch } from '../profile/profile-mapper.js';

export type SendOtpInput = {
  mobileDigits: string;
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
};

/** Send OTP to the given 10-digit Indian mobile. */
export async function sendOtp(input: SendOtpInput): Promise<RequestOtpResult> {
  const client = getOnboardingBootstrapClient();
  return requestOtpApi(client, {
    phone: toE164IndianMobile(input.mobileDigits),
  });
}

/** Verify OTP, persist tokens, sync profile, and optionally grant consent. */
export async function verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
  const bootstrap = getOnboardingBootstrapClient();
  const authenticated = getOnboardingApiClient();
  const tokenManager = getTokenManager();

  const tokens = await verifyOtpApi(bootstrap, {
    phone: toE164IndianMobile(input.mobileDigits),
    code: input.code,
  });

  tokenManager.save(tokens);

  let profile: Profile | null = null;
  try {
    profile = await getProfile(authenticated);
    authLogger.info('profile_synced', { hasName: Boolean(profile.name) });
  } catch (error) {
    authLogger.warn('profile_sync_failed', { error });
  }

  if (input.consentAccepted) {
    void grantSignupConsents(authenticated);
  }

  void registerDevice();

  return {
    tokens,
    profile,
    journeyPatch: mapProfileToJourney(profile),
  };
}

/** Revoke server session and clear local tokens. */
export async function logout(): Promise<void> {
  const tokenManager = getTokenManager();
  if (!tokenManager.hasSession()) {
    tokenManager.clear();
    return;
  }

  try {
    await logoutSession(getOnboardingApiClient());
  } catch (error) {
    authLogger.warn('logout_api_failed', { error });
  } finally {
    tokenManager.clear();
  }
}
