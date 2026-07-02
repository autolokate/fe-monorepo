import { registerDeviceToken } from '@autolokate/api-client';
import { getTokenManager } from '@autolokate/auth';

import { getOnboardingApiClient } from '@/platform/api/onboarding-api-client.js';

import { deviceLogger } from './device-logger.js';
import { detectDevicePlatform } from './device-platform.js';
import { getFcmToken } from './fcm-token-provider.js';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function upsertDeviceRegistration(): Promise<boolean> {
  if (!getTokenManager().hasSession()) {
    deviceLogger.debug('register_skipped_no_session');
    return false;
  }

  const fcmToken = await getFcmToken();
  if (!fcmToken) {
    deviceLogger.debug('register_skipped_no_fcm_token');
    return false;
  }

  const client = getOnboardingApiClient();
  const platform = detectDevicePlatform();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await registerDeviceToken(client, { fcmToken, platform });
      deviceLogger.info('device_registered', {
        platform,
        deviceId: result.deviceId,
      });
      return true;
    } catch (error) {
      deviceLogger.warn('device_register_failed', { attempt, error });
      if (attempt < MAX_ATTEMPTS) {
        await delay(RETRY_BASE_MS * attempt);
      }
    }
  }

  return false;
}

/**
 * Register this browser/device for push after authentication.
 * Non-blocking — never throws; failures are logged only.
 */
export async function registerDevice(): Promise<void> {
  await upsertDeviceRegistration();
}

/**
 * Re-upsert when the FCM token rotates.
 * Non-blocking — never throws; failures are logged only.
 */
export async function refreshDeviceRegistration(): Promise<void> {
  await upsertDeviceRegistration();
}
