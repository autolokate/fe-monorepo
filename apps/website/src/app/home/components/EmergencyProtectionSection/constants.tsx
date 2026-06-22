import { SAFETY_PACKS_SECTION_ID } from "../SafetyPacksSection/constants";
import type { EmergencyFeaturePill, EmergencyProtectionSectionCopy } from "./types";

export const EMERGENCY_PROTECTION_BACKGROUND = "/images/home/home_emrgency_bg.png";

export const EMERGENCY_PROTECTION_COPY: EmergencyProtectionSectionCopy = {
  eyebrow: "EMERGENCY PROTECTION",
  headline: "In an emergency, every second counts.",
  subheading:
    "Autolokate helps share your location, alert your contacts, and connect you to support faster.",
  ctaTitle: "Get Safety Pack",
  ctaPrice: "7M+ cars already protected",
  ctaHref: `/#${SAFETY_PACKS_SECTION_ID}`,
};

export const EMERGENCY_FEATURE_PILLS: EmergencyFeaturePill[] = [
  { label: "Quick Identification" },
  { label: "Instant Alerts", indicator: "alert" },
  { label: "Real-time Location" },
  { label: "Direct to Help" },
];
