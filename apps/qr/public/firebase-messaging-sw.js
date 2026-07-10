/* eslint-disable no-undef */
/**
 * FCM background service worker (must be at site root).
 * Config mirrors the web app Firebase project (autolokate-50246).
 * Keep in sync with VITE_FIREBASE_* in apps/qr/.env*.
 *
 * @see https://firebase.google.com/docs/cloud-messaging/js/receive
 */
/* Compat SW per https://firebase.google.com/docs/cloud-messaging/js/receive
 * (modular SW requires bundling; keep CDN version pinned to the npm `firebase` major). */
importScripts(
  'https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyBc722Z077xkcOrpL5PdnlSAnc4w9PqLRo',
  authDomain: 'autolokate-50246.firebaseapp.com',
  projectId: 'autolokate-50246',
  storageBucket: 'autolokate-50246.firebasestorage.app',
  messagingSenderId: '1096938366736',
  appId: '1:1096938366736:web:c2f1941f7132f2b327e795',
  measurementId: 'G-8LF8RBJLR0',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Autolokate';
  const options = {
    body: payload.notification?.body || '',
    data: payload.data || {},
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };
  self.registration.showNotification(title, options);
});
