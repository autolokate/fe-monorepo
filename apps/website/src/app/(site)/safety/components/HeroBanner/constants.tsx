import { Ambulance, Radar, Split, type LucideIcon } from "lucide-react";

export const HERO_BG_WEB = "/images/new-design/safetyPageHeroWeb.png";
export const HERO_BG_MOBILE = "/images/new-design/safetyPageHeroMobile.png";

export const HERO_COPY = {
  eyebrow: "The Golden Hour",
  headline: "The first minutes",
  headlineAccent: "decide survival.",
  description:
    "In a serious accident, every second counts. Autolokate detects, alerts and dispatches help in parallel — so you get the right help, faster.",
} as const;

export interface HeroFeature {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const HERO_FEATURES: HeroFeature[] = [
  { id: "detection", label: "Automatic Accident Detection", Icon: Radar },
  { id: "dispatch", label: "Instant, Parallel Dispatch", Icon: Split },
  { id: "faster", label: "Help That Reaches Faster", Icon: Ambulance },
];
