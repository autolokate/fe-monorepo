import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const productsMetadata: Metadata = {
  title: 'Products — Autolokate',
  description:
    'Explore the Autolokate product lineup — Smart QR ID, Park Me tags, dashcam, FASTag, and crash-detection safety combos that keep every vehicle connected and protected.',
  alternates: { canonical: '/products' },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'Autolokate Products',
    description:
      'One connected platform for your vehicle — Smart QR ID, Park Me, dashcam, renewals, and emergency safety, all in one place.',
    url: '/products',
    type: 'website',
  },
};
