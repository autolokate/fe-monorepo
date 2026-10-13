import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const teamMetadata: Metadata = {
  title: 'Our Team — Autolokate',
  description:
    'Meet the people building Autolokate — a premium vehicle safety platform for automatic crash detection, emergency response, and family alerts.',
  alternates: { canonical: '/team' },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'Our Team — Autolokate',
    description: 'Built around one mission: safer journeys for every driver in India.',
    url: '/team',
    type: 'website',
  },
};
