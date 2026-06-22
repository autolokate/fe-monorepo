import type { LucideIcon } from "lucide-react";

export interface AboutHeroCopy {
  badge: string;
  headline: string;
  subheading: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface AboutHeroFeature {
  title: string;
  body: string;
  Icon: LucideIcon;
}

export interface AboutHeroStat {
  value: string;
  label: string;
  Icon: LucideIcon;
}
