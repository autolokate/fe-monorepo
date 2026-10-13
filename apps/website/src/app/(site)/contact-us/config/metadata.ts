import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const contactMetadata: Metadata = {
  title: 'Contact us — Autolokate',
  description:
    'Talk to the Autolokate team about partnerships, product, press, or support. We reply to most enquiries within one business day.',
  alternates: { canonical: '/contact-us' },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'Contact Autolokate',
    description:
      'A problem, a question, or feedback — you’re one message away from an answer. WhatsApp us, email us, or send a message.',
    url: '/contact-us',
    type: 'website',
  },
};
