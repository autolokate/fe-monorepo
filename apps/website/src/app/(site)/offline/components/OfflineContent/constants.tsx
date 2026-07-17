import type { OfflineCopy } from './types';

export const OFFLINE_COPY: OfflineCopy = {
  eyebrow: 'No connection',
  headline: 'You are offline',
  description:
    "We couldn't reach the internet. Check your connection and try again. In a real emergency, always dial 112 directly.",
  secondaryCta: { label: 'Go to home', href: '/' },
  primaryCta: { label: 'Try again' },
};
