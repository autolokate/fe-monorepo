import { journeyPaths } from '../constants.js';

/** URL paths for the emergency suffix inside the journey orchestrator. */
export const emergencyJourneyPaths = {
  riderPrompt: `${journeyPaths.emergency}/rider-prompt`,
  riderMobile: `${journeyPaths.emergency}/rider-mobile`,
  riderOtp: `${journeyPaths.emergency}/rider-otp`,
  riderName: `${journeyPaths.emergency}/rider-name`,
  ridersSummary: `${journeyPaths.emergency}/riders-summary`,
  contactsEmpty: `${journeyPaths.emergency}/contacts-empty`,
  contactMobile: `${journeyPaths.emergency}/contact-mobile`,
  contactOtp: `${journeyPaths.emergency}/contact-otp`,
  contactName: `${journeyPaths.emergency}/contact-name`,
  contactsSummary: `${journeyPaths.emergency}/contacts-summary`,
  /** Legacy Phase 9 placeholder — redirects to rider-prompt. */
  legacyRiderSetup: `${journeyPaths.emergency}/rider-setup`,
} as const;

export type EmergencyJourneyPath =
  (typeof emergencyJourneyPaths)[keyof typeof emergencyJourneyPaths];

export const emergencyStepPathSequence = [
  emergencyJourneyPaths.riderPrompt,
  emergencyJourneyPaths.riderMobile,
  emergencyJourneyPaths.riderOtp,
  emergencyJourneyPaths.riderName,
  emergencyJourneyPaths.ridersSummary,
  emergencyJourneyPaths.contactsEmpty,
  emergencyJourneyPaths.contactMobile,
  emergencyJourneyPaths.contactOtp,
  emergencyJourneyPaths.contactName,
  emergencyJourneyPaths.contactsSummary,
] as const;
