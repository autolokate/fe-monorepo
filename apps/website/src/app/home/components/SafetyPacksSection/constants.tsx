import { Check, Shield, ShieldCheck, ShieldPlus, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  getPlanDisplayName,
  planCtaLabel,
  planDetailsLabel,
  SAFE_START_DISPLAY,
  type PlanSlug,
} from '@/lib/plan-display-names';
import type { Plan } from '@/services/plans';
import type { SafetyPacksSectionCopy, SafetyPlan, SafetyPlanVariant } from './types';

/** In-page anchor — hero CTA and deep links scroll here. */
export const SAFETY_PACKS_SECTION_ID = 'safety-packs';

export const SAFETY_PACKS_BACKGROUND = '/images/home_banner_light.png';

export const SAFETY_PACKS_COPY: SafetyPacksSectionCopy = {
  eyebrow: 'Protection tiers',
  headline: 'Choose the coverage that fits your drive.',
  headlineAccent: 'your drive.',
  subheading:
    'Each plan covers one vehicle for a year, with a Smart QR sticker included. Manage every car and bike from one profile.',
  headerPill: 'One QR. Complete protection.',
  footnotes: ['Purchase in app', 'Cancel anytime', 'Sticker shipped free'],
  footnote: `Need only the Smart QR? ${SAFE_START_DISPLAY} is ₹99 on Blinkit, Zepto, and Amazon. Upgrade to Protect anytime in the app.`,
  compareCta: { label: 'Compare plans & pricing', href: '/pricing' },
};

interface TierPresentation {
  variant: SafetyPlanVariant;
  Icon: ComponentType<LucideProps>;
  /** Stable slug the purchase flow understands (kept off the API UUID). */
  slug: PlanSlug;
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

/** One-line plan summaries (home grid) keyed by backend tier code. */
const SUMMARY_BY_TIER: Record<string, string> = {
  SECURE:
    'Crash detection, ambulance coordination, cashless hospital care, and ₹1L accident cover.',
  SHIELD: 'Everything in Protect, plus roadside assistance and ₹3L accident cover.',
  SHIELD_PLUS: 'Everything in Guardian, plus 100 km+ roadside assistance and ₹5L accident cover.',
};

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
    tierLabel: getPlanDisplayName(plan.tier),
    Icon: presentation.Icon,
    price: formatRupeesFromPaise(plan.pricePaise),
    pricePeriod: periodSuffix(plan.period),
    popular: Boolean(plan.badge),
    popularBadge: plan.badge ?? undefined,
    ctaLabel: planCtaLabel(presentation.slug),
    detailsLabel: planDetailsLabel(presentation.slug),
    summary: SUMMARY_BY_TIER[plan.tier],
    features: plan.features.map((label) => ({ label, Icon: Check })),
  };
}

/**
 * Static three-tier fallback so the home plan grid always renders the designed
 * cards even if the plans API is unreachable (e.g. local dev without a backend).
 */
export const FALLBACK_SAFETY_PLANS: SafetyPlan[] = [
  {
    id: 'secure',
    variant: 'secure',
    tierLabel: getPlanDisplayName('secure'),
    Icon: ShieldCheck,
    price: '₹999',
    pricePeriod: '/year',
    ctaLabel: planCtaLabel('secure'),
    detailsLabel: planDetailsLabel('secure'),
    summary: SUMMARY_BY_TIER.SECURE,
    features: [],
  },
  {
    id: 'shield',
    variant: 'shield',
    tierLabel: getPlanDisplayName('shield'),
    Icon: Shield,
    price: '₹1,999',
    pricePeriod: '/year',
    popular: true,
    popularBadge: 'Most popular',
    ctaLabel: planCtaLabel('shield'),
    detailsLabel: planDetailsLabel('shield'),
    summary: SUMMARY_BY_TIER.SHIELD,
    features: [],
  },
  {
    id: 'shield-plus',
    variant: 'shieldPlus',
    tierLabel: getPlanDisplayName('shield-plus'),
    Icon: ShieldPlus,
    price: '₹2,999',
    pricePeriod: '/year',
    ctaLabel: planCtaLabel('shield-plus'),
    detailsLabel: planDetailsLabel('shield-plus'),
    summary: SUMMARY_BY_TIER.SHIELD_PLUS,
    features: [],
  },
];
