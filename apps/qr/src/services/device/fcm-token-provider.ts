/**
 * Pluggable source for this device's push registration value.
 *
 * The value is sent as `fcmToken` to `POST /v1/devices/token`: either a native FCM registration
 * token (mobile) or a Firebase Installation ID (web). The wire field and column intentionally
 * carry both during the FID transition. Wired at startup via `installFirebaseMessaging()`.
 */
export type FcmTokenProvider = () => Promise<string | null>;

let fcmTokenProvider: FcmTokenProvider = () => Promise.resolve(null);

/** Replace the push registration provider (e.g. the Firebase web FID resolver). */
export function setFcmTokenProvider(provider: FcmTokenProvider): void {
  fcmTokenProvider = provider;
}

/** Read the current push registration value (FCM token or Firebase Installation ID), if available. */
export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await fcmTokenProvider();
    if (!token?.trim()) {
      return null;
    }
    return token.trim();
  } catch {
    return null;
  }
}
