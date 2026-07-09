export type { FeatureDefinition } from '../registry';
export { featureRegistry } from '../registry';
export { AUTH_COMPLETED } from './types';
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
} from './types';
export * from './screens/index';

export const featureId = 'shared-auth' as const;
