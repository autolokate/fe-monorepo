import { Ambulance, Banknote, ShieldCheck } from 'lucide-react';
import { PLAN_DISPLAY_BY_SLUG } from '@/lib/plan-display-names';
import type { InsuranceBenefit, InsuranceCopy } from './types';

export const INSURANCE_COPY: InsuranceCopy = {
  eyebrow: 'Insurance benefits',
  headline: 'More than response.',
  headlineAccent: 'Real financial protection.',
  subheading:
    'Ambulance, accident and hospital cover on every plan. Amounts, limits and eligibility depend on your plan and partner terms.',
  compareLink: { label: 'Compare plans & pricing', href: '/pricing' },
};

export const INSURANCE_BENEFITS: InsuranceBenefit[] = [
  {
    id: 'ambulance-cover',
    title: 'Ambulance cover',
    body: 'The ambulance bill is covered, from ₹3,000 to ₹10,000 by plan.',
    Icon: Ambulance,
  },
  {
    id: 'accident-cover',
    title: 'Accident cover',
    body: `Accidental death, permanent total disability and partial disability, from ₹1 lakh to ₹5 lakh. Paid to you or your family. Rider cover extends it to your pillion, on ${PLAN_DISPLAY_BY_SLUG.secure} and above.`,
    Icon: ShieldCheck,
  },
  {
    id: 'daily-hospital-cash',
    title: 'Daily hospital cash',
    body: 'Cash for every day you’re admitted, up to 30 days. Hospital care is cashless at network hospitals.',
    Icon: Banknote,
  },
];
