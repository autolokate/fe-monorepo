import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  isSupported,
  onMessage,
  onRegistered,
  onUnregistered,
  register,
  type Messaging,
} from 'firebase/messaging';

import { deviceLogger } from './device-logger';
import { readFirebaseVapidKey, readFirebaseWebConfig } from './firebase-config';
import { refreshDeviceRegistration, unregisterDevice } from './device-service';

// onRegistered may never fire (blocked permission, service-worker failure, offline); bound the
// wait so the provider seam fails closed (resolves null) instead of stalling. 10s covers a
// service-worker cold start plus a slow FCM round-trip.
const FID_WAIT_TIMEOUT_MS = 10_000;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let cachedInstallationId: string | null = null;
let registeredSubscribed = false;
let pendingFirstFid: Promise<string | null> | null = null;
let resolveFirstFid: ((value: string | null) => void) | null = null;

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
 * Subscribe once to FID lifecycle events. `onRegistered` fires on initial registration and again
 * on rotation; `onUnregistered` fires when the FID is retired so the backend can drop it.
 * @see https://firebase.google.com/docs/cloud-messaging/js/client
 */
function subscribeFidEvents(msg: Messaging): void {
  if (registeredSubscribed) {
    return;
  }
  registeredSubscribed = true;
  onRegistered(msg, (installationId) => {
    if (!installationId) {
      return;
    }
    const isRotation = cachedInstallationId !== null && installationId !== cachedInstallationId;
    cachedInstallationId = installationId;
    const resolve = resolveFirstFid;
    if (resolve) {
      // A caller is awaiting this FID; it uploads the value itself.
      resolveFirstFid = null;
      deviceLogger.info('fcm_fid_ready');
      resolve(installationId);
      return;
    }
    // Nobody is waiting, so this FID would never reach the server on its own: either it rotated,
    // or it arrived after the bounded wait already resolved null and that upsert was abandoned.
    // Both leave the backend holding a stale or absent registration — re-upsert (the provider now
    // returns the cached FID, so this never re-registers).
    deviceLogger.info(isRotation ? 'fcm_fid_rotated' : 'fcm_fid_late');
    void refreshDeviceRegistration();
  });
  onUnregistered(msg, (installationId) => {
    if (!installationId) {
      return;
    }
    // Retired FID: drop the cached projection so the next resolve re-registers, and tell the
    // backend to stop targeting this installation.
    if (cachedInstallationId === installationId) {
      cachedInstallationId = null;
    }
    deviceLogger.info('fcm_fid_unregistered');
    void unregisterDevice(installationId);
  });
}

/**
 * Register with FCM and resolve the first FID delivered via `onRegistered`, or null on timeout.
 * Deduped across concurrent callers; `register` is invoked once per in-flight cycle, after the
 * `onRegistered` subscription is established.
 */
function startRegistration(msg: Messaging, vapidKey: string): Promise<string | null> {
  if (pendingFirstFid) {
    return pendingFirstFid;
  }
  subscribeFidEvents(msg);
  pendingFirstFid = new Promise<string | null>((resolve) => {
    resolveFirstFid = resolve;
    window.setTimeout(() => {
      if (resolveFirstFid === resolve) {
        resolveFirstFid = null;
        // A deferral, not a failure: a slow-but-successful registration still delivers the FID via
        // onRegistered afterwards and self-heals (fcm_fid_late). Only a fcm_fid_timeout with no
        // following fcm_fid_late means the browser never registered — hence INFO, not WARN.
        deviceLogger.info('fcm_fid_timeout');
        resolve(null);
      }
    }, FID_WAIT_TIMEOUT_MS);
    void register(msg, { vapidKey }).catch((error: unknown) => {
      deviceLogger.warn('fcm_register_failed', { error });
      if (resolveFirstFid === resolve) {
        resolveFirstFid = null;
        resolve(null);
      }
    });
  });
  void pendingFirstFid.finally(() => {
    pendingFirstFid = null;
  });
  return pendingFirstFid;
}

/**
 * Request notification permission and resolve this browser's Firebase Installation ID (FID).
 *
 * Registers with FCM via {@link register}; the FID is delivered asynchronously through the
 * {@link onRegistered} callback, then cached and returned. Relies on `/firebase-messaging-sw.js`
 * at the site root (FCM default service-worker discovery). Returns null when unsupported, denied,
 * misconfigured, or when the FID does not arrive within the bounded wait (never throws).
 *
 * @see https://firebase.google.com/docs/cloud-messaging/js/client
 */
export async function resolveWebInstallationId(): Promise<string | null> {
  try {
    if (cachedInstallationId) {
      return cachedInstallationId;
    }
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
    if (cachedInstallationId) {
      return cachedInstallationId;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      deviceLogger.debug('fcm_permission_denied', { permission });
      return null;
    }
    if (cachedInstallationId) {
      return cachedInstallationId;
    }
    return await startRegistration(msg, vapidKey);
  } catch (error) {
    deviceLogger.warn('fcm_registration_failed', { error });
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
