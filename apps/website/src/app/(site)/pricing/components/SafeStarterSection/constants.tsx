import { SAFE_START_DISPLAY } from '@/lib/plan-display-names';
import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';
import type { SafeStarterCopy } from './types';

export const STARTER_VISUAL_IMAGE = MARKETING_STORY_IMAGES.safeStartRetail;

export const SAFE_STARTER_COPY: SafeStarterCopy = {
  eyebrow: `Starter · ${SAFE_START_DISPLAY}`,
  headlineLead: 'Start with',
  headlineAccent: '₹99.',
  headlineRest: '',
  description: `${SAFE_START_DISPLAY}: vehicle identity, Park Me and a way for anyone at the scene to call help—all in one sticker. Pick it up with your groceries, stick it on, done.`,
  availability: 'Available on Blinkit, Zepto and Amazon · Retail only, not sold online',
  upgrade:
    'Ready for automatic crash detection and ambulance cover? Move up to a full plan anytime in the app.',
};
