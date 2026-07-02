export const EMERGENCY_FLOW_STEP_COUNT = 10;

/** Figma-aligned view states for emergency suffix screens. */
export type EmergencyScreenState = 'default' | 'loading' | 'error' | 'empty' | 'success';

export type EmergencyRiderPromptState = 'default' | 'loading' | 'error' | 'offline';

export type EmergencyNameFormState = 'default' | 'disabled' | 'submitting' | 'error';

export type EmergencyMobileState = 'default' | 'error' | 'offline';

export type EmergencyOtpState = 'default' | 'error' | 'verifying' | 'network-error' | 'success';

export type RelationshipId =
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'friend'
  | 'relative'
  | 'colleague'
  | 'other';

export type EmergencyContact = {
  id?: string;
  name: string;
  mobile: string;
  phoneMasked?: string;
  relation: RelationshipId;
  verified: boolean;
};

export type EmergencyContactDraft = {
  mobile?: string;
  name?: string;
  relation?: RelationshipId;
  fromPicker?: boolean;
  otpVerified?: boolean;
};

export type EmergencyRider = {
  id?: string;
  mobile: string;
  phoneMasked?: string;
  name: string;
  relation: RelationshipId;
};

export type EmergencySession = {
  riderSkipped?: boolean;
  /** Latest rider draft while capturing R1–R3. */
  rider?: EmergencyRider;
  /** Saved riders shown on R4 (foundation session field). */
  riders?: EmergencyRider[];
  contactDraft?: EmergencyContactDraft;
  contacts?: EmergencyContact[];
  /** Simulated rider entitlement load failure for R0 error state. */
  riderPromptLoadFailed?: boolean;
};

export type EmergencyStepId =
  | 'emergency.rider-prompt'
  | 'emergency.rider-mobile'
  | 'emergency.rider-otp'
  | 'emergency.rider-name'
  | 'emergency.riders-summary'
  | 'emergency.contacts-empty'
  | 'emergency.contact-mobile'
  | 'emergency.contact-otp'
  | 'emergency.contact-name'
  | 'emergency.contacts-summary';

export type EmergencyScreenId =
  | 'EmergencyRiderPrompt'
  | 'EmergencyRiderMobile'
  | 'EmergencyRiderOtp'
  | 'EmergencyRiderName'
  | 'EmergencyRidersSummary'
  | 'EmergencyContactsEmpty'
  | 'EmergencyContactMobile'
  | 'EmergencyContactOtp'
  | 'EmergencyContactName'
  | 'EmergencyContactsSummary';

export type EmergencyScreenNavigationProps = {
  onContinue?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  footerSecondaryLabel?: string;
  onFooterSecondary?: () => void;
};
