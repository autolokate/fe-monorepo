import { INDIAN_DRIVE_GUIDE_CHANNEL_URL } from '@/lib/idg';
import type { SubscribeCopy } from './types';

export const SUBSCRIBE_COPY: SubscribeCopy = {
  eyebrow: 'Stay in the loop',
  headline: 'Never miss',
  headlineAccent: 'an explainer.',
  subheading: 'New videos and guides, the moment they drop.',
  cta: { label: 'Subscribe on YouTube', href: INDIAN_DRIVE_GUIDE_CHANNEL_URL },
  socialsPrefix: 'Also on',
  socials: ['instagram', 'facebook', 'linkedin'],
};
