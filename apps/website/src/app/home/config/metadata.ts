import type { Metadata } from 'next';

const title = 'Autolokate – Automatic Crash Detection & Vehicle Safety';
const description =
  'Your phone detects a serious crash and alerts our 24/7 Control Center. Family alerts, ambulance and roadside help, cashless cover, and a Smart QR backup — protection from ₹999 a year.';

export const homeMetadata: Metadata = {
  title,
  description,
  keywords: [
    'Autolokate',
    'automatic crash detection',
    'vehicle safety India',
    'emergency SOS',
    'smart QR sticker',
    'roadside assistance',
    '24/7 control center',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title,
    description,
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};
