import type { Metadata } from 'next';

export const blogMetadata: Metadata = {
  title: 'Blog — Autolokate',
  description:
    'Guides, notes and deep-dives. Plain-language reads on safety, plans and the product, from the team behind Autolokate.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Autolokate Blog',
    description:
      'Plain-language reads on safety, plans and the product, from the team behind Autolokate.',
    url: '/blog',
    type: 'website',
  },
};
