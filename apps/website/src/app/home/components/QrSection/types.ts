import type { LucideIcon } from 'lucide-react';

export type QrFeatureTone = 'emergency' | 'brand';

export interface QrFeature {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  tone: QrFeatureTone;
}

export interface QrSectionCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  body: string;
  chip: {
    title: string;
    subtitle: string;
  };
  primaryCta: {
    label: string;
    href: string;
  };
}
