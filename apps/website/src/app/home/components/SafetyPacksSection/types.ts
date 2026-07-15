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
  features: PlanFeature[];
}

export interface SafetyPacksSectionCopy {
  eyebrow: string;
  headline: string;
  subheading: string;
  headerPill: string;
  footnotes: string[];
}
