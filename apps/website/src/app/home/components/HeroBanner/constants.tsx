import { SAFETY_PACKS_SECTION_ID } from '../SafetyPacksSection/constants';
import type { HeroCopy, HeroStat } from './types';

/** Transparent phone render (device + shadow) exported from Figma. */
export const HERO_PHONE_IMAGE = '/images/new-design/home/hero-phone.png';

export const HERO_COPY: HeroCopy = {
  eyebrow: 'Automatic crash detection',
  headline: 'The crash happens. Help is',
  headlineAccent: 'already moving.',
  subheading:
    'Your phone detects a serious crash and alerts our 24/7 Control Center. Your family gets a call, WhatsApp and SMS. Your plan adds ambulance, roadside help and cashless cover.',
  microcopy: 'Free to download · Protection from ₹999 a year · No device to fit',
  primaryCta: { label: 'Get protected', href: `/#${SAFETY_PACKS_SECTION_ID}` },
  secondaryCta: { label: 'See how it works', href: '/how-it-works' },
};

export const HERO_STATS: HeroStat[] = [
  { id: 'rating', value: '4.8★', label: 'Play Store rating' },
  { id: 'owners', value: '42,000+', label: 'Owners protected' },
  { id: 'control-center', value: '24/7', label: 'Control Center' },
];
