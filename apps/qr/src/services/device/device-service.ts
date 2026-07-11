import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '@autolokate/api-client';
import { getTokenManager } from '@autolokate/auth';

import { getQrApiClient } from '@/platform/api/qr-api-client';

import { deviceLogger } from './device-logger';
import { detectDevicePlatform } from './device-platform';
import { getFcmToken } from './fcm-token-provider';

const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 400;
// A late FID whose upload fails transiently (offline / 5xx) has no other trigger this session:
// cachedInstallationId is already set, so the provider only ever returns it and nothing re-attempts.
// Grant the upload bounded second chances driven by reconnect/foreground events — no timers, no poll.
const MAX_RECONNECT_RETRIES = 3;

type UpsertOutcome = 'registered' | 'no-session' | 'no-token' | 'failed';

let reconnectArmed = false;
let reconnectRetries = 0;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function upsertDeviceRegistration(): Promise<UpsertOutcome> {
  if (!getTokenManager().hasSession()) {
    deviceLogger.debug('register_skipped_no_session');
    return 'no-session';
  }

  const fcmToken = await getFcmToken();
  if (!fcmToken) {
    deviceLogger.debug('register_skipped_no_fcm_token');
    return 'no-token';
  }

  const client = getQrApiClient();
  const platform = detectDevicePlatform();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await registerDeviceToken(client, { fcmToken, platform });
      deviceLogger.info('device_registered', {
        platform,
        deviceId: result.deviceId,
      });
      return 'registered';
    } catch (error) {
      deviceLogger.warn('device_register_failed', { attempt, error });
      if (attempt < MAX_ATTEMPTS) {
        await delay(RETRY_BASE_MS * attempt);
      }
    }
  }

  return 'failed';
}

function handleReconnect(): void {
  void retryPendingUpload();
}

function handleVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    void retryPendingUpload();
  }
}

function armReconnectRetry(): void {
  if (reconnectArmed) {
    return;
  }
  reconnectArmed = true;
  reconnectRetries = 0;
  window.addEventListener('online', handleReconnect);
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

function disarmReconnectRetry(): void {
  if (!reconnectArmed) {
    return;
  }
  reconnectArmed = false;
  reconnectRetries = 0;
  window.removeEventListener('online', handleReconnect);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
}

async function retryPendingUpload(): Promise<void> {
  if (!reconnectArmed) {
    return;
  }
  const outcome = await upsertDeviceRegistration();
  if (outcome === 'registered' || outcome === 'no-session') {
    // Uploaded, or the session lapsed (a later login re-runs registerDevice) — stop retrying.
    disarmReconnectRetry();
    return;
  }
  reconnectRetries += 1;
  if (reconnectRetries >= MAX_RECONNECT_RETRIES) {
    disarmReconnectRetry();
    deviceLogger.warn('device_register_abandoned');
  }
}

async function driveUpsert(): Promise<void> {
  const outcome = await upsertDeviceRegistration();
  if (outcome === 'registered') {
    disarmReconnectRetry();
    return;
  }
  if (outcome === 'failed') {
    armReconnectRetry();
  }
}

/**
 * Register this browser/device for push after authentication.
 * Non-blocking — never throws; failures are logged only.
 */
export async function registerDevice(): Promise<void> {
  await driveUpsert();
}

/**
 * Re-upsert when the FCM token rotates or a late FID arrives.
 * Non-blocking — never throws; failures are logged only.
 */
export async function refreshDeviceRegistration(): Promise<void> {
  await driveUpsert();
}

/**
 * Tell the backend to drop a retired Firebase Installation ID (fired from `onUnregistered`), so
 * sends stop targeting a dead installation instead of 404-ing. Non-blocking — never throws;
 * no-ops without a session.
 */
export async function unregisterDevice(fcmToken: string): Promise<void> {
  try {
    if (!getTokenManager().hasSession()) {
      deviceLogger.debug('unregister_skipped_no_session');
      return;
    }
    const client = getQrApiClient();
    await unregisterDeviceToken(client, { fcmToken });
    deviceLogger.info('device_unregistered');
  } catch (error) {
    deviceLogger.warn('device_unregister_failed', { error });
  }
}
