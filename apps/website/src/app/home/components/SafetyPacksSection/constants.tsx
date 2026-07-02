import {
  ArrowLeftRight,
  BellRing,
  CircleParking,
  ClipboardList,
  Crown,
  Headset,
  History,
  Layers,
  LifeBuoy,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  UsersRound,
} from "lucide-react";
import type { SafetyPacksSectionCopy, SafetyPlan } from "./types";

/** In-page anchor — hero CTA and deep links scroll here. */
export const SAFETY_PACKS_SECTION_ID = "safety-packs";

export const SAFETY_PACKS_BACKGROUND = "/images/home_banner_light.png";

/** Where the "Choose <plan>" buttons take the user. */
const PLAN_CTA_HREF = "/auth/login";

export const SAFETY_PACKS_COPY: SafetyPacksSectionCopy = {
  eyebrow: "Vehicle Safety Plans",
  headline: "Choose your protection plan.",
  subheading: "Every plan includes a smart QR sticker and is valid for 1 year.",
  headerPill: "One QR. Complete Protection.",
  footnotes: ["Buy in the app", "Cancel anytime", "Sticker shipped free"],
};

export const SAFETY_PLANS: SafetyPlan[] = [
  {
    id: "secure",
    variant: "secure",
    tierLabel: "Secure",
    Icon: ShieldCheck,
    price: "₹999",
    pricePeriod: "/year",
    ctaLabel: "Choose Secure",
    ctaHref: PLAN_CTA_HREF,
    features: [
      { label: "QR Protection", Icon: QrCode },
      { label: "Emergency Contacts", Icon: UsersRound },
      { label: "Parking Help", Icon: CircleParking },
      { label: "Service History", Icon: History },
    ],
  },
  {
    id: "shield",
    variant: "shield",
    tierLabel: "Shield",
    Icon: Shield,
    price: "₹1,999",
    pricePeriod: "/year",
    popular: true,
    popularBadge: "Most Popular",
    ctaLabel: "Choose Shield",
    ctaHref: PLAN_CTA_HREF,
    features: [
      { label: "Everything in Secure", Icon: Layers },
      { label: "Crash Detection Backup", Icon: ShieldAlert },
      { label: "Service History Tracking", Icon: ClipboardList },
      { label: "RSA & Utility Tools", Icon: LifeBuoy },
      { label: "Priority Support", Icon: Headset },
    ],
  },
  {
    id: "shield-plus",
    variant: "shieldPlus",
    tierLabel: "Shield+",
    Icon: ShieldPlus,
    price: "₹2,999",
    pricePeriod: "/year",
    ctaLabel: "Choose Shield+",
    ctaHref: PLAN_CTA_HREF,
    features: [
      { label: "Everything in Shield", Icon: Layers },
      { label: "Family Safety Circle", Icon: UsersRound },
      { label: "Advanced Alerts", Icon: BellRing },
      { label: "Resale & Transfer Support", Icon: ArrowLeftRight },
      { label: "Premium Support", Icon: Crown },
    ],
  },
];
