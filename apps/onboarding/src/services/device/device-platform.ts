import type { DevicePlatform } from '@autolokate/api-client';

/** Detect push platform for `RegisterDeviceDto.platform`. */
export function detectDevicePlatform(): DevicePlatform {
  if (typeof navigator === 'undefined') {
    return 'WEB';
  }

  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return 'ANDROID';
  }
  if (/iPad|iPhone|iPod/i.test(ua)) {
    return 'IOS';
  }
  if (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) {
    return 'IOS';
  }
  return 'WEB';
}
