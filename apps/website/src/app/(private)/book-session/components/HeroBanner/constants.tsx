import { Headphones, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface HeroChip {
  Icon: LucideIcon;
  label: string;
  /** When true the icon is tinted primary blue (used for the "GST" badge). */
  accent?: boolean;
}

export const HERO_CHIPS: ReadonlyArray<HeroChip> = [
  { Icon: Headphones, label: '15 min live' },
  { Icon: ShieldCheck, label: '1:1 Expert call' },
  { Icon: ShieldCheck, label: 'GST included', accent: true },
] as const;

export const HERO_CHECKLIST = [
  'Live published availability',
  'No hidden charges',
  'Cancel anytime before the call',
] as const;
