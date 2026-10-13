import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const profileMetadata: Metadata = {
  title: 'Profile — Autolokate',
  description: 'Update your Autolokate profile, contact details, vehicle preferences, and budget.',
  robots: { index: false, follow: false },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'Profile — Autolokate',
    description: 'Manage your Autolokate account preferences.',
    type: 'website',
  },
};
