import type { HeroCopy } from './types';

export const HERO_COPY: HeroCopy = {
  eyebrow: 'About Autolokate',
  headline: 'Protection for the moment',
  headlineAccent: 'you cannot call for help.',
  description:
    'Autolokate is India’s connected vehicle safety layer. When a serious crash happens, we detect it, alert your family, and start emergency response—without you unlocking your phone.',
  callout: [
    { text: '600+', accent: true },
    { text: ' partner locations · ' },
    { text: '30,000+', accent: true },
    { text: ' ambulances · 24/7 Control Center' },
  ],
};

export const HERO_STATS = [
  { value: '600+', label: 'Partner locations across India' },
  { value: '30,000+', label: 'Ambulances in the network' },
  { value: '24/7', label: 'Human Control Center' },
] as const;
