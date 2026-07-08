import { Headset, Users, type LucideIcon } from "lucide-react";

export const CTA_DESKTOP_BG = "/images/new-design/howItWorksCTA.png";
export const CTA_MOBILE_BG = "/images/new-design/howItWorksCTAMobile.png";

export const CTA_COPY = {
  headline: "Every feature, working together for you.",
  subheadline: "Smart detection. Instant help. Total peace of mind.",
  primaryCta: { label: "Get Protected", href: "/#safety-packs" },
  secondaryCta: { label: "Download App", href: "/#download" },
} as const;

export interface CtaTrust {
  id: string;
  label: string;
  Icon?: LucideIcon;
  flag?: boolean;
}

export const CTA_TRUST: CtaTrust[] = [
  { id: "trusted", label: "Trusted by thousands", Icon: Users },
  { id: "control-center", label: "24/7 Control Center", Icon: Headset },
  { id: "india", label: "Made in India", flag: true },
];
