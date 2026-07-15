import type { LucideIcon } from 'lucide-react';

export interface AboutHeroCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
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
