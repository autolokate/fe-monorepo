import type { LucideIcon } from 'lucide-react';

export const LEGAL_HERO_BACKGROUND = '/images/legal/static_page_babber_bg.png';

export interface LegalHeroMetaItem {
  label: string;
  value: string;
  Icon: LucideIcon;
}

export interface LegalHeroBannerCopy {
  badgeLabel: string;
  BadgeIcon: LucideIcon;
  title: string;
  description: string;
  meta: LegalHeroMetaItem[];
}
