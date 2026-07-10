/**
 * Pluggable FCM token source.
 * Wired at startup via `installFirebaseMessaging()` → Firebase web `getToken()`.
 */
export type FcmTokenProvider = () => Promise<string | null>;

let fcmTokenProvider: FcmTokenProvider = () => Promise.resolve(null);

/** Replace the FCM token provider (e.g. Firebase `getToken()` wrapper). */
export function setFcmTokenProvider(provider: FcmTokenProvider): void {
  fcmTokenProvider = provider;
}

/** Read the current FCM registration token, if available. */
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
