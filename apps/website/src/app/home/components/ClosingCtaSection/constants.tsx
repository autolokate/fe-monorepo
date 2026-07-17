import { SAFETY_PACKS_SECTION_ID } from '../SafetyPacksSection/constants';
import type { ClosingCtaCopy } from './types';

export const CLOSING_SIGNAL_RINGS = '/images/new-design/home/closing-signal-rings.svg';

export const CLOSING_CTA_COPY: ClosingCtaCopy = {
  headline: 'Protected before your next',
  headlineAccent: 'trip.',
  subheading: 'Set up in minutes. Covered for a full year, from ₹999.',
  cta: { label: 'Get protected', href: `/#${SAFETY_PACKS_SECTION_ID}` },
};
