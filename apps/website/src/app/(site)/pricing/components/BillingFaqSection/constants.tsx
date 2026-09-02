import { PLAN_DISPLAY_BY_SLUG } from '@/lib/plan-display-names';
import type { BillingFaqCopy, FaqItem } from './types';

export const BILLING_FAQ_COPY: BillingFaqCopy = {
  eyebrow: 'Before you choose',
  headline: 'Billing, in',
  headlineAccent: 'plain terms.',
};

export const BILLING_FAQS: FaqItem[] = [
  {
    id: 'how-billed',
    question: 'How is Autolokate billed?',
    answer:
      'Once a year, per vehicle. One payment covers the full year. No monthly billing, no hidden charges.',
  },
  {
    id: 'cancel-refund',
    question: 'Can I cancel or get a refund?',
    answer:
      'Full refund within 7 days of a new purchase. After that, your plan runs to the end of its year.',
  },
  {
    id: 'how-pay',
    question: 'How do I pay?',
    answer: 'UPI, cards or netbanking. Payment completes on a secure checkout.',
  },
  {
    id: 'auto-renew',
    question: 'Does it auto-renew?',
    answer:
      'No surprise renewals. Auto-renew is off by default, and we remind you before the year ends.',
  },
  {
    id: 'all-vehicles',
    question: 'Does one plan cover all my vehicles?',
    answer:
      'Plans are per vehicle, one year each. Add every vehicle under one profile and manage them together.',
  },
  {
    id: 'upgrade-later',
    question: 'Can I upgrade later?',
    answer: 'Yes. Upgrade anytime in the app. You pay only the difference.',
  },
  {
    id: 'ambulance-roadside',
    question: 'What does the ambulance and roadside cover include?',
    answer: `Ambulance dispatch with the bill covered, from ₹3,000 to ₹10,000 by plan. Roadside help on ${PLAN_DISPLAY_BY_SLUG.shield} and above: towing and minor repairs, fuel delivery, flat tyre, battery jump-start and lockout help.`,
  },
  {
    id: 'rider-pillion',
    question: 'Does it cover a rider or pillion?',
    answer: `Rider cover is available as an add-on on ${PLAN_DISPLAY_BY_SLUG.secure} and above, for up to two riders. You can add them in the app.`,
  },
];
