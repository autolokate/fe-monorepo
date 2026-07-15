import type { Metadata } from 'next';

export const howQrWorksMetadata: Metadata = {
  title: 'How QR Works — Autolokate',
  description:
    'Learn how Autolokate QR keeps your vehicle reachable while your number stays private. Buy official QR stickers for bikes, scooters, and cars.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    title: 'How Autolokate QR Works',
    description:
      'One scan. Two ways to help — parking contact and emergency support without showing your personal number.',
    url: '/how-it-works',
    type: 'website',
  },
};

/** @deprecated Use howQrWorksMetadata */
export const shopMetadata = howQrWorksMetadata;
