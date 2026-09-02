import type { Metadata } from 'next';

export const pricingMetadata: Metadata = {
  title: 'Pricing — Autolokate',
  description:
    'One payment, a full year of cover. Every plan protects one vehicle for a year with Smart QR, automatic crash detection, ambulance and roadside help. GST included, no hidden charges.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Autolokate Pricing',
    description:
      'Protect, Guardian and Guardian Plus — annual per-vehicle plans with crash detection, ambulance and roadside cover. From ₹999, GST included.',
    url: '/pricing',
    type: 'website',
  },
};
