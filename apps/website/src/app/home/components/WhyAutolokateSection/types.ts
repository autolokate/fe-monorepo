import type { LucideIcon } from 'lucide-react';

export type FeatureLayout = 'stacked' | 'wide';

export type IconTone = 'default' | 'brand' | 'amber';

export interface WhyHighlight {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  layout: FeatureLayout;
  /** Icon color per Figma: default (ink), brand (green) or amber. */
  iconTone?: IconTone;
}

export interface WhyAutolokateSectionCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  headlineSuffix: string;
  subheadline: string;
  cta: {
    label: string;
    href: string;
  };
}
