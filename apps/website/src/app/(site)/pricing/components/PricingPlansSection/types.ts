import type { LucideIcon } from 'lucide-react';

export interface PlanCard {
  id: string;
  name: string;
  Icon: LucideIcon;
  tagline: string;
  price: string;
  unit: string;
  note: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
  detailsLabel: string;
  detailsHref: string;
  popular?: boolean;
  badge?: string;
}

export interface PlansCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  footnote: string;
}
