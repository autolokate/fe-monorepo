import type { Metadata } from 'next';

export const contactMetadata: Metadata = {
  title: 'Contact us — Autolokate',
  description:
    'Talk to the Autolokate team about partnerships, product, press, or support. We reply to most enquiries within one business day.',
  alternates: { canonical: '/contact-us' },
  openGraph: {
    title: 'Contact Autolokate',
    description:
      'A problem, a question, or feedback — you’re one message away from an answer. WhatsApp us, email us, or send a message.',
    url: '/contact-us',
    type: 'website',
  },
};
