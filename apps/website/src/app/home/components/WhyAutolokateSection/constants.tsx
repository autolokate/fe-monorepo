import { Bell, Car, Gauge, ShoppingBag, Users } from 'lucide-react';
import type { WhyAutolokateSectionCopy, WhyHighlight } from './types';

export const WHY_AUTOLOKATE_COPY: WhyAutolokateSectionCopy = {
  eyebrow: 'Beyond the emergency',
  headline: 'One app for ',
  headlineAccent: 'every mile',
  headlineSuffix: ' you drive.',
  subheadline:
    'Crash protection is why you join. Challans, renewals, and garage bookings are why you return. Every plan includes the full app.',
  cta: { label: 'Explore app features', href: '/features' },
};

export const WHY_HIGHLIGHTS: WhyHighlight[] = [
  {
    id: 'garages',
    title: 'Garages & services',
    body: 'Find and book trusted garages, services, and accessory shops.',
    Icon: ShoppingBag,
    layout: 'stacked',
    iconTone: 'default',
  },
  {
    id: 'community',
    title: 'Community',
    body: 'Owner Q&A, driving tips, and fellow owners nearby who stop to help.',
    Icon: Users,
    layout: 'stacked',
    iconTone: 'brand',
  },
  {
    id: 'renewals',
    title: 'Renewal reminders',
    body: 'Insurance, PUC, and FASTag reminders before they lapse. E-challan checks before a fine grows.',
    Icon: Bell,
    layout: 'stacked',
    iconTone: 'amber',
  },
  {
    id: 'driver-score',
    title: 'Driver score',
    body: 'A score for every drive, with tips to sharpen your habits over time.',
    Icon: Gauge,
    layout: 'wide',
    iconTone: 'brand',
  },
  {
    id: 'multi-vehicle',
    title: 'Multi-vehicle',
    body: 'Every car and bike you own, managed from one profile.',
    Icon: Car,
    layout: 'wide',
    iconTone: 'default',
  },
];
