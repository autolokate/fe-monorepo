import { Shield, ShieldCheck, ShieldPlus } from 'lucide-react';
import type { PlanCard, PlansCopy } from './types';

export const PLANS_COPY: PlansCopy = {
  eyebrow: 'Plans',
  headline: 'Find the cover that',
  headlineAccent: 'fits.',
  subheading: 'Each plan includes everything in the one before it, then adds more.',
  footnote: 'Prices load live at checkout. What you see is what you pay.',
};

const CHECKOUT_HREF = '/#safety-packs';

export const PLAN_CARDS: PlanCard[] = [
  {
    id: 'secure',
    name: 'Secure',
    Icon: ShieldCheck,
    price: '₹999',
    unit: '/year per vehicle',
    note: 'GST included. No hidden charges.',
    description: 'Crash detection, ambulance help, cashless hospital care and ₹1L accident cover.',
    ctaLabel: 'Choose Secure',
    ctaHref: CHECKOUT_HREF,
    detailsLabel: "See what's included in Secure",
    detailsHref: '/features',
  },
  {
    id: 'shield',
    name: 'Shield',
    Icon: Shield,
    price: '₹1,999',
    unit: '/year per vehicle',
    note: 'GST included. No hidden charges.',
    description: 'Everything in Secure, plus roadside help and ₹3L accident cover.',
    ctaLabel: 'Choose Shield',
    ctaHref: CHECKOUT_HREF,
    detailsLabel: "See what's included in Shield",
    detailsHref: '/features',
    popular: true,
    badge: 'Most popular',
  },
  {
    id: 'shield-plus',
    name: 'Shield+',
    Icon: ShieldPlus,
    price: '₹2,999',
    unit: '/year per vehicle',
    note: 'GST included. No hidden charges.',
    description: 'Everything in Shield, plus 100 km+ roadside and ₹5L accident cover.',
    ctaLabel: 'Choose Shield+',
    ctaHref: CHECKOUT_HREF,
    detailsLabel: "See what's included in Shield+",
    detailsHref: '/features',
  },
];
