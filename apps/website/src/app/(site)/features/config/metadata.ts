import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const featuresMetadata: Metadata = {
  title: 'Features — Autolokate',
  description:
    'Everything the Autolokate app does—challans, FASTag, crash detection, Control Center, Smart QR, garages, driver score, multi-vehicle, and more in one place.',
  alternates: { canonical: '/features' },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'Autolokate Features',
    description:
      'Every capability in one app—daily utility, safety, garages, driver score, and your whole garage.',
    url: '/features',
    type: 'website',
  },
};
