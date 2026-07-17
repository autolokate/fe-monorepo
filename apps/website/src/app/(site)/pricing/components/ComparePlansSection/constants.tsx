import type { CompareColumn, CompareCopy, CompareGroup } from './types';

const CHECKOUT_HREF = '/#safety-packs';

export const COMPARE_COPY: CompareCopy = {
  eyebrow: 'Compare plans',
  headline: 'Row by row,',
  headlineAccent: 'no fine print.',
  subheading:
    'Crash detection starts at Secure. Higher plans add roadside distance and bigger cover.',
  handoff: 'Every plan here also includes the full app.',
  handoffLink: { label: 'See everything the app does', href: '/features' },
};

export const COMPARE_COLUMNS: CompareColumn[] = [
  {
    id: 'secure',
    name: 'Secure',
    price: '₹999/year',
    ctaLabel: 'Choose Secure',
    ctaHref: CHECKOUT_HREF,
  },
  {
    id: 'shield',
    name: 'Shield',
    price: '₹1,999/year',
    popular: true,
    badge: 'Most popular',
    ctaLabel: 'Choose Shield',
    ctaHref: CHECKOUT_HREF,
  },
  {
    id: 'shield-plus',
    name: 'Shield+',
    price: '₹2,999/year',
    ctaLabel: 'Choose Shield+',
    ctaHref: CHECKOUT_HREF,
  },
];

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    id: 'in-every-plan',
    title: 'In every plan',
    rows: [
      { id: 'crash-detection', label: 'Automatic crash detection', cells: [true, true, true] },
      {
        id: 'ai-calling',
        label: 'AI calling to your emergency contacts',
        cells: [true, true, true],
      },
      { id: 'ambulance', label: 'Ambulance cover ₹3,000', cells: [true, true, true] },
      {
        id: 'accident-cover',
        label: '₹1L accident cover · ₹1,000/day hospital cash',
        cells: [true, true, true],
      },
      { id: 'cashless', label: 'Cashless hospital care', cells: [true, true, true] },
      { id: 'driver-score', label: 'Driver score & leaderboard', cells: [true, true, true] },
    ],
  },
  {
    id: 'added-in-shield',
    title: 'Added in Shield',
    rows: [
      { id: 'roadside-50', label: 'Roadside help (50 km)', cells: [false, true, true] },
      {
        id: 'accident-3l',
        label: 'Accident cover raised to ₹3L · hospital cash ₹1,500/day',
        cells: [false, true, true],
      },
      {
        id: 'ambulance-5k',
        label: 'Ambulance cover raised to ₹5,000',
        cells: [false, true, true],
      },
    ],
  },
  {
    id: 'added-in-shield-plus',
    title: 'Added in Shield+',
    rows: [
      { id: 'roadside-100', label: 'Roadside help (100 km+)', cells: [false, false, true] },
      {
        id: 'accident-5l',
        label: 'Accident cover raised to ₹5L · hospital cash ₹2,000/day',
        cells: [false, false, true],
      },
      {
        id: 'ambulance-10k',
        label: 'Ambulance cover raised to ₹10,000',
        cells: [false, false, true],
      },
    ],
  },
];
