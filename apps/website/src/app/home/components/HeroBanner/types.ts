import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export interface HeroFeature {
  title: string;
  body: string;
  Icon: ComponentType<LucideProps>;
}

export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroCopy {
  /** Small monospace eyebrow shown above the headline. */
  badge: string;
  /** Leading part of the headline rendered in the base color. */
  headline: string;
  /** Trailing word(s) rendered in the amber accent + italic. */
  headlineAccent: string;
  subheading: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
}

export interface TrendingModel {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  /** Optional remote/local image. Falls back to a tinted placeholder. */
  imageUrl?: string;
  imageAlt: string;
  priceLabel: string;
}
