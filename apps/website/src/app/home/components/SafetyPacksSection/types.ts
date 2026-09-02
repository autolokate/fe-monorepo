import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export interface PlanFeature {
  label: string;
  Icon: ComponentType<LucideProps>;
}

export type SafetyPlanVariant = 'secure' | 'shield' | 'shieldPlus';

export interface SafetyPlan {
  id: string;
  variant: SafetyPlanVariant;
  tierLabel: string;
  /** Tier glyph shown in the badge at the top of the card. */
  Icon: ComponentType<LucideProps>;
  price: string;
  pricePeriod: string;
  popular?: boolean;
  popularBadge?: string;
  ctaLabel: string;
  /** Secondary link label below the plan CTA (pricing page). */
  detailsLabel: string;
  /** One-line plan summary shown on the home plan grid (matches Figma). */
  summary?: string;
  features: PlanFeature[];
}

export interface SafetyPacksSectionCopy {
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  subheading: string;
  headerPill: string;
  footnotes: string[];
  /** Single-line footnote shown under the plan grid (home). */
  footnote?: string;
  /** Secondary CTA linking to the full pricing/compare page (home). */
  compareCta?: {
    label: string;
    href: string;
  };
}
