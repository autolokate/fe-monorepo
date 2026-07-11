import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

export type RegisterDeviceBody = {
  fcmToken: string;
  platform: DevicePlatform;
};

export type DeviceRegistered = {
  deviceId: string;
};

/** POST /v1/devices/token — register or refresh FCM push target (upsert-idempotent). */
export async function registerDeviceToken(
  client: ApiClient,
  body: RegisterDeviceBody,
): Promise<DeviceRegistered> {
  const response = await client.post<unknown>(endpoints.devices.token, body);
  return unwrapEnvelope(response) as DeviceRegistered;
}

/**
 * DELETE /v1/devices/token — unregister THIS device's push target.
 *
 * Fired when the browser's Firebase Installation ID is retired (`onUnregistered`), so the server
 * stops targeting a dead installation instead of waiting for a send to 404. Idempotent.
 */
export async function unregisterDeviceToken(
  client: ApiClient,
  body: { fcmToken: string },
): Promise<void> {
  await client.delete<unknown>(endpoints.devices.token, { body });
}
