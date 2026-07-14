import { compactPlate } from '@/services/vehicle/vehicle-plate';
import { normalizePlate } from '@/services/vehicle/index';

/** Top-level route namespaces (industry-standard journey-scoped URLs). */
export const ROUTE_NAMESPACE = {
  q: '/q',
  onboarding: '/onboarding',
  emergency: '/emergency',
  scan: '/scan',
  prepaid: '/prepaid',
  b2b2c: '/b2b2c',
  legalPrivacy: '/legal/privacy',
  legalTerms: '/legal/terms',
  completed: '/completed',
} as const;

/** Legacy root paths — redirect targets only. */
export const LEGACY_FLAT_PATHS = {
  auth: '/auth',
  otp: '/otp',
  profile: '/profile',
  scan: '/scan',
  purchase: '/purchase',
  pwaScan: '/pwa/scan',
} as const;

export function encodeJourneyId(journeyId: string): string {
  return encodeURIComponent(journeyId.trim());
}

export function decodeJourneyId(segment: string): string {
  try {
    return decodeURIComponent(segment).trim();
  } catch {
    return segment.trim();
  }
}

function onboardingRoot(journeyId: string): string {
  return `${ROUTE_NAMESPACE.onboarding}/${encodeJourneyId(journeyId)}`;
}

function emergencyRoot(journeyId: string): string {
  return `${ROUTE_NAMESPACE.emergency}/${encodeJourneyId(journeyId)}`;
}

function scanRoot(qrCode: string): string {
  return `${ROUTE_NAMESPACE.scan}/${encodeJourneyId(qrCode)}`;
}

function prepaidRoot(journeyId: string): string {
  return `${ROUTE_NAMESPACE.prepaid}/${encodeJourneyId(journeyId)}`;
}

function b2b2cRoot(journeyId: string): string {
  return `${ROUTE_NAMESPACE.b2b2c}/${encodeJourneyId(journeyId)}`;
}

function registrationSegment(registration: string): string {
  return encodeURIComponent(compactPlate(normalizePlate(registration)));
}

/** Auth paths scoped to a journey (QR code is the journey identifier). */
export function buildAuthPaths(journeyId: string) {
  const base = onboardingRoot(journeyId);
  return {
    mobile: `${base}/auth`,
    otp: `${base}/otp`,
    vehicleOwner: `${base}/profile`,
    privacy: ROUTE_NAMESPACE.legalPrivacy,
    terms: ROUTE_NAMESPACE.legalTerms,
  } as const;
}

/** Purchase paths scoped to a journey. */
export function buildPurchasePaths(journeyId: string) {
  const base = onboardingRoot(journeyId);
  const path = (segment: string) => `${base}/${segment}`;

  return {
    welcome: path('welcome'),
    vehicleDetails: path('vehicle'),
    vehicleLookupFailed: path('vehicle-lookup-failed'),
    choosePlan: path('plans'),
    riderCover: path('rider-cover'),
    orderSummary: path('order-summary'),
    orderSummaryPromoApplied: path('order-summary-promo-applied'),
    orderSummaryInvalidPromo: path('order-summary-invalid-promo'),
    processingPayment: path('processing-payment'),
    paymentStillConfirming: path('payment-still-confirming'),
    paymentSuccess: path('payment-success'),
    paymentFailed: path('payment-failed'),
    paymentUnconfirmed: path('payment-unconfirmed'),
    vehicleLookup: (registration: string) =>
      `${base}/vehicle/${registrationSegment(registration)}/lookup`,
    vehicleConfirmation: (registration: string) =>
      `${base}/vehicle/${registrationSegment(registration)}/confirmation`,
    orderSummaryWithPromo: (promo: 'applied' | 'invalid') =>
      `${path('order-summary')}?promo=${promo}`,
    orderSummaryForOrder: (orderId: string) => `${base}/orders/${encodeURIComponent(orderId)}/summary`,
    paymentProcessingForOrder: (orderId: string) =>
      `${base}/orders/${encodeURIComponent(orderId)}/payment/processing`,
    paymentSuccessForOrder: (orderId: string) =>
      `${base}/orders/${encodeURIComponent(orderId)}/payment/success`,
  } as const;
}

/** Emergency paths scoped to a journey. */
export function buildEmergencyPaths(journeyId: string) {
  const base = emergencyRoot(journeyId);
  const path = (segment: string) => `${base}/${segment}`;

  return {
    root: base,
    riderPrompt: path('rider-prompt'),
    riderMobile: path('rider-mobile'),
    riderOtp: path('rider-otp'),
    riderName: path('rider-name'),
    ridersSummary: path('riders-summary'),
    contactsEmpty: path('contacts-empty'),
    contactMobile: path('contact-mobile'),
    contactOtp: path('contact-otp'),
    contactName: path('contact-name'),
    contactsSummary: path('contacts-summary'),
    legacyRiderSetup: path('rider-setup'),
  } as const;
}

/** Prepaid paths scoped to a journey. */
export function buildPrepaidPaths(journeyId: string) {
  return {
    welcome: `${prepaidRoot(journeyId)}/welcome`,
  } as const;
}

/** B2B2C paths scoped to a journey. */
export function buildB2b2cPaths(journeyId: string) {
  const base = b2b2cRoot(journeyId);
  return {
    welcome: `${base}/welcome`,
    welcomePlanRider: `${base}/welcome/plan-rider`,
  } as const;
}

/** Post-activation PWA scan paths scoped to a QR code. */
export function buildScanPaths(qrCode: string) {
  const base = scanRoot(qrCode);
  const path = (segment: string) => `${base}/${segment}`;

  return {
    root: base,
    loading: path('loading'),
    vehicle: path('vehicle'),
    verifyMobile: path('verify/mobile'),
    verifyOtp: path('verify/otp'),
    verifyName: path('verify/name'),
    parkMeVehicleNumber: path('park-me/vehicle-number'),
    parkMeLookingUp: path('park-me/looking-up'),
    parkMeConfirm: path('park-me/confirm'),
    parkMeConfirmProtected: path('park-me/confirm-protected'),
    parkMePermissions: path('park-me/permissions'),
    parkMePhotos: path('park-me/photos'),
    parkMeReview: path('park-me/review'),
    parkMeStatusChecking: path('park-me/status/checking'),
    parkMeStatusCalling: path('park-me/status/calling'),
    parkMeStatusResolved: path('park-me/status/resolved'),
    parkMePhotoNotClear: path('park-me/photo-not-clear'),
    sos: path('sos'),
    sosHolding: path('sos/holding'),
    sosAllowLocation: path('sos/allow-location'),
    sosLeaveConfirm: path('sos/leave-confirm'),
    sosScenePhotos: path('sos/scene-photos'),
    sosScenePhotosCaptured: path('sos/scene-photos/captured'),
    sosLocationUnavailable: path('sos/location-unavailable'),
    sosSending: path('sos/sending'),
    sosCouldntSend: path('sos/couldnt-send'),
    sosHelpReceived: path('sos/help-received'),
    sosHelpDispatched: path('sos/help-dispatched'),
    sosResolved: path('sos/resolved'),
    sosAlertCancelled: path('sos/alert-cancelled'),
    sosContactsOnly: path('sos/contacts-only'),
  } as const;
}

export function scopedOnboardingPath(journeyId: string, suffix: string): string {
  const base = onboardingRoot(journeyId);
  if (!suffix || suffix === '/') {
    return base;
  }
  return suffix.startsWith('/') ? `${base}${suffix}` : `${base}/${suffix}`;
}

export function scopedEmergencyPath(journeyId: string, suffix: string): string {
  const base = emergencyRoot(journeyId);
  if (!suffix || suffix === '/') {
    return base;
  }
  return suffix.startsWith('/') ? `${base}${suffix}` : `${base}/${suffix}`;
}

export function buildQrEntryPath(qrCode: string): string {
  return `${ROUTE_NAMESPACE.q}/${encodeJourneyId(qrCode)}`;
}

const ONBOARDING_JOURNEY_RE = /^\/onboarding\/([^/]+)(\/.*)?$/;
const EMERGENCY_JOURNEY_RE = /^\/emergency\/([^/]+)(\/.*)?$/;
const SCAN_QR_RE = /^\/scan\/([^/]+)(\/.*)?$/;
const PREPAID_JOURNEY_RE = /^\/prepaid\/([^/]+)(\/.*)?$/;
const B2B2C_JOURNEY_RE = /^\/b2b2c\/([^/]+)(\/.*)?$/;

const Q_ENTRY_RE = /^\/q\/([^/]+)$/;

export function parseJourneyIdFromPathname(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  const qMatch = Q_ENTRY_RE.exec(normalized);
  if (qMatch?.[1]) {
    return decodeJourneyId(qMatch[1]);
  }

  for (const re of [
    ONBOARDING_JOURNEY_RE,
    EMERGENCY_JOURNEY_RE,
    SCAN_QR_RE,
    PREPAID_JOURNEY_RE,
    B2B2C_JOURNEY_RE,
  ]) {
    const match = re.exec(normalized);
    if (match?.[1]) {
      return decodeJourneyId(match[1]);
    }
  }

  return null;
}

/** Strip `/onboarding/:journeyId` prefix — returns relative purchase/auth suffix path. */
export function stripOnboardingPrefix(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = ONBOARDING_JOURNEY_RE.exec(normalized);
  if (!match) {
    return normalized;
  }
  const suffix = match[2] ?? '';
  return suffix || '/';
}

/** Strip `/emergency/:journeyId` prefix. */
export function stripEmergencyPrefix(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = EMERGENCY_JOURNEY_RE.exec(normalized);
  if (!match) {
    return normalized;
  }
  const suffix = match[2] ?? '';
  return suffix || '/';
}

/** Strip `/scan/:qrCode` prefix. */
export function stripScanPrefix(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const match = SCAN_QR_RE.exec(normalized);
  if (!match) {
    return normalized;
  }
  const suffix = match[2] ?? '';
  return suffix || '/';
}

export function decodeRegistrationFromPath(segment: string): string {
  try {
    return decodeURIComponent(segment).trim();
  } catch {
    return segment.trim();
  }
}

export function parsePurchaseVehicleLookupPath(pathname: string, journeyId?: string): string | null {
  const relative = journeyId ? stripOnboardingPrefix(pathname) : pathname.replace(/\/+$/, '');
  const prefix = journeyId ? '' : '';
  const re = new RegExp(`^${prefix}/vehicle/([^/]+)/lookup$`.replace('//', '/'));
  const match = re.exec(relative.startsWith('/') ? relative : `/${relative}`);
  if (!match?.[1]) {
    if (!journeyId) {
      const legacy = /^\/vehicle\/([^/]+)\/lookup$/.exec(pathname.replace(/\/+$/, ''));
      if (legacy?.[1]) {
        return decodeRegistrationFromPath(legacy[1]);
      }
    }
    return null;
  }
  return decodeRegistrationFromPath(match[1]);
}

export function parsePurchaseVehicleConfirmationPath(
  pathname: string,
  journeyId?: string,
): string | null {
  const relative = journeyId ? stripOnboardingPrefix(pathname) : pathname.replace(/\/+$/, '');
  const re = /^\/vehicle\/([^/]+)\/confirmation$/;
  const match = re.exec(relative.startsWith('/') ? relative : `/${relative}`);
  if (!match?.[1]) {
    if (!journeyId) {
      const legacy = /^\/vehicle\/([^/]+)\/confirmation$/.exec(pathname.replace(/\/+$/, ''));
      if (legacy?.[1]) {
        return decodeRegistrationFromPath(legacy[1]);
      }
    }
    return null;
  }
  return decodeRegistrationFromPath(match[1]);
}

export type JourneyScopedPaths = {
  journeyId: string;
  auth: ReturnType<typeof buildAuthPaths>;
  purchase: ReturnType<typeof buildPurchasePaths>;
  emergency: ReturnType<typeof buildEmergencyPaths>;
  prepaid: ReturnType<typeof buildPrepaidPaths>;
  b2b2c: ReturnType<typeof buildB2b2cPaths>;
  scan: ReturnType<typeof buildScanPaths>;
};

export function buildJourneyScopedPaths(journeyId: string): JourneyScopedPaths {
  const trimmed = journeyId.trim();
  return {
    journeyId: trimmed,
    auth: buildAuthPaths(trimmed),
    purchase: buildPurchasePaths(trimmed),
    emergency: buildEmergencyPaths(trimmed),
    prepaid: buildPrepaidPaths(trimmed),
    b2b2c: buildB2b2cPaths(trimmed),
    scan: buildScanPaths(trimmed),
  };
}
