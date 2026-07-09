export type { FeatureDefinition } from '../registry.js';
export { featureRegistry } from '../registry.js';
export { AUTH_COMPLETED } from './types.js';
export type {
  A1MobileScreenProps,
  A2OtpScreenProps,
  AuthFlowCompletion,
  AuthLanguageId,
  AuthMobileState,
  AuthNavigationProps,
  AuthOtpState,
  L1PrivacyPolicyScreenProps,
  L2TermsConditionsScreenProps,
  OtpErrorKind,
  R01VehicleNumberScreenProps,
  R05AccountCreationScreenProps,
  R06LegalConsentScreenProps,
  S0SplashScreenProps,
} from './types.js';
export * from './screens/index.js';

export const featureId = 'shared-auth' as const;
