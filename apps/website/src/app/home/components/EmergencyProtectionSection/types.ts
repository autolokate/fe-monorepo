export type EmergencyPillIndicator = "dot" | "alert";

export interface EmergencyFeaturePill {
  label: string;
  indicator?: EmergencyPillIndicator;
}

export interface EmergencyProtectionSectionCopy {
  eyebrow: string;
  headline: string;
  subheading: string;
  ctaTitle: string;
  ctaPrice: string;
  ctaHref: string;
}
