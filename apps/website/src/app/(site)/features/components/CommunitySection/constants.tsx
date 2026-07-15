import type { PhoneShot } from '../PhoneCarousel';

export const COMMUNITY_COPY = {
  index: '05',
  heading: 'Community & Programs',
  description: 'A community that drives together, stays together.',
} as const;

export interface ChecklistItem {
  id: string;
  label: string;
}

export const COMMUNITY_CHECKLIST: ChecklistItem[] = [
  { id: 'qa', label: 'Q&A & expert answers' },
  { id: 'reels', label: 'Reels, tips & updates' },
  { id: 'programs', label: 'Angel & Raah Veer programs' },
];

export const COMMUNITY_PHONE_SHOTS: PhoneShot[] = [
  {
    id: 'community',
    src: '/images/new-design/feedbackFirstSectionImage10.png',
    alt: 'Autolokate Community feed showing a driving question with tags, views, and replies',
  },
  {
    id: 'reels',
    src: '/images/new-design/feedbackFirstSectionImage11.png',
    alt: 'Autolokate Reels screen playing a fuel-saving tips video with likes, comments, and follow options',
  },
  {
    id: 'programs',
    src: '/images/new-design/feedbackFirstSectionImage12.png',
    alt: 'Autolokate Programs screen featuring the Angel Program and Raah Veer with join options',
  },
];

export const COMMUNITY_ASIDE = {
  heading: 'Stronger together. Safer together.',
  description: 'Share, learn, help and get recognized.',
} as const;
