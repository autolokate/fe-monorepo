import type { Metadata } from 'next';

export const safetyMetadata: Metadata = {
  title: 'Emergency & Safety — Autolokate',
  description:
    'Automatic crash detection, instant family alerts, ambulance & roadside assistance, and a 24/7 Control Center — Autolokate acts the moment it matters most.',
  alternates: { canonical: '/safety' },
  openGraph: {
    title: 'Autolokate Emergency & Safety',
    description:
      'AI-powered crash detection, SOS alerts, and human Control Center support that trigger help in seconds — protection for every drive.',
    url: '/safety',
    type: 'website',
  },
};
