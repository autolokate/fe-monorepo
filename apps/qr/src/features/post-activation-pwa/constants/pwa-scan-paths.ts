/** Isolated Post-Activation PWA route paths — not under /journey/*. */
export const pwaScanPaths = {
  root: '/pwa/scan',
  loading: '/pwa/scan/loading',
  vehicle: '/pwa/scan/vehicle',
  verifyMobile: '/pwa/scan/verify/mobile',
  verifyOtp: '/pwa/scan/verify/otp',
  verifyName: '/pwa/scan/verify/name',
  parkMeVehicleNumber: '/pwa/scan/park-me/vehicle-number',
  parkMeLookingUp: '/pwa/scan/park-me/looking-up',
  parkMeConfirm: '/pwa/scan/park-me/confirm',
  parkMeConfirmProtected: '/pwa/scan/park-me/confirm-protected',
  parkMePermissions: '/pwa/scan/park-me/permissions',
  parkMePhotos: '/pwa/scan/park-me/photos',
  parkMeReview: '/pwa/scan/park-me/review',
  parkMeStatusChecking: '/pwa/scan/park-me/status/checking',
  parkMeStatusCalling: '/pwa/scan/park-me/status/calling',
  parkMeStatusResolved: '/pwa/scan/park-me/status/resolved',
  parkMePhotoNotClear: '/pwa/scan/park-me/photo-not-clear',
  sos: '/pwa/scan/sos',
  sosHolding: '/pwa/scan/sos/holding',
  sosAllowLocation: '/pwa/scan/sos/allow-location',
  sosLeaveConfirm: '/pwa/scan/sos/leave-confirm',
  sosScenePhotos: '/pwa/scan/sos/scene-photos',
  sosScenePhotosCaptured: '/pwa/scan/sos/scene-photos/captured',
  sosLocationUnavailable: '/pwa/scan/sos/location-unavailable',
  sosSending: '/pwa/scan/sos/sending',
  sosCouldntSend: '/pwa/scan/sos/couldnt-send',
  sosHelpReceived: '/pwa/scan/sos/help-received',
  sosHelpDispatched: '/pwa/scan/sos/help-dispatched',
  sosResolved: '/pwa/scan/sos/resolved',
  sosAlertCancelled: '/pwa/scan/sos/alert-cancelled',
  sosContactsOnly: '/pwa/scan/sos/contacts-only',
} as const;

export const PWA_SCAN_STORAGE_KEY = 'al-pwa-scan-v1';

export const PWA_BOOTSTRAP_MS = 1200;
export const PWA_SOS_HOLD_MS = 4000;
export const PWA_STATUS_STEP_MS = 2500;
