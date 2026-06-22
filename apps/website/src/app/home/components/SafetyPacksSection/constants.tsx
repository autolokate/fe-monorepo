import type { SafetyPacksSectionCopy, SafetyPlan } from "./types";

/** In-page anchor — hero CTA and deep links scroll here. */
export const SAFETY_PACKS_SECTION_ID = "safety-packs";

export const SAFETY_PACKS_BACKGROUND = "/images/home_banner_light.png";

export const SAFETY_PACKS_COPY: SafetyPacksSectionCopy = {
  eyebrow: "VEHICLE SAFETY PLANS",
  headline: "Choose your protection plan.",
  subheading: "Every plan includes a smart QR sticker and is valid for 1 year.",
  headerPill: "One QR. Complete Protection.",
};

export const SAFETY_PLANS: SafetyPlan[] = [
  {
    id: "starter",
    variant: "starter",
    tierLabel: "Starter",
    title: "Choose your protection plan",
    price: "₹99",
    priceNote: "Every plan includes a smart QR sticker and is valid for 1 year.",
    features: [
      {
        label: "Emergency alert",
        description: "Notify your contacts when someone scans in an emergency.",
        state: "included",
      },
      {
        label: "Park Me",
        description: "Let others reach you when your vehicle is parked or blocking.",
        state: "included",
      },
      {
        label: "Modification feed",
        description: "Share updates and notes linked to your vehicle profile.",
        state: "included",
      },
      {
        label: "Community",
        description: "Connect with the Autolokate owner community.",
        state: "included",
      },
      { label: "Ambulance dispatch", state: "excluded" },
      { label: "Accident policy", state: "excluded" },
      { label: "Insurance management", state: "excluded" },
    ],
  },
  {
    id: "shield",
    variant: "shield",
    tierLabel: "Shield",
    popularBadge: "Most Popular",
    planCategory: "Full Protection",
    title: "Coming Soon",
    price: "",
    priceNote: "Annual protection plan",
    features: [
      { label: "Everything in Safety Pack", state: "included" },
      {
        label: "Ambulance dispatch",
        description: "Priority routing to nearby ambulance services when needed.",
        state: "included",
      },
      {
        label: "AI voice call to family",
        description: "Automated call to emergency contacts with location context.",
        state: "included",
      },
      {
        label: "Group accident policy",
        description: "Coverage benefits for registered family members on scan.",
        state: "included",
      },
      {
        label: "Insurance management",
        description: "Store policies and renewal reminders on your profile.",
        state: "included",
      },
      {
        label: "Challan and PUC alerts",
        description: "Reminders for fines, pollution certificates, and deadlines.",
        state: "included",
      },
      {
        label: "Vehicle service history on QR",
        description: "Key maintenance records available on scan.",
        state: "included",
      },
      {
        label: "EV stations and fuel finder",
        description: "Locate charging and fuel options near your vehicle.",
        state: "included",
      },
    ],
  },
  {
    id: "shield-plus",
    variant: "shieldPlus",
    tierLabel: "Shield+",
    title: "Elite",
    price: "Coming Soon",
    priceNote: "Annual protection plan",
    features: [
      { label: "Everything in Shield", state: "included" },
      {
        label: "RSA - Roadside Assistance",
        description: "On-road help for breakdowns, flats, and towing.",
        state: "included",
      },
      {
        label: "Priority ambulance dispatch",
        description: "Faster escalation to emergency medical response.",
        state: "included",
      },
      {
        label: "Extended accident coverage",
        description: "Broader protection for serious incidents.",
        state: "included",
      },
      {
        label: "Legal helpline",
        description: "Guidance for accidents, disputes, and documentation.",
        state: "included",
      },
      {
        label: "Used car QR transfer",
        description: "Transfer vehicle profile and history to a new owner.",
        state: "included",
      },
    ],
  },
];
