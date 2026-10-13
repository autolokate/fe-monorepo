import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const blogMetadata: Metadata = {
  title: 'Blog — Autolokate',
  description:
    'Guides, notes and deep-dives. Plain-language reads on safety, plans and the product, from the team behind Autolokate.',
  alternates: { canonical: '/blog' },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'Autolokate Blog',
    description:
      'Plain-language reads on safety, plans and the product, from the team behind Autolokate.',
    url: '/blog',
    type: 'website',
  },
};
