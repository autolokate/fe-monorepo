/** Stand-in for `firebase/app`. Only what firebase-messaging.ts imports. */
export function initializeApp(config) {
  return { name: '[fake]', options: config };
}
