/** Emitted when Shared Auth (Mobile → OTP → Vehicle owner) completes. */
export const AUTH_COMPLETED = 'AUTH_COMPLETED' as const;

export type AuthFlowCompletion = typeof AUTH_COMPLETED;

export type AuthNavigationProps = {
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export type OtpErrorKind = 'wrong' | 'expired';

export type AuthMobileState = 'empty' | 'filled' | 'ready' | 'error' | 'offline' | 'loading';

export type AuthOtpState =
  | 'default'
  | 'typing'
  | 'verifying'
  | 'success'
  | 'error'
  | 'network-error'
  | 'resend'
  | 'resend-failed'
  | 'offline';

export type S0SplashScreenProps = {
  onComplete?: () => void;
};

export type A1MobileScreenProps = AuthNavigationProps & {
  mobileState?: AuthMobileState;
  mobileValue?: string;
  onMobileChange?: (value: string) => void;
  consentAccepted?: boolean;
  onConsentChange?: (accepted: boolean) => void;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  title?: string;
  description?: string;
  footerLabel?: string;
  hideProgress?: boolean;
  consentVariant?: 'owner' | 'bystander';
};

export type A2OtpScreenProps = AuthNavigationProps & {
  otpState?: AuthOtpState;
  mobile: string;
  otpValue?: string;
  onOtpChange?: (value: string) => void;
  otpErrorKind?: OtpErrorKind | null;
  resendCooldownSeconds?: number;
  onResendOtp?: () => void;
  onSmsFallback?: () => void;
  onChangeNumber?: () => void;
  title?: string;
};

export type AuthVehicleOwnerState = 'empty' | 'filled' | 'error' | 'loading';

export type A3VehicleOwnerScreenProps = AuthNavigationProps & {
  nameValue?: string;
  onNameChange?: (value: string) => void;
  nameState?: AuthVehicleOwnerState;
  title?: string;
  description?: string;
  footerLabel?: string;
};

export type AuthLanguageId = 'en' | 'hi';

export type LegalReaderNavigationProps = AuthNavigationProps;

export type L1PrivacyPolicyScreenProps = LegalReaderNavigationProps;

export type L2TermsConditionsScreenProps = LegalReaderNavigationProps;

import type { ScreenViewState } from '../../types/flow.js';

/** @deprecated Use A1MobileScreen */
export type R03MobileNumberScreenProps = AuthNavigationProps & {
  state?: ScreenViewState;
  mobileValue?: string;
  onMobileChange?: (value: string) => void;
};

/** @deprecated Use A2OtpScreen */
export type R04OtpVerificationScreenProps = AuthNavigationProps & {
  state?: ScreenViewState;
  otpValue?: string;
  onOtpChange?: (value: string) => void;
  otpErrorKind?: OtpErrorKind | null;
  onResendOtp?: () => void;
  resendCooldownSeconds?: number;
};

/** @deprecated Purchase activation */
export type { R01VehicleNumberScreenProps, R05AccountCreationScreenProps, R06LegalConsentScreenProps } from '../purchase-activation/types.js';
