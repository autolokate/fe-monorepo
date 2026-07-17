import type { Metadata } from 'next';

export const emergencySafetyMetadata: Metadata = {
  title: 'Emergency & Safety — Autolokate',
  description:
    'A serious crash starts the response on its own — ambulance, roadside help and accident cover that pays the bills that follow. Autolokate works alongside 112 and official emergency services.',
  alternates: { canonical: '/emergency-safety' },
  openGraph: {
    title: 'Autolokate Emergency & Safety',
    description:
      'Help on the ground, cover for the bills. Ambulance dispatch, family alerts, roadside help and accident cover — triggered the moment a crash is confirmed.',
    url: '/emergency-safety',
    type: 'website',
  },
};

/** @deprecated Use emergencySafetyMetadata */
export const safetyMetadata = emergencySafetyMetadata;
