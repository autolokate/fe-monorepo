export { registerDevice, refreshDeviceRegistration } from './device-service';
export {
  setFcmTokenProvider,
  getFcmToken,
  type FcmTokenProvider,
} from './fcm-token-provider';
export {
  resolveWebInstallationId,
  listenForForegroundMessages,
} from './firebase-messaging';
export { installFirebaseMessaging } from './install-firebase-messaging';
export { detectDevicePlatform } from './device-platform';
