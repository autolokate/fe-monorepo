import type { PhoneShot } from "../PhoneCarousel";

export const MULTI_VEHICLE_COPY = {
  index: "06",
  heading: "Multi-vehicle",
  description: "Many vehicles. One profile. Switch in a tap.",
} as const;

export interface ChecklistItem {
  id: string;
  label: string;
}

export const MULTI_VEHICLE_CHECKLIST: ChecklistItem[] = [
  { id: "unlimited", label: "Add unlimited vehicles" },
  { id: "switch", label: "Quick switch between vehicles" },
  { id: "insights", label: "Vehicle-specific insights" },
];

export const MULTI_VEHICLE_PHONE_SHOTS: PhoneShot[] = [
  {
    id: "garage",
    src: "/images/new-design/feedbackFirstSectionImage13.png",
    alt: "My Vehicles list showing a Hyundai Creta marked primary, a Royal Enfield Classic 350, and a Honda City",
  },
  {
    id: "dashboard",
    src: "/images/new-design/feedbackFirstSectionImage14.png",
    alt: "Vehicle dashboard for the Hyundai Creta with safety, daily utility, driver score, and quick actions",
  },
];

export const MULTI_VEHICLE_ASIDE = {
  heading: "One profile, every ride.",
  description: "Switch between cars and bikes in a single tap.",
} as const;
