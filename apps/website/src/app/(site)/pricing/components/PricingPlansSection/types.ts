import type { LucideIcon } from 'lucide-react';

export interface PlanCard {
  id: string;
  name: string;
  Icon: LucideIcon;
  price: string;
  unit: string;
  note: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  detailsLabel: string;
  detailsHref: string;
  /** Highlighted "hero" plan — rendered as the dark, most-popular card. */
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
