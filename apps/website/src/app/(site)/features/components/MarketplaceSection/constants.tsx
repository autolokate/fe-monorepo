import type { PhoneShot } from "../PhoneCarousel";

export const MARKETPLACE_COPY = {
  index: "03",
  heading: "Marketplace / Service History",
  description: "Everything your vehicle needs, in one trusted place.",
} as const;

export interface ChecklistItem {
  id: string;
  label: string;
}

export const MARKETPLACE_CHECKLIST: ChecklistItem[] = [
  { id: "verified-partners", label: "Verified garage & service partners" },
  { id: "book-services", label: "Book vehicle modification & services" },
  { id: "history-tracking", label: "Complete service history tracking" },
];

export const MARKETPLACE_PHONE_SHOTS: PhoneShot[] = [
  {
    id: "marketplace",
    src: "/images/new-design/feedbackFirstSectionImage6.png",
    alt: "Autolokate Marketplace screen showing popular services, categories, and a recommended garage",
  },
  {
    id: "service-history",
    src: "/images/new-design/feedbackFirstSectionImage7.png",
    alt: "Autolokate Service History screen listing general service, wheel alignment, and AC service records with costs",
  },
];

export const MARKETPLACE_ASIDE = {
  heading: "Trusted services. Transparent records.",
  description: "Keep your vehicle in top shape with complete service visibility.",
} as const;
