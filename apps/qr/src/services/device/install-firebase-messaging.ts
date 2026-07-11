import { setFcmTokenProvider } from './fcm-token-provider';
import {
  resolveWebInstallationId,
  listenForForegroundMessages,
} from './firebase-messaging';

/**
 * Wire the Firebase Messaging token provider into the device-registration seam.
 * Call once at app startup (before auth restore / DeviceRegistrationRegistrar).
 */
export function installFirebaseMessaging(): void {
  setFcmTokenProvider(() => resolveWebInstallationId());
  void listenForForegroundMessages();
}
