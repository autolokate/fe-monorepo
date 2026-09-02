import { Shield, ShieldCheck, ShieldPlus } from 'lucide-react';
import { PLAN_DISPLAY_BY_SLUG, planCtaLabel, planDetailsLabel } from '@/lib/plan-display-names';
import type { PlanCard, PlansCopy } from './types';

export const PLANS_COPY: PlansCopy = {
  eyebrow: 'Protection plans',
  headline: 'Automotive protection,',
  headlineAccent: 'priced per vehicle.',
  subheading:
    'Each tier includes everything below it—then adds more cover on the road and at the hospital.',
  footnote: 'Prices load live at checkout. What you see is what you pay.',
};

const CHECKOUT_HREF = '/buy';

export const PLAN_CARDS: PlanCard[] = [
  {
    id: 'secure',
    name: PLAN_DISPLAY_BY_SLUG.secure,
    Icon: ShieldCheck,
    tagline: 'Essential crash response and hospital cover.',
    price: '₹999',
    unit: '/year per vehicle',
    note: 'GST included. No hidden charges.',
    description: 'For drivers who want automatic detection and emergency coordination.',
    highlights: [
      'Crash detection & 30-second cancel window',
      'Ambulance dispatch & family alerts',
      'Cashless hospital care on network',
      '₹1L accident cover',
    ],
    ctaLabel: planCtaLabel('secure'),
    ctaHref: CHECKOUT_HREF,
    detailsLabel: planDetailsLabel('secure'),
    detailsHref: '/features',
  },
  {
    id: 'shield',
    name: PLAN_DISPLAY_BY_SLUG.shield,
    Icon: Shield,
    tagline: 'Full response plus roadside for your vehicle.',
    price: '₹1,999',
    unit: '/year per vehicle',
    note: 'GST included. No hidden charges.',
    description: 'Our most chosen plan—emergency response and roadside help together.',
    highlights: [
      `Everything in ${PLAN_DISPLAY_BY_SLUG.secure}`,
      'Roadside help: tow, fuel, flat tyre',
      'Higher ambulance cover limits',
      '₹3L accident cover',
    ],
    ctaLabel: planCtaLabel('shield'),
    ctaHref: CHECKOUT_HREF,
    detailsLabel: planDetailsLabel('shield'),
    detailsHref: '/features',
    popular: true,
    badge: 'Most popular',
  },
  {
    id: 'shield-plus',
    name: PLAN_DISPLAY_BY_SLUG['shield-plus'],
    Icon: ShieldPlus,
    tagline: 'Maximum cover for frequent drivers and families.',
    price: '₹2,999',
    unit: '/year per vehicle',
    note: 'GST included. No hidden charges.',
    description: 'The highest limits—built for long commutes and multi-driver households.',
    highlights: [
      `Everything in ${PLAN_DISPLAY_BY_SLUG.shield}`,
      '100 km+ roadside assistance',
      'Highest ambulance & hospital limits',
      '₹5L accident cover',
    ],
    ctaLabel: planCtaLabel('shield-plus'),
    ctaHref: CHECKOUT_HREF,
    detailsLabel: planDetailsLabel('shield-plus'),
    detailsHref: '/features',
  },
];
