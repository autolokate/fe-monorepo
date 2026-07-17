import type { Metadata } from 'next';

export const aboutMetadata: Metadata = {
  title: 'About Autolokate — Building a Safer India. Together.',
  description:
    'Autolokate is an app-first vehicle safety platform. Your phone detects a serious crash on its own, then gets an ambulance moving and alerts your family, automatically, all at once.',
  alternates: { canonical: '/about-us' },
  openGraph: {
    title: 'About Autolokate — Building a Safer India. Together.',
    description:
      'An app-first vehicle safety platform for India. Automatic crash detection, instant family alerts, and a Smart QR backup that works even when your phone can’t.',
    url: '/about-us',
    type: 'website',
  },
};
