import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import type { HeroCopy } from './types';

export const HERO_COPY: HeroCopy = {
  eyebrow: 'Pricing',
  headline: 'One payment.',
  headlineAccent: 'A full year of cover.',
  description:
    'Every plan covers one vehicle for a year—Smart QR sticker included. No monthly billing, no surprise renewals. GST included. No hidden charges.',
};

export const HERO_TRUST_POINTS = [
  'Crash detection on every drive',
  'Smart QR sticker shipped free',
  'Upgrade or add vehicles anytime',
] as const;

export const HERO_VISUAL_IMAGE = MARKETING_STORY_IMAGES.pricingHeroCover;
