import type { PhoneShot } from "../PhoneCarousel";

export const SAFETY_EMERGENCY_COPY = {
  index: "01",
  heading: "Safety & Emergency",
  description: "Advanced AI and community support that acts when it matters most.",
} as const;

export interface ChecklistItem {
  id: string;
  label: string;
}

export const SAFETY_CHECKLIST: ChecklistItem[] = [
  { id: "family-alerts", label: "Instant family member alerts" },
  { id: "whatsapp", label: "AI & WhatsApp notifications" },
  { id: "ambulance", label: "Ambulance / RSA support" },
  { id: "logs", label: "Incident logs & history" },
];

export const PHONE_SHOTS: PhoneShot[] = [
  {
    id: "emergency",
    src: "/images/new-design/feedbackFirstSectionImage1.png",
    alt: "Autolokate Emergency screen with an SOS send-alert button and ambulance and roadside assistance shortcuts",
  },
  {
    id: "incident-history",
    src: "/images/new-design/feedbackFirstSectionImage2.png",
    alt: "Autolokate Incident History screen listing panic, theft, impact, and overspeed alerts",
  },
];

export const SAFETY_ASIDE = {
  heading: "Peace of mind for every drive.",
  description: "Real-time protection for you and your loved ones.",
} as const;
