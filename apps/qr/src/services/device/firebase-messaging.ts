import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from 'firebase/messaging';

import { deviceLogger } from './device-logger';
import {
  readFirebaseVapidKey,
  readFirebaseWebConfig,
} from './firebase-config';
import { refreshDeviceRegistration } from './device-service';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase App + Messaging (modular SDK).
 * @see https://firebase.google.com/docs/cloud-messaging/js/client
 */
function getOrInitMessaging(): Messaging | null {
  if (messaging) {
    return messaging;
  }
  const config = readFirebaseWebConfig();
  if (!config) {
    deviceLogger.debug('fcm_skipped_missing_firebase_env');
    return null;
  }
  app = initializeApp(config);
  messaging = getMessaging(app);
  return messaging;
}

/**
 * Request notification permission + return an FCM registration token.
 * Relies on `/firebase-messaging-sw.js` at the site root (FCM default discovery).
 * Returns null when unsupported, denied, or misconfigured (never throws).
 *
 * @see https://firebase.google.com/docs/cloud-messaging/js/client#access_the_registration_token
 */
export async function fetchWebFcmToken(): Promise<string | null> {
  try {
    if (!(await isSupported())) {
      deviceLogger.debug('fcm_unsupported_browser');
      return null;
    }
    const vapidKey = readFirebaseVapidKey();
    if (!vapidKey) {
      deviceLogger.debug('fcm_skipped_missing_vapid');
      return null;
    }
    const msg = getOrInitMessaging();
    if (!msg) {
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      deviceLogger.debug('fcm_permission_denied', { permission });
      return null;
    }
    // Official path: getToken with vapidKey; SDK registers /firebase-messaging-sw.js at root.
    const token = await getToken(msg, { vapidKey });
    if (!token) {
      deviceLogger.debug('fcm_token_empty');
      return null;
    }
    deviceLogger.info('fcm_token_ready');
    return token;
  } catch (error) {
    deviceLogger.warn('fcm_token_failed', { error });
    return null;
  }
}

/**
 * Foreground messages via onMessage; background via firebase-messaging-sw.js.
 * @see https://firebase.google.com/docs/cloud-messaging/js/receive
 */
export async function listenForForegroundMessages(): Promise<void> {
  try {
    if (!(await isSupported())) {
      return;
    }
    const msg = getOrInitMessaging();
    if (!msg) {
      return;
    }
    onMessage(msg, (payload) => {
      deviceLogger.info('fcm_foreground_message', {
        messageId: payload.messageId,
        title: payload.notification?.title,
      });
      if (
        payload.notification?.title &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          data: payload.data,
        });
      }
      void refreshDeviceRegistration();
    });
  } catch (error) {
    deviceLogger.warn('fcm_foreground_listen_failed', { error });
  }
}
