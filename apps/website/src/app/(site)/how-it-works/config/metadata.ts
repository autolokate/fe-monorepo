import type { Metadata } from 'next';
import { DEFAULT_SHARE_IMAGE } from '@/lib/seo';

export const howQrWorksMetadata: Metadata = {
  title: 'How It Works — Autolokate',
  description:
    'See how Autolokate protects you: automatic crash detection on your phone, a 24/7 Control Center that dispatches an ambulance and alerts your family, and a Smart QR backup for when your phone can’t answer.',
  alternates: { canonical: '/how-it-works' },
  openGraph: {
    images: [DEFAULT_SHARE_IMAGE],
    title: 'How Autolokate Works',
    description:
      'Detection is automatic. So is help. Crash detection, a 24/7 Control Center and a Smart QR backup on every vehicle.',
    url: '/how-it-works',
    type: 'website',
  },
};

/** @deprecated Use howQrWorksMetadata */
export const shopMetadata = howQrWorksMetadata;
