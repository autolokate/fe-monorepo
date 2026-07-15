import { ShieldCheck, Users, Zap, type LucideIcon } from 'lucide-react';

export interface HeroMetaItem {
  label: string;
  value: string;
  Icon: LucideIcon;
}

export const heroMeta: HeroMetaItem[] = [
  { Icon: Zap, label: 'Quick Support', value: 'Within 24 Hours' },
  { Icon: ShieldCheck, label: 'Privacy First', value: 'Your data is safe' },
  { Icon: Users, label: 'Trusted by', value: '80K+ Users' },
];
