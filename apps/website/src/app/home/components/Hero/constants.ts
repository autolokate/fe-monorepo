import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import { SAFETY_PACKS_SECTION_ID } from '../SafetyPacksSection/constants';

export const HERO_COPY = {
  eyebrow: 'Vehicle safety & intelligence',
  headline: 'When something goes wrong,',
  headlineAccent: 'Autolokate responds.',
  subheading:
    'Crash detection, 24/7 Control Center coordination, Smart QR backup—and everyday tools for every vehicle you own.',
  primaryCta: { label: 'Get protected', href: '/buy' },
  secondaryCta: { label: 'How it works', href: '/how-it-works' },
  plansAnchor: { label: 'View plans', href: `/#${SAFETY_PACKS_SECTION_ID}` },
} as const;

export const HERO_STATS = [
  { id: 'owners', value: '42,000+', label: 'Drivers covered', icon: 'shield' as const },
  { id: 'response', value: '24/7', label: 'Control Center', icon: 'clock' as const },
  { id: 'detect', value: '30 sec', label: 'Typical detection', icon: 'bolt' as const },
  { id: 'hardware', value: 'No hardware', label: 'Phone-based protection', icon: 'phone' as const },
] as const;

/** Static poster for reduced-motion users */
export const HERO_POSTER = MARKETING_STORY_IMAGES.heroPoster;

/** Hero background video */
export const HERO_VIDEO = MARKETING_STORY_IMAGES.heroVideo;
export const HERO_VIDEO_START_SEC = 2;
