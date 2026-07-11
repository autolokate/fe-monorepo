import type { ProductAreaId, ScreenId, SharedStepId, StepId } from '../types/flow';

/** Every route maps to exactly one StepId. */
export type RouteDefinition = {
  path: string;
  stepId: StepId;
  screenId: ScreenId;
  featureId: ProductAreaId;
  label: string;
  figmaRef: string;
};

export const routePaths = {
  root: '/',
  activate: '/activate/:token',
  journey: {
    entry: '/auth',
    home: '/auth',
    qrScan: '/auth',
    qrDeepLink: '/q/:qrCode',
    auth: '/auth',
    authWildcard: '/auth',
    authMobile: '/auth',
    authOtp: '/otp',
    authVehicleOwner: '/profile',
    authPrivacy: '/legal/privacy',
    authTerms: '/legal/terms',
    purchase: '/vehicle',
    purchaseWildcard: '/vehicle',
    purchaseQrScan: '/auth',
    purchaseVehicleDetails: '/vehicle',
    purchaseVehicleLookup: '/vehicle/:registrationNumber/lookup',
    purchaseVehicleLookupFailed: '/vehicle-lookup-failed',
    purchaseVehicleConfirmation: '/vehicle/:registrationNumber/confirmation',
    purchaseChoosePlan: '/plans',
    purchaseRiderCover: '/rider-cover',
    purchaseOrderSummary: '/order-summary',
    purchaseOrderSummaryPromoApplied: '/order-summary-promo-applied',
    purchaseOrderSummaryInvalidPromo: '/order-summary-invalid-promo',
    purchaseProcessingPayment: '/processing-payment',
    purchasePaymentStillConfirming: '/payment-still-confirming',
    purchasePaymentSuccess: '/payment-success',
    purchasePaymentFailed: '/payment-failed',
    purchasePaymentUnconfirmed: '/payment-unconfirmed',
    /** @deprecated Legacy Figma segment — redirects to purchaseVehicleDetails */
    purchaseR03: '/r03-vehicle',
    /** @deprecated Legacy Figma segment — redirects to purchaseVehicleLookup */
    purchaseR04: '/r04-fetching',
    /** @deprecated Legacy Figma segment — redirects to purchaseVehicleLookupFailed */
    purchaseR04b: '/r04b-fetch-failed',
    /** @deprecated Legacy Figma segment — redirects to purchaseVehicleConfirmation */
    purchaseR05: '/r05-confirm',
    /** @deprecated Legacy Figma segment — redirects to purchaseChoosePlan */
    purchaseR06: '/r06-choose-plan',
    /** @deprecated Legacy Figma segment — redirects to purchaseRiderCover */
    purchaseR07: '/r07-rider-cover',
    /** @deprecated Legacy Figma segment — redirects to purchaseOrderSummary */
    purchaseR08: '/r08-order-summary',
    /** @deprecated Legacy Figma segment — redirects to purchaseOrderSummaryPromoApplied */
    purchaseR08b: '/r08b-promo-applied',
    /** @deprecated Legacy Figma segment — redirects to purchaseOrderSummaryInvalidPromo */
    purchaseR08c: '/r08c-invalid-promo',
    /** @deprecated Legacy Figma segment — redirects to purchaseProcessingPayment */
    purchaseR09: '/r09-processing-payment',
    /** @deprecated Legacy Figma segment — redirects to purchasePaymentStillConfirming */
    purchaseR09b: '/r09b-still-confirming',
    /** @deprecated Legacy Figma segment — redirects to purchasePaymentSuccess */
    purchaseR10: '/r10-payment-success',
    /** @deprecated Legacy Figma segment — redirects to purchasePaymentFailed */
    purchaseR10b: '/r10b-payment-failed',
    /** @deprecated Legacy Figma segment — redirects to purchasePaymentUnconfirmed */
    purchaseR10c: '/r10c-payment-unconfirmed',
    prepaid: '/prepaid',
    prepaidWildcard: '/prepaid/*',
    prepaidEntry: '/prepaid/entry',
    b2b2c: '/b2b2c',
    b2b2cWildcard: '/b2b2c/*',
    b2b2cPartnerBridge: '/b2b2c/partner-bridge',
    emergency: '/emergency',
    emergencyWildcard: '/emergency/*',
    emergencyRiderPrompt: '/emergency/rider-prompt',
    emergencyRiderMobile: '/emergency/rider-mobile',
    emergencyRiderOtp: '/emergency/rider-otp',
    emergencyRiderName: '/emergency/rider-name',
    emergencyRidersSummary: '/emergency/riders-summary',
    emergencyContactsEmpty: '/emergency/contacts-empty',
    emergencyContactMobile: '/emergency/contact-mobile',
    emergencyContactOtp: '/emergency/contact-otp',
    emergencyContactName: '/emergency/contact-name',
    emergencyContactsSummary: '/emergency/contacts-summary',
    /** @deprecated Redirects to rider-prompt */
    emergencyRiderSetup: '/emergency/rider-setup',
    completed: '/completed',
  },
  shared: {
    splash: '/shared/splash',
    mobile: '/shared/mobile',
    otp: '/shared/otp',
    privacy: '/shared/legal/privacy',
    terms: '/shared/legal/terms',
    /** @deprecated Purchase activation — relocated */
    r01VehicleNumber: '/shared/r01-vehicle-number',
    r02VehicleDetails: '/shared/r02-vehicle-details',
    r05AccountCreation: '/shared/r05-account-creation',
    r06LegalConsent: '/shared/r06-legal-consent',
  },
  flows: {
    purchase: '/flow/purchase',
    b2b: '/flow/b2b',
    prepaid: '/flow/prepaid',
    b2b2c: '/flow/b2b2c',
    emergency: '/flow/emergency',
  },
  prepaid: {
    pr01PrepaidEntry: '/prepaid/pr01-prepaid-entry',
    pr02ActivationCode: '/prepaid/pr02-activation-code',
    pr03CodeValidation: '/prepaid/pr03-code-validation',
  },
} as const;

/** Shared Auth routes — Figma 91:268 */
export const sharedFlowRoutes = [
  {
    path: routePaths.shared.splash,
    stepId: 'shared.splash',
    screenId: 'Splash',
    featureId: 'shared-auth',
    label: 'S0 · Splash',
    figmaRef: '27:98',
  },
  {
    path: routePaths.shared.mobile,
    stepId: 'shared.mobile',
    screenId: 'MobileCapture',
    featureId: 'shared-auth',
    label: 'A1 · Mobile',
    figmaRef: '102:268 · 557:1606',
  },
  {
    path: routePaths.shared.otp,
    stepId: 'shared.otp',
    screenId: 'OtpVerify',
    featureId: 'shared-auth',
    label: 'A2 · OTP',
    figmaRef: '103:324 · 557:1647',
  },
  {
    path: routePaths.shared.privacy,
    stepId: 'shared.mobile',
    screenId: 'PrivacyPolicy',
    featureId: 'shared-legal',
    label: 'L1 · Privacy Policy',
    figmaRef: '60:156',
  },
  {
    path: routePaths.shared.terms,
    stepId: 'shared.mobile',
    screenId: 'TermsConditions',
    featureId: 'shared-legal',
    label: 'L2 · Terms & Conditions',
    figmaRef: '61:163',
  },
  /* eslint-disable @typescript-eslint/no-deprecated -- catalog entries for relocated purchase screens */
  {
    path: routePaths.shared.r01VehicleNumber,
    stepId: 'shared.vehicle-number',
    screenId: 'VehicleNumber',
    featureId: 'qr-purchase',
    label: 'R01 · Vehicle Number (deprecated)',
    figmaRef: '170:25 · Purchase',
  },
  {
    path: routePaths.shared.r02VehicleDetails,
    stepId: 'shared.vehicle-details',
    screenId: 'VehicleDetails',
    featureId: 'qr-purchase',
    label: 'R02 · Vehicle Details (deprecated)',
    figmaRef: '170:71 · Purchase',
  },
  {
    path: routePaths.shared.r05AccountCreation,
    stepId: 'shared.account',
    screenId: 'AccountSetup',
    featureId: 'qr-purchase',
    label: 'R05 · Account Creation (deprecated)',
    figmaRef: '174:25 · Purchase',
  },
  {
    path: routePaths.shared.r06LegalConsent,
    stepId: 'shared.legal',
    screenId: 'LegalConsent',
    featureId: 'qr-purchase',
    label: 'R06 · Legal Consent (deprecated)',
    figmaRef: '—',
  },
] as const satisfies readonly RouteDefinition[];

export type SharedFlowRoute = (typeof sharedFlowRoutes)[number];

/** Legacy Phase 5 purchase routes — dev preview only; not mounted in journey router. */
export const purchaseFlowRoutes = [] as const satisfies readonly RouteDefinition[];

export type PurchaseFlowRoute = (typeof purchaseFlowRoutes)[number];

export const prepaidFlowRoutes = [
  {
    path: routePaths.prepaid.pr01PrepaidEntry,
    stepId: 'prepaid.entry',
    screenId: 'PrepaidEntry',
    featureId: 'qr-prepaid',
    label: 'PR01 · Pre-paid Entry',
    figmaRef: 'Pre-paid · Entry',
  },
  {
    path: routePaths.prepaid.pr02ActivationCode,
    stepId: 'prepaid.activation-code',
    screenId: 'ActivationCode',
    featureId: 'qr-prepaid',
    label: 'PR02 · Activation Code',
    figmaRef: 'Pre-paid · Activation code',
  },
  {
    path: routePaths.prepaid.pr03CodeValidation,
    stepId: 'prepaid.code-validation',
    screenId: 'CodeValidation',
    featureId: 'qr-prepaid',
    label: 'PR03 · Code Validation',
    figmaRef: 'Pre-paid · Code validation',
  },
] as const satisfies readonly RouteDefinition[];

export type PrepaidFlowRoute = (typeof prepaidFlowRoutes)[number];

/** Phase 9 journey orchestrator routes — navigation shell; activation screens deferred. */
export const journeyOrchestratorRoutes = [
  {
    path: routePaths.journey.authMobile,
    stepId: 'shared.mobile',
    screenId: 'MobileCapture',
    featureId: 'shared-auth',
    label: 'Journey · A1 Mobile',
    figmaRef: '102:268 · 557:1606',
  },
  {
    path: routePaths.journey.authOtp,
    stepId: 'shared.otp',
    screenId: 'OtpVerify',
    featureId: 'shared-auth',
    label: 'Journey · A2 OTP',
    figmaRef: '103:324 · 557:1647',
  },
  {
    path: routePaths.journey.authVehicleOwner,
    stepId: 'shared.account',
    screenId: 'AccountSetup',
    featureId: 'shared-auth',
    label: 'Journey · A3 Vehicle owner',
    figmaRef: '174:25',
  },
  {
    path: routePaths.journey.authPrivacy,
    stepId: 'shared.mobile',
    screenId: 'PrivacyPolicy',
    featureId: 'shared-legal',
    label: 'Journey · L1 Privacy Policy',
    figmaRef: '60:156',
  },
  {
    path: routePaths.journey.authTerms,
    stepId: 'shared.mobile',
    screenId: 'TermsConditions',
    featureId: 'shared-legal',
    label: 'Journey · L2 Terms & Conditions',
    figmaRef: '61:163',
  },
  {
    path: routePaths.journey.home,
    stepId: 'shared.vehicle-number',
    screenId: 'VehicleNumber',
    featureId: 'shared-auth',
    label: 'Journey · Home / Flow selection',
    figmaRef: '—',
  },
  {
    path: routePaths.journey.authWildcard,
    stepId: 'shared.splash',
    screenId: 'Splash',
    featureId: 'shared-auth',
    label: 'Journey · Shared auth segment',
    figmaRef: 'S0 → A1 → A2',
  },
  {
    path: routePaths.journey.purchaseQrScan,
    stepId: 'purchase.qr-scan',
    screenId: 'QrScan',
    featureId: 'qr-purchase',
    label: 'Journey · R01 QR scan (deprecated redirect)',
    figmaRef: '178:25 · Pre-auth marketing — redirects to R03',
  },
  {
    path: routePaths.journey.purchaseVehicleDetails,
    stepId: 'purchase.vehicle-number',
    screenId: 'VehicleNumber',
    featureId: 'qr-purchase',
    label: 'Journey · Vehicle details',
    figmaRef: '170:25',
  },
  {
    path: routePaths.journey.purchaseVehicleLookup,
    stepId: 'purchase.fetching-vehicle',
    screenId: 'VehicleDetails',
    featureId: 'qr-purchase',
    label: 'Journey · Vehicle lookup',
    figmaRef: '179:25',
  },
  {
    path: routePaths.journey.purchaseVehicleLookupFailed,
    stepId: 'purchase.fetching-vehicle',
    screenId: 'VehicleDetails',
    featureId: 'qr-purchase',
    label: 'Journey · Vehicle lookup failed',
    figmaRef: '579:1663',
  },
  {
    path: routePaths.journey.purchaseVehicleConfirmation,
    stepId: 'purchase.confirm-vehicle',
    screenId: 'VehicleDetails',
    featureId: 'qr-purchase',
    label: 'Journey · Vehicle confirmation',
    figmaRef: '170:71',
  },
  {
    path: routePaths.journey.purchaseChoosePlan,
    stepId: 'purchase.choose-plan',
    screenId: 'PlanSelection',
    featureId: 'qr-purchase',
    label: 'Journey · Choose plan',
    figmaRef: '183:25',
  },
  {
    path: routePaths.journey.purchaseRiderCover,
    stepId: 'purchase.rider-cover',
    screenId: 'RiderSelection',
    featureId: 'qr-purchase',
    label: 'Journey · Rider cover',
    figmaRef: '186:25',
  },
  {
    path: routePaths.journey.purchaseOrderSummary,
    stepId: 'purchase.order-summary',
    screenId: 'CheckoutSummary',
    featureId: 'qr-purchase',
    label: 'Journey · Order summary',
    figmaRef: '190:25',
  },
  {
    path: routePaths.journey.purchaseOrderSummaryPromoApplied,
    stepId: 'purchase.order-summary',
    screenId: 'CheckoutSummary',
    featureId: 'qr-purchase',
    label: 'Journey · Order summary · Promo applied',
    figmaRef: '333:37',
  },
  {
    path: routePaths.journey.purchaseOrderSummaryInvalidPromo,
    stepId: 'purchase.order-summary',
    screenId: 'CheckoutSummary',
    featureId: 'qr-purchase',
    label: 'Journey · Order summary · Invalid promo',
    figmaRef: '579:1748',
  },
  {
    path: routePaths.journey.purchaseProcessingPayment,
    stepId: 'purchase.processing-payment',
    screenId: 'PaymentProcessing',
    featureId: 'qr-purchase',
    label: 'Journey · Processing payment',
    figmaRef: '192:25',
  },
  {
    path: routePaths.journey.purchasePaymentStillConfirming,
    stepId: 'purchase.processing-payment',
    screenId: 'PaymentProcessing',
    featureId: 'qr-purchase',
    label: 'Journey · Payment still confirming',
    figmaRef: '579:1687',
  },
  {
    path: routePaths.journey.purchasePaymentSuccess,
    stepId: 'purchase.payment-success',
    screenId: 'PaymentSuccess',
    featureId: 'qr-purchase',
    label: 'Journey · Payment success → Emergency',
    figmaRef: '193:25',
  },
  {
    path: routePaths.journey.purchasePaymentFailed,
    stepId: 'purchase.processing-payment',
    screenId: 'PaymentProcessing',
    featureId: 'qr-purchase',
    label: 'Journey · Payment failed',
    figmaRef: '194:25',
  },
  {
    path: routePaths.journey.purchasePaymentUnconfirmed,
    stepId: 'purchase.processing-payment',
    screenId: 'PaymentProcessing',
    featureId: 'qr-purchase',
    label: 'Journey · Payment unconfirmed',
    figmaRef: '579:1638',
  },
  {
    path: routePaths.journey.prepaidEntry,
    stepId: 'prepaid.entry',
    screenId: 'PrepaidEntry',
    featureId: 'qr-prepaid',
    label: 'Journey · Prepaid welcome',
    figmaRef: '411:38 · 588:1798 · 588:1850',
  },
  {
    path: routePaths.journey.b2b2cPartnerBridge,
    stepId: 'b2b2c.partner-bridge',
    screenId: 'PartnerBridge',
    featureId: 'qr-b2b2c',
    label: 'Journey · B2B2C partner welcome',
    figmaRef: '386:889 · 443:37 · 588:1798 · 588:1850',
  },
  {
    path: routePaths.journey.emergencyRiderPrompt,
    stepId: 'emergency.rider-prompt',
    screenId: 'EmergencyRiderPrompt',
    featureId: 'emergency',
    label: 'Journey · Emergency · R0 rider prompt',
    figmaRef: '375:37',
  },
  {
    path: routePaths.journey.emergencyRiderMobile,
    stepId: 'emergency.rider-mobile',
    screenId: 'EmergencyRiderMobile',
    featureId: 'emergency',
    label: 'Journey · Emergency · R1 rider mobile',
    figmaRef: '374:37',
  },
  {
    path: routePaths.journey.emergencyRiderOtp,
    stepId: 'emergency.rider-otp',
    screenId: 'EmergencyRiderOtp',
    featureId: 'emergency',
    label: 'Journey · Emergency · R2 rider OTP',
    figmaRef: '374:54',
  },
  {
    path: routePaths.journey.emergencyRiderName,
    stepId: 'emergency.rider-name',
    screenId: 'EmergencyRiderName',
    featureId: 'emergency',
    label: 'Journey · Emergency · R3 rider name',
    figmaRef: '374:71',
  },
  {
    path: routePaths.journey.emergencyRidersSummary,
    stepId: 'emergency.riders-summary',
    screenId: 'EmergencyRidersSummary',
    featureId: 'emergency',
    label: 'Journey · Emergency · R4 riders summary',
    figmaRef: '822:1980',
  },
  {
    path: routePaths.journey.emergencyContactsEmpty,
    stepId: 'emergency.contacts-empty',
    screenId: 'EmergencyContactsEmpty',
    featureId: 'emergency',
    label: 'Journey · Emergency · E0 contacts empty',
    figmaRef: '373:37',
  },
  {
    path: routePaths.journey.emergencyContactMobile,
    stepId: 'emergency.contact-mobile',
    screenId: 'EmergencyContactMobile',
    featureId: 'emergency',
    label: 'Journey · Emergency · E1 contact mobile',
    figmaRef: '371:1295',
  },
  {
    path: routePaths.journey.emergencyContactOtp,
    stepId: 'emergency.contact-otp',
    screenId: 'EmergencyContactOtp',
    featureId: 'emergency',
    label: 'Journey · Emergency · E2 contact OTP',
    figmaRef: '371:1318',
  },
  {
    path: routePaths.journey.emergencyContactName,
    stepId: 'emergency.contact-name',
    screenId: 'EmergencyContactName',
    featureId: 'emergency',
    label: 'Journey · Emergency · E3 contact name',
    figmaRef: '371:1276',
  },
  {
    path: routePaths.journey.emergencyContactsSummary,
    stepId: 'emergency.contacts-summary',
    screenId: 'EmergencyContactsSummary',
    featureId: 'emergency',
    label: 'Journey · Emergency · E5 contacts summary',
    figmaRef: '373:64',
  },
  {
    path: routePaths.journey.completed,
    stepId: 'shared.otp',
    screenId: 'OtpVerify',
    featureId: 'shared-auth',
    label: 'Journey · Completed',
    figmaRef: '—',
  },
] as const satisfies readonly RouteDefinition[];

export type JourneyOrchestratorRoute = (typeof journeyOrchestratorRoutes)[number];

export const routeCatalog: RouteDefinition[] = [
  ...sharedFlowRoutes,
  ...purchaseFlowRoutes,
  ...prepaidFlowRoutes,
  ...journeyOrchestratorRoutes,
  {
    path: routePaths.root,
    stepId: 'shared.splash',
    screenId: 'Splash',
    featureId: 'shared-auth',
    label: 'Entry redirect',
    figmaRef: '—',
  },
  {
    path: routePaths.activate,
    stepId: 'shared.splash',
    screenId: 'Splash',
    featureId: 'shared-auth',
    label: 'QR activation entry',
    figmaRef: '—',
  },
];

export const stepIdByPath = Object.fromEntries(
  routeCatalog.map((route) => [route.path, route.stepId]),
) as Record<string, StepId>;

export const sharedStepIds = sharedFlowRoutes.map((route) => route.stepId) as readonly SharedStepId[];
