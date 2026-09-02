import type { LucideIcon } from 'lucide-react';

export type QrStepTone = 'brand' | 'emergency' | 'calm';

export interface QrJourneyStep {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  badge?: string;
  tone?: QrStepTone;
}

export interface SmartQrCopy {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subheading: string;
  callout: string;
}
