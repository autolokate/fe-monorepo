import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import type { HeroCopy } from './types';

/** Crash detection + radar — matches "detection is automatic" */
export const HERO_PHONE_IMAGE = MARKETING_STORY_IMAGES.detectionRadar;

export const HERO_COPY: HeroCopy = {
  eyebrow: 'How it works',
  headline: 'Detection is automatic.',
  headlineRest: 'So is',
  headlineAccent: 'help.',
  description:
    'Your phone watches every drive. On a serious impact, you get one tap to cancel a false alarm—then our 24/7 Control Center takes over: ambulance, roadside help and your family, all at once. If your phone can’t speak, the Smart QR on your vehicle does.',
  microcopy: 'No hardware · Works on budget Androids · Bystanders need no app',
  primaryCta: { label: 'Get protected', href: '/#safety-packs' },
};
