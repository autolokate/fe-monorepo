import type { DevicePlatform } from '@autolokate/api-client';

/**
 * Push platform for `RegisterDeviceDto.platform`.
 * This app obtains tokens via the Firebase *web* SDK only — always `WEB`,
 * even when the browser UA is Android/iOS (native apps use a different client).
 */
export function detectDevicePlatform(): DevicePlatform {
  return 'WEB';
}
