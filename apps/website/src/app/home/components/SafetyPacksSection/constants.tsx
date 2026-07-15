import { Check, Shield, ShieldCheck, ShieldPlus, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Plan } from '@/services/plans';
import type { SafetyPacksSectionCopy, SafetyPlan, SafetyPlanVariant } from './types';

/** In-page anchor — hero CTA and deep links scroll here. */
export const SAFETY_PACKS_SECTION_ID = 'safety-packs';

export const SAFETY_PACKS_BACKGROUND = '/images/home_banner_light.png';

export const SAFETY_PACKS_COPY: SafetyPacksSectionCopy = {
  eyebrow: 'Vehicle Safety Plans',
  headline: 'Choose your protection plan.',
  subheading: 'Every plan includes a smart QR sticker and is valid for 1 year.',
  headerPill: 'One QR. Complete Protection.',
  footnotes: ['Buy in the app', 'Cancel anytime', 'Sticker shipped free'],
};

interface TierPresentation {
  variant: SafetyPlanVariant;
  Icon: ComponentType<LucideProps>;
  /** Stable slug the purchase flow understands (kept off the API UUID). */
  slug: string;
}

/**
 * Presentation-only bits the API doesn't send (card accent + tier glyph),
 * keyed by the backend tier code. Falls back to the "shield" look.
 */
const TIER_PRESENTATION: Record<string, TierPresentation> = {
  SECURE: { variant: 'secure', Icon: ShieldCheck, slug: 'secure' },
  SHIELD: { variant: 'shield', Icon: Shield, slug: 'shield' },
  SHIELD_PLUS: { variant: 'shieldPlus', Icon: ShieldPlus, slug: 'shield-plus' },
};

const FALLBACK_PRESENTATION: TierPresentation = {
  variant: 'shield',
  Icon: Shield,
  slug: 'shield',
};

/** Map the backend billing period to the short suffix shown after the price. */
function periodSuffix(period: string): string {
  return period.toUpperCase() === 'MONTHLY' ? '/month' : '/year';
}

/** Paise → "₹1,999" (Indian grouping, no decimals). */
export function formatRupeesFromPaise(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/** Adapt an API plan into the shape the carousel/card render. */
export function toSafetyPlan(plan: Plan): SafetyPlan {
  const presentation = TIER_PRESENTATION[plan.tier] ?? FALLBACK_PRESENTATION;
  return {
    id: presentation.slug,
    variant: presentation.variant,
    tierLabel: plan.name,
    Icon: presentation.Icon,
    price: formatRupeesFromPaise(plan.pricePaise),
    pricePeriod: periodSuffix(plan.period),
    popular: Boolean(plan.badge),
    popularBadge: plan.badge ?? undefined,
    ctaLabel: `Choose ${plan.name}`,
    features: plan.features.map((label) => ({ label, Icon: Check })),
  };
}
