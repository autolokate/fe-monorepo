/**
 * Stand-in for `firebase/messaging`, mirroring @firebase/messaging's public contract as
 * firebase-messaging.ts consumes it:
 *   register(messaging, options)      -> Promise<void>   (the FID is NOT the return value)
 *   onRegistered(messaging, cb)       -> Unsubscribe      (cb receives the FID; fires on register + rotation)
 *   onUnregistered(messaging, cb)     -> Unsubscribe      (cb receives the retired FID)
 *
 * The test drives it through `window.__fcm`, so the FID's arrival time relative to the bounded wait
 * in firebase-messaging.ts — and FID rotation / retirement — are test inputs. Chrome refuses real
 * push subscriptions under automation; the code under test is the bridge, not Firebase's SDK.
 */
/* global window */
// Seeded by the test via addInitScript, so the config is in place before any app module runs.
const seed = (typeof window !== 'undefined' && window.__fcmConfig) || {};

const state = {
  registerCalls: 0,
  onRegisteredSubscriptions: 0,
  onUnregisteredSubscriptions: 0,
  onMessageSubscriptions: 0,
  registeredCallbacks: [],
  unregisteredCallbacks: [],
  /** ms to wait after register() before delivering the FID; -1 = never deliver. */
  fidDelayMs: seed.fidDelayMs ?? 0,
  fid: seed.fid ?? 'FAKE-FID-0000',
};

if (typeof window !== 'undefined') {
  window.__fcm = {
    state,
    configure(opts) {
      Object.assign(state, opts);
    },
    /** Deliver an FID to every onRegistered subscriber (initial registration or rotation). */
    emit(fid) {
      state.fid = fid;
      state.registeredCallbacks.forEach((cb) => cb(fid));
    },
    /** Retire an FID: fire every onUnregistered subscriber with it. */
    emitUnregister(fid) {
      state.unregisteredCallbacks.forEach((cb) => cb(fid));
    },
    snapshot() {
      return {
        registerCalls: state.registerCalls,
        onRegisteredSubscriptions: state.onRegisteredSubscriptions,
        onUnregisteredSubscriptions: state.onUnregisteredSubscriptions,
        onMessageSubscriptions: state.onMessageSubscriptions,
      };
    },
  };
}

export function getMessaging() {
  return { __fake: true };
}

export function isSupported() {
  return Promise.resolve(true);
}

export function onMessage() {
  state.onMessageSubscriptions += 1;
  return () => undefined;
}

export function onRegistered(_messaging, cb) {
  state.onRegisteredSubscriptions += 1;
  state.registeredCallbacks.push(cb);
  return () => {
    state.registeredCallbacks = state.registeredCallbacks.filter((c) => c !== cb);
  };
}

export function onUnregistered(_messaging, cb) {
  state.onUnregisteredSubscriptions += 1;
  state.unregisteredCallbacks.push(cb);
  return () => {
    state.unregisteredCallbacks = state.unregisteredCallbacks.filter((c) => c !== cb);
  };
}

export function register() {
  state.registerCalls += 1;
  if (state.fidDelayMs >= 0) {
    setTimeout(() => {
      state.registeredCallbacks.forEach((cb) => cb(state.fid));
    }, state.fidDelayMs);
  }
  // Resolves as soon as registration is *initiated*, exactly like the real SDK.
  return Promise.resolve();
}
